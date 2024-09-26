# Troubleshooting

This guide aims to help you resolve common issues you might encounter while using CodebaseMD. If you're experiencing a problem not listed here, please [open an issue](https://github.com/alpha912/codebase-md/issues) on GitHub.

## Common Issues and Solutions

### 1. Extension Not Appearing in VS Code

**Problem**: After installation, you can't find CodebaseMD in the extensions list or command palette.

**Solutions**:
- Ensure you've reloaded VS Code after installation
- Check if the extension is disabled in the Extensions view
- Verify that you're using a compatible version of VS Code (1.70.0 or later)

### 2. "Export Codebase as Markdown" Command Not Working

**Problem**: The command doesn't appear to do anything when invoked.

**Solutions**:
- Make sure you have a workspace folder open in VS Code
- Check the Output panel (View > Output) and select "CodebaseMD" from the dropdown for any error messages
- Verify that you have write permissions in the directory where you're trying to save the Markdown file

### 3. Generated Markdown File is Empty or Incomplete

**Problem**: The exported Markdown file doesn't contain all expected content.

**Solutions**:
- Check if your project