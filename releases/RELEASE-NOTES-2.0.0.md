# CodebaseMD v2.0.0 Release Notes

We're excited to announce the release of CodebaseMD v2.0.0, featuring a major new capability: Micro Codebase Export!

## New Features

### Micro Codebase Export

This release introduces a powerful new feature that enables you to create highly condensed, yet informative representations of your code files. The Micro Codebase export reduces code size by approximately 95% while preserving essential structural and functional information.

#### Key Benefits

- **Size Reduction**: Condenses large files (2000+ lines) down to approximately 100 lines
- **Structural Preservation**: Maintains class hierarchies, function relationships, and module dependencies
- **Information Density**: Uses a specialized notation system to maximize information content
- **Pattern Recognition**: Automatically identifies and highlights common design patterns in your code

#### How It Works

The Micro Codebase export applies a sophisticated code condensation algorithm that:

1. Analyzes your code's structure, including classes, functions, dependencies, and patterns
2. Prioritizes information based on visibility, usage, and importance
3. Creates a condensed representation using specialized notation
4. Generates a markdown file with the micro representation of your codebase

#### How to Use Micro Codebase Export

**For the entire codebase:**
1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS)
2. Type "CodebaseMD: Export Micro Codebase" and select it
3. Choose a location to save the exported Markdown file

**For selected files:**
1. Select one or more files or folders in the Explorer view
2. Right-click and select "CodebaseMD: Export Selected as Micro Codebase" from the context menu
3. Choose a location to save the exported Markdown file

#### Understanding the Output Format

The micro codebase representation uses a specialized notation:

```
// PATH: src/services/auth/UserAuthentication.java [JAVA]
// DESC: Handles user authentication and session management
// DEPS: io.jwt.*, org.security.*, java.util.*

EXPORT [C:2, I:1, F:5]

C+ UserAuthentication implements I:AuthProvider {
  // Core authentication controller
  
  F+ authenticate(user:S, pass:S):AuthResult
    [FLOW: validate→verify→createSession]
    [THROWS: AuthFailedException]
  
  F- verifyPassword(hash:S, input:S):Bool
    [ALG: PBKDF2/SHA256]
  
  V+ sessionStore:Map<S,SessionData>
  V- attempts:Counter
  
  C- SessionData {...}
}

PATTERNS:
- Builder pattern for auth options
- Observer for session events
```

Where:
- `C+` = Public Class
- `F-` = Private Function/Method
- `I#` = Protected Interface
- `V+` = Public Variable
- `S` = String type
- `FLOW:` = Execution flow
- `ALG:` = Algorithm used

## Installation

Download the `.vsix` file from this release and install it in VS Code:

1. Open VS Code
2. Press `Ctrl+Shift+X` to open the Extensions view
3. Click on the three dots (⋯) in the top right corner
4. Select "Install from VSIX..." and choose the downloaded file

Thank you for using CodebaseMD! 