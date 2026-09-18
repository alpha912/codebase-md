import * as fs from 'fs';
import * as path from 'path';
import { condenseMicroCode, getLanguageFromExtension, getLanguageForSpecialFile } from './analyzer';
import { collectFiles, createFilters, relativePath } from './fsUtils';
import { formatDocument } from './formatters';
import { getFileDiff, getGitChanges } from './git';
import { redactSecrets } from './secrets';
import { skeleton } from './skeleton';
import { estimateTokens } from './tokens';
import { ExportDocument, ExportHooks, ExportOptions, checkCancelled } from './types';

const extensions = new Set(('.js .jsx .ts .tsx .mjs .cjs .html .css .scss .json .md .txt .py .java .c .h .hpp .cpp .cs .rb .go .php .sh .xml .yaml .yml .ini .bat .ps1 .sql .rs .swift .kt .dart .lua .r .pl .hs .erl .ex .exs .el .jl .scala .toml .vue .svelte .csv .graphql .proto').split(' '));
const special = new Set(['Dockerfile', 'Makefile', 'Jenkinsfile', 'docker-compose', '.gitignore', '.codebaseignore', '.dockerignore', '.env', '.babelrc', '.eslintrc', '.prettierrc', 'Vagrantfile', 'Procfile']);
export function isSupportedFile(file: string): boolean {
  const name = path.basename(file);
  return extensions.has(path.extname(name).toLowerCase()) || special.has(name) || name.startsWith('.env.');
}
export interface ExportResult { document: ExportDocument; content: string; tokens: number; }
export async function exportCodebase(root: string, options: ExportOptions,
  request: { selected?: string[]; git?: boolean } = {}, hooks: ExportHooks = {}): Promise<ExportResult> {
  checkCancelled(hooks);
  const filters = await createFilters(root, options);
  const changes = request.git ? await getGitChanges(root, hooks) : undefined;
  const paths = await collectFiles(root, changes?.paths ?? request.selected, filters, hooks);
  const doc: ExportDocument = { files: [], mode: options.contentMode, header: options.customHeader, diff: '', redactions: 0 };
  const clean = (text: string) => options.redactSecrets ? redactSecrets(text) : { text, count: 0 };
  const header = clean(doc.header); doc.header = header.text; doc.redactions += header.count;
  for (const file of paths) {
    checkCancelled(hooks);
    const rel = relativePath(root, file);
    hooks.progress?.(`Reading ${rel}`);
    const ext = path.extname(file).toLowerCase();
    const language = path.basename(file).startsWith('.env') ? 'dotenv'
      : ext ? getLanguageFromExtension(ext) : getLanguageForSpecialFile(path.basename(file));
    const entry = { path: rel, language, content: '', tokens: 0, redactions: 0, omitted: undefined as string | undefined };
    if (filters.contentsExcluded(file)) { entry.omitted = 'File content excluded by .codebaseignore'; }
    else if (!isSupportedFile(file)) { entry.omitted = 'Unsupported file type'; }
    else {
      try {
        const stat = await fs.promises.lstat(file);
        if (!stat.isFile() || stat.isSymbolicLink()) { entry.omitted = 'Not a regular file'; }
        else if (stat.size > options.maxFileSizeKB * 1024) { entry.omitted = 'File exceeds configured size limit'; }
        else {
          const override = await hooks.readText?.(file);
          const bytes = override === undefined ? await fs.promises.readFile(file) : Buffer.from(override);
          if (bytes.length > options.maxFileSizeKB * 1024) { entry.omitted = 'File exceeds configured size limit'; }
          else if (bytes.includes(0)) { entry.omitted = 'Binary file'; }
          else {
            const redacted = clean(bytes.toString('utf8'));
            entry.redactions = redacted.count; doc.redactions += redacted.count;
            entry.content = options.contentMode === 'micro' ? condenseMicroCode(redacted.text, path.basename(file), rel)
              : options.contentMode === 'skeleton' ? skeleton(redacted.text, language) : redacted.text;
            if (options.lineNumbers) { entry.content = entry.content.split(/\r?\n/).map((line, i) => `${i + 1}: ${line}`).join('\n'); }
            entry.tokens = estimateTokens(entry.content);
          }
        }
      } catch (error) {
        checkCancelled(hooks);
        entry.omitted = `Unable to read file (${(error as NodeJS.ErrnoException).code ?? 'read error'})`;
      }
    }
    doc.files.push(entry);
  }
  if (changes) {
    for (const file of changes.deleted) {
      checkCancelled(hooks);
      if (!await filters.excluded(file)) {
        doc.files.push({ path: relativePath(root, file), language: 'text', content: '', tokens: 0, redactions: 0, omitted: 'Deleted relative to HEAD' });
      }
    }
    if (options.includeDiff) {
      // Only diff readable content. Deleted, binary, oversized and content-excluded files never bypass filters.
      for (const entry of doc.files.filter(file => !file.omitted)) {
        checkCancelled(hooks);
        const diff = await getFileDiff(root, path.join(root, entry.path), changes.hasHead, hooks);
        if (Buffer.byteLength(diff) > options.maxFileSizeKB * 1024) {
          doc.diff += `Diff omitted for ${entry.path}: exceeds configured size limit.\n`;
        } else {
          const redacted = clean(diff); doc.diff += redacted.text; doc.redactions += redacted.count;
        }
      }
    }
  }
  checkCancelled(hooks);
  doc.files.sort((a, b) => a.path.localeCompare(b.path));
  const content = formatDocument(doc, options.format);
  return { document: doc, content, tokens: estimateTokens(content) };
}
