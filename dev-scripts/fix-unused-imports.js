const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get a list of files with unused import warnings
const getFilesWithUnusedImports = () => {
  try {
    // Use grep to find files with unused import warnings from the build output
    const result = execSync('grep -r "@typescript-eslint/no-unused-vars" --include="*.ts" --include="*.tsx" ./src').toString();
    const fileLines = result.split('\n').filter(line => line.length > 0);
    
    // Extract filenames and unused variables
    const fileInfo = {};
    
    fileLines.forEach(line => {
      const match = line.match(/\.\/src\/(.+?):(\d+):(\d+)\s+Warning: '(.+?)' is defined but never used/);
      if (match) {
        const [_, filePath, lineNum, colNum, varName] = match;
        const fullPath = path.join('./src', filePath);
        
        if (!fileInfo[fullPath]) {
          fileInfo[fullPath] = [];
        }
        
        fileInfo[fullPath].push({
          variable: varName,
          line: parseInt(lineNum),
          column: parseInt(colNum)
        });
      }
    });
    
    return fileInfo;
  } catch (error) {
    console.error('Error finding files with unused imports:', error);
    return {};
  }
};

// Process a file to remove unused imports
const processFile = (filePath, unusedVars) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const unusedVarNames = unusedVars.map(v => v.variable);
    
    // Find import lines and modify them
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim().startsWith('import ')) {
        // Check if this is a named import with curly braces
        const namedImportMatch = line.match(/import\s+{([^}]+)}\s+from/);
        if (namedImportMatch) {
          const imports = namedImportMatch[1].split(',').map(i => i.trim());
          const keptImports = imports.filter(importName => !unusedVarNames.includes(importName));
          
          if (keptImports.length === 0) {
            // Remove the entire import line if all imports are unused
            lines[i] = ''; // Remove the line
          } else if (keptImports.length < imports.length) {
            // Reconstruct the import line with only the used imports
            const newImports = keptImports.join(', ');
            lines[i] = line.replace(/import\s+{[^}]+}\s+from/, `import { ${newImports} } from`);
          }
        } else {
          // Check if this is a direct import (e.g., import Auth from './auth')
          const directImportMatch = line.match(/import\s+(\w+)\s+from/);
          if (directImportMatch && unusedVarNames.includes(directImportMatch[1])) {
            lines[i] = ''; // Remove the line
          }
        }
      }
    }
    
    // Write the modified content back to the file
    fs.writeFileSync(filePath, lines.filter(line => line !== '').join('\n'));
    console.log(`Processed ${filePath}`);
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
};

// Main execution
const fileInfo = getFilesWithUnusedImports();
const fileCount = Object.keys(fileInfo).length;

console.log(`Found ${fileCount} files with unused imports`);

Object.entries(fileInfo).forEach(([filePath, unusedVars]) => {
  processFile(filePath, unusedVars);
});

console.log('Finished processing files');
