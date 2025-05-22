"use strict";
exports.__esModule = true;
exports.createMockFileSystem = void 0;
var path = require("path");
/**
 * Creates a mock file system structure for testing
 */
function createMockFileSystem() {
    var _a;
    var rootPath = path.sep + 'mock-project';
    var files = [
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
    var mockFileContents = (_a = {},
        _a[path.join(rootPath, 'src', 'index.ts')] = '// Main entry point\nimport React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./components/App";\n\nReactDOM.render(<App />, document.getElementById("root"));',
        _a[path.join(rootPath, 'src', 'components', 'App.tsx')] = '// App component\nimport React from "react";\nimport Button from "./Button";\n\nexport default function App() {\n  return (\n    <div>\n      <h1>Hello World</h1>\n      <Button />\n    </div>\n  );\n}',
        _a[path.join(rootPath, 'package.json')] = '{\n  "name": "mock-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^17.0.2",\n    "react-dom": "^17.0.2"\n  }\n}',
        _a[path.join(rootPath, 'README.md')] = '# Mock Project\n\nThis is a mock project for testing.',
        _a);
    return {
        rootPath: rootPath,
        files: files,
        mockFileContents: mockFileContents,
        readFile: function (filePath) {
            return mockFileContents[filePath] || '';
        },
        isDirectory: function (filePath) {
            // Check if any file starts with this path
            return files.some(function (f) { return f.startsWith(filePath) && f !== filePath; });
        },
        isFile: function (filePath) {
            return files.includes(filePath);
        },
        getRelativePath: function (filePath) {
            return path.relative(rootPath, filePath);
        }
    };
}
exports.createMockFileSystem = createMockFileSystem;
