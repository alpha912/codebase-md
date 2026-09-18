import * as fs from 'fs';
import * as path from 'path';
import ignore, { Ignore } from 'ignore';
import { ExportHooks, ExportOptions, checkCancelled } from './types';

const defaultPatterns = ['node_modules/', 'build/', 'out/', 'dist/', '.git/', '.svn/', '.hg/',
  '.vscode/', '.idea/', 'coverage/', 'logs/', '__pycache__/', '*.log', '*.exe', '*.dll', '*.bin',
  '*.lock', '*.zip', '*.tar', '*.tar.gz', '*.tgz', '*.jar', '*.class', '*.pyc', '*.vsix',
  'package-lock.json', 'codebase-export.md', 'codebase-export.xml', 'codebase-export.txt'];
export function relativePath(root: string, file: string): string {
  return path.relative(root, file).split(path.sep).join('/');
}
export function isWithin(root: string, file: string): boolean {
  const rel = path.relative(root, file);
  return rel === '' || (!path.isAbsolute(rel) && rel !== '..' && !rel.startsWith('..' + path.sep));
}
async function readRules(file: string): Promise<string> {
  try {
    const stat = await fs.promises.lstat(file);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024) { return ''; }
    return await fs.promises.readFile(file, 'utf8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') { return ''; }
    throw error;
  }
}
export interface FileFilters {
  excluded: (file: string, directory?: boolean) => Promise<boolean>;
  contentsExcluded: (file: string) => boolean;
}
export async function createFilters(root: string, options: ExportOptions): Promise<FileFilters> {
  const base = ignore().add(defaultPatterns).add(options.exclude);
  const content = ignore().add(await readRules(path.join(root, '.codebaseignore')));
  const cache = new Map<string, Ignore>();
  async function rules(dir: string): Promise<Ignore> {
    if (!cache.has(dir)) { cache.set(dir, ignore().add(await readRules(path.join(dir, '.gitignore')))); }
    return cache.get(dir)!;
  }
  return {
    contentsExcluded: file => content.ignores(relativePath(root, file)),
    excluded: async (file, directory = false) => {
      if (!isWithin(root, file)) { return true; }
      const rel = relativePath(root, file);
      if (!rel) { return false; }
      const candidate = rel + (directory ? '/' : '');
      if (base.ignores(candidate)) { return true; }
      if (!options.respectGitignore) { return false; }
      // Test each ancestor so nested negations cannot re-include an ignored directory.
      const parts = rel.split('/');
      for (let i = 0; i < parts.length; i++) {
        const target = path.join(root, ...parts.slice(0, i + 1));
        const isDir = i < parts.length - 1 || directory;
        let ignored = false;
        let ruleDir = root;
        for (let j = 0; j <= i; j++) {
          const result = (await rules(ruleDir)).test(relativePath(ruleDir, target) + (isDir ? '/' : ''));
          if (result.ignored) { ignored = true; }
          if (result.unignored) { ignored = false; }
          if (j < i) { ruleDir = path.join(ruleDir, parts[j]); }
        }
        if (ignored) { return true; }
      }
      return false;
    }
  };
}
export async function collectFiles(root: string, selected: string[] | undefined, filters: FileFilters,
  hooks: ExportHooks = {}): Promise<string[]> {
  const files = new Set<string>();
  const visited = new Set<string>();
  async function visit(file: string): Promise<void> {
    checkCancelled(hooks);
    file = path.resolve(file);
    if (!isWithin(root, file) || visited.has(file)) { return; }
    visited.add(file);
    // Reject links in every component, including explicitly selected descendants of a link.
    const parts = path.relative(root, file).split(path.sep).filter(Boolean);
    let candidate = root;
    for (const part of parts) {
      candidate = path.join(candidate, part);
      try { if ((await fs.promises.lstat(candidate)).isSymbolicLink()) { return; } }
      catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') { return; } throw error; }
    }
    const stat = await fs.promises.lstat(file);
    if (stat.isSymbolicLink() || await filters.excluded(file, stat.isDirectory())) { return; }
    if (stat.isDirectory()) {
      hooks.progress?.(`Scanning ${relativePath(root, file) || '.'}`);
      for (const name of (await fs.promises.readdir(file)).sort()) { await visit(path.join(file, name)); }
    } else if (stat.isFile()) { files.add(file); }
  }
  for (const file of selected ?? [root]) { await visit(file); }
  return [...files].sort();
}
