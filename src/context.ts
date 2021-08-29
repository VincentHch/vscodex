import * as vscode from "vscode";

export const getSelection = (): {selection: vscode.Selection; text: string} | undefined => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {return;}
    const document = editor.document;
    const selection = editor.selection;
    const selectionText = document.getText(selection);

    return {selection: selection, text: selectionText};
};