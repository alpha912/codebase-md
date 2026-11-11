// SPDX-FileCopyrightText: 2024-2026 Alphin Tom
//
// SPDX-License-Identifier: MIT

// File: src/test/unit/helpers.test.ts
// What: Unit tests for language mapping, the Micro representation, path containment and formatting helpers.
// Why: Pins the small pure functions the pipeline is built from.
// Related: ../../analyzer.ts, ../../fsUtils.ts, ../../formatters.ts

import * as assert from 'node:assert';
import * as path from 'node:path';
import { condenseMicroCode, getLanguageForSpecialFile, getLanguageFromExtension } from '../../analyzer';
import { codeFence, folderTree, formatDocument, xmlEscape } from '../../formatters';
import { isWithin, relativePath } from '../../fsUtils';
import type { ExportDocument } from '../../types';

suite('Language mapping', () => {
  test('maps known extensions and falls back to unknown', () => {
    assert.strictEqual(getLanguageFromExtension('.ts'), 'typescript');
    assert.strictEqual(getLanguageFromExtension('.py'), 'python');
    assert.strictEqual(getLanguageFromExtension('.zzz'), 'unknown');
  });

  test('maps extensionless files and falls back to plaintext', () => {
    assert.strictEqual(getLanguageForSpecialFile('Dockerfile'), 'dockerfile');
    assert.strictEqual(getLanguageForSpecialFile('Makefile'), 'makefile');
    assert.strictEqual(getLanguageForSpecialFile('nope'), 'plaintext');
  });
});

suite('Micro representation', () => {
  const source = [
    'import { x } from "./x";',
    'export class Greeter {',
    '  private name: string;',
    '  public greet(who: string): string {',
    '    return who;',
    '  }',
    '}',
    'export function hi(): void {}',
    '',
  ].join('\n');

  test('summarises path, dependencies, exports and members', () => {
    const micro = condenseMicroCode(source, 'greeter.ts', 'src/greeter.ts');
    assert.ok(micro.startsWith('// PATH: src/greeter.ts [TYPESCRIPT]\n'));
    assert.ok(micro.includes('// DEPS: ./x'));
    assert.ok(micro.includes('EXPORT [C:1, F:1]'));
    assert.ok(micro.includes('C+ Greeter {'));
    assert.ok(micro.includes('V- name:string'));
    assert.ok(micro.includes('F+ greet(who:string):string'));
    assert.ok(micro.includes('F+ hi'));
  });

  test('description comes from the leading comment without comment markers', () => {
    const micro = condenseMicroCode(`/** Greets people. */\n${source}`, 'greeter.ts', 'src/greeter.ts');
    assert.ok(micro.includes('// DESC: Greets people.\n'));
  });

  test('drops method bodies', () => {
    const micro = condenseMicroCode(source, 'greeter.ts', 'src/greeter.ts');
    assert.ok(!micro.includes('return who;'));
  });
});

suite('Path containment', () => {
  const root = path.resolve('workspace', 'project');

  test('accepts the root and its descendants only', () => {
    assert.ok(isWithin(root, root));
    assert.ok(isWithin(root, path.join(root, 'src', 'a.ts')));
    assert.ok(!isWithin(root, path.dirname(root)));
    assert.ok(!isWithin(root, `${root}-sibling`));
    assert.ok(!isWithin(root, path.join(root, '..', 'other', 'a.ts')));
  });

  test('relative paths always use forward slashes', () => {
    assert.strictEqual(relativePath(root, path.join(root, 'src', 'nested', 'a.ts')), 'src/nested/a.ts');
  });
});

suite('Formatting helpers', () => {
  const doc: ExportDocument = {
    files: [{ path: 'a.ts', language: 'typescript', content: 'x', tokens: 1, redactions: 0 }],
    mode: 'full',
    header: 'Task',
    diff: '',
    redactions: 0,
  };

  test('XML escaping replaces control characters and markup', () => {
    assert.strictEqual(xmlEscape('a\u0001<b>&"q"'), 'a�&lt;b&gt;&amp;&quot;q&quot;');
  });

  test('code fences carry the language', () => {
    assert.strictEqual(codeFence('x', 'ts'), '```ts\nx\n```');
  });

  test('folder tree lists directories before files, sorted', () => {
    assert.strictEqual(
      folderTree(['b.ts', 'a/c.ts', 'a/b/d.ts']),
      ['├── a/', '│   ├── b/', '│   │   └── d.ts', '│   └── c.ts', '└── b.ts'].join('\n'),
    );
  });

  test('plain text output carries the summary, header, tree and file content', () => {
    const text = formatDocument(doc, 'text');
    assert.ok(text.startsWith('CodebaseMD Export\n1 files | 1 estimated content tokens'));
    assert.ok(text.includes('\nTask\n'));
    assert.ok(text.includes('└── a.ts'));
    assert.ok(text.includes('=== a.ts (~1 tokens) ===\nx'));
  });
});
