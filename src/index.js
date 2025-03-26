#!/usr/bin/env node

const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const glob = require('glob');

program
  .name('noconsole')
  .description('Remove console.log statements from your codebase')
  .version('1.0.0')
  .argument('<directory>', 'Directory to process')
  .option('-p, --pattern <pattern>', 'File pattern to match', '**/*.{js,jsx,ts,tsx}')
  .option('-d, --dry-run', 'Show what would be removed without making changes')
  .action(async (directory, options) => {
    try {
      const files = glob.sync(options.pattern, {
        cwd: directory,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
      });

      let totalRemoved = 0;
      let totalFiles = 0;

      for (const file of files) {
        const filePath = path.join(directory, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Match console.log statements with various formats
        const consoleLogRegex = /console\.(log|debug|info|warn|error)\s*\([^)]*\)\s*;?/g;
        const matches = content.match(consoleLogRegex);

        if (matches) {
          totalFiles++;
          if (options.dryRun) {
            console.log(`\nFile: ${file}`);
            matches.forEach(match => console.log(`  Would remove: ${match}`));
          } else {
            const newContent = content.replace(consoleLogRegex, '');
            fs.writeFileSync(filePath, newContent);
            console.log(`Removed ${matches.length} console statements from ${file}`);
          }
          totalRemoved += matches.length;
        }
      }

      console.log(`\nSummary:`);
      console.log(`Files processed: ${files.length}`);
      console.log(`Files containing console statements: ${totalFiles}`);
      console.log(`Total console statements ${options.dryRun ? 'that would be' : ''} removed: ${totalRemoved}`);
      
      if (options.dryRun) {
        console.log('\nThis was a dry run. No files were modified.');
      }

    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  });

program.parse(); 