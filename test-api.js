// Simple test to check API response
const axios = require('axios');

async function testAPI() {
  try {
    // Test login first to get token
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'manager@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful, token:', token);
    
    // Test fetching tasks
    const tasksResponse = await axios.get('http://localhost:5000/api/tasks', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Tasks API Response:', JSON.stringify(tasksResponse.data, null, 2));
    
  } catch (error) {
    console.error('API Test Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testAPI();
