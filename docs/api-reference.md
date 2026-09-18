# Developer API Reference

CodebaseMD does not expose a stable external programmatic API. Its production modules are independently testable:

| Module | Responsibility |
| --- | --- |
| `src/extension.ts` | VS Code commands, wizard, progress, budget warning and output destinations |
| `src/config.ts` | Validated resource-scoped settings |
| `src/exporter.ts` | Collect, read, transform and render an export |
| `src/fsUtils.ts` | Ignore rules, safe traversal, containment and deduplication |
| `src/git.ts` | Changed file discovery and filtered diffs |
| `src/analyzer.ts` | Existing Micro representation and language mapping |
| `src/skeleton.ts` | Best-effort declaration outlines |
| `src/secrets.ts` | Heuristic redaction and counts |
| `src/tokens.ts` | Character-based token estimate |
| `src/formatters.ts` | Markdown, XML, text and folder tree rendering |
| `src/types.ts` | Options, export document types and cancellation contract |

`exportCodebase(root, options, request, hooks)` returns a document, formatted content and final-output token estimate. `request` can provide selected absolute paths or enable Git scope. Hooks provide cancellation, progress and optional editor-buffer content. It does not write files or modify the clipboard. The command layer owns those effects.

The original command IDs remain `codebaseMD.exportAll`, `codebaseMD.exportSelected`, `codebaseMD.exportMicro` and `codebaseMD.exportMicroSelected`. New commands are `codebaseMD.exportWizard`, `codebaseMD.exportGitChanges` and `codebaseMD.copyCurrentFile`. Selected commands accept a resource URI and an optional array of selected URIs.

Run `npm test` for production module tests and `npm run test:integration` for extension-host command checks. Build outputs belong in `out/`.
