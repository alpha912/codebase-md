import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ignore, { Ignore } from 'ignore';

export function activate(context: vscode.ExtensionContext) {
  let exportAll = vscode.commands.registerCommand('codebaseMD.exportAll', () => {
    exportCodebase();
  });

  let exportSelected = vscode.commands.registerCommand('codebaseMD.exportSelected', (uri: vscode.Uri) => {
    exportSelectedFiles(uri);
  });

  context.subscriptions.push(exportAll);
  context.subscriptions.push(exportSelected);
}

async function exportCodebase() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('No workspace folder open.');
    return;
  }
  const rootPath = workspaceFolders[0].uri.fsPath;

  const files = await getAllFiles(rootPath);
  const markdownContent = await generateMarkdown(files, rootPath);
  saveMarkdownFile(markdownContent);
}

async function exportSelectedFiles(uri: vscode.Uri) {
  const files = await getFilesFromUri(uri);
  if (files.length === 0) {
    vscode.window.showErrorMessage('No files to export.');
    return;
  }
  const rootPath = vscode.workspace.workspaceFolders![0].uri.fsPath;
  const markdownContent = await generateMarkdown(files, rootPath);
  saveMarkdownFile(markdownContent);
}

async function getAllFiles(dir: string): Promise<string[]> {
  const ig = createIgnoreInstance(dir);
  const files: string[] = [];

  async function traverse(currentDir: string) {
    const entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(dir, fullPath);

      if (ig.ignores(relativePath) || isLargeFile(entry.name)) {
        continue;
      }

      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  await traverse(dir);
  return files;
}

async function getFilesFromUri(uri: vscode.Uri): Promise<string[]> {
  const files: string[] = [];
  const rootPath = vscode.workspace.workspaceFolders![0].uri.fsPath;
  const ig = createIgnoreInstance(rootPath);

  async function processUri(currentUri: vscode.Uri) {
    const stat = await vscode.workspace.fs.stat(currentUri);
    const relativePath = vscode.workspace.asRelativePath(currentUri);

    if (ig.ignores(relativePath) || isLargeFile(path.basename(currentUri.fsPath))) {
      return;
    }

    if (stat.type === vscode.FileType.Directory) {
      const entries = await vscode.workspace.fs.readDirectory(currentUri);
      for (const [name, fileType] of entries) {
        const childUri = vscode.Uri.joinPath(currentUri, name);
        await processUri(childUri);
      }
    } else if (stat.type === vscode.FileType.File) {
      files.push(currentUri.fsPath);
    }
  }

  await processUri(uri);
  return files;
}

function createIgnoreInstance(rootDir: string): Ignore {
  const ig = ignore();
  const gitignorePath = path.join(rootDir, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    ig.add(gitignoreContent);
  }
  return ig;
}

function isLargeFile(fileName: string): boolean {
  const largeFiles = ['package-lock.json', 'yarn.lock'];
  return largeFiles.includes(fileName);
}

async function generateMarkdown(files: string[], rootPath: string): Promise<string> {
  let markdown = `# Project Export\n\n`;

  // Project statistics
  markdown += `## Project Statistics\n\n`;
  markdown += `- Total files: ${files.length}\n`;

  // Folder structure
  markdown += `\n## Folder Structure\n\n`;
  markdown += '```\n';
  markdown += generateFolderStructure(files, rootPath);
  markdown += '\n```\n';

  // File contents
  for (const file of files) {
    const relativePath = path.relative(rootPath, file);
    const code = fs.readFileSync(file, 'utf8');
    const ext = path.extname(file).substring(1);
    markdown += `\n### ${relativePath}\n\n`;
    markdown += '```' + ext + '\n';
    markdown += code;
    markdown += '\n```\n';
  }

  return markdown;
}

function generateFolderStructure(files: string[], rootPath: string): string {
  const tree: any = {};
  files.forEach(file => {
    const relativePath = path.relative(rootPath, file);
    const parts = relativePath.split(path.sep);
    let current = tree;
    for (const part of parts) {
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
  });

  function printTree(node: any, prefix = ''): string {
    let result = '';
    for (const key in node) {
      result += `${prefix}${key}\n`;
      result += printTree(node[key], prefix + '  ');
    }
    return result;
  }

  return printTree(tree);
}

function saveMarkdownFile(content: string) {
  const options: vscode.SaveDialogOptions = {
    saveLabel: 'Save Markdown File',
    filters: {
      'Markdown Files': ['md']
    }
  };

  vscode.window.showSaveDialog(options).then(fileUri => {
    if (fileUri) {
      fs.writeFile(fileUri.fsPath, content, (err: NodeJS.ErrnoException | null) => {
        if (err) {
          vscode.window.showErrorMessage('Error saving file.');
        } else {
          vscode.window.showInformationMessage('Markdown file saved successfully.');
        }
      });
    }
  });
}

export function deactivate() {}
