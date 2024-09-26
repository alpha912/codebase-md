# Contributing to CodebaseMD

We welcome contributions to CodebaseMD! Whether you're fixing bugs, adding new features, improving documentation, or suggesting ideas, we appreciate your involvement. This guide will help you get started with contributing to the project.

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```
   git clone https://github.com/your-username/codebase-md.git
   ```
3. Create a new branch for your changes:
   ```
   git checkout -b feature/your-feature-name
   ```

## Setting Up the Development Environment

1. Ensure you have [Node.js](https://nodejs.org/) installed (version 12.x or later)
2. Install the project dependencies:
   ```
   npm install
   ```
3. Open the project in Visual Studio Code

## Making Changes

1. Make your changes in the `src` directory
2. If you're adding a new feature, consider adding tests in the `src/test` directory
3. Run the linter to ensure your code follows the project's style guidelines:
   ```
   npm run lint
   ```
4. Compile the TypeScript code:
   ```
   npm run compile
   ```
5. Test your changes by running the extension in a new VS Code window:
   - Press `F5` in VS Code to launch the extension in debug mode

## Submitting a Pull Request

1. Commit your changes:
   ```
   git add .
   git commit -m "Your descriptive commit message"
   ```
2. Push to your fork:
   ```
   git push origin feature/your-feature-name
   ```
3. Go to the [CodebaseMD repository](https://github.com/alpha912/codebase-md) and create a new pull request
4. Describe your changes in the pull request description
5. Wait for a maintainer to review your pull request

## Coding Guidelines

- Follow the existing code style and conventions used in the project
- Write clear, concise commit messages
- Keep pull requests focused on a single feature or bug fix
- Add comments to your code where necessary to explain complex logic

## Reporting Issues

If you find a bug or have a suggestion for improvement:

1. Check if the issue already exists in the [GitHub issue tracker](https://github.com/alpha912/codebase-md/issues)
2. If not, create a new issue, providing as much detail as possible:
   - Steps to reproduce (for bugs)
   - Expected behavior
   - Actual behavior
   - VS Code version
   - CodebaseMD version
   - Operating system

## Community Guidelines

- Be respectful and considerate in all interactions
- Provide constructive feedback
- Focus on the issue or idea being discussed, not the individuals involved
- Follow the [Code of Conduct](../CODE_OF_CONDUCT.md)

Thank you for contributing to CodebaseMD!