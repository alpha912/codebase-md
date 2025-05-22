# CodebaseMD Extension v2.0.2

## Micro Export Format Improvements

The 2.0.2 release brings significant improvements to the Micro Export format, providing a more detailed and structured view of your codebase. The goal is to give you a quick but comprehensive understanding of each file's structure and purpose without diving into the full code.

### Enhanced Features

#### 1. Better Component Detection
- Automatically detects classes, interfaces, functions, and variables
- Extracts class hierarchies and interface implementations
- Identifies public, private, and protected members

#### 2. Code Flow Analysis
- Detects async/await patterns
- Identifies error handling (try/catch blocks)
- Recognizes conditional flows and loop structures

#### 3. Type Information
- Extracts parameter and return types from functions and methods
- Shows property types and visibility
- Displays inheritance relationships

#### 4. Design Pattern Recognition
- Automatically identifies common patterns like:
  - Observer pattern
  - Factory methods
  - Singleton implementations
  - Inheritance and interface implementation

#### 5. Improved Visual Representation
- Uses consistent notation for visibility (+public, -private, #protected)
- Shows type prefixes (C=class, I=interface, F=function, V=variable)
- Hierarchical display of component relationships

### Example Output

```typescript
// PATH: src/services/taskManager.ts [TYPESCRIPT]
// DESC: Manages task creation, deletion and status updates
// DEPS: vscode, fs, ./models/task

EXPORT [C:1, I:1, F:2]

C+ TaskManager implements ITaskService {
  // Main task management service
  [FLOW: error-handling→async-await]
  
  -V tasks:Map<string, Task> {
    // Property tasks
  }
  
  +F createTask(name:string, priority:TaskPriority):Promise<Task> {
    // Creates a new task
    [FLOW: conditional→try-catch]
  }
  
  +F deleteTask(id:string):Promise<boolean> {
    // Deletes a task by ID
    [FLOW: async-await→conditional]
  }
}

I+ ITaskService {
  // Task service interface
  F createTask(name:string, priority:TaskPriority):Promise<Task> {
    ...
  }
  F deleteTask(id:string):Promise<boolean> {
    ...
  }
}

PATTERNS:
- Async/Promise pattern
- Interface implementation pattern
```

### Usage

To use the improved Micro Export format, you can:

1. Right-click on a file/folder and select "Export Selected as Micro Codebase"
2. Use the command palette and select "Export Micro Codebase" for the entire workspace

This feature is particularly useful for:
- Project onboarding for new team members
- Documentation generation
- Understanding complex codebases
- Creating high-level architectural overviews
