import * as vscode from 'vscode';

let decorationType: vscode.TextEditorDecorationType;
let highlightedRanges: vscode.Range[] = [];

export function activate(context: vscode.ExtensionContext) {

    decorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor('editor.selectionHighlightBackground')
    });

    const highlightCommand = vscode.commands.registerCommand(
        'highlight-code-snippet.highlight',
        () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                return;
            }

            const selection = editor.selection;
            if (selection.isEmpty) {
                return;
            }

            const range = new vscode.Range(selection.start, selection.end);

            // toggle behavior: remove if already highlighted
            const index = highlightedRanges.findIndex(r => r.isEqual(range));
            if (index >= 0) {
                highlightedRanges.splice(index, 1);
            } else {
                highlightedRanges.push(range);
            }

            editor.setDecorations(decorationType, highlightedRanges);
        }
    );

    context.subscriptions.push(highlightCommand, decorationType);
}

export function deactivate() {}