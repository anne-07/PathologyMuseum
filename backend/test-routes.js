const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
let authToken = '';

const logSuccess = (message) => console.log('✅', message);
const logInfo = (message) => console.log('ℹ️', message);
const logError = (error) => console.error('❌ Error:', error.message);

const testRoutes = async () => {
  try {
    logInfo('Testing Authentication Routes...');
    
    // Generate unique identifiers
    const timestamp = Date.now();
    const testUsername = `testuser_${timestamp}`;
    const testEmail = `test${timestamp}@example.com`;
    
    // Test Register
    logInfo('Testing Register...');
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        username: testUsername,
        email: testEmail,
        password: 'test123'
      });
      logSuccess('User registered successfully');
    } catch (error) {
      logInfo('Using existing user credentials');
    }
    
    // Test Login
    logInfo('Testing Login...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: 'test123'
    });
    authToken = loginRes.data.data.token;
    logSuccess('Login successful');

    // Test Get Profile
    logInfo('Testing Profile...');
    await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logSuccess('Profile retrieved successfully');

    logInfo('Testing Specimen Routes...');
    
    // Create Specimen
    logInfo('Creating specimen...');
    const specimenRes = await axios.post(`${BASE_URL}/specimens`, {
      accessionNumber: `SP${timestamp}`,
      title: 'Test Specimen',
      description: 'Test Description',
      organ: 'Liver',
      diagnosis: 'Normal',
      clinicalHistory: 'Test History',
      grossFeatures: 'Test Gross',
      microscopicFeatures: 'Test Microscopic',
      category: 'Non-neoplastic'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const specimenId = specimenRes.data.data.specimen._id;
    logSuccess('Specimen created successfully');

    // Get All Specimens
    logInfo('Getting all specimens...');
    await axios.get(`${BASE_URL}/specimens`);
    logSuccess('Specimens retrieved successfully');

    logInfo('Testing Slide Routes...');
    
    // Create Slide
    logInfo('Creating slide...');
    const slideRes = await axios.post(`${BASE_URL}/slides`, {
      specimenId,
      slideNumber: `SL${timestamp}`,
      stain: 'H&E',
      magnification: '40x',
      imageUrl: 'http://example.com/slide.jpg',
      description: 'Test Slide',
      findings: 'Test Findings'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const slideId = slideRes.data.data.slide._id;
    logSuccess('Slide created successfully');

    // Get Slides for Specimen
    logInfo('Getting slides for specimen...');
    await axios.get(`${BASE_URL}/slides/specimen/${specimenId}`);
    logSuccess('Specimen slides retrieved successfully');

    // Update Slide Annotations
    logInfo('Updating slide annotations...');
    await axios.patch(`${BASE_URL}/slides/${slideId}/annotations`, {
      annotations: [{
        type: 'Arrow',
        coordinates: { x: 100, y: 100, width: 50, height: 50 },
        text: 'Test annotation',
        color: '#ff0000'
      }]
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    logSuccess('Annotations updated successfully');

    console.log('\n✨ All tests completed successfully!');
  } catch (error) {
    logError(error);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
};

testRoutes();
