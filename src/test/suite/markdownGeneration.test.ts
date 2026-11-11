// SPDX-FileCopyrightText: 2024-2026 Alphin Tom
//
// SPDX-License-Identifier: MIT

// File: src/test/suite/markdownGeneration.test.ts
// What: Checks fence and tree generation inside the extension host.
// Why: Guards the production formatters against drifting from what the host loads.
// Related: ../../formatters.ts

import * as assert from 'node:assert';
import { codeFence, folderTree } from '../../formatters';

suite('Markdown generation integration', () => {
  test('uses production fence and tree generation', () => {
    assert.ok(codeFence('```').startsWith('````'));
    assert.ok(folderTree(['src/a.ts']).includes('└── a.ts'));
  });
});
