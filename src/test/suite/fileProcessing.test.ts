import * as assert from 'node:assert';
import { isSupportedFile } from '../../exporter';

suite('File processing integration', () => {
  test('uses production support rules', () => {
    assert.ok(isSupportedFile('Dockerfile'));
    assert.ok(isSupportedFile('index.ts'));
    assert.ok(!isSupportedFile('photo.png'));
  });
});
