# CodebaseMD 4.0.0

CodebaseMD 4.0.0 is a maintenance release. Exports work as they did in 3.0.0;
the major version marks a higher minimum VS Code version.

## Breaking

- **VS Code 1.146 or later is required** (3.0.0 required 1.70). If you use an
  older VS Code, or an editor built on an older VS Code base, stay on
  [3.0.0](https://github.com/alpha912/codebase-md/releases/tag/v3.0.0).

Commands, settings, ignore files and output formats are unchanged. No
migration is needed.

## Changed

- The download is much smaller: about 92 KB instead of 4.7 MB. The VSIX now
  ships a 256 px icon and no longer bundles the documentation, release notes,
  banner and full-size logos. The documentation is on
  [GitHub](https://github.com/alpha912/codebase-md/tree/main/docs).
- `ignore`, the one runtime dependency, moves from 5.x to 7.x.

## Fixed

- Micro summaries no longer keep a stray `*` in the description taken from a
  `/** … */` comment.

## Project

- Development tooling: TypeScript 7 with stricter compiler checks, Bun for
  installs and scripts, and Biome for linting and formatting.
- Documentation: a rewritten README, an architecture guide, a security policy,
  support and agent guides, and issue and pull request templates.
- REUSE licensing metadata, checked in CI.
- More unit tests; the dependency audit reports no advisories at release
  preparation.

## Limits

Unchanged from 3.0.0. Token counts and secret redaction are heuristic, and
Micro and skeleton modes are not parser-complete; review output before sharing
it. Only local workspace folders are supported, one folder per export. CI
covers Linux and Windows.

## Install

Download `codebase-md-4.0.0.vsix` from this release and use **Extensions → …
→ Install from VSIX…** in VS Code, then run **CodebaseMD: Export Wizard**. A
SHA-256 checksum is provided alongside the VSIX. Marketplace publication is
separate.
