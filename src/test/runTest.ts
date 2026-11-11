// SPDX-FileCopyrightText: 2024-2026 Alphin Tom
//
// SPDX-License-Identifier: MIT

// File: src/test/runTest.ts
// What: Launches a VS Code extension host and runs the integration suite inside it.
// Why: Commands, clipboard output and unsaved-buffer handling can only be verified in a real host.
// Related: suite/index.ts

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { runTests } from '@vscode/test-electron';

async function main() {
  const fixture = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'codebasemd-host-'));
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to test runner
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    // Download VS Code, unzip it and run the integration test
    await fs.promises.writeFile(path.join(fixture, 'fixture.ts'), 'export const answer = 42;\n');
    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        fixture,
        '--disable-extensions',
        '--skip-welcome',
        '--skip-release-notes',
        '--disable-workspace-trust',
      ],
    });
  } catch (err) {
    console.error('Failed to run tests', err);
    process.exitCode = 1;
  } finally {
    if (path.resolve(fixture).startsWith(`${path.resolve(os.tmpdir()) + path.sep}codebasemd-host-`)) {
      await fs.promises.rm(fixture, { recursive: true, force: true });
    }
  }
}

main();
