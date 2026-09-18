import { execFile } from 'child_process';
import * as path from 'path';
import { ExportHooks, checkCancelled } from './types';

function git(root: string, args: string[], hooks: ExportHooks): Promise<string> {
  checkCancelled(hooks);
  return new Promise((resolve, reject) => {
    const child = execFile('git', ['--no-pager', '-C', root, ...args], {
      encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, windowsHide: true, timeout: 30000,
      env: { ...process.env, GIT_TERMINAL_PROMPT: '0', GIT_LITERAL_PATHSPECS: '1' }
    }, (error, stdout) => {
      clearInterval(timer);
      try { checkCancelled(hooks); } catch (cancelled) { reject(cancelled); return; }
      if (error) { reject(new Error('Git export failed. Check that Git is installed and this folder is a repository.')); }
      else { resolve(stdout); }
    });
    const timer = setInterval(() => { if (hooks.cancelled?.()) { child.kill(); } }, 100);
  });
}
export interface GitChanges { paths: string[]; deleted: string[]; hasHead: boolean; }
export async function getGitChanges(root: string, hooks: ExportHooks = {}): Promise<GitChanges> {
  await git(root, ['rev-parse', '--show-toplevel'], hooks);
  let hasHead = true;
  try { await git(root, ['rev-parse', '--verify', 'HEAD'], hooks); }
  catch { checkCancelled(hooks); hasHead = false; }
  const args = hasHead ? ['diff', '--relative', '--name-only', '-z', '--no-renames', 'HEAD', '--', '.']
    : ['ls-files', '--cached', '-z', '--', '.'];
  const changed = await git(root, args, hooks);
  const untracked = await git(root, ['ls-files', '--others', '--exclude-standard', '-z', '--', '.'], hooks);
  const deleted = hasHead ? await git(root, ['diff', '--relative', '--name-only', '-z', '--no-renames', '--diff-filter=D', 'HEAD', '--', '.'], hooks) : '';
  const parse = (text: string) => text.split('\0').filter(Boolean).map(file => path.resolve(root, file));
  return { paths: [...new Set([...parse(changed), ...parse(untracked)])], deleted: parse(deleted), hasHead };
}
export async function getFileDiff(root: string, file: string, hasHead: boolean, hooks: ExportHooks = {}): Promise<string> {
  // Disable user-configured external diff/textconv programs. Each file is filtered before this call.
  return git(root, ['diff', '--no-ext-diff', '--no-textconv', '--no-renames', '--no-color',
    ...(hasHead ? ['HEAD'] : ['--cached']), '--', path.relative(root, file)], hooks);
}
