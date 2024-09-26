# Configuration

Currently, CodebaseMD does not have user-configurable settings through the Visual Studio Code settings interface. However, you can customize some behaviors by modifying the source code directly.

## Customizing Ignored Files and Directories

To change which files and directories are ignored during export:

1. Open the `src/extension.ts` file in the project
2. Locate the `createIgnoreInstance` function
3. Modify the `ig.add()` call to add or remove patterns from the ignore list

Example:

```typescript
ig.add([
  'node_modules/',
  'build/',
  'out/',
  'dist/',
  '.git/',
  // Add your custom ignore patterns here
  'custom-ignore-folder/',
  '*.custom-extension'
]);
```

## Customizing Supported File Types

To change which file types are considered "supported" and have their contents included in the export:

1. Open the `src/extension.ts` file
2. Find the `isSupportedFile` function
3. Modify the `supportedExtensions` array to add or remove file extensions

Example:

```typescript
const supportedExtensions = [
  '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss', '.json', '.md', '.txt',
  '.py', '.java', '.c', '.cpp', '.cs', '.rb', '.go', '.php', '.sh', '.xml',
  // Add your custom extensions here
  '.custom', '.myext'
];
```

## Customizing Large File Exclusions

To change which files are considered "large" and excluded from the export:

1. Open the `src/extension.ts` file
2. Locate the `isLargeFile` function
3. Modify the `largeFiles` array to add or remove file names

Example:

```typescript
function isLargeFile(fileName: string): boolean {
  const largeFiles = ['package-lock.json', 'yarn.lock', 'my-large-file.json'];
  return largeFiles.includes(fileName);
}
```

**Note**: After making any changes to the source code, you'll need to recompile the extension and reinstall it in Visual Studio Code for the changes to take effect.

## Future Configuration Plans

We plan to add user-configurable settings in future versions of CodebaseMD. This will allow users to customize the extension's behavior without modifying the source code. If you have suggestions for configurable options, please [open an issue](https://github.com/alpha912/codebase-md/issues) on GitHub.