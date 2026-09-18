# Contributing

See the [repository contribution guide](../CONTRIBUTING.md) for setup, testing, and pull request guidance.

Development requires Node.js 22.12+ (Node 24 recommended) and Git. Run `npm ci`, `npm test`, `npm run test:integration`, and `npm run package`. There is no separate lint command. On headless Linux, run integration tests with `xvfb-run -a`.

Production modules are described in the [developer reference](api-reference.md). Add regression tests that import the actual module being changed. Keep generated JavaScript in `out/` and do not commit VSIX files.
