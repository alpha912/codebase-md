# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.3] - 2025-05-22

### Changed
- Updated extension logo and banner images
- Improved visual branding across all documentation
- Enhanced README with more consistent visual elements

## [2.0.2] - 2025-05-10

### Added
- Comprehensive test suite with Mocha for ensuring code quality
- Enhanced Micro Export format with improved code structure analysis
- Automatic detection of code flow patterns (async/await, try/catch, conditionals)
- Better component representation with visibility indicators
- Detailed documentation for the Micro Export format

### Fixed
- Issues with file type detection and language mapping
- Various edge cases in folder structure generation
- Pattern detection for different programming paradigms
- Extraction of file metadata

### Changed
- Improved TypeScript configuration
- Enhanced code organization and documentation

## [2.0.1] - 2025-03-24

### Fixed
- Improved method detection in Micro Codebase Export to eliminate false positives
- Fixed class hierarchy detection to properly show inheritance relationships
- Enhanced property detection to avoid capturing method calls as properties
- Added better flow pattern detection for methods (error handling, async, conditionals)
- Improved type information display for method parameters and return types
- Added proper static member identification

## [2.0.0] - 2025-03-22

### Added
- Micro Codebase Export feature - Condenses code files into a highly informative minimal representation
- New commands: "Export Micro Codebase" and "Export Selected as Micro Codebase"
- Specialized notation system for representing code structures in condensed form
- Automatic detection of design patterns and critical code paths

## [1.0.2] - 2025-03-16

### Added
- `.codebaseignore` file support - Allows excluding file contents from export while keeping files in the directory structure

## [1.0.1] - 2024-09-26

### Added
- New logo: A clean and minimalist logo added to the extension
- Updated package.json to reference the logo in the marketplace

## [1.0.0] - 2024-09-26

### Added
- Initial release
- Export entire codebase as Markdown
- Export selected files or folders as Markdown
- Automatically exclude files based on .gitignore and default patterns
- File content syntax highlighting in exported Markdown
- Folder structure visualization in the generated Markdown
- Project statistics in the generated Markdown

### Changed
- N/A (Initial release)

### Deprecated
- N/A (Initial release)

### Removed
- N/A (Initial release)

### Fixed
- N/A (Initial release)

### Security
- N/A (Initial release)

## Planned Features
- User-configurable ignore patterns
- Option to include or exclude specific file types
- Customizable Markdown output format
- Integration with version control systems for diff exports
- Performance improvements for large codebases

---

Note: As this is the initial release, there are no previous versions to compare against. Future updates will include more detailed changelogs comparing to previous versions.