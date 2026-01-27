#!/usr/bin/env node
// scripts/test-backend-connection.js

const axios = require('axios');
const chalk = require('chalk');
const { program } = require('commander');
const fs = require('fs');
const path = require('path');

// Configuration
const DEFAULT_BACKEND_URL = 'http://localhost:3002';
const TEST_TIMEOUT = 10000;

// Test suites
const TEST_SUITES = {
  basic: [
    { name: 'Root endpoint', path: '/', method: 'GET' },
    { name: 'Health check', path: '/health', method: 'GET' },
    { name: 'API health', path: '/api/health', method: 'GET' },
  ],
  core: [
    { name: 'NBA API', path: '/api/nba', method: 'GET' },
    { name: 'User API', path: '/api/user', method: 'GET' },
    { name: 'Auth API', path: '/api/auth/health', method: 'GET' },
    { name: 'Analytics API', path: '/api/analytics', method: 'GET' },
  ],
  data: [
    { name: 'NBA games today', path: '/api/nba/games/today', method: 'GET' },
    { name: 'Players data', path: '/api/players', method: 'GET' },
    { name: 'Teams data', path: '/api/teams', method: 'GET' },
    { name: 'News data', path: '/api/news', method: 'GET' },
  ],
  services: [
    { name: 'PrizePicks API', path: '/api/prizepicks', method: 'GET' },
    { name: 'Search API', path: '/api/search', method: 'GET' },
    { name: 'Sportsbooks API', path: '/api/sportsbooks', method: 'GET' },
    { name: 'Notifications API', path: '/api/notifications', method: 'GET' },
  ]
};

class BackendTester {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.results = [];
    this.stats = {
      total: 0,
      passed: 0,
      failed: 0,
      warnings: 0
    };
  }

  async runTests(suites = ['basic', 'core', 'data', 'services']) {
    console.log(chalk.blue.bold('\n🔗 Frontend-Backend Connection Tester\n'));
    console.log(chalk.gray(`Backend URL: ${this.baseURL}`));
    console.log(chalk.gray(`Test suites: ${suites.join(', ')}`));
    console.log(chalk.gray('='.repeat(60) + '\n'));

    const startTime = Date.now();

    for (const suite of suites) {
      if (TEST_SUITES[suite]) {
        console.log(chalk.cyan.bold(`\n📦 Testing ${suite.toUpperCase()} suite:`));
        await this.runTestSuite(TEST_SUITES[suite]);
      }
    }

    const endTime = Date.now();
    this.generateReport(startTime, endTime);
    
    return this.stats.failed === 0;
  }

  async runTestSuite(tests) {
    for (const test of tests) {
      await this.executeTest(test);
    }
  }

  async executeTest(test) {
    this.stats.total++;
    const url = `${this.baseURL}${test.path}`;
    const startTime = Date.now();

    try {
      const response = await axios({
        method: test.method,
        url,
        timeout: TEST_TIMEOUT,
        headers: {
          'User-Agent': 'Frontend-Backend-Tester'
        }
      });

      const duration = Date.now() - startTime;
      const isSuccess = response.status >= 200 && response.status < 300;

      if (isSuccess) {
        this.stats.passed++;
        console.log(chalk.green(`  ✅ ${test.name}`));
        console.log(chalk.gray(`     ${url} - ${response.status} (${duration}ms)`));
        
        if (response.data && response.data.message) {
          console.log(chalk.gray(`     Message: ${response.data.message}`));
        }
      } else {
        this.stats.warnings++;
        console.log(chalk.yellow(`  ⚠️  ${test.name}`));
        console.log(chalk.gray(`     ${url} - ${response.status} (${duration}ms)`));
      }

      this.results.push({
        name: test.name,
        status: isSuccess ? 'PASS' : 'WARNING',
        url,
        statusCode: response.status,
        duration,
        data: response.data ? { message: response.data.message } : null
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      this.stats.failed++;
      
      console.log(chalk.red(`  ❌ ${test.name}`));
      console.log(chalk.gray(`     ${url}`));
      console.log(chalk.red(`     Error: ${error.message}`));
      
      if (error.response) {
        console.log(chalk.gray(`     Status: ${error.response.status}`));
      }

      this.results.push({
        name: test.name,
        status: 'FAIL',
        url,
        error: error.message,
        statusCode: error.response?.status,
        duration
      });
    }
  }

  generateReport(startTime, endTime) {
    const totalTime = endTime - startTime;
    
    console.log(chalk.blue.bold('\n' + '='.repeat(60)));
    console.log(chalk.blue.bold('📊 TEST REPORT'));
    console.log(chalk.blue.bold('='.repeat(60) + '\n'));

    console.log(chalk.white.bold('Summary:'));
    console.log(`  Total tests: ${chalk.white.bold(this.stats.total)}`);
    console.log(`  Passed: ${chalk.green.bold(this.stats.passed)}`);
    console.log(`  Failed: ${chalk.red.bold(this.stats.failed)}`);
    console.log(`  Warnings: ${chalk.yellow.bold(this.stats.warnings)}`);
    console.log(`  Duration: ${chalk.white.bold(totalTime + 'ms')}\n`);

    const successRate = this.stats.total > 0 
      ? Math.round((this.stats.passed / this.stats.total) * 100) 
      : 0;

    console.log(chalk.white.bold('Success Rate:'));
    if (successRate === 100) {
      console.log(chalk.green.bold(`  ${successRate}% - Excellent! All tests passed 🎉\n`));
    } else if (successRate >= 80) {
      console.log(chalk.yellow.bold(`  ${successRate}% - Good, but needs attention\n`));
    } else {
      console.log(chalk.red.bold(`  ${successRate}% - Needs immediate attention\n`));
    }

    if (this.stats.failed > 0) {
      console.log(chalk.red.bold('Failed Tests:'));
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach((result, index) => {
          console.log(chalk.red(`  ${index + 1}. ${result.name}`));
          console.log(chalk.gray(`     ${result.url}`));
          console.log(chalk.gray(`     Error: ${result.error}`));
        });
      console.log('');
    }

    // Save detailed report
    this.saveReport(totalTime);
  }

  saveReport(totalTime) {
    const report = {
      timestamp: new Date().toISOString(),
      backendUrl: this.baseURL,
      summary: {
        ...this.stats,
        successRate: this.stats.total > 0 
          ? Math.round((this.stats.passed / this.stats.total) * 100) 
          : 0,
        duration: totalTime
      },
      results: this.results
    };

    const reportDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `backend-test-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(chalk.gray(`Detailed report saved to: ${reportPath}`));
  }
}

// CLI setup
program
  .name('test-backend')
  .description('Test frontend-backend connection')
  .version('1.0.0')
  .option('-u, --url <url>', 'Backend URL', DEFAULT_BACKEND_URL)
  .option('-s, --suites <suites>', 'Test suites to run (comma-separated)', 'basic,core,data,services')
  .option('-o, --output <path>', 'Output directory for reports', './reports')
  .action(async (options) => {
    const suites = options.suites.split(',').map(s => s.trim());
    
    const tester = new BackendTester(options.url);
    const success = await tester.runTests(suites);
    
    process.exit(success ? 0 : 1);
  });

program.parse(process.argv);
