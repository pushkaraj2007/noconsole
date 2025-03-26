# noconsole

A CLI tool to remove console.log statements from your codebase.

## Installation

```bash
npm install -g noconsole
```

## Usage

```bash
noconsole <directory> [options]
```

### Options

- `-p, --pattern <pattern>` - File pattern to match (default: "**/*.{js,jsx,ts,tsx}")
- `-d, --dry-run` - Show what would be removed without making changes

### Examples

Remove console.log statements from all JavaScript files in the current directory:
```bash
noconsole .
```

Remove console.log statements from all TypeScript files in a specific directory:
```bash
noconsole ./src --pattern "**/*.ts"
```

Show what would be removed without making changes:
```bash
noconsole . --dry-run
```

## Features

- Removes all types of console statements (log, debug, info, warn, error)
- Supports JavaScript and TypeScript files
- Ignores node_modules, dist, and build directories by default
- Provides a dry-run option to preview changes
- Shows a summary of removed statements

## License

MIT 