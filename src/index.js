#!/usr/bin/env node

import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

program
  .name('noconsole')
  .description('Remove console.log statements from your codebase')
  .version('1.0.2')
  .argument('<directory>', 'Directory to process')
  .option('-p, --pattern <pattern>', 'File pattern to match', '**/*.{js,jsx,ts,tsx}')
  .option('-d, --dry-run', 'Show what would be removed without making changes')
  .option('-e, --exclude <patterns...>', 'Patterns to exclude (comma-separated)')
  .action(async (directory, options) => {
    try {
      // Default ignore patterns
      const defaultIgnores = ['**/node_modules/**', '**/dist/**', '**/build/**'];
      
      // Add user-specified exclude patterns
      const ignorePatterns = options.exclude 
        ? [...defaultIgnores, ...options.exclude.map(p => `**/${p}/**`)]
        : defaultIgnores;

      console.log(chalk.cyan('\n🔍 Scanning for console.log statements...\n'));

      const files = glob.sync(options.pattern, {
        cwd: directory,
        ignore: ignorePatterns
      });

      let totalRemoved = 0;
      let totalFiles = 0;
      let filesWithConsole = [];

      // First pass: identify files with console statements
      for (const file of files) {
        const filePath = path.join(directory, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const consoleLogRegex = /console\.(log|debug|info|warn|error)\s*\([^)]*\)\s*;?/g;
        const matches = content.match(consoleLogRegex);

        if (matches) {
          filesWithConsole.push({
            file,
            matches,
            count: matches.length
          });
          totalFiles++;
          totalRemoved += matches.length;
        }
      }

      if (filesWithConsole.length === 0) {
        console.log(chalk.green('✨ No console.log statements found in the specified directory!'));
        return;
      }

      // Show summary and ask for confirmation
      console.log(chalk.yellow('\n📊 Summary of console.log statements found:'));
      console.log(chalk.yellow(`Total files with console statements: ${totalFiles}`));
      console.log(chalk.yellow(`Total console statements: ${totalRemoved}\n`));

      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: chalk.cyan('Would you like to proceed with removing these console statements?'),
          default: true
        }
      ]);

      if (!proceed) {
        console.log(chalk.yellow('\n❌ Operation cancelled by user.'));
        return;
      }

      // Process files
      for (const { file, matches, count } of filesWithConsole) {
        const filePath = path.join(directory, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const consoleLogRegex = /console\.(log|debug|info|warn|error)\s*\([^)]*\)\s*;?/g;
        
        if (options.dryRun) {
          console.log(chalk.blue(`\n📄 File: ${file}`));
          matches.forEach(match => console.log(chalk.gray(`  Would remove: ${match}`)));
        } else {
          const newContent = content.replace(consoleLogRegex, '');
          fs.writeFileSync(filePath, newContent);
          console.log(chalk.green(`✓ Removed ${count} console statements from ${file}`));
        }
      }

      console.log(chalk.green('\n✨ Operation completed successfully!'));
      console.log(chalk.blue(`\n📊 Final Summary:`));
      console.log(chalk.blue(`Files processed: ${files.length}`));
      console.log(chalk.blue(`Files containing console statements: ${totalFiles}`));
      console.log(chalk.blue(`Total console statements ${options.dryRun ? 'that would be' : ''} removed: ${totalRemoved}`));
      
      if (options.dryRun) {
        console.log(chalk.yellow('\n⚠️ This was a dry run. No files were modified.'));
      }

    } catch (error) {
      console.error(chalk.red('\n❌ Error:'), error.message);
      process.exit(1);
    }
  });

program.parse();