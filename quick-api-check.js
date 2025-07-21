#!/usr/bin/env node

/**
 * Quick API Check Script
 * Kiểm tra nhanh API Foods và các endpoints chính
 */

const http = require('http');
const https = require('https');
const url = require('url');

// Configuration
const config = {
  baseUrl: 'http://localhost:3000',
  timeout: 5000
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Make HTTP request
 */
function makeRequest(requestUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(requestUrl);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'API-Check-Script/1.0',
        ...options.headers
      },
      timeout: config.timeout
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
            raw: data
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: null,
            raw: data,
            parseError: error.message
          });
        }
      });
    });

    req.on('error', (error) => {
      reject({
        error: error.message,
        code: error.code
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        code: 'TIMEOUT'
      });
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Log with colors
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Test endpoint
 */
async function testEndpoint(name, path, options = {}) {
  const fullUrl = `${config.baseUrl}${path}`;
  
  log(`\n🔍 Testing: ${name}`, 'cyan');
  log(`   URL: ${fullUrl}`, 'blue');
  
  try {
    const startTime = Date.now();
    const response = await makeRequest(fullUrl, options);
    const duration = Date.now() - startTime;
    
    if (response.status >= 200 && response.status < 300) {
      log(`   ✅ SUCCESS (${response.status}) - ${duration}ms`, 'green');
      if (response.data) {
        log(`   📄 Response: ${JSON.stringify(response.data, null, 2).substring(0, 200)}...`, 'reset');
      }
    } else {
      log(`   ⚠️  WARNING (${response.status}) - ${duration}ms`, 'yellow');
      if (response.data) {
        log(`   📄 Response: ${JSON.stringify(response.data, null, 2)}`, 'reset');
      } else {
        log(`   📄 Raw: ${response.raw}`, 'reset');
      }
    }
    
    return response;
  } catch (error) {
    log(`   ❌ ERROR: ${error.error || error.message}`, 'red');
    if (error.code) {
      log(`   🔧 Code: ${error.code}`, 'red');
    }
    return null;
  }
}

/**
 * Main test function
 */
async function runTests() {
  log('🍽️  Restaurant API Quick Check', 'magenta');
  log('================================', 'magenta');
  log(`Base URL: ${config.baseUrl}`, 'blue');
  log(`Timeout: ${config.timeout}ms`, 'blue');

  const tests = [
    // Basic connectivity
    {
      name: 'Server Root',
      path: '/',
      description: 'Check if server is running'
    },
    
    // Health checks
    {
      name: 'API Health Check',
      path: '/api/health',
      description: 'Check API health status'
    },
    
    {
      name: 'API Test Endpoint',
      path: '/api/test',
      description: 'Test API connectivity'
    },
    
    // Foods API
    {
      name: 'Get All Foods',
      path: '/api/foods',
      description: 'Get list of all foods'
    },
    
    {
      name: 'Get Foods with Limit',
      path: '/api/foods?limit=5',
      description: 'Get foods with pagination'
    },
    
    {
      name: 'Get Food by ID',
      path: '/api/foods/1',
      description: 'Get specific food item'
    },
    
    // Categories API
    {
      name: 'Get All Categories',
      path: '/api/categories',
      description: 'Get list of food categories'
    },
    
    // Documentation
    {
      name: 'API Documentation',
      path: '/api/docs',
      description: 'Check API documentation'
    },
    
    {
      name: 'Swagger JSON',
      path: '/api-docs.json',
      description: 'Get Swagger specification'
    }
  ];

  let successCount = 0;
  let totalTests = tests.length;

  for (const test of tests) {
    const result = await testEndpoint(test.name, test.path);
    if (result && result.status >= 200 && result.status < 300) {
      successCount++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  log('\n📊 Test Summary', 'magenta');
  log('===============', 'magenta');
  log(`Total Tests: ${totalTests}`, 'blue');
  log(`Successful: ${successCount}`, successCount === totalTests ? 'green' : 'yellow');
  log(`Failed: ${totalTests - successCount}`, totalTests - successCount === 0 ? 'green' : 'red');
  log(`Success Rate: ${Math.round((successCount / totalTests) * 100)}%`, 'blue');

  if (successCount === 0) {
    log('\n🚨 Server appears to be offline or not accessible!', 'red');
    log('💡 Troubleshooting steps:', 'yellow');
    log('   1. Check if Node.js server is running: node server.js', 'reset');
    log('   2. Verify port 3000 is not blocked', 'reset');
    log('   3. Check if MySQL database is running', 'reset');
    log('   4. Verify .env configuration', 'reset');
  } else if (successCount < totalTests) {
    log('\n⚠️  Some endpoints are not working properly', 'yellow');
    log('💡 This might indicate:', 'yellow');
    log('   - Database connection issues', 'reset');
    log('   - Missing routes or controllers', 'reset');
    log('   - Authentication requirements', 'reset');
  } else {
    log('\n🎉 All tests passed! API is working correctly', 'green');
  }

  log('\n🔗 Useful URLs:', 'cyan');
  log(`   API Base: ${config.baseUrl}/api`, 'reset');
  log(`   Health: ${config.baseUrl}/api/health`, 'reset');
  log(`   Docs: ${config.baseUrl}/api/docs`, 'reset');
  log(`   Swagger: ${config.baseUrl}/api-docs`, 'reset');
}

/**
 * CLI interface
 */
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    log('🍽️  Restaurant API Quick Check', 'magenta');
    log('Usage: node quick-api-check.js [options]', 'blue');
    log('Options:', 'blue');
    log('  --url <url>    Set base URL (default: http://localhost:3000)', 'reset');
    log('  --timeout <ms> Set timeout (default: 5000)', 'reset');
    log('  --help, -h     Show this help', 'reset');
    process.exit(0);
  }
  
  // Parse arguments
  const urlIndex = args.indexOf('--url');
  if (urlIndex !== -1 && args[urlIndex + 1]) {
    config.baseUrl = args[urlIndex + 1];
  }
  
  const timeoutIndex = args.indexOf('--timeout');
  if (timeoutIndex !== -1 && args[timeoutIndex + 1]) {
    config.timeout = parseInt(args[timeoutIndex + 1]);
  }
  
  runTests().catch(error => {
    log(`\n💥 Unexpected error: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint, makeRequest };
