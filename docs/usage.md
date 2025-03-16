# Usage

CodebaseMD provides four main commands:

1. **Export All**: Export the entire codebase to a Markdown file
2. **Export Selected**: Export only the selected files or folders to a Markdown file
3. **Export Micro Codebase**: Export a condensed version of the entire codebase
4. **Export Selected as Micro Codebase**: Export a condensed version of selected files or folders

## Exporting the Entire Codebase

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS)
2. Type "CodebaseMD: Export All" and select it
3. Choose a location to save the exported Markdown file
4. The extension will process all files in your workspace, excluding files specified in `.gitignore` or default ignore patterns
5. Once complete, you will see a notification that the file was saved successfully

## Exporting Selected Files

1. Select one or more files or folders in the Explorer view
2. Right-click and select "CodebaseMD: Export Selected" from the context menu
3. Alternatively, open the Command Palette and type "CodebaseMD: Export Selected" (you need to have selected files first)
4. Choose a location to save the exported Markdown file
5. The extension will process only the selected files, still respecting ignore patterns
6. Once complete, you will see a notification that the file was saved successfully

## Exporting Micro Codebase

The Micro Codebase export feature creates highly condensed representations of your code files, reducing size by approximately 95% while preserving essential structural information.

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS)
2. Type "CodebaseMD: Export Micro Codebase" and select it
3. Choose a location to save the exported Markdown file
4. The extension will analyze and condense all files in your workspace
5. Once complete, you will see a notification that the file was saved successfully

## Exporting Selected Files as Micro Codebase

1. Select one or more files or folders in the Explorer view
2. Right-click and select "CodebaseMD: Export Selected as Micro Codebase" from the context menu
3. Choose a location to save the exported Markdown file
4. The extension will analyze and condense only the selected files
5. Once complete, you will see a notification that the file was saved successfully

## Understanding the Micro Codebase Format

The Micro Codebase export uses a specialized notation to represent code structures in a condensed format:

- File metadata is shown at the top (path, description, dependencies)
- Export information summarizes what the file exposes (classes, interfaces, functions)
- Components (classes, functions, etc.) use type and visibility indicators:
  - Type: C = Class, I = Interface, F = Function, V = Variable
  - Visibility: + = public, - = private, # = protected
- Function parameters and return types are shown in abbreviated form
- Important algorithms and flow patterns are highlighted
- Design patterns detected in the code are listed at the bottom

Example:
```
// PATH: src/auth/UserManager.ts [TYPESCRIPT]
// DESC: User authentication and session management
// DEPS: ./models, ../utils, @auth/jwt

EXPORT [C:1, F:2]

C+ UserManager {
  // Handles user authentication and session tracking
  
  F+ login(user:S, pass:S):Promise<UserSession>
    [FLOW: validate→authenticate→createSession]
  
  F+ logout(id:S):void
    [FLOW: validateSession→destroyToken→clearCache]
  
  F- validateCredentials(user:S, pass:S):Bool
    [ALG: PBKDF2]
}

PATTERNS:
- Singleton pattern
- Promise chain pattern
```

## Excluding Files from Content Export

You can exclude files from having their contents exported while still keeping them in the folder structure by using a `.codebaseignore` file:

1. Create a `.codebaseignore` file in the root of your workspace
2. Add patterns using the same syntax as `.gitignore`
3. When exporting, files matching these patterns will be included in the folder structure but will show a message indicating their contents were excluded

This is useful for files that you want to acknowledge exist in your project structure but don't need to include their full contents in the export.

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