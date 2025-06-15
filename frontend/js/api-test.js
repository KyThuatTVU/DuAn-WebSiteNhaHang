// Simple API Test Script
console.log('🔧 Starting API Test...');

// Test API endpoints
async function testAPI() {
    const baseURL = 'http://localhost:3001/api';
    
    console.log('📡 Testing API connection...');
    
    try {
        // Test 1: Health Check
        console.log('1️⃣ Testing Health Check...');
        const healthResponse = await fetch(`${baseURL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health Check:', healthData);
        
        // Test 2: Foods API
        console.log('2️⃣ Testing Foods API...');
        const foodsResponse = await fetch(`${baseURL}/foods?limit=3`);
        const foodsData = await foodsResponse.json();
        console.log('✅ Foods API:', foodsData);
        
        // Test 3: Search API
        console.log('3️⃣ Testing Search API...');
        const searchResponse = await fetch(`${baseURL}/foods?search=cá&limit=2`);
        const searchData = await searchResponse.json();
        console.log('✅ Search API:', searchData);
        
        console.log('🎉 All API tests passed!');
        return true;
        
    } catch (error) {
        console.error('❌ API Test Failed:', error);
        return false;
    }
}

// Run test when script loads
testAPI();
