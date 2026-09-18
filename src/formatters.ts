import { ExportDocument, OutputFormat } from './types';

export function xmlEscape(text: string): string {
  return text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\ufffe\uffff]/g, '\uFFFD')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
function md(text: string): string {
  return text.replace(/[\\`*_{}\[\]()#+.!|<>~-]/g, '\\$&').replace(/[\r\n]/g, ' ');
}
export function codeFence(text: string, language = ''): string {
  const runs = text.match(/`+/g) ?? [];
  const fence = '`'.repeat(Math.max(3, ...runs.map(run => run.length + 1)));
  return `${fence}${language}\n${text}\n${fence}`;
}
export function folderTree(paths: string[]): string {
  interface Tree { children: Map<string, Tree>; }
  const root: Tree = { children: new Map() };
  for (const file of paths) {
    let current = root;
    for (const part of file.split('/')) {
      if (!current.children.has(part)) { current.children.set(part, { children: new Map() }); }
      current = current.children.get(part)!;
    }
  }
  const lines: string[] = [];
  function render(tree: Tree, prefix: string): void {
    const entries = [...tree.children.entries()].sort(([a], [b]) => a.localeCompare(b));
    entries.forEach(([name, child], i) => {
      const last = i === entries.length - 1;
      lines.push(prefix + (last ? '└── ' : '├── ') + name.replace(/[\r\n]/g, ' ') + (child.children.size ? '/' : ''));
      render(child, prefix + (last ? '    ' : '│   '));
    });
  }
  render(root, '');
  return lines.join('\n');
}
export function formatDocument(doc: ExportDocument, format: OutputFormat): string {
  const tokens = doc.files.reduce((total, file) => total + file.tokens, 0);
  const languages = new Map<string, { files: number; tokens: number }>();
  for (const file of doc.files) {
    const stat = languages.get(file.language) ?? { files: 0, tokens: 0 };
    stat.files++; stat.tokens += file.tokens; languages.set(file.language, stat);
  }
  const summary = `${doc.files.length} files | ${tokens} estimated content tokens (characters / 4) | ${doc.redactions} redactions | ${doc.mode} mode`;
  const tree = folderTree(doc.files.map(file => file.path));
  const top = [...doc.files].sort((a, b) => b.tokens - a.tokens).slice(0, 5);
  if (format === 'xml') {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<codebase>\n'
      + `<summary>${xmlEscape(summary)}</summary>\n<header>${xmlEscape(doc.header)}</header>\n`
      + `<tree>${xmlEscape(tree)}</tree>\n<languages>\n`
      + [...languages].map(([name, stat]) => `<language name="${xmlEscape(name)}" files="${stat.files}" tokens="${stat.tokens}"/>`).join('\n')
      + '\n</languages>\n<files>\n'
      + doc.files.map(file => `<file path="${xmlEscape(file.path)}" language="${xmlEscape(file.language)}" tokens="${file.tokens}" redactions="${file.redactions}">${xmlEscape(file.omitted ? `[${file.omitted}]` : file.content)}</file>`).join('\n')
      + `\n</files>\n<diff>${xmlEscape(doc.diff)}</diff>\n</codebase>\n`;
  }
  if (format === 'text') {
    return `CodebaseMD Export\n${summary}\n\n${doc.header}\n\nFolder structure\n${tree}\n\nLanguages\n`
      + [...languages].map(([name, stat]) => `${name}: ${stat.files} files, ~${stat.tokens} tokens`).join('\n')
      + '\n\nLargest files\n' + top.map(file => `${file.path}: ~${file.tokens} tokens`).join('\n')
      + '\n\n' + doc.files.map(file => `=== ${file.path} (~${file.tokens} tokens) ===\n${file.omitted ? `[${file.omitted}]` : file.content}`).join('\n\n')
      + (doc.diff ? `\n\nGit diff\n${doc.diff}` : '') + '\n';
  }
  return `# ${doc.mode === 'micro' ? 'Micro Codebase' : 'Project'} Export\n\n${summary}\n\n${doc.header}\n\n`
    + '## Languages\n\n| Language | Files | Estimated tokens |\n| --- | ---: | ---: |\n'
    + [...languages].map(([name, stat]) => `| ${md(name)} | ${stat.files} | ${stat.tokens} |`).join('\n')
    + '\n\n## Largest Files\n\n' + top.map(file => `- ${md(file.path)}: ~${file.tokens} tokens`).join('\n')
    + '\n\n## Folder Structure\n\n' + codeFence(tree)
    + '\n\n## Contents\n\n' + doc.files.map((file, i) => `- [${md(file.path)}](#file-${i + 1}) — ${md(file.language)}, ~${file.tokens} tokens${file.omitted ? ' (omitted)' : ''}`).join('\n')
    + '\n\n' + doc.files.map((file, i) => `<a id="file-${i + 1}"></a>\n\n### ${md(file.path)}\n\n`
      + (file.omitted ? `*${md(file.omitted)}*` : codeFence(file.content, file.language))).join('\n\n')
    + (doc.diff ? '\n\n## Git Diff\n\n' + codeFence(doc.diff, 'diff') : '') + '\n';
}
