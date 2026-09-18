# Configuration

CodebaseMD 3.0 exposes settings under **Settings → CodebaseMD**. Settings can be set per workspace folder. See the [complete settings table](../README.md#settings) for defaults and descriptions.

Example workspace settings:

```json
{
  "codebaseMD.format": "xml",
  "codebaseMD.contentMode": "full",
  "codebaseMD.target": "clipboard",
  "codebaseMD.tokenBudget": 32000,
  "codebaseMD.redactSecrets": true,
  "codebaseMD.maxFileSizeKB": 1024,
  "codebaseMD.exclude": ["fixtures/", "*.generated.ts"],
  "codebaseMD.includeDiff": false
}
```

The four original export commands always save Markdown and use their original full/Micro modes. The wizard uses configured defaults and lets you choose all output options. Git export uses the configured format, mode and destination; Copy Current File always uses the clipboard.

## Content exclusions

Create `.codebaseignore` in the workspace root to omit file contents while retaining paths in the exported tree:

```gitignore
*.test.ts
private/
.env*
```

Use `codebaseMD.exclude` or `.gitignore` when paths should also be omitted. Root and nested `.gitignore` files are respected unless `respectGitignore` is disabled. Default dependency/build/archive exclusions still apply. Selected files follow the same filters as workspace exports.

## Limits

Files above `maxFileSizeKB`, binary files and unsupported types receive omission notices. Symbolic links and junctions are skipped. Token estimates, redaction and skeleton extraction are heuristic; see [accuracy and scope](../README.md#accuracy-and-scope). No source edits or rebuilds are needed to change settings.
