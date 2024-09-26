# Contributing to CodebaseMD

We welcome contributions to **CodebaseMD**! Whether you’re fixing bugs, adding new features, improving documentation, or suggesting ideas, we appreciate your involvement. Before getting started, please review the following guidelines.

## How to Contribute

### 1. Fork the Repository

- Go to the [CodebaseMD GitHub repository](https://github.com/alpha912/codebase-md).
- Click on the **Fork** button in the top-right corner to create a copy of the repository under your GitHub account.

### 2. Clone the Fork

Once you have forked the repository, clone it to your local machine:

```
git clone https://github.com/your-username/codebase-md.git
cd codebase-md
```

### 3. Create a Branch

Create a new branch for your work. This makes it easier to isolate your changes and submit them as a pull request.

```
git checkout -b feature/my-new-feature
```

### 4. Make Your Changes

- For new features, be sure to update/add relevant tests.
- For bug fixes, provide steps in your pull request for testing the fix.

### 5. Lint and Test Your Changes

Ensure that the code is clean and free of linting issues by running the following:

```
npm run lint
```

If you made significant changes, also run tests to ensure everything works correctly:

```
npm test
```

### 6. Commit Your Changes

Write meaningful commit messages, following these guidelines:
- Start with a lowercase verb, such as `fix:`, `feat:`, or `docs:`.
- Keep the commit message short but descriptive.

Example commit message:

```
git add .
git commit -m "fix: resolve export error for unsupported file types"
```

### 7. Push the Branch

Push your changes to your forked repository:

```
git push origin feature/my-new-feature
```

### 8. Submit a Pull Request

Go to your fork on GitHub, and you should see a prompt to submit a pull request. Provide a meaningful description of the changes in the pull request, referencing any issues that are related.

We will review your pull request as soon as possible and provide feedback if needed.

## Guidelines

- **Respect existing code standards**: Follow the coding style and conventions used in the project.
- **Test thoroughly**: Ensure your changes don’t break existing functionality.
- **Stay focused**: Stick to the purpose of your pull request, and try not to include unrelated changes.

## Reporting Bugs

If you encounter a bug, please submit an issue in the [issue tracker](https://github.com/alpha912/codebase-md/issues) and include:
- Steps to reproduce the bug.
- Expected and actual results.
- Any additional information, such as screenshots or error logs.

## Feature Requests

Feel free to open a new issue in the [issue tracker](https://github.com/alpha912/codebase-md/issues) for feature requests. Make sure to provide as much context as possible to help us understand the need for the new feature.

---

Thank you for your contributions! 🎉