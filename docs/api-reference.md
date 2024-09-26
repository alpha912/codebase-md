# API Reference

CodebaseMD is a Visual Studio Code extension and does not expose a public API for other extensions to consume. However, this document provides an overview of the main functions and their purposes within the extension.

## Core Functions

### `activate(context: vscode.ExtensionContext)`

This function is called when the extension is activated. It registers the commands that the extension provides.

### `exportCodebase()`

Exports the entire codebase of the currently open workspace.

### `exportSelectedFiles(uris: vscode.Uri[])`

Exports only the selected files and folders.

### `getAllFiles(dir: string): Promise<string[]>`

Recursively gets all files in a directory, respecting ignore patterns.

### `getFilesFromUris(uris: vscode.Uri[]): Promise<string[]>`

Gets all files from the provided URIs, which may include both files and folders.

### `createIgnoreInstance(rootDir: string): Ignore`

Creates an instance of the `ignore` package, configured with patterns from `.gitignore` and default ignored items.

### `isLargeFile(fileName: string): boolean`

Determines if a file should be considered "large" and excluded from the export.

### `isSupportedFile(fileName: string): boolean`

Checks if a file type is supported for content export.

### `generateMarkdown(files: string[], rootPath: string): Promise<string>`

Generates the Markdown content for the given files.

### `generateFolderStructure(files: string[], rootPath: string): string`

Creates a tree-like representation of the folder structure.

### `saveMarkdownFile(content: string)`

Prompts the user to choose a save location and saves the generated Markdown content.

## Extension Commands

CodebaseMD registers two commands that can be invoked from the Command Palette:

1. `codebaseMD.exportAll`: Exports the entire codebase as Markdown.
2. `codebaseMD.exportSelected`: Exports selected files or folders as Markdown.

## Events

CodebaseMD does not currently emit any custom events.

## Configuration

The extension does not currently use VS Code's configuration API. All configuration is hard-coded in the source files.

## Extending CodebaseMD

While CodebaseMD doesn't provide an API for other extensions, you can fork the project and modify it to suit your needs. Some potential extension points include:

- Adding new file type support
- Implementing custom markdown generation logic
- Adding new commands for different export options

If you develop features that you think would be valuable to the community, consider submitting a pull request to the main repository.

For more information on developing extensions for Visual Studio Code, refer to the [official documentation](https://code.visualstudio.com/api).