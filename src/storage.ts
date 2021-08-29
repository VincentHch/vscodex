import * as vscode from "vscode";

const LEVEL_KEY = "level";

/**
 * Store the default level in the vscode storage system
 */
export const storeDefaultLevel = (context: vscode.ExtensionContext, level: string) => {
    context.globalState.update(LEVEL_KEY, level);
};

/**
 * Get the default level stored in the vscode storage system
 */
export const getDefaultLevel = (context: vscode.ExtensionContext, defaultLevel: string = "function"): string => {
    // TODO

    let level = context.globalState.get<string>(LEVEL_KEY);
    if (!level) {
        level = defaultLevel;
    }
    return level;
};
