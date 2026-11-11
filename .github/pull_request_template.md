## What and why

<!-- What does this change, and why? Link the issue: Closes #123 -->

## Areas touched

- [ ] Export pipeline (`exporter`, `fsUtils`, `git`, `secrets`)
- [ ] Output (`formatters`, Micro, skeleton, token estimate)
- [ ] VS Code integration (`extension`, `config`, `package.json` contributions)
- [ ] Documentation
- [ ] Repository (CI, dependencies, licensing)

## How it was tested

<!-- Commands you ran and what you checked by hand, e.g. the exported output. -->

## Checklist

- [ ] Tests added or updated for behaviour changes
- [ ] `bun run check` passes; `bun run test:integration` passes if VS Code integration changed
- [ ] `CHANGELOG.md` updated under `[Unreleased]`
- [ ] Documentation updated for user-visible changes
- [ ] Breaking changes are marked **BREAKING** with migration notes
- [ ] Safety properties are unchanged (workspace containment, no symlink following, redaction before transformation), or the change is explained above
- [ ] New files have SPDX headers or are covered by `REUSE.toml`
- [ ] The title does not start with `release:`
- [ ] I agree my contribution is licensed under the MIT License (see CONTRIBUTING.md)
