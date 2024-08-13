import * as vscode from 'vscode';

import Provider from './provider';

export function activate(context: vscode.ExtensionContext) {
	const provider = new Provider();

	vscode.languages.registerDocumentLinkProvider('yaml', provider);
}

export function deactivate() {}
