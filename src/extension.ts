// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// import superagent from 'superagent';
const superagent = require("superagent");

//Create output channel
const vscodexOut = vscode.window.createOutputChannel("vscodex");

const CODEX_URL = "https://api.openai.com/v1/engines/davinci-codex/completions";

const complete = async (prompt: string): Promise<string> => new Promise((resolve, reject) => {

	let stop: string[] | null = vscode.workspace.getConfiguration("general").get("stop") ?? null;
	if (Array.isArray(stop) && stop.length === 0) {
		stop = null;
	}

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


async function completeSelection(selectionText: string, selection: vscode.Selection) {
	// validation for no text being selected
	// TODO Might be a bug here sometimes, idk if it's just during development but sometimes
	// it said I have no selection although I have.
	if (selectionText.length === 0) {
		vscode.window.showWarningMessage("No text selected! Please select some text to get snippet");
		return;
	}

	const DO_CANCEL = await vscode.window.withProgress({
		cancellable: true,
		location: vscode.ProgressLocation.Notification,
		title: "VSCodex",
	}, async (progress, cancelToken) => {
		try {
			progress.report({
				message: "Loading Codex result ..."
			});

			const completion: string = await complete(selectionText);
			
			if (cancelToken.isCancellationRequested) {
				return true;
			}

			if (vscode.window.activeTextEditor) {
				vscode.window.activeTextEditor.edit(editBuilder => {
					editBuilder.insert(selection.end, completion);
				});
			}

		} catch (e) {
			vscodexOut.appendLine("Error:"+e);
		}

		return false;
	});

	if (DO_CANCEL) {
		return;
	}
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	const disposable = vscode.commands.registerCommand("vscodex.predict", async function() {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const selection = editor.selection;

			const selectionText = document.getText(selection);
			await completeSelection(selectionText, selection);
		}
	});
	
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
