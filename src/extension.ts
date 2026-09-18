import * as vscode from 'vscode';
import { readConfig } from './config';
import { exportCodebase } from './exporter';
import { isWithin } from './fsUtils';
import { ContentMode, ExportCancelled, ExportOptions, ExportTarget, OutputFormat } from './types';

type Scope = 'workspace' | 'selected' | 'git' | 'current';
interface Request { scope: Scope; mode?: ContentMode; legacy?: boolean; wizard?: boolean; }

async function pick<T extends string>(title: string, values: readonly T[], preferred?: T): Promise<T | undefined> {
  const ordered = preferred ? [preferred, ...values.filter(value => value !== preferred)] : [...values];
  const result = await vscode.window.showQuickPick(ordered.map(value => ({ label: value, description: value === preferred ? 'Configured default' : undefined })), { title, ignoreFocusOut: true });
  return result?.label as T | undefined;
}

async function run(request: Request, uri?: vscode.Uri, uris?: vscode.Uri[]): Promise<void> {
  let scope = request.scope;
  if (request.wizard) {
    const chosen = await pick<Scope>('CodebaseMD — 1/4: Choose scope', ['workspace', 'selected', 'git', 'current']);
    if (!chosen) { return; } scope = chosen;
  }
  let selected = uris?.length ? uris : uri ? [uri] : [];
  if (scope === 'current') {
    const current = vscode.window.activeTextEditor?.document;
    if (!current || current.uri.scheme !== 'file') { throw new Error('Open a saved file in a local workspace first. Unsaved edits in that file are supported.'); }
    selected = [current.uri];
  }
  if (scope === 'selected' && !selected.length) {
    const chosen = await vscode.window.showOpenDialog({ canSelectFiles: true, canSelectFolders: true, canSelectMany: true, openLabel: 'Select files or folders to export' });
    if (!chosen?.length) { return; } selected = chosen;
  }
  const folders = vscode.workspace.workspaceFolders;
  if (!folders?.length) { throw new Error('Open a workspace folder before exporting.'); }
  const explicit = scope === 'selected' || scope === 'current';
  let folder = explicit ? vscode.workspace.getWorkspaceFolder(selected[0]) : undefined;
  if (explicit && !folder) { throw new Error('Choose files inside an open workspace folder.'); }
  if (!folder) { folder = folders.length === 1 ? folders[0] : await vscode.window.showWorkspaceFolderPick({ placeHolder: 'Choose the workspace folder to export' }); }
  if (!folder) { return; }
  if (folder.uri.scheme !== 'file') { throw new Error('CodebaseMD supports local filesystem workspaces only.'); }
  const root = folder.uri.fsPath;
  if (explicit && selected.some(item => item.scheme !== 'file' || !isWithin(root, item.fsPath))) {
    throw new Error('Select files from one workspace folder per export.');
  }
  const options: ExportOptions = readConfig(folder.uri);
  if (request.legacy) { options.format = 'markdown'; options.target = 'file'; options.contentMode = request.mode ?? 'full'; }
  if (request.wizard) {
    const mode = await pick<ContentMode>('CodebaseMD — 2/4: Content mode', ['full', 'micro', 'skeleton'], options.contentMode);
    if (!mode) { return; } options.contentMode = mode;
    const format = await pick<OutputFormat>('CodebaseMD — 3/4: Output format', ['markdown', 'xml', 'text'], options.format);
    if (!format) { return; } options.format = format;
    const target = await pick<ExportTarget>('CodebaseMD — 4/4: Destination', ['file', 'clipboard', 'editor'], options.target);
    if (!target) { return; } options.target = target;
  } else if (scope === 'current') { options.target = 'clipboard'; }
  if (scope === 'git' && !vscode.workspace.isTrusted) { throw new Error('Git export requires a trusted workspace.'); }
  const result = await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'CodebaseMD: Preparing export', cancellable: true }, async (progress, token) => {
    return exportCodebase(root, options, { selected: explicit ? selected.map(item => item.fsPath) : undefined, git: scope === 'git' }, {
      cancelled: () => token.isCancellationRequested,
      progress: message => progress.report({ message }),
      readText: async file => vscode.workspace.textDocuments.find(document => document.uri.scheme === 'file' && document.uri.fsPath === file)?.getText()
    });
  });
  if (!result.document.files.length) { void vscode.window.showInformationMessage('No files to export after filtering.'); return; }
  if (options.tokenBudget > 0 && result.tokens > options.tokenBudget) {
    const choice = await vscode.window.showWarningMessage(`Export is approximately ${result.tokens.toLocaleString()} tokens including formatting; your budget is ${options.tokenBudget.toLocaleString()}.`, 'Export anyway');
    if (choice !== 'Export anyway') { return; }
  }
  if (options.target === 'clipboard') { await vscode.env.clipboard.writeText(result.content); }
  else if (options.target === 'editor') {
    await vscode.window.showTextDocument(await vscode.workspace.openTextDocument({ content: result.content, language: options.format === 'text' ? 'plaintext' : options.format }));
  } else {
    const extension = options.format === 'markdown' ? 'md' : options.format === 'xml' ? 'xml' : 'txt';
    const destination = await vscode.window.showSaveDialog({ defaultUri: vscode.Uri.joinPath(folder.uri, `codebase-export.${extension}`), filters: { [options.format]: [extension] }, saveLabel: 'Save export' });
    if (!destination) { return; }
    if (result.document.files.some(file => vscode.Uri.joinPath(folder!.uri, file.path).toString() === destination.toString())) {
      throw new Error('Choose a destination other than a source file included in this export.');
    }
    await vscode.workspace.fs.writeFile(destination, Buffer.from(result.content, 'utf8'));
  }
  void vscode.window.showInformationMessage(`Exported ${result.document.files.length} files · ~${result.tokens.toLocaleString()} tokens · ${result.document.redactions} redactions.`);
}

export function activate(context: vscode.ExtensionContext): void {
  const commands: [string, Request][] = [
    ['exportAll', { scope: 'workspace', legacy: true }],
    ['exportSelected', { scope: 'selected', legacy: true }],
    ['exportMicro', { scope: 'workspace', mode: 'micro', legacy: true }],
    ['exportMicroSelected', { scope: 'selected', mode: 'micro', legacy: true }],
    ['exportWizard', { scope: 'workspace', wizard: true }],
    ['exportGitChanges', { scope: 'git' }],
    ['copyCurrentFile', { scope: 'current' }]
  ];
  for (const [name, request] of commands) {
    context.subscriptions.push(vscode.commands.registerCommand(`codebaseMD.${name}`, async (uri?: vscode.Uri, uris?: vscode.Uri[]) => {
      try { await run(request, uri, uris); }
      catch (error) {
        if (!(error instanceof ExportCancelled)) {
          void vscode.window.showErrorMessage(`CodebaseMD: ${error instanceof Error ? error.message : 'Export failed.'}`);
        }
      }
    }));
  }
}
export function deactivate(): void {}
