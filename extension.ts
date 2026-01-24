import * as vscode from 'vscode';

let highlightedRanges: vscode.Range[] = [];
let decorationType: vscode.TextEditorDecorationType;
let currentColor = 'rgba(255,255,0,0.3)'; // default yellow

function createDecoration(color: string): vscode.TextEditorDecorationType {
    // Determine alpha based on theme
    const theme = vscode.window.activeColorTheme.kind;
    let alpha = 0.6;
    if (theme === vscode.ColorThemeKind.Light) alpha = 0.5;
    if (theme === vscode.ColorThemeKind.Dark) alpha = 0.7;

    // Parse rgb from color string
    const match = color.match(/rgba?\((\d+),(\d+),(\d+)/);
    let r = 255, g = 255, b = 0;
    if (match) {
        r = Number(match[1]);
        g = Number(match[2]);
        b = Number(match[3]);
    }

    const finalColor = `rgba(${r},${g},${b},${alpha})`;

    return vscode.window.createTextEditorDecorationType({
        backgroundColor: 'transparent',
        textDecoration: 'none;', // prevents VS Code from modifying text color
        borderRadius: '3px',
        border: `2px solid ${finalColor}`,
        isWholeLine: false
    });
}

export function activate(context: vscode.ExtensionContext) {
    decorationType = createDecoration(currentColor);

    // Highlight / toggle selection
    const highlightCmd = vscode.commands.registerCommand('highlight-code-snippet.highlight', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        const selection = editor.selection;
        if (selection.isEmpty) return;

        const range = new vscode.Range(selection.start, selection.end);

        const index = highlightedRanges.findIndex(r => r.isEqual(range));
        if (index >= 0) highlightedRanges.splice(index, 1);
        else highlightedRanges.push(range);

        editor.setDecorations(decorationType, highlightedRanges);
    });

    // Pick color + transparency
    const pickColorCmd = vscode.commands.registerCommand('highlight-code-snippet.pickColor', async () => {
        const colors = [
            { label: 'Red', rgb: [255,0,0] },
            { label: 'Blue', rgb: [0,0,255] },
            { label: 'Green', rgb: [0,255,0] },
            { label: 'Yellow', rgb: [255,255,0] },
            { label: 'Pink', rgb: [255,192,203] },
            { label: 'Purple', rgb: [128,0,128] },
            { label: 'Gray', rgb: [128,128,128] },
            { label: 'Custom', rgb: null }
        ];

        const colorPick = await vscode.window.showQuickPick(colors.map(c => c.label), { placeHolder: 'Pick highlight color' });
        if (!colorPick) return;

        let rgb: number[] | null = null;
        if (colorPick === 'Custom') {
            const input = await vscode.window.showInputBox({ prompt: 'Enter RGB (e.g., 255,100,50)', value: '255,255,0' });
            if (!input) return;
            const parts = input.split(',').map(Number);
            if (parts.length !== 3) return;
            rgb = parts;
        } else {
            rgb = colors.find(c => c.label === colorPick)!.rgb;
        }

        // Pick transparency
        const alphas = ['0.1','0.2','0.3','0.4','0.5','0.6','0.7','0.8','0.9'];
        const alphaPick = await vscode.window.showQuickPick(alphas, { placeHolder: 'Pick transparency (alpha)' });
        if (!alphaPick) return;

        currentColor = `rgba(${rgb![0]},${rgb![1]},${rgb![2]},${alphaPick})`;

        // Recreate decoration type
        decorationType.dispose();
        decorationType = createDecoration(currentColor);

        const editor = vscode.window.activeTextEditor;
        if (editor) editor.setDecorations(decorationType, highlightedRanges);

        await vscode.workspace.getConfiguration('highlightCodeSnippet').update('defaultColor', currentColor, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Highlight color set to ${currentColor}`);
    });

    // Clear all highlights
    const clearCmd = vscode.commands.registerCommand('highlight-code-snippet.clear', () => {
        highlightedRanges = [];
        const editor = vscode.window.activeTextEditor;
        if (editor) editor.setDecorations(decorationType, highlightedRanges);
    });

    context.subscriptions.push(highlightCmd, pickColorCmd, clearCmd, decorationType);
}

export function deactivate() {
    decorationType.dispose();
}
