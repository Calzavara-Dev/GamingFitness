const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') && !file.includes('SystemText.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.resolve(__dirname, '../src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('SystemText as Text')) return;
  if (!content.includes('<Text')) return;
  
  const importRegex = /import\s+\{([^}]*)\bText\b([^}]*)\}\s+from\s+['"]react-native['"]/g;
  
  let modified = false;
  content = content.replace(importRegex, (match, p1, p2) => {
    modified = true;
    let newImport = `import {${p1}${p2}} from 'react-native'`;
    newImport = newImport.replace(/,\s*,/g, ',').replace(/\{\s*,/g, '{').replace(/,\s*\}/g, '}');
    if (newImport.includes('{}')) return '';
    return newImport;
  });

  if (modified) {
    const relativePath = path.relative(path.dirname(file), path.resolve(__dirname, '../src/components/SystemText')).replace(/\\/g, '/');
    let importPath = relativePath.startsWith('.') ? relativePath : './' + relativePath;
    
    // Procura o último import para adicionar logo em seguida
    const finalContent = content.replace(/(import.*react-native['"];?)/, `$1\nimport { SystemText as Text } from '${importPath}';`);
    fs.writeFileSync(file, finalContent, 'utf8');
    console.log('Modified:', file);
  }
});
