#!/usr/bin/env node

const http = require('http');

function testApiEndpoint(path, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8070,
      path: path,
      method: 'GET',
      timeout: 5000,
    };

    console.log(`Testing ${description} (${path})...`);
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ ${description}: Status ${res.statusCode}`);
        if (data) {
          try {
            const parsed = JSON.parse(data);
            console.log(`   Response:`, parsed);
          } catch (e) {
            console.log(`   Response:`, data);
          }
        }
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${description}: ${err.message}`);
      reject(err);
    });

    req.on('timeout', () => {
      console.log(`⏱️  ${description}: Request timed out`);
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing API server on localhost:8070\n');
  
  const tests = [
    { path: '/test', description: 'Test endpoint' },
    { path: '/health', description: 'Health check endpoint' },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await testApiEndpoint(test.path, test.description);
      passed++;
    } catch (error) {
      failed++;
    }
    console.log(''); // Empty line for readability
  }

  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n💡 Make sure your API server is running on port 8070');
    console.log('   You can start it by running: npm run dev (in the backend directory)');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed! Your API is ready for React Query integration.');
    process.exit(0);
  }
}

runTests().catch((error) => {
  console.error('❌ Test runner failed:', error.message);
  process.exit(1);
}); 