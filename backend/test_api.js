// Simple API Test Script
const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing Chat API...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  try {
    const healthResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/chat/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Health Check:', healthResult.status, healthResult.data);
  } catch (error) {
    console.log('❌ Health Check Error:', error.message);
  }

  console.log('\n');

  // Test 2: Service Status
  console.log('2. Testing Service Status...');
  try {
    const statusResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/chat/status',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Service Status:', statusResult.status, statusResult.data);
  } catch (error) {
    console.log('❌ Service Status Error:', error.message);
  }

  console.log('\n');

  // Test 3: Chat Message
  console.log('3. Testing Chat Message...');
  try {
    const chatData = JSON.stringify({
      messages: [
        { role: 'user', content: 'Xin chào' }
      ]
    });

    const chatResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/chat',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(chatData)
      }
    }, chatData);
    console.log('✅ Chat Message:', chatResult.status, chatResult.data);
  } catch (error) {
    console.log('❌ Chat Message Error:', error.message);
  }

  console.log('\n');

  // Test 4: Restaurant Info
  console.log('4. Testing Restaurant Info...');
  try {
    const infoResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/chat/restaurant-info',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Restaurant Info:', infoResult.status, infoResult.data);
  } catch (error) {
    console.log('❌ Restaurant Info Error:', error.message);
  }

  console.log('\n');

  // Test 5: Generate Food Description
  console.log('5. Testing Generate Food Description...');
  try {
    const foodData = JSON.stringify({
      foodName: 'Phở Bò',
      ingredients: 'Thịt bò, bánh phở, hành lá',
      category: 'Món chính'
    });

    const foodResult = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/chat/generate-description',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(foodData)
      }
    }, foodData);
    console.log('✅ Generate Food Description:', foodResult.status, foodResult.data);
  } catch (error) {
    console.log('❌ Generate Food Description Error:', error.message);
  }

  console.log('\n🏁 Test completed!');
}

// Run tests
testAPI().catch(console.error);
