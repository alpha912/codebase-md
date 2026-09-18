# Usage

## Export Wizard

Run **CodebaseMD: Export Wizard** from the Command Palette. Choose:

1. **Scope**: workspace, selected files/folders, Git changes, or current file.
2. **Content mode**: full source, Micro summary, or best-effort skeleton.
3. **Format**: Markdown, XML, or plain text.
4. **Destination**: file, clipboard, or editor.

Cancel any picker to stop. During preparation, use the progress notification's cancel control. If the final token estimate exceeds your configured budget, choose **Export anyway** to proceed or dismiss the warning to stop. No destination is written until preparation and budget checks finish.

## Original export commands

**Export Codebase as Markdown** and **Export Micro Codebase** export one workspace folder and open a save dialog. In a multi-root workspace, choose the folder first.

Right-click selected Explorer items and choose **Export Selected as Markdown** or **Export Selected as Micro Codebase**. Running either command from the Command Palette opens a picker. Selections must belong to the same workspace folder.

## Git Changes

Run **CodebaseMD: Export Git Changes** in a trusted local Git workspace. It selects tracked files changed against HEAD plus untracked files, using configured output settings. Deleted files receive a status entry.

Enable `codebaseMD.includeDiff` to include filtered tracked-file diffs. Files whose contents are excluded, unavailable, oversized, binary, or unsupported do not contribute diff contents. Untracked files include their contents without a patch. Repositories with no commits are supported.

Git selection and diffs reflect disk/index state. Unsaved changes alone do not select a file for Git export; selected open files use editor content.

## Copy Current File

Open a saved file in your workspace and run **CodebaseMD: Copy Current File**. It includes unsaved edits and applies the configured format, content mode, filtering, size limit and redaction. Untitled files are not supported.

## Understanding the output

Exports contain file paths, a folder tree, language statistics, estimated content tokens, and the requested representation. Markdown also has a linked contents list. The completion notification and budget check use an estimate of the whole document, including formatting and diffs.

Token counts, secret detection and condensed representations are heuristic. Consult [accuracy and scope](../README.md#accuracy-and-scope) and [Micro format details](micro-export-format.md). There is no fixed compression ratio.

## Filtering and settings

See [configuration](configuration.md). Exclusions apply equally to workspace exports and explicit selections. To hide a sensitive path entirely, use `codebaseMD.exclude` or `.gitignore`; `.codebaseignore` hides only its content.
