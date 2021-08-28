// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// import superagent from 'superagent';
const superagent = require("superagent");

//Create output channel
const vscodexOut = vscode.window.createOutputChannel("vscodex");

const CODEX_URL = "https://api.openai.com/v1/engines/davinci-codex/completions";

const complete = async (prompt: string, stop: string[] | null): Promise<string> => new Promise((resolve, reject) => {
	
	superagent
		.post(CODEX_URL)
		.send({
			prompt: prompt,
			temperature: vscode.workspace.getConfiguration("general").get("temperature"),
			max_tokens: vscode.workspace.getConfiguration("general").get("maxTokens"),
			top_p: 1,
			presence_penalty: vscode.workspace.getConfiguration("general").get("presence_penalty"),
			frequency_penalty: vscode.workspace.getConfiguration("general").get("frequency_penalty"),
			stop: stop
		})
		.set("Authorization", "Bearer " + (process.env.OPENAI_API_KEY ?? vscode.workspace.getConfiguration("general").get("OPENAI_API_KEY")))
		.end((error: any, response: any) => {
			if (error) {
				let message: string;
				if (error.response.text) {
					message = JSON.parse(error.response.text).error.message;
				} else {
					message = error;
				}
				vscode.window.showErrorMessage(message);
				reject(error);
				return;
			}
			const resp = JSON.parse(response.text);
			
			if (resp["choices"].length === 0) {
				vscode.window.showWarningMessage("No code returned by the server.");
				reject(new Error("No code returned by the server."));
			} else {
				resolve(String(resp["choices"][0]["text"]));
			}
		});
});

const completeWithProgress = async(
	prompt: string, 
	stop: string[] | null, 
	completionCallback: (completion: string) => void
): Promise<any> => {

	const DID_CANCEL = await vscode.window.withProgress({
		cancellable: true,
		location: vscode.ProgressLocation.Notification,
		title: "VSCodex",
	}, async (progress, cancelToken) => {
		try {
			
			progress.report({
				message: "Loading Codex result ..."
			});

			const completion: string = await complete(prompt, stop);

			if (cancelToken.isCancellationRequested) {
				return true;
			}

			completionCallback(completion);
		} catch (e) {
			vscodexOut.appendLine("Error: "+e);
			vscode.window.showErrorMessage(e as string ?? "Unknown Error");
		}

		return false;
	});

	return DID_CANCEL;
};

const getStop = async (): Promise<{ stop: string[] | null, cancel: boolean }> => {
	const userStop = await vscode.window.showInputBox({
		title: "Stop sequence (optional)", 
		prompt: "Stop generation on this sequence, in addition to stop sequences in settings.\r\n"
	});

	if (userStop === undefined) {
        return {stop: [], cancel: true};
    }

	let stop: string[] | null = [...vscode.workspace.getConfiguration("general").get("stop") as string[]] ?? null;

	if (userStop && stop) {
		stop.push(userStop);
	}

	if (Array.isArray(stop) && stop.length === 0) {
		stop = null;
	}

	return {stop: stop, cancel: false};
};

const completeSelection = async (selectionText: string, selection: vscode.Selection) => {
	if (selectionText.length === 0) {
		vscode.window.showWarningMessage("No text selected! Please select some text to get snippet");
		return;
	}

	const {stop, cancel} = await getStop();
	if (cancel) {
		return;
	}

	const prompt = selectionText + "\n\n";
	completeWithProgress(selectionText, stop, completion => {
		if (vscode.window.activeTextEditor) {
			vscode.window.activeTextEditor.edit(editBuilder => {
				editBuilder.insert(selection.end, completion);
			});
		}
	});
};


const refactorSelection = async (selectionText: string, selection: vscode.Selection) => {
	// validation for no text being selected
	// TODO Might be a bug here sometimes, idk if it's just during development but sometimes
	// it said I have no selection although I have.
	if (selectionText.length === 0) {
		vscode.window.showWarningMessage("No text selected! Please select some text to get snippet");
		return;
	}

	const {stop, cancel} = await getStop();
	if (cancel) {
		return;
	}

	const refactorComment = await vscode.window.showInputBox({
		title: "Refactor comment (leave blank for general improvement)", 
		prompt: "Don't forget to include comment and refer to old code as \"Above\",\r\ne.g. \"\"\" Above changed to not do X. \"\"\"\r\n"
	});

	const prompt = selectionText + "\r\n\r\n" + refactorComment;
	
	completeWithProgress(prompt, stop, completion => {
		if (vscode.window.activeTextEditor) {
			vscode.window.activeTextEditor.edit(editBuilder => {
				editBuilder.replace(selection, completion);
			});
		}
	});
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	const withSelection = async (callback: (selectionText: string, selection: any) => Promise<any>) => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const selection = editor.selection;

			const selectionText = document.getText(selection);

			callback(selectionText, selection);
		}
	};

	const vscodexPredict = vscode.commands.registerCommand("vscodex.predict", async function() {
		withSelection(completeSelection);
	});
	
	const vscodexRefactor = vscode.commands.registerCommand("vscodex.refactor", async function() {
		withSelection(refactorSelection);
	});

	context.subscriptions.push(vscodexPredict);
	context.subscriptions.push(vscodexRefactor);
}

// this method is called when your extension is deactivated
export function deactivate() {}
