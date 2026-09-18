# CodebaseMD 3.0 plan and research

Research checked September 18, 2026 against primary project documentation:

- [Repomix getting started](https://repomix.com/guide/): repository context and token tracking.
- [Repomix output formats](https://repomix.com/guide/output): structured XML, Markdown and text output (also supports JSON).
- [Repomix security](https://repomix.com/guide/security): security scanning as part of repository preparation.
- [code2prompt repository](https://github.com/mufeedvh/code2prompt): clipboard output, token tracking, filtering, templates and Git context.

These establish practical priorities; CodebaseMD does not claim feature parity or model-specific token accuracy. No star-count comparisons are used because they are volatile and do not establish usability.

## Release goal

Make the existing VS Code workflow useful for preparing bounded, reviewable AI context without requiring a CLI or sending source code to a service.

## Implementation sequence

1. Repair the interrupted manifest edit; advance package and lockfile to 3.0.0.
2. Extract the existing Micro analyzer intact and split filesystem traversal, Git access, redaction, skeleton generation, token estimation, formatting and orchestration into modules.
3. Add Markdown/XML/text and file/clipboard/editor destinations; retain the original command IDs and Markdown-to-file behavior.
4. Add a four-step wizard, current-file copy and Git changes export, with resource-scoped settings, progress, cancellation and budget confirmation.
5. Add production-module tests with temporary files and Git repositories, plus extension-host activation and command tests.
6. Document limitations, compile, test and build a local VSIX.

## Design choices

- Token estimates are explicitly heuristic; budget warnings use the final output, not just raw source.
- `.codebaseignore` remains content-only to preserve its existing contract.
- Git diffs only run for files whose content passed export filters. Deleted files are represented by a status rather than old source.
- Git uses argument arrays, literal pathspecs, timeouts, and disables external diff/textconv commands.
- Redaction runs before compacting and also covers diffs and custom headers. The report contains counts rather than matched values.
- Traversal is asynchronous, deterministic and deduplicated; symlinks/junctions are skipped, including explicit selections beneath them.
- Skeleton extraction is best-effort; parser-quality compression and model-specific tokenization are future work.
- The extension includes no telemetry, remote repository ingestion, or AI provider integration. GitHub release publication is separate from extension runtime behavior.

## Validation

Validation completed on Windows with Node 24 and VS Code 1.138.0:

- TypeScript compilation passes.
- 19 production-module tests pass.
- 24 tests pass in the VS Code host, including current-file copy of unsaved content with redaction in all three formats.
- VSIX packaging passes; archive inspection confirms runtime modules and the `ignore` dependency are present and source/test files are excluded.
- `git diff --check` passes.
- The full dependency audit reports zero vulnerabilities after modernizing the build/test toolchain to `@vscode/vsce` 4 and Mocha 12 and updating the lockfile.

`npm test` runs the module tests; `npm run test:integration` runs the extension-host checks. `npm run package` builds a local VSIX without publishing it.
