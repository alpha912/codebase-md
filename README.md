# CodebaseMD

[![VSCode Extension Version](https://img.shields.io/visual-studio-marketplace/v/alpha912.codebase-md)](https://marketplace.visualstudio.com/items?itemName=alpha912.codebase-md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**CodebaseMD** is a Visual Studio Code extension that allows you to export your entire codebase or selected files as a Markdown file, making it easier to share and document your projects.

## Features

- **1-Click Export Entire Codebase as Markdown**: Export your entire project into a single markdown file with the folder structure and code files included.
- **Exclude Unnecessary Files Automatically**: Automatically excludes files and folders like those in `.gitignore`, `node_modules`, `build`, `out`, and large files such as `package-lock.json`.
- **Export Selected Files**: Right-click on selected files or folders and export only those to Markdown.
- **Markdown Compatible Output**: Only actively coded files with supported extensions (e.g., `.js`, `.ts`, `.py`, `.html`, etc.) are included with their contents, while unsupported files are listed with their names and paths.

## Installation

### From Visual Studio Marketplace

You can install **CodebaseMD** directly from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=alpha912.codebase-md).

### Manually via VSIX

1. Download the `.vsix` file from the [releases section](https://github.com/alpha912/codebase-md/releases).
2. Open **VS Code**.
3. Go to **Extensions** (`Ctrl+Shift+X` or `Cmd+Shift+X` on macOS).
4. Click on the **three dots** in the top-right corner, then choose **Install from VSIX**.
5. Select the downloaded `.vsix` file.

## Usage

### 1. Export the Entire Codebase

- Open the **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`).
- Search for and run the command **Export Codebase as Markdown**.

### 2. Export Selected Files/Folders

- In the **Explorer** view, select multiple files or folders.
- Right-click and choose **Export Selected as Markdown**.

### Example of Exported Markdown

The exported markdown file will have:

- **Project Statistics**: Total number of files exported.
- **Folder Structure**: A tree-like structure of your project.
- **Code Files**: Each file's contents enclosed in a code block with proper syntax highlighting.
- **Unsupported Files**: Unsupported file types will be listed with their file paths but not their contents.

## Contributing

Contributions are welcome! Feel free to open issues, submit pull requests, or suggest new features.

## License

This project is licensed under the MIT License. See the [LICENSE](https://github.com/alpha912/codebase-md/blob/master/LICENSE.md) file for details.

---

### **Author**

- **Alphin Tom**
- **Email**: [alphinctom@gmail.com](mailto:alphinctom@gmail.com)
- **GitHub**: [alpha912](https://github.com/alpha912)
