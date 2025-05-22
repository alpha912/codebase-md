import * as path from 'path';

export interface MockFileSystem {
  rootPath: string;
  files: string[];
  mockFileContents: Record<string, string>;
  readFile: (filePath: string) => string;
  isDirectory: (filePath: string) => boolean;
  isFile: (filePath: string) => boolean;
  getRelativePath: (filePath: string) => string;
}

/**
 * Creates a mock file system structure for testing
 */
export function createMockFileSystem(): MockFileSystem {
  const rootPath = path.sep + 'mock-project';
  
  const files = [
    path.join(rootPath, 'src', 'index.ts'),
    path.join(rootPath, 'src', 'utils', 'helper.ts'),
    path.join(rootPath, 'src', 'components', 'App.tsx'),
    path.join(rootPath, 'src', 'components', 'Button.tsx'),
    path.join(rootPath, 'package.json'),
    path.join(rootPath, 'tsconfig.json'),
    path.join(rootPath, 'README.md'),
    path.join(rootPath, '.gitignore'),
    path.join(rootPath, 'node_modules', 'react', 'package.json'),
    path.join(rootPath, 'node_modules', 'typescript', 'package.json'),
    path.join(rootPath, 'build', 'index.js'),
    path.join(rootPath, 'public', 'index.html'),
    path.join(rootPath, 'public', 'styles.css'),
    path.join(rootPath, 'Dockerfile'),
  ];
  
  const mockFileContents: Record<string, string> = {
    [path.join(rootPath, 'src', 'index.ts')]: '// Main entry point\nimport React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./components/App";\n\nReactDOM.render(<App />, document.getElementById("root"));',
    [path.join(rootPath, 'src', 'components', 'App.tsx')]: '// App component\nimport React from "react";\nimport Button from "./Button";\n\nexport default function App() {\n  return (\n    <div>\n      <h1>Hello World</h1>\n      <Button />\n    </div>\n  );\n}',
    [path.join(rootPath, 'package.json')]: '{\n  "name": "mock-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^17.0.2",\n    "react-dom": "^17.0.2"\n  }\n}',
    [path.join(rootPath, 'README.md')]: '# Mock Project\n\nThis is a mock project for testing.',
  };
  
  return {
    rootPath,
    files,
    mockFileContents,
    readFile: (filePath: string): string => {
      return mockFileContents[filePath] || '';
    },
    isDirectory: (filePath: string): boolean => {
      // Check if any file starts with this path
      return files.some(f => f.startsWith(filePath) && f !== filePath);
    },
    isFile: (filePath: string): boolean => {
      return files.includes(filePath);
    },
    getRelativePath: (filePath: string): string => {
      return path.relative(rootPath, filePath);
    }
  };
}
