import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { execFileSync } from 'child_process';
import { exportCodebase, isSupportedFile } from '../../exporter';
import { codeFence, folderTree, formatDocument } from '../../formatters';
import { redactSecrets } from '../../secrets';
import { skeleton } from '../../skeleton';
import { defaults, ExportCancelled, ExportDocument } from '../../types';
import { estimateTokens } from '../../tokens';

suite('Production export pipeline', () => {
  let root: string;
  const write = async (name: string, content: string | Buffer) => {
    const file = path.join(root, name);
    await fs.promises.mkdir(path.dirname(file), { recursive: true });
    await fs.promises.writeFile(file, content);
    return file;
  };
  const git = (...args: string[]) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', windowsHide: true });
  setup(async () => { root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'codebasemd-test-')); });
  teardown(async () => {
    assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep + 'codebasemd-test-'));
    await fs.promises.rm(root, { recursive: true, force: true });
  });
  test('honors root/nested gitignore, hard exclusions, and content-only exclusions', async () => {
    await write('.gitignore', '*.tmp\nignored/\n');
    await write('.codebaseignore', 'private.txt\n');
    await write('private.txt', 'DO_NOT_EXPORT');
    await write('src/.gitignore', '*.ts\n!keep.ts\n');
    await write('src/keep.ts', 'export const keep = 1;');
    await write('src/omit.ts', 'hidden');
    await write('ignored/.gitignore', '!child.ts');
    await write('ignored/child.ts', 'hidden');
    await write('node_modules/dependency.ts', 'hidden');
    await write('extra.txt', 'hidden');
    await write('cache.tmp', 'hidden');
    const result = await exportCodebase(root, { ...defaults, exclude: ['extra.txt'] });
    const names = result.document.files.map(file => file.path);
    assert.ok(names.includes('src/keep.ts'));
    for (const name of ['src/omit.ts', 'ignored/child.ts', 'node_modules/dependency.ts', 'extra.txt', 'cache.tmp']) { assert.ok(!names.includes(name), name); }
    assert.ok(result.document.files.find(file => file.path === 'private.txt')?.omitted);
    assert.ok(!result.content.includes('DO_NOT_EXPORT'));
  });
  test('selection deduplicates overlapping directories and rejects paths outside root', async () => {
    const file = await write('src/a.ts', 'hello');
    const result = await exportCodebase(root, defaults, { selected: [path.join(root, 'src'), file, path.dirname(root)] });
    assert.deepStrictEqual(result.document.files.map(item => item.path), ['src/a.ts']);
  });
  test('directory junctions cannot escape the workspace, including explicit child selections', async () => {
    const outside = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'codebasemd-outside-'));
    try {
      await fs.promises.writeFile(path.join(outside, 'secret.txt'), 'outside');
      await fs.promises.symlink(outside, path.join(root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
      const result = await exportCodebase(root, defaults, { selected: [path.join(root, 'linked', 'secret.txt')] });
      assert.strictEqual(result.document.files.length, 0);
    } finally {
      assert.ok(path.resolve(outside).startsWith(path.resolve(os.tmpdir()) + path.sep + 'codebasemd-outside-'));
      await fs.promises.rm(outside, { recursive: true, force: true });
    }
  });
  test('skips binary and oversized contents while retaining their paths', async () => {
    await write('binary.ts', Buffer.from([65, 0, 66]));
    await write('big.txt', 'x'.repeat(2048));
    await write('image.png', 'unsupported');
    const result = await exportCodebase(root, { ...defaults, maxFileSizeKB: 1 });
    assert.strictEqual(result.document.files.length, 3);
    assert.ok(result.document.files.every(file => file.omitted && file.content === ''));
  });
  test('uses unsaved editor text and bounds its size', async () => {
    await write('a.ts', 'disk');
    const result = await exportCodebase(root, defaults, {}, { readText: async () => 'editor' });
    assert.strictEqual(result.document.files[0].content, 'editor');
    const large = await exportCodebase(root, { ...defaults, maxFileSizeKB: 1 }, {}, { readText: async () => 'x'.repeat(2048) });
    assert.ok(large.document.files[0].omitted);
  });
  test('redacts before transformation and counts tokens on final output', async () => {
    const secret = 'ghp_' + 'a'.repeat(36);
    await write('key.ts', `export const api_key = '${secret}';`);
    for (const contentMode of ['full', 'micro', 'skeleton'] as const) {
      const result = await exportCodebase(root, { ...defaults, contentMode, customHeader: secret, lineNumbers: true });
      assert.ok(!result.content.includes(secret));
      assert.ok(result.document.redactions >= 2);
      assert.strictEqual(result.tokens, estimateTokens(result.content));
      assert.ok(result.document.files[0].content.startsWith('1: '));
    }
  });
  test('allows explicitly disabling redaction and gitignore', async () => {
    await write('.gitignore', 'a.txt');
    await write('a.txt', 'password="secret"');
    const result = await exportCodebase(root, { ...defaults, respectGitignore: false, redactSecrets: false });
    assert.ok(result.content.includes('password="secret"'));
  });
  test('cancellation rejects without returning a partial export', async () => {
    await assert.rejects(exportCodebase(root, defaults, {}, { cancelled: () => true }), ExportCancelled);
    await write('a.ts', 'hello');
    let cancelled = false;
    await assert.rejects(exportCodebase(root, defaults, {}, { cancelled: () => cancelled, progress: () => { cancelled = true; } }), ExportCancelled);
  });
  test('Git exports staged, unstaged, untracked, renamed, and deleted files; filters diffs', async () => {
    git('init'); git('config', 'user.email', 'test@example.invalid'); git('config', 'user.name', 'Test');
    await write('tracked.ts', 'before\n'); await write('removed.ts', 'deleted-secret\n');
    await write('rename.ts', 'rename\n'); await write('private.txt', 'private-before\n');
    await write('stable.ts', 'unchanged\n');
    git('add', '.'); git('commit', '-m', 'fixture');
    await write('tracked.ts', 'staged\n'); git('add', 'tracked.ts');
    await write('tracked.ts', 'unstaged\n');
    await fs.promises.unlink(path.join(root, 'removed.ts'));
    git('mv', 'rename.ts', 'renamed.ts');
    await write('untracked.ts', 'new\n');
    await write('private.txt', 'private-after\n');
    await write('.codebaseignore', 'private.txt');
    const result = await exportCodebase(root, { ...defaults, includeDiff: true }, { git: true });
    const names = result.document.files.map(file => file.path);
    for (const name of ['tracked.ts', 'removed.ts', 'rename.ts', 'renamed.ts', 'untracked.ts']) { assert.ok(names.includes(name), name); }
    assert.ok(!names.includes('stable.ts'));
    assert.ok(result.document.diff.includes('+unstaged'));
    assert.ok(!result.content.includes('private-before') && !result.content.includes('private-after'));
    assert.ok(!result.content.includes('deleted-secret'));
    assert.strictEqual(result.document.files.find(file => file.path === 'removed.ts')?.omitted, 'Deleted relative to HEAD');
  });
  test('Git handles a repository without commits', async () => {
    git('init'); await write('staged.ts', 'new file'); git('add', '.'); await write('untracked.ts', 'new');
    const result = await exportCodebase(root, { ...defaults, includeDiff: true }, { git: true });
    assert.strictEqual(result.document.files.length, 2);
    assert.ok(result.document.diff.includes('+new file'));
  });
  test('Git works when workspace is a repository subdirectory', async () => {
    git('init'); git('config', 'user.email', 'test@example.invalid'); git('config', 'user.name', 'Test');
    await write('src/a.ts', 'before'); await write('outside.ts', 'before'); git('add', '.'); git('commit', '-m', 'fixture');
    await write('src/a.ts', 'after'); await write('outside.ts', 'after');
    const result = await exportCodebase(path.join(root, 'src'), { ...defaults, includeDiff: true }, { git: true });
    assert.deepStrictEqual(result.document.files.map(file => file.path), ['a.ts']);
    assert.ok(result.document.diff.includes('+after'));
    assert.ok(!result.document.diff.includes('outside.ts'));
  });
  test('Git diff secrets are redacted', async () => {
    git('init'); git('config', 'user.email', 'test@example.invalid'); git('config', 'user.name', 'Test');
    const secret = 'sk-' + 'a'.repeat(48);
    await write('a.ts', `const x = '${secret}';\n`); git('add', '.'); git('commit', '-m', 'fixture');
    await write('a.ts', 'const x = "removed";\n');
    const result = await exportCodebase(root, { ...defaults, includeDiff: true }, { git: true });
    assert.ok(!result.content.includes(secret)); assert.ok(result.document.diff.includes('***REDACTED***'));
  });
});

suite('Pure production helpers', () => {
  test('recognizes special names and common extensions', () => {
    for (const file of ['a.ts', 'Dockerfile', '.env.local', 'a.toml', '.gitignore']) { assert.ok(isSupportedFile(file)); }
    assert.ok(!isSupportedFile('image.png'));
  });
  test('Markdown fences cannot be closed by embedded backticks', () => {
    assert.strictEqual(codeFence('```\nhello\n````'), '`````\n```\nhello\n````\n`````');
  });
  test('tree handles prototype-like names', () => {
    const tree = folderTree(['__proto__/a.ts', 'constructor/b.ts']);
    assert.ok(tree.includes('a.ts') && tree.includes('b.ts') && tree.includes('└──'));
  });
  test('XML escapes content and attribute injection; all formats retain metadata', () => {
    const doc: ExportDocument = { header: '<header>', mode: 'full', diff: '<diff>', redactions: 0,
      files: [{ path: 'a"<&.ts', language: 'typescript', content: '</file> & text', tokens: 4, redactions: 0 }] };
    const xml = formatDocument(doc, 'xml');
    assert.ok(xml.includes('a&quot;&lt;&amp;.ts')); assert.ok(xml.includes('&lt;/file&gt; &amp; text'));
    for (const format of ['markdown', 'xml', 'text'] as const) { assert.ok(formatDocument(doc, format).includes('characters / 4')); }
  });
  test('redacts provider tokens, assignments, JWT and private keys', () => {
    const examples = ['AKIA' + 'A'.repeat(16), 'ghp_' + 'a'.repeat(36), 'github_pat_' + 'a'.repeat(30),
      'sk-proj-' + 'a'.repeat(30), 'sk-ant-api03-' + 'a'.repeat(30), 'xoxb-' + 'a'.repeat(20),
      'AIza' + 'a'.repeat(35), 'sk_live_' + 'a'.repeat(24), 'eyJabc.eyJdef.signature',
      '-----BEGIN RSA PRIVATE KEY-----\nabc\n-----END RSA PRIVATE KEY-----',
      'password="hunter2"', 'API_KEY=unquoted', '+API_KEY=unquoted', '-PASSWORD=oldsecret', '"client_secret": "secretvalue"'];
    for (const example of examples) {
      const result = redactSecrets(example); assert.ok(result.count > 0, example); assert.ok(result.text.includes('***REDACTED***'));
    }
    assert.strictEqual(redactSecrets('const answer = 42;').count, 0);
  });
  test('skeleton preserves Python declarations and drops bodies; data falls back unchanged', () => {
    const result = skeleton('import os\nclass A:\n    def run(self):\n        return 42', 'python');
    assert.ok(result.includes('def run(self):')); assert.ok(!result.includes('return 42'));
    assert.strictEqual(skeleton('{"answer":42}', 'json'), '{"answer":42}');
  });
  test('token estimates round up and handle empty content', () => {
    assert.strictEqual(estimateTokens(''), 0); assert.strictEqual(estimateTokens('12345'), 2);
  });
});
