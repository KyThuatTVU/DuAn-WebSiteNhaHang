#!/usr/bin/env node

/**
 * Postman Collection Test Runner
 * Chạy automated tests cho Restaurant API
 */

const newman = require('newman');
const path = require('path');
const fs = require('fs');

// Configuration
const config = {
  collection: path.join(__dirname, 'Restaurant_API_Postman_Collection.json'),
  environment: path.join(__dirname, 'Restaurant_API_Environment.json'),
  reporters: ['cli', 'json', 'html'],
  iterationCount: 1,
  delayRequest: 500, // 500ms delay between requests
  timeout: 30000, // 30 seconds timeout
  insecure: true, // Allow self-signed certificates
  bail: false, // Continue on failures
  color: 'on'
};

// Test scenarios
const testScenarios = [
  {
    name: 'Health Check Tests',
    folder: 'System',
    description: 'Test system health and connectivity'
  },
  {
    name: 'Authentication Flow Tests',
    folder: 'Authentication',
    description: 'Test user registration, login, and token management'
  },
  {
    name: 'Foods Management Tests',
    folder: 'Foods Management',
    description: 'Test CRUD operations for food items'
  },
  {
    name: 'Categories Tests',
    folder: 'Categories Management',
    description: 'Test category management'
  },
  {
    name: 'AI Chat Tests',
    folder: 'AI Chat',
    description: 'Test AI chatbot integration'
  },
  {
    name: 'Reservations Tests',
    folder: 'Reservations',
    description: 'Test reservation management'
  }
];

/**
 * Run Newman collection
 */
function runTests(options = {}) {
  const runOptions = {
    ...config,
    ...options
  };

  console.log('🚀 Starting Restaurant API Tests...\n');
  console.log(`📁 Collection: ${runOptions.collection}`);
  console.log(`🌍 Environment: ${runOptions.environment}`);
  console.log(`⏱️  Timeout: ${runOptions.timeout}ms`);
  console.log(`🔄 Iterations: ${runOptions.iterationCount}\n`);

  return new Promise((resolve, reject) => {
    newman.run(runOptions, (err, summary) => {
      if (err) {
        console.error('❌ Newman run failed:', err);
        reject(err);
        return;
      }

      // Print summary
      console.log('\n📊 Test Summary:');
      console.log(`Total Requests: ${summary.run.stats.requests.total}`);
      console.log(`Passed: ${summary.run.stats.requests.total - summary.run.stats.requests.failed}`);
      console.log(`Failed: ${summary.run.stats.requests.failed}`);
      console.log(`Assertions: ${summary.run.stats.assertions.total}`);
      console.log(`Assertion Failures: ${summary.run.stats.assertions.failed}`);

      if (summary.run.failures.length > 0) {
        console.log('\n❌ Failures:');
        summary.run.failures.forEach((failure, index) => {
          console.log(`${index + 1}. ${failure.error.name}: ${failure.error.message}`);
          if (failure.source) {
            console.log(`   Source: ${failure.source.name}`);
          }
        });
      }

      if (summary.run.stats.requests.failed === 0) {
        console.log('\n✅ All tests passed!');
        resolve(summary);
      } else {
        console.log('\n⚠️  Some tests failed. Check the details above.');
        resolve(summary);
      }
    });
  });
}

/**
 * Run specific folder tests
 */
function runFolderTests(folderName) {
  console.log(`🎯 Running tests for folder: ${folderName}`);
  
  return runTests({
    folder: folderName,
    reporters: ['cli']
  });
}

/**
 * Run all test scenarios
 */
async function runAllScenarios() {
  console.log('🎭 Running all test scenarios...\n');
  
  const results = [];
  
  for (const scenario of testScenarios) {
    console.log(`\n🔍 ${scenario.name}`);
    console.log(`📝 ${scenario.description}`);
    console.log('─'.repeat(50));
    
    try {
      const result = await runFolderTests(scenario.folder);
      results.push({
        scenario: scenario.name,
        success: result.run.stats.requests.failed === 0,
        stats: result.run.stats
      });
    } catch (error) {
      console.error(`❌ Failed to run ${scenario.name}:`, error.message);
      results.push({
        scenario: scenario.name,
        success: false,
        error: error.message
      });
    }
  }
  
  // Print overall summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 OVERALL TEST RESULTS');
  console.log('='.repeat(60));
  
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${index + 1}. ${status} ${result.scenario}`);
    if (result.stats) {
      console.log(`   Requests: ${result.stats.requests.total}, Failed: ${result.stats.requests.failed}`);
    }
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n🎯 Success Rate: ${successCount}/${totalCount} (${Math.round(successCount/totalCount*100)}%)`);
  
  return results;
}

/**
 * Generate HTML report
 */
function generateHtmlReport() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(__dirname, `test-report-${timestamp}.html`);
  
  return runTests({
    reporters: ['html'],
    reporter: {
      html: {
        export: reportPath
      }
    }
  }).then(() => {
    console.log(`📄 HTML report generated: ${reportPath}`);
    return reportPath;
  });
}

/**
 * Validate collection and environment files
 */
function validateFiles() {
  const errors = [];
  
  if (!fs.existsSync(config.collection)) {
    errors.push(`Collection file not found: ${config.collection}`);
  }
  
  if (!fs.existsSync(config.environment)) {
    errors.push(`Environment file not found: ${config.environment}`);
  }
  
  if (errors.length > 0) {
    console.error('❌ Validation errors:');
    errors.forEach(error => console.error(`   ${error}`));
    process.exit(1);
  }
  
  console.log('✅ Files validated successfully');
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  validateFiles();
  
  switch (command) {
    case 'all':
      runAllScenarios()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'folder':
      const folderName = args[1];
      if (!folderName) {
        console.error('❌ Please specify folder name');
        process.exit(1);
      }
      runFolderTests(folderName)
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'report':
      generateHtmlReport()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
      break;
      
    case 'help':
    default:
      console.log('🍽️  Restaurant API Test Runner\n');
      console.log('Usage:');
      console.log('  node postman-test-runner.js [command] [options]\n');
      console.log('Commands:');
      console.log('  all                 Run all test scenarios');
      console.log('  folder <name>       Run tests for specific folder');
      console.log('  report              Generate HTML report');
      console.log('  help                Show this help\n');
      console.log('Examples:');
      console.log('  node postman-test-runner.js all');
      console.log('  node postman-test-runner.js folder "Authentication"');
      console.log('  node postman-test-runner.js report');
      break;
  }
}

module.exports = {
  runTests,
  runFolderTests,
  runAllScenarios,
  generateHtmlReport,
  testScenarios
};
