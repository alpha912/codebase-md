# AGENTS.md - AI Agent Instructions

## Repository Purpose

CodebaseMD is a VS Code extension that exports a workspace folder, a selection
of files or Git changes as one Markdown, XML or plain-text document, with a
folder tree, token estimates and secret redaction. It runs locally and makes
no network requests. The repository holds the extension source, its tests,
the documentation and the release notes.

## Quick Start for AI Agents

1. Read `docs/architecture.md` (the pipeline and its safety properties) and
   `docs/api-reference.md` (modules and command IDs).
2. Read `src/exporter.ts` for the core flow, then the module you will change.
3. Run the checks for what you touch (see **Before Making Changes**).

## Building

```sh
bun install --frozen-lockfile
bun run check              # Biome, then compile and unit tests
bun run test:integration   # extension host; on headless Linux: xvfb-run -a …
bun run package            # VSIX
```

Use Bun for installs and scripts. Node.js 22.12+ must also be installed. Do
not add `package-lock.json`; `bun.lock` is the lockfile.

## Layout

| Path | Contents |
| --- | --- |
| `src/extension.ts` | Commands, wizard, progress, budget warning, output destinations |
| `src/config.ts` | Reads and validates `codebaseMD.*` settings |
| `src/exporter.ts` | Pipeline: collect, read, redact, transform, render |
| `src/fsUtils.ts` | Ignore rules, containment, directory walk |
| `src/git.ts` | Changed files and filtered diffs |
| `src/secrets.ts` | Heuristic redaction (text and count only) |
| `src/analyzer.ts` | Micro representation and language mapping |
| `src/skeleton.ts` | Declaration outlines |
| `src/tokens.ts` | `ceil(characters / 4)` estimate |
| `src/formatters.ts` | Markdown, XML, text, folder tree |
| `src/types.ts` | Options, document types, defaults, cancellation |
| `src/test/unit/` | Unit tests, run with Mocha on Node |
| `src/test/suite/` | Tests that run inside a VS Code extension host |
| `docs/` | User and developer documentation |
| `releases/` | Release notes per version; VSIX files of releases before 3.0 |
| `scripts/publish-release.cjs` | Used by CI to publish a GitHub release |

## Code Conventions

- **Licensing headers:** every source file starts with
  `SPDX-FileCopyrightText` and `SPDX-License-Identifier` (REUSE). Files that
  cannot carry a header are covered by `REUSE.toml`.
- **Header comments:** source files continue with
  `// File: … / What: … / Why: … / Related: …`. Keep the pattern.
- **TypeScript:** strict, with unused locals and parameters as errors.
  Biome formats and lints (`bun run lint:fix`). No non-null assertions.
- **Module boundary:** only `extension.ts` and `config.ts` import `vscode`.
  Everything else is plain Node code so the unit tests can run it.
- **Tests** import the production module they cover; do not re-implement
  logic in a test.

## Do's and Don'ts

### DO

- Add a test with every behaviour change, and run `bun run check`.
- Keep user-facing claims accurate: token counts, redaction, Micro and
  skeleton modes are heuristics and are described that way everywhere.
- Update `CHANGELOG.md` under `[Unreleased]` and the affected pages in
  `docs/` and `README.md`.
- Keep `engines.vscode` and `@types/vscode` in step; `vsce` refuses to package
  when the types are newer than the engine.

### DON'T

- Don't start a commit or pull request title with `release:`. On `main` that
  prefix publishes a GitHub release.
- Don't weaken the safety properties: no files outside the workspace folder,
  no following symbolic links, redaction before transformation, Git without a
  shell and without external diff or textconv programs.
- Don't log or return matched secret values; redaction reports counts only.
- Don't add runtime dependencies without a strong reason; `ignore` is the only
  one and it ships to every user.
- Don't commit `out/`, `*.vsix` or `node_modules/`.
- Don't change the Micro output format casually; it is documented in
  `docs/micro-export-format.md` and users depend on it.

## Before Making Changes

| You changed | Run |
| --- | --- |
| Anything in `src/` | `bun run check` |
| `extension.ts`, `config.ts`, `package.json` contributions | also `bun run test:integration` |
| Dependencies | also `bun audit` and `bun run package` |
| New files | also `uvx reuse lint` |
| Documentation only | check that relative links resolve |

## Common Tasks

### Adding a setting

1. Add it to `contributes.configuration` in `package.json`.
2. Add the field and default to `ExportOptions` and `defaults` in
   `src/types.ts`, and validate it in `src/config.ts`.
3. Use it in the pipeline, add a unit test, and document it in the settings
   table in `README.md` and in `docs/configuration.md`.

### Adding a secret pattern

1. Add the pattern to `src/secrets.ts`.
2. Add a positive case and a near-miss case to the redaction test in
   `src/test/unit/exporter.test.ts`, using synthetic values only.

### Supporting a file type

1. Add the extension or special name in `src/exporter.ts`
   (`isSupportedFile`) and the language in `src/analyzer.ts`.
2. Add cases to the language-mapping and support tests.
