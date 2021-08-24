// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// import superagent from 'superagent';
const superagent = require("superagent")

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	
	const editor = vscode.window.activeTextEditor;

	async function findSnippets(data: string, selections: vscode.Selection) {
        //validation for no text being selected
        if (data.length == 0){
            vscode.window.showWarningMessage("No text selected! Please select some text to get snippet")
            return
        }
        const codexURL = "https://api.openai.com/v1/engines/davinci-codex/completions";
        // callbacks
        superagent
            .post(codexURL)
			.send({
				prompt: data,
				temperature: 0.3,
				max_tokens: 1000,
				top_p: 1,
				frequency_penalty: 0,
				presence_penalty: 0,
                stop: ["def", "class", "@"]
			})
			.set('Authorization', 'Bearer ' + process.env.OPENAI_API_KEY)
            .end((error: any, response: any) => {
                let data = JSON.parse(response.text);
                console.log(data)
                if (data["choices"].length == 0) {
                    vscode.window.showWarningMessage("No code returned by the server.")
                }
				if (editor) {
					editor.edit(editBuilder => {
						editBuilder.insert(selections.end, String(data["choices"][0]["text"]));
					});
				}
            })
    }

    let disposable = vscode.commands.registerCommand('vscodex.predict', async function() {

        if (editor) {
            const document = editor.document;
            const selection = editor.selection;

            const word = document.getText(selection);
            await findSnippets(word, selection);

        }
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
