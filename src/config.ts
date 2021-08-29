import * as vscode from "vscode";

import {getDefaultLevel} from "./storage";

export type Config = {
    temperature: number;
    maxTokens: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
    stop: Array<string>;
};

const getStopLevel = (context: vscode.ExtensionContext, level: string | undefined = ""): Array<string> | undefined => {

    if (!level) {
        level = getDefaultLevel(context);
    }

    let paramName: string;
    switch (level) {
        case "Function":
            paramName = "stopFunction";
            break;
        case "Class":
            paramName = "stopClass";
            break;
        case "File":
            return [];
        default:
            paramName = "stopCustom";

    }
    let param = vscode.workspace.getConfiguration("tokens").get(paramName);
    if (typeof param === 'string' && param) {
        return param.split(",");
    }
    return [];
};

/**
 * Get the configuration from the settings.
 *
 * TODO: Return differents value for `stop` depending on the level.
 */
export const getDefaultConfig = (context: vscode.ExtensionContext, level: string | undefined = ""): Config => { return {
    temperature: vscode.workspace.getConfiguration("general").get("temperature") ?? 0,
    maxTokens: vscode.workspace.getConfiguration("general").get("maxTokens") ?? 64,
    topP: vscode.workspace.getConfiguration("general").get("topP") ?? 1,
    presencePenalty: vscode.workspace.getConfiguration("general").get("presencePenalty") ?? 0,
    frequencyPenalty: vscode.workspace.getConfiguration("general").get("frequencyPenalty") ?? 0,
    stop: getStopLevel(context, level) ?? []
};};

/**
 * Get API key, firstly from the extension settings and if not found, then from the environment variables.
 */
export const getApiKey = (): string => {
    return vscode.workspace.getConfiguration("general").get("key") ?? process.env.OPENAI_API_KEY ?? "";
};
