// SPDX-FileCopyrightText: 2024-2026 Alphin Tom
//
// SPDX-License-Identifier: MIT

// File: src/test/suite/fileProcessing.test.ts
// What: Checks file-support rules inside the extension host.
// Why: Guards the production rules against drifting from what the host loads.
// Related: ../../exporter.ts

import * as assert from 'node:assert';
import { isSupportedFile } from '../../exporter';

suite('File processing integration', () => {
  test('uses production support rules', () => {
    assert.ok(isSupportedFile('Dockerfile'));
    assert.ok(isSupportedFile('index.ts'));
    assert.ok(!isSupportedFile('photo.png'));
  });
});
