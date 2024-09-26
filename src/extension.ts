import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import ignore, { Ignore } from 'ignore';

export function activate(context: vscode.ExtensionContext) {
  let exportAll = vscode.commands.registerCommand('codebaseMD.exportAll', () => {
    exportCodebase();
  });

  let exportSelected = vscode.commands.registerCommand('codebaseMD.exportSelected', (uri: vscode.Uri, uris: vscode.Uri[]) => {
    const selectedUris = uris && uris.length > 0 ? uris : [uri];
    exportSelectedFiles(selectedUris);
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

async function exportSelectedFiles(uris: vscode.Uri[]) {
  const files = await getFilesFromUris(uris);
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
        // Check if directory is ignored
        if (ig.ignores(relativePath + '/')) {
          continue;
        }
        await traverse(fullPath);
      } else {
        files.push(fullPath);
      }
    }
  }

  await traverse(dir);
  return files;
}

async function getFilesFromUris(uris: vscode.Uri[]): Promise<string[]> {
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
      // Check if directory is ignored
      if (ig.ignores(relativePath + '/')) {
        return;
      }
      const entries = await vscode.workspace.fs.readDirectory(currentUri);
      for (const [name, fileType] of entries) {
        const childUri = vscode.Uri.joinPath(currentUri, name);
        await processUri(childUri);
      }
    } else if (stat.type === vscode.FileType.File) {
      files.push(currentUri.fsPath);
    }
  }

  for (const uri of uris) {
    await processUri(uri);
  }

  return files;
}

function createIgnoreInstance(rootDir: string): Ignore {
  const ig = ignore();
  const gitignorePath = path.join(rootDir, '.gitignore');
  if (fs.existsSync(gitignorePath)) {
    const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
    ig.add(gitignoreContent);
  }
  // Add default ignored directories and files
  ig.add([
    'node_modules/',
    'build/',
    'out/',
    'dist/',
    '.git/',
    '.svn/',
    '.hg/',
    '.vscode/',
    '.idea/',
    'coverage/',
    'logs/',
    '*.log',
    '*.exe',
    '*.dll',
    '*.bin',
    '*.lock',
    '*.zip',
    '*.tar',
    '*.tar.gz',
    '*.tgz',
    '*.jar',
    '*.class',
    '*.pyc',
    '__pycache__/'
  ]);
  return ig;
}

function isLargeFile(fileName: string): boolean {
  const largeFiles = ['package-lock.json', 'yarn.lock'];
  return largeFiles.includes(fileName);
}

function isSupportedFile(fileName: string): boolean {
  const supportedExtensions = [
    '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.json', '.md', '.txt',
    '.py', '.java', '.c', '.cpp', '.cs', '.rb', '.go', '.php', '.sh', '.xml',
    '.yaml', '.yml', '.ini', '.bat', '.sql', '.rs', '.swift', '.kt', '.dart',
    '.lua', '.r', '.pl', '.hs', '.erl', '.ex', '.el', '.jl', '.scala'
  ];
  const ext = path.extname(fileName).toLowerCase();
  return supportedExtensions.includes(ext);
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
    const fileName = path.basename(file);
    markdown += `\n### ${relativePath}\n\n`;

    if (isSupportedFile(fileName)) {
      const code = fs.readFileSync(file, 'utf8');
      const ext = path.extname(file).substring(1);
      markdown += '```' + ext + '\n';
      markdown += code;
      markdown += '\n```\n';
    } else {
      markdown += `*(Unsupported file type)*\n`;
    }
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
