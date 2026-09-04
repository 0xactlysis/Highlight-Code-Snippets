import * as vscode from 'vscode';

// We now keep a map of decoration types so each color gets its own style
const decorationTypes: Map<string, vscode.TextEditorDecorationType> = new Map();
let currentColor = 'rgba(255,255,0,0.3)'; // default yellow

// VS Code ranges can't be saved directly to storage, so we serialize them into basic objects
interface SerializedRange {
    startLine: number;
    startChar: number;
    endLine: number;
    endChar: number;
    color?: string; // Added color property
}

// Internal representation tying a range to a color
interface ColoredRange {
    range: vscode.Range;
    color: string;
}

function getDecorationType(color: string): vscode.TextEditorDecorationType {
    // Reuse decoration type if we already created one for this color
    if (decorationTypes.has(color)) {
        return decorationTypes.get(color)!;
    }

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

    const decType = vscode.window.createTextEditorDecorationType({
        backgroundColor: 'transparent',
        textDecoration: 'none;', // prevents VS Code from modifying text color
        borderRadius: '3px',
        border: `2px solid ${finalColor}`,
        isWholeLine: false
    });

    decorationTypes.set(color, decType);
    return decType;
}

// --- Storage Helpers ---

function getRangesForDocument(context: vscode.ExtensionContext, uri: vscode.Uri): ColoredRange[] {
    const key = `highlights_${uri.toString()}`;
    const serialized = context.workspaceState.get<SerializedRange[]>(key) || [];
    return serialized.map(s => ({
        range: new vscode.Range(s.startLine, s.startChar, s.endLine, s.endChar),
        color: s.color || 'rgba(255,255,0,0.3)' // fallback to default yellow if old data without color
    }));
}

function saveRangesForDocument(context: vscode.ExtensionContext, uri: vscode.Uri, ranges: ColoredRange[]) {
    const key = `highlights_${uri.toString()}`;
    const serialized: SerializedRange[] = ranges.map(r => ({
        startLine: r.range.start.line,
        startChar: r.range.start.character,
        endLine: r.range.end.line,
        endChar: r.range.end.character,
        color: r.color
    }));
    context.workspaceState.update(key, serialized);
}

function applyDecorationsToEditor(context: vscode.ExtensionContext, editor: vscode.TextEditor) {
    if (!editor) return;

    // Clear all existing custom decorations first to prevent ghosting
    decorationTypes.forEach(decType => editor.setDecorations(decType, []));

    const coloredRanges = getRangesForDocument(context, editor.document.uri);
    
    // Group ranges by color
    const rangesByColor = new Map<string, vscode.Range[]>();
    for (const cr of coloredRanges) {
        if (!rangesByColor.has(cr.color)) {
            rangesByColor.set(cr.color, []);
        }
        rangesByColor.get(cr.color)!.push(cr.range);
    }

    // Apply grouped ranges to their respective decoration types
    rangesByColor.forEach((ranges, color) => {
        const decType = getDecorationType(color);
        editor.setDecorations(decType, ranges);
    });
}

// --- Main Extension Logic ---

export function activate(context: vscode.ExtensionContext) {
    // Load previously saved color from configuration
    const config = vscode.workspace.getConfiguration('highlightCodeSnippet');
    currentColor = config.get<string>('defaultColor') || 'rgba(255,255,0,0.3)';

    // 1. Apply highlights to the current editor immediately on startup
    if (vscode.window.activeTextEditor) {
        applyDecorationsToEditor(context, vscode.window.activeTextEditor);
    }

    // 2. Re-apply highlights whenever the user switches file tabs
    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor) applyDecorationsToEditor(context, editor);
    }, null, context.subscriptions);

    // Highlight / toggle selection
    const highlightCmd = vscode.commands.registerCommand('highlight-code-snippet.highlight', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        const selection = editor.selection;
        if (selection.isEmpty) return;

        const range = new vscode.Range(selection.start, selection.end);
        const ranges = getRangesForDocument(context, editor.document.uri);

        // Toggle logic: If exact match exists, remove it. Otherwise add with current color.
        const index = ranges.findIndex(r => r.range.isEqual(range));
        if (index >= 0) {
            ranges.splice(index, 1);
        } else {
            ranges.push({ range, color: currentColor });
        }

        saveRangesForDocument(context, editor.document.uri, ranges);
        applyDecorationsToEditor(context, editor);
    });

    // NEW: Clear specific selection under cursor
    const clearSpecificCmd = vscode.commands.registerCommand('highlight-code-snippet.clearSpecific', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;
        const selection = editor.selection;

        let ranges = getRangesForDocument(context, editor.document.uri);
        
        // Remove any highlight that intersects/overlaps with the current cursor or selection
        ranges = ranges.filter(r => !r.range.intersection(selection));

        saveRangesForDocument(context, editor.document.uri, ranges);
        applyDecorationsToEditor(context, editor);
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

        const alphas = ['0.1','0.2','0.3','0.4','0.5','0.6','0.7','0.8','0.9'];
        const alphaPick = await vscode.window.showQuickPick(alphas, { placeHolder: 'Pick transparency (alpha)' });
        if (!alphaPick) return;

        currentColor = `rgba(${rgb![0]},${rgb![1]},${rgb![2]},${alphaPick})`;

        await vscode.workspace.getConfiguration('highlightCodeSnippet').update('defaultColor', currentColor, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage(`Highlight color set to ${currentColor}`);
        // Note: We no longer update currently visible tabs here because existing highlights should keep their original colors
    });

    // Clear all highlights for the current file
    const clearCmd = vscode.commands.registerCommand('highlight-code-snippet.clear', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            saveRangesForDocument(context, editor.document.uri, []); // Save empty array
            applyDecorationsToEditor(context, editor);
        }
    });

    context.subscriptions.push(highlightCmd, pickColorCmd, clearCmd, clearSpecificCmd);
}

export function deactivate() {
    decorationTypes.forEach(decType => decType.dispose());
    decorationTypes.clear();
}