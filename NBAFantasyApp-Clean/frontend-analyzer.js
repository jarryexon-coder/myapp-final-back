// frontend-analyzer.js
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

// Check and fix package.json
function checkPackageJson() {
  const packagePath = path.join(projectRoot, 'package.json');
  
  if (!fs.existsSync(packagePath)) {
    console.log('❌ No package.json found');
    return false;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    console.log('📦 Current package.json:');
    console.log(`   Name: ${pkg.name}`);
    console.log(`   Type: ${pkg.type || 'Not specified (defaults to CommonJS)'}`);
    
    // Add type: module if not present
    if (!pkg.type && pkg.dependencies && pkg.dependencies.react) {
      console.log('\n⚠️  Adding "type": "module" to package.json...');
      pkg.type = 'module';
      
      // Create backup
      fs.writeFileSync(`${packagePath}.backup`, JSON.stringify(pkg, null, 2));
      
      // Update package.json
      fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2));
      console.log('✅ Added "type": "module" to package.json');
      
      return true;
    } else if (pkg.type === 'module') {
      console.log('✅ Already has "type": "module"');
      return true;
    }
    
  } catch (error) {
    console.error(`❌ Error reading package.json: ${error.message}`);
    return false;
  }
}

// Check source files
function checkSourceFiles() {
  const srcDir = path.join(projectRoot, 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.log('❌ No src directory found');
    return;
  }

  console.log('\n🔍 Scanning src directory...');
  
  const jsFiles = [];
  const jsxFiles = [];
  const tsFiles = [];
  const tsxFiles = [];
  
  function scanDir(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        scanDir(fullPath);
      } else if (stat.isFile()) {
        if (item.endsWith('.js')) jsFiles.push(fullPath);
        else if (item.endsWith('.jsx')) jsxFiles.push(fullPath);
        else if (item.endsWith('.ts')) tsFiles.push(fullPath);
        else if (item.endsWith('.tsx')) tsxFiles.push(fullPath);
      }
    }
  }
  
  scanDir(srcDir);
  
  console.log(`   📁 Found: ${jsFiles.length} .js, ${jsxFiles.length} .jsx, ${tsFiles.length} .ts, ${tsxFiles.length} .tsx`);
  
  // Check a sample of files
  const sampleFiles = [...jsFiles.slice(0, 3), ...jsxFiles.slice(0, 3)];
  
  console.log('\n📄 Sample file analysis:');
  let esmCount = 0;
  let cjsCount = 0;
  
  sampleFiles.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const relative = path.relative(projectRoot, file);
      
      if (content.includes('import ') && content.includes('from ')) {
        esmCount++;
        console.log(`   ✅ ${relative} - ES Module`);
      } else if (content.includes('require(')) {
        cjsCount++;
        console.log(`   ❌ ${relative} - CommonJS`);
      } else {
        console.log(`   ⚠️  ${relative} - Unknown module format`);
      }
    } catch (error) {
      console.log(`   ❌ Error reading ${file}`);
    }
  });
  
  console.log(`\n📊 Sample: ${esmCount} ES modules, ${cjsCount} CommonJS`);
  
  if (cjsCount > 0) {
    console.log('\n⚠️  Some files use CommonJS. Recommendations:');
    console.log('   1. Convert require() to import statements');
    console.log('   2. Ensure all React components use ES modules');
    console.log('   3. Update webpack/babel config if needed');
  }
}

// Check build configuration
function checkBuildConfig() {
  console.log('\n🔧 Checking build configuration...');
  
  const configs = [
    'vite.config.js',
    'vite.config.ts',
    'next.config.js',
    'next.config.mjs',
    'webpack.config.js',
    'craco.config.js',
    'babel.config.js',
    '.babelrc'
  ];
  
  const found = configs.filter(config => fs.existsSync(path.join(projectRoot, config)));
  
  if (found.length > 0) {
    console.log(`   Found: ${found.join(', ')}`);
    
    // Check if any config needs updating
    found.forEach(config => {
      const content = fs.readFileSync(path.join(projectRoot, config), 'utf8');
      if (content.includes('require(') && !content.includes('import ')) {
        console.log(`   ⚠️  ${config} uses CommonJS - consider converting to ES modules`);
      }
    });
  } else {
    console.log('   No build config found (likely Create React App)');
  }
}

// Main function
async function main() {
  console.log('🏗️  FRONTEND MODULE ANALYSIS');
  console.log('='.repeat(50));
  console.log(`Project: ${projectRoot}\n`);
  
  // Check package.json
  const packageUpdated = checkPackageJson();
  
  if (packageUpdated) {
    console.log('\n⚠️  Restart your dev server to apply changes');
  }
  
  // Check source files
  checkSourceFiles();
  
  // Check build config
  checkBuildConfig();
  
  // Create .env.local suggestion
  console.log('\n💡 If you see "Cannot use import statement outside a module":');
  console.log('   1. Delete node_modules and package-lock.json');
  console.log('   2. Run: npm install');
  console.log('   3. Restart dev server');
}

main().catch(console.error);
