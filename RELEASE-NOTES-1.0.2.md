# CodebaseMD v1.0.2 Release Notes

We're excited to announce the release of CodebaseMD v1.0.2!

## New Features

### .codebaseignore Support

This release adds support for a special `.codebaseignore` file that works similarly to `.gitignore` but is specifically for controlling what file contents are exported:

- Files matching patterns in `.codebaseignore` will still be included in the folder structure
- Their contents will be excluded from the export, showing "*(File content excluded by .codebaseignore)*" instead
- The `.codebaseignore` file uses the same syntax as `.gitignore`

## How to Use .codebaseignore

1. Create a `.codebaseignore` file in the root of your workspace
2. Add file patterns following standard gitignore syntax
3. Run the export command - files matching these patterns will be in the structure but their contents won't be included

Example `.codebaseignore` file:
```
# Exclude all test files
*.test.js
*.spec.js
__tests__/

# Exclude configuration files
.eslintrc
.prettierrc
tsconfig.json

# Exclude specific files or directories
src/legacy/
temp.js
```

## Installation

Download the `.vsix` file from this release and install it in VS Code:

1. Open VS Code
2. Press `Ctrl+Shift+X` to open the Extensions view
3. Click on the three dots (⋯) in the top right corner
4. Select "Install from VSIX..." and choose the downloaded file

Thank you for using CodebaseMD! 