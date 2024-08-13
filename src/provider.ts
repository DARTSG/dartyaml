
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const pathRe = /^\s*-\s*(.*\.yml)\s*$/gm;


export default class Provider implements vscode.DocumentLinkProvider {
    diagnosticCollection: vscode.DiagnosticCollection;
    
    provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.DocumentLink[] {
        const txt = document.getText();
        let diagnstics: vscode.Diagnostic[] = [];
        const matches = txt.matchAll(pathRe);
        const result: vscode.DocumentLink[] = [];

        for (const match of matches) {
            console.log("found ref: " + match[1]);
            const range = new vscode.Range(document.positionAt(match.index), document.positionAt(match.index + match[0].length));
            
            const uri = this.getPath(document, match[1]);
            if (uri) {
                result.push(new vscode.DocumentLink(range, uri));
                
                // if file doesn't exists, report an error.
                if (!fs.existsSync(uri.fsPath)) {
                    diagnstics.push(new vscode.Diagnostic(range, `File ${uri.fsPath} not found`, vscode.DiagnosticSeverity.Error));
                }
            } 
        }

        this.diagnosticCollection.set(document.uri, diagnstics);
        return result;
    }

    // return a path for a filename according to our convention.
    getPath(document: vscode.TextDocument, filename: string): undefined | vscode.Uri {
        if (!filename.startsWith('/')) { // relative path filename;
            return vscode.Uri.file(path.join(path.dirname(document.uri.fsPath), filename));
        } else if (vscode.workspace.workspaceFolders) { // absolute path works only if opened in workspace
            return vscode.Uri.file(path.join(vscode.workspace.workspaceFolders[0].uri.fsPath, filename));
        }
        return undefined; // not in workspace
    }

    constructor() {
        console.log('Provider constructor');
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('dartyaml');
    }
}