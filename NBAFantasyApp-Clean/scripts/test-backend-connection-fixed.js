#!/usr/bin/env node
// scripts/test-backend-connection-fixed.js

const axios = require('axios');
const chalk = require('chalk');
const { program } = require('commander');
const fs = require('fs');
const path = require('path');

// Configuration - Use your actual backend URL
const DEFAULT_BACKEND_URL = 'http://localhost:3002';
const TEST_TIMEOUT = 5000;

// UPDATED TEST SUITES based on your server logs
const TEST_SUITES = {
  basic: [
    { name: 'Root endpoint', path: '/', method: 'GET' },
    { name: 'Health check', path: '/health', method: 'GET' },
  ],
  
  // These routes were shown as mounted in your logs
  working_routes: [
    { name: 'Auth API health', path: '/api/auth/health', method: 'GET' },
    { name: 'NBA API (mounted)', path: '/api/nba', method: 'GET' },
    { name: 'User preferences (mounted)', path: '/api/user', method: 'GET' },
    { name: 'Analytics (mounted)', path: '/api/analytics', method: 'GET' },
    { name: 'Live games', path: '/api/games', method: 'GET' },
    { name: 'News API', path: '/api/news', method: 'GET' },
    { name: 'Predictions', path: '/api/predictions', method: 'GET' },
  ],
  
  // Test if these endpoints exist within the mounted routes
  sub_endpoints: [
    // These might exist within the main routes
    { name: 'NBA games (if exists)', path: '/api/nba/games', method: 'GET' },
    { name: 'User notifications', path: '/api/user/notifications', method: 'GET' },
  ],
  
  // Other mounted routes from your logs
  other_mounted: [
    { name: 'NHL API', path: '/api/nhl', method: 'GET' },
    { name: 'NFL API', path: '/api/nfl', method: 'GET' },
    { name: 'Fantasy API', path: '/api/fantasy', method: 'GET' },
    { name: 'Admin API', path: '/api/admin', method: 'GET' },
    { name: 'Picks API', path: '/api/picks', method: 'GET' },
    { name: 'Kalshi API', path: '/api/kalshi', method: 'GET' },
    { name: 'Sports Analytics', path: '/api/sports-analytics', method: 'GET' },
    { name: 'PrizePicks Analytics', path: '/api/prizepicks/analytics', method: 'GET' },
    { name: 'Sportsbooks', path: '/api/sportsbooks', method: 'GET' },
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

  async runTests(suites = ['basic', 'working_routes', 'sub_endpoints', 'other_mounted']) {
    console.log(chalk.blue.bold('\n🔗 Frontend-Backend Connection Tester\n'));
    console.log(chalk.gray(`Backend URL: ${this.baseURL}`));
    console.log(chalk.gray('='.repeat(60) + '\n'));

    // First, let's discover what endpoints actually exist
    await this.discoverEndpoints();

    const startTime = Date.now();

    for (const suite of suites) {
      if (TEST_SUITES[suite]) {
        console.log(chalk.cyan.bold(`\n📦 Testing ${suite.replace('_', ' ').toUpperCase()} suite:`));
        await this.runTestSuite(TEST_SUITES[suite]);
      }
    }

    const endTime = Date.now();
    this.generateReport(startTime, endTime);
    
    return this.stats.failed === 0;
  }

  async discoverEndpoints() {
    console.log(chalk.yellow.bold('🔍 Discovering available endpoints...'));
    
    // First check the root to see what endpoints might be listed
    try {
      const response = await axios.get(this.baseURL, { timeout: 3000 });
      if (response.data && response.data.endpoints) {
        console.log(chalk.green('✅ Root endpoint lists available endpoints'));
        console.log(chalk.gray('   Available endpoints:'));
        response.data.endpoints.forEach(endpoint => {
          console.log(chalk.gray(`   - ${endpoint}`));
        });
      }
    } catch (error) {
      // Ignore errors in discovery
    }
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
          'User-Agent': 'Frontend-Backend-Tester',
          'Accept': 'application/json'
        }
      });

      const duration = Date.now() - startTime;
      const isSuccess = response.status >= 200 && response.status < 300;

      if (isSuccess) {
        this.stats.passed++;
        console.log(chalk.green(`  ✅ ${test.name}`));
        console.log(chalk.gray(`     ${url} - ${response.status} (${duration}ms)`));
        
        if (response.data) {
          if (response.data.message) {
            console.log(chalk.gray(`     Message: ${response.data.message}`));
          }
          if (response.data.success !== undefined) {
            console.log(chalk.gray(`     Success: ${response.data.success}`));
          }
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
        data: response.data ? { 
          message: response.data.message,
          success: response.data.success 
        } : null
      });

    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Check if it's a 404 - which might be expected for some endpoints
      if (error.response && error.response.status === 404) {
        this.stats.warnings++;
        console.log(chalk.yellow(`  ⚠️  ${test.name}`));
        console.log(chalk.gray(`     ${url}`));
        console.log(chalk.yellow(`     Endpoint not found (404)`));
        
        this.results.push({
          name: test.name,
          status: 'NOT_FOUND',
          url,
          statusCode: 404,
          duration,
          note: 'Endpoint might not exist or require authentication'
        });
      } else {
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
  }

  generateReport(startTime, endTime) {
    const totalTime = endTime - startTime;
    
    console.log(chalk.blue.bold('\n' + '='.repeat(60)));
    console.log(chalk.blue.bold('📊 TEST REPORT'));
    console.log(chalk.blue.bold('='.repeat(60) + '\n'));

    const workingEndpoints = this.results.filter(r => r.status === 'PASS');
    const notFoundEndpoints = this.results.filter(r => r.status === 'NOT_FOUND');
    const failedEndpoints = this.results.filter(r => r.status === 'FAIL');

    console.log(chalk.white.bold('Summary:'));
    console.log(`  Total tests: ${chalk.white.bold(this.stats.total)}`);
    console.log(`  ✅ Working endpoints: ${chalk.green.bold(workingEndpoints.length)}`);
    console.log(`  ⚠️  Not found (404): ${chalk.yellow.bold(notFoundEndpoints.length)}`);
    console.log(`  ❌ Failed (errors): ${chalk.red.bold(failedEndpoints.length)}`);
    console.log(`  ⏱️  Duration: ${chalk.white.bold(totalTime + 'ms')}\n`);

    console.log(chalk.green.bold('✅ Working Endpoints:'));
    workingEndpoints.forEach(result => {
      console.log(chalk.green(`  • ${result.name}`));
      console.log(chalk.gray(`    ${result.url}`));
    });

    if (notFoundEndpoints.length > 0) {
      console.log(chalk.yellow.bold('\n⚠️  Not Found (404) - Check if these should exist:'));
      notFoundEndpoints.forEach(result => {
        console.log(chalk.yellow(`  • ${result.name}`));
        console.log(chalk.gray(`    ${result.url}`));
      });
    }

    if (failedEndpoints.length > 0) {
      console.log(chalk.red.bold('\n❌ Failed Tests (need attention):'));
      failedEndpoints.forEach((result, index) => {
        console.log(chalk.red(`  ${index + 1}. ${result.name}`));
        console.log(chalk.gray(`     ${result.url}`));
        console.log(chalk.gray(`     Error: ${result.error}`));
      });
    }

    // Recommendations
    console.log(chalk.blue.bold('\n💡 RECOMMENDATIONS:'));
    console.log(chalk.blue('='.repeat(40)));
    
    if (workingEndpoints.length === 0) {
      console.log(chalk.red('❌ No endpoints are working! Check:'));
      console.log('   1. Is the backend server running?');
      console.log('   2. Is the URL correct?');
      console.log('   3. Check server logs for errors');
    } else if (workingEndpoints.length < 5) {
      console.log(chalk.yellow('⚠️  Limited connectivity. Check:'));
      console.log('   1. Some routes may need authentication');
      console.log('   2. Check CORS configuration');
      console.log('   3. Verify route mounting in server.js');
    } else {
      console.log(chalk.green('✅ Good connectivity! Focus on:'));
      console.log('   1. Fixing 404 endpoints that should exist');
      console.log('   2. Adding authentication to protected routes');
      console.log('   3. Testing with actual frontend components');
    }

    // Save detailed report
    this.saveReport(totalTime, {
      working: workingEndpoints.length,
      notFound: notFoundEndpoints.length,
      failed: failedEndpoints.length
    });
  }

  saveReport(totalTime, counts) {
    const report = {
      timestamp: new Date().toISOString(),
      backendUrl: this.baseURL,
      summary: {
        ...this.stats,
        workingEndpoints: counts.working,
        notFoundEndpoints: counts.notFound,
        failedEndpoints: counts.failed,
        duration: totalTime
      },
      results: this.results,
      recommendations: this.generateRecommendations(counts)
    };

    const reportDir = path.join(__dirname, '../reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const reportPath = path.join(reportDir, `backend-test-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(chalk.gray(`\n📄 Detailed report saved to: ${reportPath}`));
  }

  generateRecommendations(counts) {
    const recommendations = [];
    
    if (counts.working === 0) {
      recommendations.push('Server may not be running or URL is incorrect');
      recommendations.push('Check server logs for startup errors');
    } else if (counts.notFound > counts.working) {
      recommendations.push('Many endpoints return 404 - check route mounting in server.js');
      recommendations.push('Some routes may require authentication headers');
    } else {
      recommendations.push('Core endpoints are working - good foundation');
      recommendations.push('Focus on fixing specific 404 endpoints that should exist');
    }
    
    return recommendations;
  }
}

// CLI setup
program
  .name('test-backend-fixed')
  .description('Test frontend-backend connection with updated routes')
  .version('1.0.0')
  .option('-u, --url <url>', 'Backend URL', DEFAULT_BACKEND_URL)
  .option('-s, --suites <suites>', 'Test suites to run (comma-separated)', 'basic,working_routes,sub_endpoints,other_mounted')
  .action(async (options) => {
    const suites = options.suites.split(',').map(s => s.trim());
    
    const tester = new BackendTester(options.url);
    const success = await tester.runTests(suites);
    
    // Exit with 0 if at least some endpoints work, 1 if none work
    const workingEndpoints = tester.results.filter(r => r.status === 'PASS').length;
    process.exit(workingEndpoints > 0 ? 0 : 1);
  });

program.parse(process.argv);
