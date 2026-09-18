# Installation

There are two ways to install the CodebaseMD extension for Visual Studio Code:

For v3.0.0, install the VSIX from GitHub Releases. Marketplace publishing is separate and its version may differ. The extension supports VS Code 1.70+ and local filesystem workspaces.

## 1. From Visual Studio Marketplace

1. Open Visual Studio Code
2. Go to the Extensions view by clicking on the square icon in the left sidebar or pressing `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS)
3. Search for "CodebaseMD"
4. Click on the "Install" button next to the CodebaseMD extension

## 2. Manual Installation via VSIX

1. Download the latest `.vsix` file from the [releases section](https://github.com/alpha912/codebase-md/releases) of the GitHub repository
2. Open Visual Studio Code
3. Go to the Extensions view
4. Click on the "..." (More Actions) button in the top-right corner of the Extensions view
5. Select "Install from VSIX..."
6. Navigate to the downloaded `.vsix` file and select it
7. Click "Install"

After installation, you may need to reload Visual Studio Code for the extension to activate.

## Verifying Installation

To verify that CodebaseMD has been installed correctly:

1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`)
2. Type "CodebaseMD"
3. Run **CodebaseMD: Export Wizard**. The original Markdown and Micro commands are also available.

If you encounter any issues during installation, please refer to the [Troubleshooting](./troubleshooting.md) guide or [open an issue](https://github.com/alpha912/codebase-md/issues) on GitHub.
