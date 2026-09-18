import * as assert from 'assert';
import { codeFence, folderTree } from '../../formatters';
suite('Markdown generation integration', () => {
  test('uses production fence and tree generation', () => {
    assert.ok(codeFence('```').startsWith('````'));
    assert.ok(folderTree(['src/a.ts']).includes('└── a.ts'));
  });
});
