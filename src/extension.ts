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

  let exportMicro = vscode.commands.registerCommand('codebaseMD.exportMicro', () => {
    exportMicroCodebase();
  });

  let exportMicroSelected = vscode.commands.registerCommand('codebaseMD.exportMicroSelected', (uri: vscode.Uri, uris: vscode.Uri[]) => {
    const selectedUris = uris && uris.length > 0 ? uris : [uri];
    exportMicroSelectedFiles(selectedUris);
  });

  context.subscriptions.push(exportAll);
  context.subscriptions.push(exportSelected);
  context.subscriptions.push(exportMicro);
  context.subscriptions.push(exportMicroSelected);
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

async function exportMicroCodebase() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('No workspace folder open.');
    return;
  }
  const rootPath = workspaceFolders[0].uri.fsPath;

  const files = await getAllFiles(rootPath);
  const markdownContent = await generateMicroMarkdown(files, rootPath);
  saveMarkdownFile(markdownContent);
}

async function exportMicroSelectedFiles(uris: vscode.Uri[]) {
  const files = await getFilesFromUris(uris);
  if (files.length === 0) {
    vscode.window.showErrorMessage('No files to export.');
    return;
  }
  const rootPath = vscode.workspace.workspaceFolders![0].uri.fsPath;
  const markdownContent = await generateMicroMarkdown(files, rootPath);
  saveMarkdownFile(markdownContent);
}

async function getAllFiles(dir: string): Promise<string[]> {
  const ig = createIgnoreInstance(dir);
  const codebaseIgnoreFiles = getCodebaseIgnoreFiles(dir);
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
  const codebaseIgnoreFiles = getCodebaseIgnoreFiles(rootPath);

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

function getCodebaseIgnoreFiles(rootDir: string): Ignore {
  const ig = ignore();
  const codebaseIgnorePath = path.join(rootDir, '.codebaseignore');
  if (fs.existsSync(codebaseIgnorePath)) {
    const codebaseIgnoreContent = fs.readFileSync(codebaseIgnorePath, 'utf8');
    ig.add(codebaseIgnoreContent);
  }
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
  
  // Support for specific filenames without extensions
  const supportedFilesWithoutExtension = [
    'Dockerfile', 'Makefile', 'Jenkinsfile', 'docker-compose', '.gitignore', '.dockerignore',
    '.env', '.babelrc', '.eslintrc', '.prettierrc', 'Vagrantfile', 'Procfile'
  ];
  
  const ext = path.extname(fileName).toLowerCase();
  
  // Check if the file has a supported extension
  if (supportedExtensions.includes(ext)) {
    return true;
  }
  
  // If file has no extension, check if the exact filename is supported
  if (ext === '') {
    return supportedFilesWithoutExtension.includes(fileName);
  }
  
  return false;
}

function shouldIncludeFileContents(filePath: string, rootPath: string, codebaseIgnoreFiles: Ignore): boolean {
  const relativePath = path.relative(rootPath, filePath);
  return !codebaseIgnoreFiles.ignores(relativePath) && isSupportedFile(path.basename(filePath));
}

async function generateMarkdown(files: string[], rootPath: string): Promise<string> {
  let markdown = `# Project Export\n\n`;
  const codebaseIgnoreFiles = getCodebaseIgnoreFiles(rootPath);

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

    if (shouldIncludeFileContents(file, rootPath, codebaseIgnoreFiles)) {
      const code = fs.readFileSync(file, 'utf8');
      // Determine language identifier for code block
      const ext = path.extname(file).substring(1);
      let lang = ext;
      if (!ext) {
        // For files without extensions, use getLanguageForSpecialFile
        lang = getLanguageForSpecialFile(fileName);
      }
      markdown += '```' + lang + '\n';
      markdown += code;
      markdown += '\n```\n';
    } else if (codebaseIgnoreFiles.ignores(relativePath)) {
      markdown += `*(File content excluded by .codebaseignore)*\n`;
    } else if (!isSupportedFile(fileName)) {
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

async function generateMicroMarkdown(files: string[], rootPath: string): Promise<string> {
  let markdown = `# Micro Codebase Export\n\n`;
  const codebaseIgnoreFiles = getCodebaseIgnoreFiles(rootPath);

  // Project statistics
  markdown += `## Project Statistics\n\n`;
  markdown += `- Total files: ${files.length}\n`;

  // Folder structure
  markdown += `\n## Folder Structure\n\n`;
  markdown += '```\n';
  markdown += generateFolderStructure(files, rootPath);
  markdown += '\n```\n';

  // File micro contents
  for (const file of files) {
    const relativePath = path.relative(rootPath, file);
    const fileName = path.basename(file);
    markdown += `\n### ${relativePath}\n\n`;

    if (shouldIncludeFileContents(file, rootPath, codebaseIgnoreFiles)) {
      const code = fs.readFileSync(file, 'utf8');
      const condensedCode = condenseMicroCode(code, fileName, relativePath);
      // Determine language identifier for code block
      const ext = path.extname(file).substring(1);
      let lang = ext;
      if (!ext) {
        // For files without extensions, use getLanguageForSpecialFile
        lang = getLanguageForSpecialFile(fileName);
      }
      markdown += '```' + lang + '\n';
      markdown += condensedCode;
      markdown += '\n```\n';
    } else if (codebaseIgnoreFiles.ignores(relativePath)) {
      markdown += `*(File content excluded by .codebaseignore)*\n`;
    } else if (!isSupportedFile(fileName)) {
      markdown += `*(Unsupported file type)*\n`;
    }
  }

  return markdown;
}

function condenseMicroCode(code: string, fileName: string, filePath: string): string {
  // Extract language based on file extension
  const ext = path.extname(fileName).toLowerCase();
  const language = ext ? getLanguageFromExtension(ext) : getLanguageForSpecialFile(fileName);
  
  // 1. Extract metadata
  const fileMetadata = extractFileMetadata(code, language, filePath);
  
  // 2. Parse structure (simplified)
  const structure = analyzeFileStructure(code, language);
  
  // 3. Generate condensed representation
  let condensed = `// PATH: ${filePath} [${language.toUpperCase()}]\n`;
  
  if (fileMetadata.description) {
    condensed += `// DESC: ${fileMetadata.description}\n`;
  }
  
  if (fileMetadata.dependencies && fileMetadata.dependencies.length > 0) {
    condensed += `// DEPS: ${fileMetadata.dependencies.join(', ')}\n`;
  }
  
  condensed += `\n`;
  
  // Add exports/public interface summary
  if (structure.exports && structure.exports.length > 0) {
    const exportCounts = {
      classes: structure.exports.filter(e => e.type === 'class').length,
      interfaces: structure.exports.filter(e => e.type === 'interface').length,
      functions: structure.exports.filter(e => e.type === 'function').length,
      variables: structure.exports.filter(e => e.type === 'variable').length
    };
    
    condensed += `EXPORT [`;
    const exportParts = [];
    if (exportCounts.classes > 0) exportParts.push(`C:${exportCounts.classes}`);
    if (exportCounts.interfaces > 0) exportParts.push(`I:${exportCounts.interfaces}`);
    if (exportCounts.functions > 0) exportParts.push(`F:${exportCounts.functions}`);
    if (exportCounts.variables > 0) exportParts.push(`V:${exportCounts.variables}`);
    condensed += exportParts.join(', ');
    condensed += `]\n\n`;
  }
  
  // Add main components (classes, functions, etc.)
  for (const component of structure.components) {
    condensed += generateComponentRepresentation(component);
    condensed += '\n';
  }
  
  // Add identified patterns
  if (structure.patterns && structure.patterns.length > 0) {
    condensed += `PATTERNS:\n`;
    for (const pattern of structure.patterns) {
      condensed += `- ${pattern}\n`;
    }
  }
  
  return condensed;
}

function getLanguageFromExtension(ext: string): string {
  const langMap: {[key: string]: string} = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.py': 'python',
    '.java': 'java',
    '.c': 'c',
    '.cpp': 'cpp',
    '.cs': 'csharp',
    '.go': 'go',
    '.rb': 'ruby',
    '.php': 'php',
    '.html': 'html',
    '.css': 'css',
    '.scss': 'scss',
    '.json': 'json',
    '.md': 'markdown',
    '.rs': 'rust',
    '.swift': 'swift',
    '.kt': 'kotlin',
    '.dart': 'dart'
  };
  
  return langMap[ext] || 'unknown';
}

// Add a helper function to get language for files without extensions
function getLanguageForSpecialFile(fileName: string): string {
  const specialFileMap: {[key: string]: string} = {
    'Dockerfile': 'dockerfile',
    'docker-compose': 'yaml',
    'Makefile': 'makefile',
    'Jenkinsfile': 'groovy',
    '.gitignore': 'gitignore',
    '.dockerignore': 'gitignore',
    '.env': 'dotenv',
    '.babelrc': 'json',
    '.eslintrc': 'json',
    '.prettierrc': 'json',
    'Vagrantfile': 'ruby',
    'Procfile': 'procfile'
  };
  
  return specialFileMap[fileName] || 'plaintext';
}

interface FileMetadata {
  description: string;
  dependencies: string[];
}

interface Component {
  type: 'class' | 'interface' | 'function' | 'variable';
  name: string;
  visibility: 'public' | 'private' | 'protected';
  description: string;
  parameters?: string[];
  returnType?: string;
  implementations?: string[];
  extends?: string;
  subComponents?: Component[];
  flows?: string[];
  algorithms?: string[];
}

interface FileStructure {
  exports: Component[];
  components: Component[];
  patterns: string[];
}

function extractFileMetadata(code: string, language: string, filePath: string): FileMetadata {
  // Extract top comments for description
  const lines = code.split('\n');
  let description = '';
  const dependencies: string[] = [];
  
  // Simple extraction of imports/dependencies based on language
  if (language === 'javascript' || language === 'typescript') {
    const importRegex = /import\s+.*?from\s+['"](.+?)['"]/g;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      dependencies.push(match[1]);
    }
  } else if (language === 'python') {
    const importRegex = /(?:from|import)\s+([^\s]+)/g;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      dependencies.push(match[1]);
    }
  } else if (language === 'java') {
    const importRegex = /import\s+([^;]+);/g;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      dependencies.push(match[1]);
    }
  }
  
  // Extract description from file comments
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    if (line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
      const comment = line.replace(/^\/\/|^\/\*|\*\/$|\*$/g, '').trim();
      if (comment && !comment.startsWith('@') && description.length < 100) {
        description += (description ? ' ' : '') + comment;
      }
    } else if (line !== '' && !line.startsWith('import') && !line.startsWith('package')) {
      // Break when we hit non-comment, non-import code
      break;
    }
  }
  
  return {
    description: description.substring(0, 100), // Limit description length
    dependencies: dependencies.slice(0, 5)      // Limit to most important dependencies
  };
}

function analyzeFileStructure(code: string, language: string): FileStructure {
  // This is a simplified placeholder for what would be a complex AST parsing
  
  const components: Component[] = [];
  const exports: Component[] = [];
  const patterns: string[] = [];
  
  // Very simplified detection of components
  const classMatch = code.match(/class\s+(\w+)/g);
  const functionMatch = code.match(/function\s+(\w+)/g);
  const interfaceMatch = code.match(/interface\s+(\w+)/g);
  
  // Check for exported interfaces
  if (interfaceMatch) {
    for (const match of interfaceMatch) {
      const interfaceName = match.replace('class ', '').replace('interface ', '');
      const isExported = code.includes(`export interface ${interfaceName}`);
      
      const component: Component = {
        type: 'interface',
        name: interfaceName,
        visibility: isExported ? 'public' : 'private',
        description: `Interface ${interfaceName}`,
        subComponents: []
      };
      
      components.push(component);
      if (isExported) {
        exports.push(component);
      }
    }
  }
  
  // Add classes
  if (classMatch) {
    for (const match of classMatch) {
      const className = match.replace('class ', '');
      const isExported = code.includes(`export class ${className}`) || 
                         code.includes(`export default class ${className}`);
      
      // Check for class inheritance
      const extendsMatch = new RegExp(`class\\s+${className}\\s+extends\\s+(\\w+)`, 'g').exec(code);
      const implementsMatch = new RegExp(`class\\s+${className}(?:\\s+extends\\s+\\w+)?\\s+implements\\s+([^{]+)`, 'g').exec(code);
      
      const component: Component = {
        type: 'class',
        name: className,
        visibility: isExported ? 'public' : 'private',
        description: `Class ${className}`,
        subComponents: [],
      };
      
      if (extendsMatch && extendsMatch[1]) {
        component.extends = extendsMatch[1].trim();
      }
      
      if (implementsMatch && implementsMatch[1]) {
        component.implementations = implementsMatch[1].split(',').map(impl => impl.trim());
      }
      
      // Detect class properties and methods more accurately
      const classDefinitionStart = code.indexOf(`class ${className}`);
      if (classDefinitionStart !== -1) {
        // Find the class body by locating the opening brace
        const classBodyStart = code.indexOf('{', classDefinitionStart);
        if (classBodyStart !== -1) {
          // Find matching closing brace (this is a simplification)
          let openBraces = 1;
          let classBodyEnd = classBodyStart + 1;
          while (openBraces > 0 && classBodyEnd < code.length) {
            if (code[classBodyEnd] === '{') openBraces++;
            if (code[classBodyEnd] === '}') openBraces--;
            classBodyEnd++;
          }
          
          // Extract class body
          const classBody = code.substring(classBodyStart + 1, classBodyEnd - 1);
          
          // Find properties (using a more precise approach)
          // Match class property declaration patterns like: 
          // private tasks: Map<string, Task>;
          const propertyRegex = /^\s*(private|public|protected)?\s+(readonly\s+)?(static\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([^;=\n]+)/gm;
          let propertyMatch;
          
          while ((propertyMatch = propertyRegex.exec(classBody)) !== null) {
            const visibility = propertyMatch[1] || 'public';
            const isReadonly = !!propertyMatch[2];
            const isStatic = !!propertyMatch[3];
            const propertyName = propertyMatch[4];
            const propertyType = propertyMatch[5]?.trim();
            
            // Skip if the match is within a method body
            // This is a basic check - real implementation would use AST
            const methodBracesBeforeMatch = classBody.substring(0, propertyMatch.index).match(/{/g);
            const methodBracesClosedBeforeMatch = classBody.substring(0, propertyMatch.index).match(/}/g);
            
            if (methodBracesBeforeMatch && methodBracesClosedBeforeMatch &&
                methodBracesBeforeMatch.length > methodBracesClosedBeforeMatch.length) {
              continue; // Skip - this is inside a method body
            }
            
            component.subComponents?.push({
              type: 'variable',
              name: propertyName,
              visibility: visibility as 'public' | 'private' | 'protected',
              description: isStatic ? `Static property ${propertyName}` : `Property ${propertyName}`,
              returnType: propertyType
            });
          }
          
          // Find methods (using a more precise approach)
          // Match class method declaration patterns like:
          // public async createTask(name: string): Promise<Task> {
          const methodRegex = /^\s*(private|public|protected)?\s+(static\s+)?(async\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*([^)]*)\s*\)(?:\s*:\s*([^{;]+))?/gm;
          let methodMatch;
          
          while ((methodMatch = methodRegex.exec(classBody)) !== null) {
            const visibility = methodMatch[1] || 'public';
            const isStatic = !!methodMatch[2];
            const isAsync = !!methodMatch[3];
            const methodName = methodMatch[4];
            const params = methodMatch[5];
            const returnType = methodMatch[6]?.trim();
            
            // Skip constructor when looking for methods
            if (methodName === 'constructor') continue;
            
            // Skip if the matched text is within a method body
            const methodBracesBeforeMatch = classBody.substring(0, methodMatch.index).match(/{/g);
            const methodBracesClosedBeforeMatch = classBody.substring(0, methodMatch.index).match(/}/g);
            
            if (methodBracesBeforeMatch && methodBracesClosedBeforeMatch &&
                methodBracesBeforeMatch.length > methodBracesClosedBeforeMatch.length) {
              continue; // Skip - this is inside a method body
            }
            
            const paramsList = params.split(',')
              .map(param => param.trim())
              .filter(param => param) // Remove empty strings
              .map(param => {
                // Extract parameter name and type if available
                const [paramName, paramType] = param.split(':').map(p => p.trim());
                return paramType ? `${paramName}:${paramType}` : paramName;
              });
            
            // Determine and extract flow patterns (simplified approach)
            const methodStart = classBody.indexOf(methodMatch[0]) + methodMatch[0].length;
            const methodBodyStart = classBody.indexOf('{', methodStart);
            if (methodBodyStart !== -1) {
              let openBraces = 1;
              let methodBodyEnd = methodBodyStart + 1;
              
              while (openBraces > 0 && methodBodyEnd < classBody.length) {
                if (classBody[methodBodyEnd] === '{') openBraces++;
                if (classBody[methodBodyEnd] === '}') openBraces--;
                methodBodyEnd++;
              }
              
              const methodBody = classBody.substring(methodBodyStart + 1, methodBodyEnd - 1);
              
              // Add the method with detected flow patterns
              const method: Component = {
                type: 'function',
                name: methodName,
                visibility: visibility as 'public' | 'private' | 'protected',
                description: isStatic ? `Static method ${methodName}` : `Method ${methodName}`,
                parameters: paramsList.length > 0 ? paramsList : undefined,
                returnType: returnType || undefined
              };
              
              // Detect flow patterns
              if (methodBody.includes('try') && methodBody.includes('catch')) {
                method.flows = ['error-handling'];
              }
              
              if (isAsync || methodBody.includes('await') || methodBody.includes('Promise')) {
                if (method.flows) {
                  method.flows.push('async-await');
                } else {
                  method.flows = ['async-await']; 
                }
              }
              
              if (methodBody.includes('if') && methodBody.includes('else')) {
                if (method.flows) {
                  method.flows.push('conditional');
                } else {
                  method.flows = ['conditional'];
                }
              }
              
              component.subComponents?.push(method);
            }
          }
        }
      }
      
      components.push(component);
      if (isExported) {
        exports.push(component);
      }
    }
  }
  
  // Add functions
  if (functionMatch) {
    for (const match of functionMatch) {
      const functionName = match.replace('function ', '');
      const isExported = code.includes(`export function ${functionName}`) ||
                        code.includes(`export default function ${functionName}`);
      
      // Extract function details
      const funcRegex = new RegExp(`(?:export\\s+)?(?:async\\s+)?function\\s+${functionName}\\s*\\(([^)]*)\\)(?:\\s*:\\s*([^{]+))?`, 'g');
      const funcMatch = funcRegex.exec(code);
      
      const component: Component = {
        type: 'function',
        name: functionName,
        visibility: isExported ? 'public' : 'private',
        description: `Function ${functionName}`
      };
      
      if (funcMatch) {
        // Extract parameters
        const params = funcMatch[1];
        if (params) {
          component.parameters = params.split(',')
            .map(param => param.trim())
            .filter(param => param) // Remove empty strings
            .map(param => {
              // Extract parameter name and type if available
              const [paramName, paramType] = param.split(':').map(p => p.trim());
              return paramType ? `${paramName}:${paramType}` : paramName;
            });
        }
        
        // Extract return type
        if (funcMatch[2]) {
          component.returnType = funcMatch[2].trim();
        }
        
        // Detect function flow (simplified)
        const functionBodyStart = code.indexOf('{', funcMatch.index);
        if (functionBodyStart !== -1) {
          // Find matching closing brace (this is a simplification)
          let openBraces = 1;
          let functionBodyEnd = functionBodyStart + 1;
          while (openBraces > 0 && functionBodyEnd < code.length) {
            if (code[functionBodyEnd] === '{') openBraces++;
            if (code[functionBodyEnd] === '}') openBraces--;
            functionBodyEnd++;
          }
          
          const functionBody = code.substring(functionBodyStart + 1, functionBodyEnd - 1);
          
          // Check for common flow patterns
          if (functionBody.includes('try') && functionBody.includes('catch')) {
            component.flows = ['try-catch'];
          } else if (functionBody.includes('if') && functionBody.includes('else')) {
            component.flows = ['conditional'];
          } else if (functionBody.includes('switch') && functionBody.includes('case')) {
            component.flows = ['switch-case'];
          } else if (functionBody.includes('for') || functionBody.includes('while') || functionBody.includes('forEach')) {
            component.flows = ['iteration'];
          }
        }
      }
      
      components.push(component);
      if (isExported) {
        exports.push(component);
      }
    }
  }
  
  // Detect common patterns (simplified)
  if (code.includes('.subscribe(') || code.includes('addEventListener(') || code.includes('.on(') || code.includes('EventEmitter')) {
    patterns.push('Observer pattern for events');
  }
  
  if (code.includes('.then(') || code.includes('await ') || code.includes('Promise')) {
    patterns.push('Async/Promise pattern');
  }
  
  if (code.includes('new') && code.includes('return')) {
    patterns.push('Factory pattern');
  }
  
  if (code.includes('static instance') || code.includes('getInstance()')) {
    patterns.push('Singleton pattern');
  }
  
  if (code.includes('extends')) {
    patterns.push('Inheritance pattern');
  }
  
  if (code.includes('implements')) {
    patterns.push('Interface implementation pattern');
  }
  
  return {
    exports,
    components,
    patterns
  };
}

function generateComponentRepresentation(component: Component): string {
  let result = '';
  
  // Visibility indicator
  const visPrefix = component.visibility === 'public' ? '+' : 
                    component.visibility === 'private' ? '-' : '#';
  
  // Component type abbreviation
  const typePrefix = component.type === 'class' ? 'C' : 
                     component.type === 'interface' ? 'I' : 
                     component.type === 'function' ? 'F' : 'V';
  
  result += `${typePrefix}${visPrefix} ${component.name}`;
  
  // Add extends info for classes
  if (component.type === 'class' && component.extends) {
    result += ` extends ${component.extends}`;
  }
  
  // Add implementation info for classes/interfaces
  if (component.implementations && component.implementations.length > 0) {
    result += ` implements ${component.implementations.join(', ')}`;
  }
  
  // Add parameters for functions
  if ((component.type === 'function' || component.type === 'interface') && component.parameters) {
    result += `(${component.parameters.join(', ')})`;
    if (component.returnType) {
      result += `:${component.returnType}`;
    }
  } else if (component.type === 'variable' && component.returnType) {
    result += `:${component.returnType}`;
  }
  
  result += ` {\n`;
  
  // Add description
  if (component.description) {
    result += `  // ${component.description}\n`;
  }
  
  // Add flows for functions
  if (component.flows && component.flows.length > 0) {
    result += `  [FLOW: ${component.flows.join('→')}]\n`;
  }
  
  // Add algorithms for functions
  if (component.algorithms && component.algorithms.length > 0) {
    result += `  [ALG: ${component.algorithms.join(', ')}]\n`;
  }
  
  // Add subcomponents
  if (component.subComponents && component.subComponents.length > 0) {
    for (const subComp of component.subComponents) {
      result += `  ${generateComponentRepresentation(subComp)}\n`;
    }
  } else {
    // Add placeholder if no subcomponents
    result += `  ...`;
  }
  
  result += `}`;
  
  return result;
}

export function deactivate() {}
