# Highlight Code Snippet

Highlight selected code directly in the editor to mark important logic, temporary notes, or areas of interest without modifying the file itself.

This extension uses editor decorations only. No comments are inserted. No text is changed. The source stays clean.

Source Code: https://github.com/Rovie569/Highlight-Code-Snippets

---

## Features

* Highlight any selected text in the editor
* Multi-color highlighting with customizable transparency
* Highlights automatically save per file and persist across reloads
* Clear specific highlights or all highlights at once
* Works from the right-click context menu
* Keyboard shortcut support
* Theme-aware highlighting (works in light and dark themes)
* No interference with existing VS Code behavior

---

## Command

**Highlight Selection**

Toggles a highlight on the currently selected text.

**Pick Highlight Color**

Opens color picker menu to choose preset colors or custom RGB values with transparency.

**Clear Specific Highlight**

Removes the highlight at your cursor or active selection.

**Clear All Highlights**

Removes all highlights in the active file.

---

## Keyboard Shortcut

Windows / Linux:

Ctrl + H, then Ctrl + I

This is a chorded shortcut. Press Ctrl+H first, then Ctrl+I.

Pick Highlight Color:

Ctrl + Alt + H

Clear Specific Highlight:

Ctrl + Shift + Alt + H

Clear All Highlights:

Ctrl + Shift + H

---

## Context Menu

Right-click in the editor with text selected and choose:

Highlight Selection

Pick Highlight Color

Clear Specific Highlight

Clear All Highlights

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
* Right-click and select **Highlight Selection**
* Press Ctrl + H, then Ctrl + I


3. Run the same command again on the same selection to remove the highlight
4. Change active color with **Pick Highlight Color** (Ctrl + Alt + H)
5. Remove highlights with **Clear Specific Highlight** (Ctrl + Shift + Alt + H) or **Clear All Highlights** (Ctrl + Shift + H)

Highlights are visual only and saved automatically across sessions.

---

## Notes

* Highlights are automatically persisted across file switching and editor restarts
* No syntax highlighting or language features are modified
* Designed as a lightweight annotation utility, not a theme or snippet tool

---

## License

MIT