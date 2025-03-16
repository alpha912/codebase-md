# CodebaseMD v2.0.1 Release Notes

We're excited to announce the release of CodebaseMD v2.0.1, with important improvements to the Micro Codebase Export feature!

## Improvements

### Enhanced Micro Codebase Export Functionality

This release includes significant improvements to the Micro Codebase Export feature:

- **Improved Method Detection**: Fixed issues with method detection to eliminate false positives
- **Accurate Class Hierarchy**: Now correctly detects and displays class inheritance (`extends`) relationships
- **Better Type Information**: Improved detection of parameter types and return types
- **Variable & Property Accuracy**: Fixed property detection to avoid capturing method calls as properties
- **Flow Pattern Detection**: Added detection of code flow patterns like error handling, async operations, and conditionals
- **Static Member Recognition**: Properly identifies and marks static methods and properties

## Example of Improved Output

```typescript
C+ TaskManager extends EventEmitter {
  // Class TaskManager
  V- tasks:Map<string, Task> {
  // Property tasks
  }
  V- logger:Logger {
  // Property logger
  }
  V- instance:TaskManager {
  // Static property instance
  }
  F+ createTask(name:string, priority:TaskPriority = TaskPriority.NORMAL):Promise<Task> {
  // Method createTask
  [FLOW: async-await]
  }
  F+ executeTask(taskId:string, fn:() => Promise<any>):Promise<any> {
  // Method executeTask
  [FLOW: error-handling→async-await]
  }
}
```

## Installation

Download the `.vsix` file from this release and install it in VS Code:

1. Open VS Code
2. Press `Ctrl+Shift+X` to open the Extensions view
3. Click on the three dots (⋯) in the top right corner
4. Select "Install from VSIX..." and choose the downloaded file

Thank you for using CodebaseMD! 