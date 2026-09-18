# Troubleshooting

## Commands are missing

Confirm the extension is enabled, reload VS Code, and search for **CodebaseMD: Export Wizard**. The v3 GitHub VSIX may be newer than the Marketplace version. VS Code 1.70 or later is required.

## No files to export

Open a local workspace folder. Check root/nested `.gitignore` files, `codebaseMD.exclude`, and default exclusions. Default output names, dependency/build directories and symbolic links are skipped. Selections must be inside one open workspace folder.

## Content is omitted or incomplete

Read the omission notice next to the file. Check `.codebaseignore`, `maxFileSizeKB`, binary detection, and file-type support. Try full mode if a Micro or skeleton summary misses a declaration. These modes are heuristic and do not promise a fixed compression ratio.

## Export stops at a token warning

Choose **Export anyway**, select a smaller scope, increase `tokenBudget`, or set it to `0` to disable warnings. Token estimates are approximate and include formatting overhead for budget checks.

## Git export fails

Verify Git is available on PATH and the workspace is inside a Git repository. Git exports require a trusted workspace. Review VS Code's error notification. The command does not run external diff or textconv tools.

Git scope uses disk/index changes; save a buffer-only change first if you want Git to select it. Use Copy Current File to export unsaved changes directly.

## Saving or clipboard access fails

Choose a writable destination. A source file included in the export cannot be overwritten by the save operation. Try the wizard's editor destination if the clipboard is unavailable. Export errors appear in VS Code notifications; CodebaseMD does not provide an Output channel.

## Unexpected redaction

The detector may treat an ordinary password/token assignment as a secret. Review the source and output. Disabling `redactSecrets` is possible, but review the resulting export before sharing. The detector is not a guarantee that all sensitive data has been removed.

If the issue persists, [open a GitHub issue](https://github.com/alpha912/codebase-md/issues) with extension/VS Code versions, platform, command, and a minimal sanitized example. Do not attach private code or credentials.
