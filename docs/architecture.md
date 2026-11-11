# Architecture

CodebaseMD is a single VS Code extension with one runtime dependency
(`ignore`). An export is a pipeline: settings are validated, files are
selected, each file is read, redacted and transformed, and the result is
rendered as one document. Nothing is written until the whole document exists
and the token-budget check has passed.

```text
VS Code command ──► config.ts ──► exporter.ts ──► formatters.ts ──► file / clipboard / editor
   (extension.ts)   validated      │
                    settings       ├─ fsUtils.ts   ignore rules, containment, directory walk
                                   ├─ git.ts       changed files and filtered diffs
                                   ├─ secrets.ts   redaction, before any transformation
                                   ├─ analyzer.ts  Micro summaries, language mapping
                                   ├─ skeleton.ts  declaration outlines
                                   └─ tokens.ts    characters / 4 estimate
```

## Module boundary

Only `extension.ts` and `config.ts` import `vscode`. Everything else is plain
Node code. `exportCodebase(root, options, request, hooks)` receives what it
needs through its arguments:

- `options`: an `ExportOptions` value, already validated;
- `request`: either a list of selected absolute paths or `{ git: true }`;
- `hooks`: `cancelled()`, `progress(message)` and `readText(path)`, which lets
  the command layer supply unsaved editor contents.

It returns the structured document, the formatted text and a token estimate
for the whole output. It does not write files, touch the clipboard or show
notifications. This is what lets the unit tests exercise filtering, redaction
and Git behaviour against temporary directories without an editor.

## Stages

### 1. Settings (`config.ts`)

Reads `codebaseMD.*` for the workspace folder being exported. Every value is
checked; anything of the wrong type or out of range falls back to its default,
so the pipeline never sees invalid options.

### 2. File selection (`fsUtils.ts`, `git.ts`)

`createFilters` builds three rule sets: the built-in exclusions plus
`codebaseMD.exclude`; `.codebaseignore` from the workspace root (content
only); and, when `respectGitignore` is on, each directory's `.gitignore`,
evaluated ancestor by ancestor so a nested negation cannot re-include an
ignored directory.

`collectFiles` walks the workspace folder, or the selected paths, or the paths
Git reports as changed. For every path it:

- resolves it and rejects anything outside the workspace folder;
- checks each path component with `lstat` and stops at a symbolic link or
  junction, including when a child of a link was selected explicitly;
- applies the exclusion rules;
- deduplicates, so overlapping selections produce one entry.

For Git scope, `getGitChanges` lists files changed against `HEAD` (staged and
unstaged), untracked files that are not ignored, and deleted files. A
repository without commits is handled by listing the index instead.

### 3. Reading and transforming (`exporter.ts`)

Each selected file becomes an entry with a path, a language and either content
or an omission notice. Content is omitted when the file is matched by
`.codebaseignore`, is not a supported type, is not a regular file, exceeds
`maxFileSizeKB`, contains a NUL byte (binary) or cannot be read. The path
stays in the export so the reader can see that something was left out.

For files that are read, the order is fixed:

1. **Read** the editor buffer if the hook supplies one, otherwise the file.
2. **Redact** (`secrets.ts`), unless `redactSecrets` is off.
3. **Transform** according to the content mode: unchanged, Micro
   (`analyzer.ts`) or skeleton (`skeleton.ts`).
4. **Number lines**, if requested.
5. **Estimate tokens** (`tokens.ts`) on the result.

Redaction comes before transformation so a condensed mode can never surface a
value that redaction would have removed. The custom header and any diffs are
redacted too.

### 4. Diffs (`git.ts`)

With `includeDiff`, a diff is produced for each tracked file whose content was
included. Files that were omitted for any reason contribute no diff, so a diff
cannot reveal content the filters removed. Diffs are size-limited like file
contents.

### 5. Rendering (`formatters.ts`)

`formatDocument` renders the document as Markdown, XML or plain text. All
three carry the summary line, the custom header, the folder tree, per-language
statistics, each file and any diffs. Markdown adds a linked contents list.

- Markdown code fences are made longer than any run of backticks in the
  content, so source text cannot close a fence early.
- XML text and attributes are escaped, and characters that XML 1.0 forbids are
  replaced.

### 6. Output (`extension.ts`)

The command layer estimates tokens for the complete output, warns if the
estimate exceeds `tokenBudget`, and only then writes to the chosen
destination. Saving refuses to overwrite a file that is part of the export.

## Safety properties

These are the behaviours a change must not weaken. Each is covered by unit
tests in `src/test/unit/`.

| Property | Where it is enforced |
| --- | --- |
| No file outside the workspace folder is exported | `isWithin`, `collectFiles` |
| Symbolic links and junctions are never followed | `collectFiles`, `exportCodebase` |
| Excluded paths never appear; `.codebaseignore` content never appears | `createFilters`, `exportCodebase` |
| Redaction runs before transformation and reports counts only | `exportCodebase`, `redactSecrets` |
| Diffs never include content the filters removed | `exportCodebase` |
| Git runs without a shell, prompts, pagers, external diff or textconv programs | `git.ts` |
| Git operations require a trusted workspace | `extension.ts` |
| A cancelled export returns nothing | `checkCancelled` throughout |
| Output stays well-formed for any source text | `codeFence`, `xmlEscape` |

## Heuristics

Three parts of the pipeline are deliberately approximate, and the UI and
documentation say so:

- **Token estimate:** `ceil(characters / 4)`. It is model-independent and
  cheap; it is not a tokenizer.
- **Secret redaction:** regular expressions for common provider tokens, JWTs,
  private keys and password or token assignments. It can miss secrets and can
  redact ordinary values.
- **Micro and skeleton modes:** regular expressions, not parsers. When
  skeleton mode recognises no declarations in a file, it returns the file
  unchanged rather than an empty outline.

## Tests

| Suite | Location | Runs in | Covers |
| --- | --- | --- | --- |
| Unit | `src/test/unit/` | Node (Mocha) | The pipeline against temporary directories and Git repositories; pure helpers |
| Extension host | `src/test/suite/` | A downloaded VS Code build | Activation, commands, clipboard output, unsaved buffers |

`bun run test` runs the unit suite. `bun run test:integration` runs every
compiled test, unit tests included, inside the extension host.

## Build and release

TypeScript compiles `src/` to CommonJS in `out/`. `vsce package` bundles
`out/` (without tests and source maps), the `ignore` package, the icon, the
README, the changelog and the license into the VSIX; `.vscodeignore` lists
what is left out. CI runs lint, tests, the dependency audit and packaging on
Linux and Windows, and a commit on `main` whose message starts with `release:`
publishes a GitHub release from that commit. See
[CONTRIBUTING.md](../CONTRIBUTING.md#releases).
