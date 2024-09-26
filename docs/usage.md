# Usage

CodebaseMD provides two main functionalities: exporting your entire codebase and exporting selected files or folders.

## Exporting the Entire Codebase

1. Open your project in Visual Studio Code
2. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
3. Search for and select "Export Codebase as Markdown"
4. Choose a location to save the exported Markdown file
5. The extension will generate a Markdown file containing your project's structure and file contents

## Exporting Selected Files or Folders

1. In the Explorer view, select one or more files or folders you want to export
2. Right-click on the selection
3. Choose "Export Selected as Markdown" from the context menu
4. Select a location to save the exported Markdown file
5. The extension will generate a Markdown file containing the structure and contents of your selected files and folders

## Understanding the Output

The generated Markdown file will contain:

- **Project Statistics**: Total number of files exported
- **Folder Structure**: A tree-like representation of your project's directory structure
- **File Contents**: Each supported file's contents enclosed in a code block with proper syntax highlighting
- **Unsupported Files**: Files with unsupported extensions will be listed with their file paths but not their contents

## Supported File Types

CodebaseMD supports a wide range of file types, including but not limited to:

- JavaScript (.js, .jsx)
- TypeScript (.ts, .tsx)
- Python (.py)
- HTML (.html)
- CSS (.css)
- Markdown (.md)
- JSON (.json)
- And many more...

For a complete list of supported file types, refer to the `isSupportedFile` function in the [source code](https://github.com/alpha912/codebase-md/blob/master/src/extension.ts).

## Excluded Files and Directories

By default, CodebaseMD excludes certain files and directories to keep the output manageable and relevant. These include:

- Files and directories specified in your project's `.gitignore`
- Common directories like `node_modules`, `build`, `dist`, etc.
- Large files like `package-lock.json`

For a complete list of excluded items, check the `createIgnoreInstance` function in the [source code](https://github.com/alpha912/codebase-md/blob/master/src/extension.ts).

If you need to customize these exclusions, please refer to the [Configuration](./configuration.md) guide.