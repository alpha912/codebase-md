# CodebaseMD

[![VSCode Extension Version](https://img.shields.io/visual-studio-marketplace/v/alpha912.codebase-md)](https://marketplace.visualstudio.com/items?itemName=alpha912.codebase-md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**CodebaseMD** is a Visual Studio Code extension that allows you to export your entire codebase or selected files as a Markdown file, making it easier to share and document your projects.

## What's New in Version 2.0.2

### Features & Improvements
- **Enhanced Micro Export Format**: Improved code structure analysis with detection of class properties, methods, and function patterns
- **Automatic Flow Detection**: Identify code flow patterns (async/await, try/catch, conditionals) 
- **Improved Component Representation**: Detailed component visualization with visibility indicators and type annotations
- **Comprehensive Test Suite**: Added extensive test framework with Mocha to ensure reliability
- **Improved File Handling**: Better support for different file types and programming languages
- **Enhanced Markdown Generation**: Better clarity and organization in exported markdown documents

### Bug Fixes
- Fixed issues with file type detection and language mapping
- Resolved edge cases in folder structure generation
- Enhanced error handling throughout the codebase
- Improved extraction of file metadata
- Fixed pattern detection for different programming paradigms

Check the full [release notes](releases/RELEASE-NOTES-2.0.2.md) for more details or view our detailed [documentation](docs/micro-export-format.md) on the Micro Export format.

## Features

- **1-Click Export Entire Codebase as Markdown**: Export your entire project into a single markdown file with the folder structure and code files included.
- **Exclude Unnecessary Files Automatically**: Automatically excludes files and folders like those in `.gitignore`, `node_modules`, `build`, `out`, and large files such as `package-lock.json`.
- **Export Selected Files**: Right-click on selected files or folders and export only those to Markdown.
- **Markdown Compatible Output**: Only actively coded files with supported extensions (e.g., `.js`, `.ts`, `.py`, `.html`, etc.) are included with their contents, while unsupported files are listed with their names and paths.
- **Micro Export Format** (New in v2.0): Generate condensed representations of your code with intelligent structure analysis, code flow detection, and design pattern recognition. [Learn more](docs/micro-export-format.md).

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

### 3. Use the Micro Export Format

- Open the **Command Palette** (`Ctrl+Shift+P` or `Cmd+Shift+P`).
- Search for and run the command **Export Micro Codebase**.
- Alternatively, right-click on files or folders and choose **Export Selected as Micro Codebase**.

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
