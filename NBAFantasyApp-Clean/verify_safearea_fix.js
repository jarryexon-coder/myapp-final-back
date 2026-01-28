const fs = require('fs');
const path = require('path');

console.log('Verifying SafeAreaView imports...\n');

let totalFiles = 0;
let fixedFiles = 0;
let alreadyGood = 0;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('SafeAreaView')) {
    return; // Doesn't use SafeAreaView
  }
  
  totalFiles++;
  
  const lines = content.split('\n');
  let hasReactNativeImport = false;
  let hasCorrectImport = false;
  
  for (const line of lines) {
    if (line.includes('import') && line.includes('SafeAreaView')) {
      if (line.includes("from 'react-native-safe-area-context'")) {
        hasCorrectImport = true;
        alreadyGood++;
      } else if (line.includes("from 'react-native'")) {
        hasReactNativeImport = true;
      }
    }
  }
  
  if (hasReactNativeImport) {
    console.log(`❌ ${filePath} - Still importing from react-native`);
  } else if (!hasCorrectImport && content.includes('<SafeAreaView')) {
    console.log(`❌ ${filePath} - Uses SafeAreaView but no import`);
  } else if (hasCorrectImport) {
    // Good - already fixed
  }
}

// Walk through src
function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('backup')) {
      walkDir(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      checkFile(filePath);
    }
  });
}

walkDir('src');

console.log(`\n=== Summary ===`);
console.log(`Total files using SafeAreaView: ${totalFiles}`);
console.log(`Already correct: ${alreadyGood}`);
console.log(`Need attention: ${totalFiles - alreadyGood}`);
