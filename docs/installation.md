# Installation

CodebaseMD needs VS Code and a local folder to export. Git is needed only for
Git exports.

| Release | Requires |
| --- | --- |
| 3.0.0 (current) | VS Code 1.70 or later |
| Next release (unreleased, on `main`) | VS Code 1.146 or later |

## From GitHub Releases

This is the recommended way to get the newest version.

1. Download `codebase-md-<version>.vsix` from the
   [latest release](https://github.com/alpha912/codebase-md/releases/latest).
2. Optionally verify it against the `.sha256` file published next to it:

   ```sh
   sha256sum -c codebase-md-<version>.vsix.sha256
   ```

3. In VS Code, open the Extensions view (`Ctrl+Shift+X`, or `Cmd+Shift+X` on
   macOS), choose **… → Install from VSIX…** and select the file.

You can also install from a terminal:

```sh
code --install-extension codebase-md-<version>.vsix
```

## From the Visual Studio Marketplace

Search for **CodebaseMD** in the Extensions view and choose **Install**, or
open the
[Marketplace page](https://marketplace.visualstudio.com/items?itemName=alpha912.codebase-md).
Marketplace publication is a separate step from a GitHub release, so the
version there can be older.

## Verifying the installation

1. Open a local folder.
2. Open the Command Palette (`Ctrl+Shift+P`, or `Cmd+Shift+P` on macOS) and
   type "CodebaseMD".
3. Run **CodebaseMD: Export Wizard** and choose *Workspace → Full → Markdown →
   Editor*. A new tab opens with the export.

If the commands are missing, see [troubleshooting](troubleshooting.md).

## Updating and removing

Install a newer VSIX over the existing one to update. To remove the extension,
choose **Uninstall** on its page in the Extensions view. CodebaseMD stores no
data outside your VS Code settings.
