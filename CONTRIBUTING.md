# Contributing to CodebaseMD

Thank you for helping. CodebaseMD is a small VS Code extension with one
maintainer, so the most useful contributions are focused: a bug report with a
minimal example, a fix with a test, or a documentation correction.

## Before You Start

- **Bugs and ideas:** open an issue with the
  [templates](https://github.com/alpha912/codebase-md/issues/new/choose). For
  anything larger than a small fix, open an issue first so the approach can be
  agreed before you write code.
- **Security problems:** do not open an issue. Follow [SECURITY.md](SECURITY.md).
- **Questions:** see [SUPPORT.md](SUPPORT.md).
- Everyone taking part is expected to follow the
  [Code of Conduct](CODE_OF_CONDUCT.md).

## Setting Up

You need [Bun](https://bun.sh) 1.4+, Node.js 22.12+ (24 recommended) and Git.
Bun installs dependencies and runs scripts; Node is still required because VS
Code runs extensions on Node and `vsce` calls npm when packaging.

```sh
git clone https://github.com/<your-username>/codebase-md.git
cd codebase-md
bun install --frozen-lockfile
bun run check
```

To try the extension, open the folder in VS Code and press `F5` to start an
Extension Development Host, or build a VSIX with `bun run package` and install
it with **Extensions → … → Install from VSIX…**.

| Command | What it does |
| --- | --- |
| `bun run lint` | Biome lint and format check |
| `bun run lint:fix` | Apply Biome formatting and safe fixes |
| `bun run typecheck` | Type-check without writing output |
| `bun run test` | Compile, then run the unit tests |
| `bun run check` | `lint` followed by `test` |
| `bun run test:integration` | Run the tests inside a VS Code extension host |
| `bun run package` | Build `codebase-md-<version>.vsix` |
| `bun audit` | Check dependencies for known advisories |

On headless Linux, run the integration tests with
`xvfb-run -a bun run test:integration`. The first run downloads a VS Code
build into `.vscode-test/`.

## Making a Change

1. Create a branch from `main` (`fix/…`, `feat/…`, `docs/…`).
2. Make the change. Keep to the module boundaries in
   [docs/architecture.md](docs/architecture.md): only `extension.ts` and
   `config.ts` may import `vscode`; the export pipeline stays plain Node code
   so it can be unit tested.
3. Add or update tests. Tests import the production module they cover;
   unit tests go in `src/test/unit/`, tests that need VS Code in
   `src/test/suite/`.
4. Update the documentation the change affects, and add a line under
   `[Unreleased]` in [CHANGELOG.md](CHANGELOG.md).
5. Run `bun run check`, and `bun run test:integration` if you touched
   `extension.ts`, `config.ts` or `package.json` contributions.

Conventions:

- **TypeScript:** strict mode with unused-code checks; Biome formats and
  lints. Do not commit generated JavaScript; compiled output lives in `out/`.
- **File headers:** every source file starts with SPDX lines and a
  `File / What / Why / Related` comment. Keep the pattern in new files.
- **Honest output:** token counts, redaction and the condensed modes are
  heuristics. Describe them as such in code comments, UI text and docs.
- **Safety properties:** exports never include files outside the workspace
  folder, never follow symbolic links, and redact before any transformation.
  A change that weakens one of these needs a test and a clear reason.
- **Dependencies:** the extension ships one runtime dependency (`ignore`).
  Adding another needs a strong case, since it ships to every user.

## Pull Requests

- Keep each pull request to one topic and fill in the template.
- Use [Conventional Commits](https://www.conventionalcommits.org/) prefixes
  for the title: `fix:`, `feat:`, `docs:`, `chore:`, `test:`, `refactor:`.
  Do not start a title with `release:`; that prefix publishes a release (see
  below).
- CI must pass on Linux and Windows: lint, unit tests, extension-host tests,
  dependency audit, packaging and the REUSE check.
- Pull requests are squash-merged.

## Licensing of Contributions

CodebaseMD is MIT licensed. By submitting a contribution you agree that it is
licensed under the [MIT License](LICENSE.md), and you confirm that you have
the right to submit it. No separate contributor agreement is required.

The repository follows the [REUSE](https://reuse.software/) specification.
New source files need the SPDX header used elsewhere in `src/`; files that
cannot carry a header are covered by [`REUSE.toml`](REUSE.toml). Run
`uvx reuse lint` (or `pipx run reuse lint`) after adding files.

## Releases

Releases are cut by the maintainer and published by CI.

1. Update `version` in `package.json`, move the `[Unreleased]` entries in
   `CHANGELOG.md` under the new version and date, and write
   `releases/RELEASE-NOTES-<version>.md`.
2. Update version-specific text in `README.md` and `docs/`.
3. Merge to `main` with a commit message that starts with `release:`.

A `release:` commit on `main` triggers publication only after the Linux and
Windows jobs pass. The release job packages that exact commit, creates a draft
GitHub release with the VSIX and its SHA-256 checksum, and then publishes it
as the latest release. Existing tags are never overwritten. Ordinary commits
and pull requests cannot publish. Publishing to the Visual Studio Marketplace
is a separate, manual step (`bun run publish`).

### Release checklist

- [ ] `bun run check` and `bun run test:integration` pass locally
- [ ] `bun audit` reports no advisories
- [ ] `CHANGELOG.md` and `releases/RELEASE-NOTES-<version>.md` describe every
      user-visible change, including breaking ones
- [ ] `engines.vscode` matches the minimum version stated in the docs
- [ ] The packaged VSIX installs and the Export Wizard runs

## Questions

Open a [discussion](https://github.com/alpha912/codebase-md/discussions) or
see [SUPPORT.md](SUPPORT.md).
