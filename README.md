# Highlight Code Snippet

Highlight selected code directly in the editor to mark important logic, temporary notes, or areas of interest without modifying the file itself.

This extension uses editor decorations only. No comments are inserted. No text is changed. The source stays clean.

---

## Features

- Highlight any selected text in the editor
- Works from the right-click context menu
- Keyboard shortcut support
- Theme-aware highlighting (works in light and dark themes)
- No interference with existing VS Code behavior
- Compatible with VS Code and VS Code–adjacent editors (VSCodium, Cursor, etc.)

---

## Command

**Highlight Selection**  
Toggles a highlight on the currently selected text.

---

## Keyboard Shortcut

Windows / Linux:

Ctrl + H, then Ctrl + I

This is a chorded shortcut. Press Ctrl+H first, then Ctrl+I.

---

## Context Menu

Right-click in the editor with text selected and choose:

Highlight Selection

This entry is additive and does not override or conflict with VS Code’s default context menu actions.

---

## Settings

You can configure the default highlight color:

highlightCodeSnippet.defaultColor

The value should be an RGBA color string.

Example:

"highlightCodeSnippet.defaultColor": "rgba(255, 255, 0, 0.6)"

If not set, the extension falls back to a theme-appropriate highlight color.

---

## How to Use

1. Select any text in the editor
2. Highlight it using one of the following:
   - Right-click and select **Highlight Selection**
   - Press Ctrl + H, then Ctrl + I
3. Run the same command again on the same selection to remove the highlight

Highlights are visual only and reset when the editor reloads.

---

## Notes

- Highlights are session-based and not persisted across restarts
- No syntax highlighting or language features are modified
- Designed as a lightweight annotation utility, not a theme or snippet tool

---

## License

MIT