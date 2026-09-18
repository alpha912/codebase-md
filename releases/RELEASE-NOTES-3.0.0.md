# CodebaseMD 3.0.0

CodebaseMD now prepares code context in Markdown, XML and plain text, with file, clipboard and editor destinations.

## Added

- Four-step Export Wizard, Export Git Changes and Copy Current File commands.
- Approximate token counts, configurable budget warnings, per-language statistics, largest files and a linked Markdown contents list.
- Full, existing Micro and best-effort skeleton modes; optional line numbers and custom headers.
- Default-on secret redaction for common keys, credentials, JWTs and private keys, with count-only reporting.
- Resource-scoped settings, progress and cancellation, binary/large-file handling, nested ignore rules, and protection against following symlinks/junctions.
- Optional filtered Git diffs, support for untracked/deleted files and repositories without commits.

## Compatibility

The development toolchain now uses `@vscode/vsce` 4 and Mocha 12, requires Node.js 22.12+, and has zero advisories in the full npm audit at release preparation. CI covers Windows/Linux builds, tests and packaging; Dependabot tracks package and action updates.

The original four commands still save Markdown. Micro uses the existing analyzer. `.codebaseignore` still hides content while retaining paths. Output formatting gains statistics, a tree and a contents list. Secrets are now redacted by default, and large/binary files have omission notices. Open saved files include unsaved editor contents.

## Limits

Token counts and redaction are heuristic. Skeletons are not parser-complete. Review output before sharing. Only local filesystem workspace folders are supported, one root per export. Git scope/diffs reflect disk/index state; diffs omit content that was excluded or unavailable. No Marketplace publication is performed by the build scripts unless `npm run publish` is explicitly run.

## Install

Download `codebase-md-3.0.0.vsix` from this GitHub release and use **Extensions → … → Install from VSIX…** in VS Code. Then run **CodebaseMD: Export Wizard**. A SHA-256 checksum is provided alongside the VSIX. Marketplace publication is separate.
