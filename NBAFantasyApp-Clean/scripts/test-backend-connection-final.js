#!/usr/bin/env node
// scripts/test-backend-connection-final.js

const axios = require('axios');
const chalk = require('chalk');
const { program } = require('commander');
const fs = require('fs');
const path = require('path');

const DEFAULT_BACKEND_URL = 'http://localhost:3002';
const TEST_TIMEOUT = 5000;

const TEST_SUITES = {
  public: [
    { name: 'Root endpoint', path: '/', method: 'GET', expectedStatus: 200 },
    { name: 'Health check', path: '/health', method: 'GET', expectedStatus: 200 },
    { name: 'Auth health', path: '/api/auth/health', method: 'GET', expectedStatus: 200 },
  ],
  
  data_apis: [
    { name: 'NBA API', path: '/api/nba', method: 'GET', expectedStatus: 200 },
    { name: 'NBA Games', path: '/api/nba/games', method: 'GET', expectedStatus: 200 },
    { name: 'User API', path: '/api/user', method: 'GET', expectedStatus: 200 },
    { name: 'User Notifications', path: '/api/user/notifications', method: 'GET', expectedStatus: 200 },
    { name: 'Analytics API', path: '/api/analytics', method: 'GET', expectedStatus: 200 },
    { name: 'News API', path: '/api/news', method: 'GET', expectedStatus: 200 },
    { name: 'Predictions API', path: '/api/predictions', method: 'GET', expectedStatus: 200 },
    { name: 'Live Games API', path: '/api/games', method: 'GET', expectedStatus: 200 },
    { name: 'NHL API', path: '/api/nhl', method: 'GET', expectedStatus: 200 },
    { name: 'NFL API', path: '/api/nfl', method: 'GET', expectedStatus: 200 },
    { name: 'Fantasy API', path: '/api/fantasy', method: 'GET', expectedStatus: 200 },
    { name: 'Picks API', path: '/api/picks', method: 'GET', expectedStatus: 200 },
    { name: 'Kalshi API', path: '/api/kalshi', method: 'GET', expectedStatus: 200 },
    { name: 'Sports Analytics', path: '/api/sports-analytics', method: 'GET', expectedStatus: 200 },
    { name: 'PrizePicks Analytics', path: '/api/prizepicks/analytics', method: 'GET', expectedStatus: 200 },
    { name: 'Sportsbooks API', path: '/api/sportsbooks', method: 'GET', expectedStatus: 200 },
  ],
  
  // Admin endpoints that may require auth
  admin: [
    { name: 'Admin Public Health', path: '/api/admin/health', method: 'GET', expectedStatus: 200 },
    { name: 'Admin Protected (401 expected)', path: '/api/admin', method: 'GET', expectedStatus: 401 },
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

  async runTests(suites = ['public', 'data_apis', 'admin']) {
    console.log(chalk.blue.bold('\n🚀 FINAL Backend Connection Test\n'));
    console.log(chalk.gray(`Backend URL: ${this.baseURL}`));
    console.log(chalk.gray('='.repeat(60) + '\n'));

    const startTime = Date.now();

    for (const suite of suites) {
      if (TEST_SUITES[suite]) {
        console.log(chalk.cyan.bold(`\n📦 Testing ${suite.toUpperCase().replace('_', ' ')}:`));
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
          'User-Agent': 'Backend-Connectivity-Tester',
          'Accept': 'application/json'
        }
      });

      const duration = Date.now() - startTime;
      const isSuccess = response.status === test.expectedStatus;

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
        console.log(chalk.gray(`     Expected ${test.expectedStatus}, got ${response.status} (${duration}ms)`));
      }

      this.results.push({
        name: test.name,
        status: isSuccess ? 'PASS' : 'WARNING',
        url,
        expectedStatus: test.expectedStatus,
        actualStatus: response.status,
        duration,
        data: response.data ? { 
          message: response.data.message,
          success: response.data.success 
        } : null
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      const statusCode = error.response?.status;
      
      // Check if the error status matches expected status
      if (statusCode === test.expectedStatus) {
        this.stats.passed++;
        console.log(chalk.green(`  ✅ ${test.name}`));
        console.log(chalk.gray(`     ${url} - ${statusCode} (${duration}ms)`));
        console.log(chalk.gray(`     Expected ${test.expectedStatus}, got ${statusCode} - Correct!`));
        
        this.results.push({
          name: test.name,
          status: 'PASS',
          url,
          expectedStatus: test.expectedStatus,
          actualStatus: statusCode,
          duration,
          note: 'Expected authentication error'
        });
      } else {
        this.stats.failed++;
        
        console.log(chalk.red(`  ❌ ${test.name}`));
        console.log(chalk.gray(`     ${url}`));
        
        if (error.response) {
          console.log(chalk.red(`     Expected ${test.expectedStatus}, got ${statusCode}`));
        } else {
          console.log(chalk.red(`     Error: ${error.message}`));
        }

        this.results.push({
          name: test.name,
          status: 'FAIL',
          url,
          expectedStatus: test.expectedStatus,
          actualStatus: statusCode,
          error: error.message,
          duration
        });
      }
    }
  }

  generateReport(startTime, endTime) {
    const totalTime = endTime - startTime;
    
    console.log(chalk.blue.bold('\n' + '='.repeat(60)));
    console.log(chalk.blue.bold('📊 FINAL TEST REPORT'));
    console.log(chalk.blue.bold('='.repeat(60) + '\n'));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARNING').length;

    const successRate = Math.round((passed / this.stats.total) * 100);

    console.log(chalk.white.bold('Summary:'));
    console.log(`  Total tests: ${chalk.white.bold(this.stats.total)}`);
    console.log(`  ✅ Passed: ${chalk.green.bold(passed)}`);
    console.log(`  ❌ Failed: ${chalk.red.bold(failed)}`);
    console.log(`  ⚠️  Warnings: ${chalk.yellow.bold(warnings)}`);
    console.log(`  ⏱️  Duration: ${chalk.white.bold(totalTime + 'ms')}`);
    console.log(`  📈 Success Rate: ${chalk.blue.bold(successRate + '%')}\n`);

    // Performance insights
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length;
    console.log(chalk.white.bold('Performance Insights:'));
    console.log(`  Average response time: ${chalk.white.bold(avgResponseTime.toFixed(0) + 'ms')}`);
    
    if (avgResponseTime > 1000) {
      console.log(chalk.yellow('  ⚠️  Some endpoints are slow (>1s)'));
    } else if (avgResponseTime > 500) {
      console.log(chalk.yellow('  ⚠️  Moderate response times (500ms-1s)'));
    } else {
      console.log(chalk.green('  ✅ Excellent response times (<500ms)'));
    }
    console.log('');

    // List failed tests
    if (failed > 0) {
      console.log(chalk.red.bold('Failed Tests:'));
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach((result, index) => {
          console.log(chalk.red(`  ${index + 1}. ${result.name}`));
          console.log(chalk.gray(`     ${result.url}`));
          console.log(chalk.gray(`     Expected: ${result.expectedStatus}, Got: ${result.actualStatus || 'Error'}`));
          if (result.error) {
            console.log(chalk.gray(`     Error: ${result.error}`));
          }
        });
      console.log('');
    }

    // List warnings
    if (warnings > 0) {
      console.log(chalk.yellow.bold('Warnings:'));
      this.results
        .filter(r => r.status === 'WARNING')
        .forEach((result, index) => {
          console.log(chalk.yellow(`  ${index + 1}. ${result.name}`));
          console.log(chalk.gray(`     ${result.url}`));
          console.log(chalk.gray(`     Expected: ${result.expectedStatus}, Got: ${result.actualStatus}`));
        });
      console.log('');
    }

    // Recommendations
    console.log(chalk.blue.bold('🎯 RECOMMENDATIONS:'));
    console.log(chalk.blue('='.repeat(40)));
    
    if (successRate === 100) {
      console.log(chalk.green('✅ Perfect! All endpoints are working correctly.'));
      console.log(chalk.green('✅ Your backend is production-ready!'));
    } else if (successRate >= 90) {
      console.log(chalk.green('✅ Excellent! Minor improvements needed.'));
      console.log('   Focus on fixing the few remaining issues.');
    } else if (successRate >= 80) {
      console.log(chalk.yellow('⚠️  Good foundation, needs attention.'));
      console.log('   Address the failed endpoints before production.');
    } else {
      console.log(chalk.red('❌ Needs significant work.'));
      console.log('   Focus on core endpoints first.');
    }

    // Next steps
    console.log('\n' + chalk.white.bold('📋 NEXT STEPS:'));
    console.log('   1. Test with actual frontend components');
    console.log('   2. Add authentication to protected endpoints');
    console.log('   3. Implement real data for mock endpoints');
    console.log('   4. Set up monitoring and logging');
    console.log('   5. Deploy to production environment\n');

    // Save detailed report
    this.saveReport(totalTime, { passed, failed, warnings, successRate });
  }

  saveReport(totalTime, stats) {
    const report = {
      timestamp: new Date().toISOString(),
      backendUrl: this.baseURL,
      testSummary: {
        totalTests: this.stats.total,
        ...stats,
        duration: totalTime,
        performance: this.calculatePerformance()
      },
      results: this.results,
      recommendations: this.generateRecommendations(stats)
    };

    const reportDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `backend-test-final-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(chalk.gray(`📄 Detailed report saved to: ${reportPath}`));
  }

  calculatePerformance() {
    const fast = this.results.filter(r => r.duration < 100).length;
    const moderate = this.results.filter(r => r.duration >= 100 && r.duration < 500).length;
    const slow = this.results.filter(r => r.duration >= 500).length;
    
    return {
      fastEndpoints: fast,
      moderateEndpoints: moderate,
      slowEndpoints: slow,
      averageResponseTime: Math.round(this.results.reduce((sum, r) => sum + r.duration, 0) / this.results.length)
    };
  }

  generateRecommendations(stats) {
    const recommendations = [];
    
    if (stats.successRate === 100) {
      recommendations.push('All endpoints working perfectly');
      recommendations.push('Ready for production deployment');
    } else if (stats.successRate >= 90) {
      recommendations.push(`Fix ${stats.failed} remaining endpoint(s)`);
      recommendations.push('Consider adding rate limiting');
    } else {
      recommendations.push(`Address ${stats.failed} failed endpoints`);
      recommendations.push('Check server logs for errors');
      recommendations.push('Verify route configurations');
    }
    
    if (this.calculatePerformance().slowEndpoints > 0) {
      recommendations.push('Optimize slow endpoints (>500ms)');
    }
    
    return recommendations;
  }
}

// CLI setup
program
  .name('test-backend-final')
  .description('Final backend connectivity test')
  .version('1.0.0')
  .option('-u, --url <url>', 'Backend URL', DEFAULT_BACKEND_URL)
  .option('-s, --suites <suites>', 'Test suites to run (comma-separated)', 'public,data_apis,admin')
  .action(async (options) => {
    const suites = options.suites.split(',').map(s => s.trim());
    
    const tester = new BackendTester(options.url);
    const success = await tester.runTests(suites);
    
    process.exit(success ? 0 : 1);
  });

program.parse(process.argv);
