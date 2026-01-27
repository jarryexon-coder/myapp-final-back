// frontend-module-checker.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FrontendModuleChecker {
  constructor(projectRoot) {
    this.root = projectRoot || process.cwd();
    this.results = {
      esmFiles: 0,
      commonjsFiles: 0,
      mixedFiles: 0,
      potentialIssues: []
    };
  }

  async scan() {
    console.log(`🔍 Scanning frontend at: ${this.root}\n`);
    
    // First check package.json
    await this.checkPackageJson();
    
    // Scan source files
    await this.scanDirectory(this.root, 0);
    
    // Analyze results
    this.printResults();
    
    // Generate report
    this.generateReport();
  }

  async checkPackageJson() {
    const packagePath = path.join(this.root, 'package.json');
    
    if (!fs.existsSync(packagePath)) {
      console.log('⚠️  No package.json found');
      return;
    }

    try {
      const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      console.log('📦 Package.json Analysis:');
      console.log(`   Name: ${pkg.name || 'N/A'}`);
      console.log(`   Type: ${pkg.type || 'Not specified (defaults to CommonJS)'}`);
      console.log(`   Main: ${pkg.main || 'index.js'}`);
      
      if (pkg.type === 'module') {
        console.log('   ✅ Project is explicitly ES modules');
      } else if (!pkg.type) {
        console.log('   ℹ️  No "type" field - defaults to CommonJS');
      }
      
      // Check for module bundlers/frameworks
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      const frameworks = ['react-scripts', 'vite', 'next', 'webpack', 'parcel', 'snowpack'];
      
      const detected = frameworks.filter(f => deps[f]);
      if (detected.length > 0) {
        console.log(`   🛠️  Detected: ${detected.join(', ')}`);
      }
      
      console.log('');
    } catch (error) {
      console.error(`❌ Error reading package.json: ${error.message}`);
    }
  }

  async scanDirectory(dir, depth) {
    if (depth > 5) return; // Limit recursion depth
    
    const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next', '.nuxt'];
    const ignoreFiles = ['.DS_Store', 'Thumbs.db'];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        
        // Skip ignored items
        if (ignoreDirs.includes(item) || ignoreFiles.includes(item)) {
          continue;
        }

        try {
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            await this.scanDirectory(fullPath, depth + 1);
          } else if (this.isSourceFile(item)) {
            await this.analyzeFile(fullPath);
          }
        } catch (error) {
          // Skip inaccessible files
        }
      }
    } catch (error) {
      // Skip inaccessible directories
    }
  }

  isSourceFile(filename) {
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.svelte', '.mjs', '.cjs'];
    return extensions.some(ext => filename.endsWith(ext));
  }

  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(this.root, filePath);
      
      // Check for module patterns
      const hasESM = /import\s+.*from|export\s+/.test(content);
      const hasCommonJS = /require\(|module\.exports|exports\./.test(content);
      
      if (hasESM && hasCommonJS) {
        this.results.mixedFiles++;
        this.results.potentialIssues.push({
          file: relativePath,
          issue: 'Mixed ES modules and CommonJS',
          severity: 'warning'
        });
      } else if (hasESM) {
        this.results.esmFiles++;
      } else if (hasCommonJS) {
        this.results.commonjsFiles++;
        
        this.results.potentialIssues.push({
          file: relativePath,
          issue: 'Contains CommonJS syntax',
          severity: filePath.endsWith('.jsx') || filePath.endsWith('.tsx') ? 'high' : 'medium'
        });
      }
      
      // Check for specific issues
      if (hasESM) {
        // Check for missing file extensions
        const missingExt = content.match(/from\s+['"](\.\.?\/[^.'"]+?)['"]/g);
        if (missingExt) {
          this.results.potentialIssues.push({
            file: relativePath,
            issue: `Missing file extension in imports: ${missingExt.join(', ')}`,
            severity: 'medium'
          });
        }
        
        // Check for dynamic imports that might be problematic
        const dynamicImports = content.match(/import\([^)]+\)/g);
        if (dynamicImports && dynamicImports.length > 3) {
          this.results.potentialIssues.push({
            file: relativePath,
            issue: `Many dynamic imports (${dynamicImports.length}) which may affect tree shaking`,
            severity: 'low'
          });
        }
      }
      
    } catch (error) {
      console.error(`Error analyzing ${filePath}: ${error.message}`);
    }
  }

  printResults() {
    const total = this.results.esmFiles + this.results.commonjsFiles + this.results.mixedFiles;
    
    console.log('📊 FRONTEND MODULE ANALYSIS:');
    console.log('='.repeat(50));
    console.log(`   Total source files analyzed: ${total}`);
    console.log(`   ✅ ES Module files: ${this.results.esmFiles} (${Math.round(this.results.esmFiles/total*100)}%)`);
    console.log(`   ❌ CommonJS files: ${this.results.commonjsFiles} (${Math.round(this.results.commonjsFiles/total*100)}%)`);
    console.log(`   ⚠️  Mixed syntax files: ${this.results.mixedFiles} (${Math.round(this.results.mixedFiles/total*100)}%)`);
    console.log('');
    
    if (this.results.potentialIssues.length > 0) {
      console.log('🔍 POTENTIAL ISSUES FOUND:');
      
      // Group by severity
      const high = this.results.potentialIssues.filter(i => i.severity === 'high');
      const medium = this.results.potentialIssues.filter(i => i.severity === 'medium');
      const low = this.results.potentialIssues.filter(i => i.severity === 'low');
      const warning = this.results.potentialIssues.filter(i => i.severity === 'warning');
      
      if (high.length > 0) {
        console.log('\n   🔴 HIGH PRIORITY:');
        high.slice(0, 5).forEach(issue => {
          console.log(`      • ${issue.file}: ${issue.issue}`);
        });
        if (high.length > 5) console.log(`      ... and ${high.length - 5} more`);
      }
      
      if (medium.length > 0) {
        console.log('\n   🟡 MEDIUM PRIORITY:');
        medium.slice(0, 5).forEach(issue => {
          console.log(`      • ${issue.file}: ${issue.issue}`);
        });
        if (medium.length > 5) console.log(`      ... and ${medium.length - 5} more`);
      }
      
      if (warning.length > 0) {
        console.log('\n   ⚪ WARNINGS:');
        warning.slice(0, 3).forEach(issue => {
          console.log(`      • ${issue.file}: ${issue.issue}`);
        });
      }
    } else {
      console.log('🎉 No issues found! Your frontend appears to be properly configured.');
    }
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      projectRoot: this.root,
      summary: {
        totalFiles: this.results.esmFiles + this.results.commonjsFiles + this.results.mixedFiles,
        esmFiles: this.results.esmFiles,
        commonjsFiles: this.results.commonjsFiles,
        mixedFiles: this.results.mixedFiles
      },
      issues: this.results.potentialIssues,
      recommendations: this.generateRecommendations()
    };
    
    const reportPath = path.join(this.root, 'module-analysis-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Full report saved to: ${reportPath}`);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.commonjsFiles > 0) {
      recommendations.push({
        priority: 'high',
        title: 'Convert CommonJS files to ES modules',
        description: `${this.results.commonjsFiles} files still use CommonJS syntax. Modern frontend bundlers work best with ES modules.`,
        action: 'Use tools like Babel or manual conversion to update require() to import and module.exports to export.'
      });
    }
    
    if (this.results.mixedFiles > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Fix mixed module syntax',
        description: `${this.results.mixedFiles} files use both ES modules and CommonJS. This can cause confusion and bundling issues.`,
        action: 'Choose one module system per file and convert all syntax consistently.'
      });
    }
    
    // Check for package.json type
    const packagePath = path.join(this.root, 'package.json');
    if (fs.existsSync(packagePath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        if (!pkg.type && this.results.esmFiles > this.results.commonjsFiles) {
          recommendations.push({
            priority: 'low',
            title: 'Add "type": "module" to package.json',
            description: 'Most files use ES modules, but package.json doesn\'t explicitly declare it.',
            action: 'Add "type": "module" to your package.json to be explicit.'
          });
        }
      } catch (error) {
        // Skip if can't read package.json
      }
    }
    
    return recommendations;
  }
}

// Usage instructions
function printUsage() {
  console.log(`
🏗️  FRONTEND MODULE CHECKER
===========================

Usage:
  node frontend-module-checker.js [path]

Examples:
  node frontend-module-checker.js                  # Scan current directory
  node frontend-module-checker.js ./src            # Scan specific directory
  node frontend-module-checker.js /path/to/project # Scan another project

What it checks:
  • Package.json configuration
  • ES module vs CommonJS usage
  • Mixed module syntax
  • Missing file extensions in imports
  • Dynamic import usage

Outputs:
  • Console summary
  • module-analysis-report.json (detailed report)
  `);
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }
  
  const targetPath = args[0] || process.cwd();
  
  try {
    const checker = new FrontendModuleChecker(targetPath);
    await checker.scan();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    printUsage();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default FrontendModuleChecker;
