# Contributing

See the [repository contribution guide](../CONTRIBUTING.md) for setup, testing, and pull request guidance.

Development requires Bun 1.4+, Node.js 22.12+ (Node 24 recommended) and Git. Run `bun install --frozen-lockfile`, `bun run lint`, `bun run test`, `bun run test:integration`, and `bun run package`. `bun run lint:fix` applies Biome formatting and safe lint fixes. On headless Linux, run integration tests with `xvfb-run -a`.

Production modules are described in the [developer reference](api-reference.md). Add regression tests that import the actual module being changed. Keep generated JavaScript in `out/` and do not commit VSIX files.
