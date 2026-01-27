import fs from 'fs';
import path from 'path';

const root = process.cwd();
console.log('🔍 Quick React Module Check\n');

// Check for React project structure
const hasReact = fs.existsSync(path.join(root, 'node_modules/react'));
const hasVite = fs.existsSync(path.join(root, 'vite.config.js')) || 
                fs.existsSync(path.join(root, 'vite.config.ts'));
const hasNext = fs.existsSync(path.join(root, 'next.config.js')) ||
                fs.existsSync(path.join(root, 'next.config.mjs'));

console.log('📦 Project type:');
if (hasNext) console.log('   • Next.js project');
else if (hasVite) console.log('   • Vite project');
else if (hasReact) console.log('   • React project (likely CRA)');
else console.log('   • Unknown frontend project');

// Quick check of JS/JSX files
function checkFiles(dir) {
  const files = fs.readdirSync(dir).filter(f => 
    f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.tsx')
  );
  
  let esm = 0, cjs = 0;
  
  files.slice(0, 10).forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    if (/import\s+.*from/.test(content)) esm++;
    if (/require\(/.test(content)) cjs++;
  });
  
  console.log(`\n📊 Sample of ${dir}: ${esm} ES modules, ${cjs} CommonJS`);
}

if (fs.existsSync(path.join(root, 'src'))) {
  checkFiles(path.join(root, 'src'));
} else {
  checkFiles(root);
}
