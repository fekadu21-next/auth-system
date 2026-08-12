const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules')) {
        results = results.concat(walk(file));
      }
    } else { 
      if (file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('.');
let allErrors = [];
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  // Match `import ... from "path"` or `import "path"`
  const importRegex = /import\s+(?:(?:.+?)\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const resolvedPath = path.resolve(path.dirname(file), importPath);
      try {
        const dir = path.dirname(resolvedPath);
        const basename = path.basename(resolvedPath);
        const actualFiles = fs.readdirSync(dir);
        if (!actualFiles.includes(basename)) {
          allErrors.push({ file, importPath, expected: basename, actualDir: dir });
        }
      } catch(e) {
         allErrors.push({ file, importPath, error: e.message });
      }
    }
  }
});
console.log(JSON.stringify(allErrors, null, 2));
