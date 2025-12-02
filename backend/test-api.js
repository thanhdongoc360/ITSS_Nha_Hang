const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = '';

// Helper function to make requests
const request = async (method, endpoint, data = null, useAuth = false) => {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(useAuth && authToken ? { Authorization: `Bearer ${authToken}` } : {})
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || error.message 
    };
  }
};

// Test functions
const tests = {
  // ==================== AUTH TESTS ====================
  testRegister: async () => {
    console.log('\n📝 Testing: Register');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    };

    const result = await request('POST', '/auth/register', testUser);
    
    if (result.success && result.data.data.token) {
      authToken = result.data.data.token;
      userId = result.data.data.user.id;
      console.log('✅ Register successful!');
      console.log('   Token:', authToken.substring(0, 20) + '...');
      console.log('   User:', result.data.data.user.name);
      return true;
    } else {
      console.log('❌ Register failed:', result.error);
      return false;
    }
  },

  testLogin: async () => {
    console.log('\n🔐 Testing: Login');
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    const result = await request('POST', '/auth/login', credentials);
    
    if (result.success && result.data.data.token) {
      authToken = result.data.data.token;
      console.log('✅ Login successful!');
      return true;
    } else {
      console.log('⚠️  Login failed (expected if user doesn\'t exist):', result.error);
      return false;
    }
  },

  testGetCurrentUser: async () => {
    console.log('\n👤 Testing: Get Current User');
    const result = await request('GET', '/auth/me', null, true);
    
    if (result.success) {
      console.log('✅ Get current user successful!');
      console.log('   User:', result.data.data.user.name);
      return true;
    } else {
      console.log('❌ Get current user failed:', result.error);
      return false;
    }
  },

  // ==================== RESTAURANT TESTS ====================
  testGetAllRestaurants: async () => {
    console.log('\n🍽️  Testing: Get All Restaurants');
    const result = await request('GET', '/restaurants');
    
    if (result.success && result.data.data.restaurants) {
      console.log('✅ Get all restaurants successful!');
      console.log(`   Found ${result.data.data.restaurants.length} restaurants`);
      return true;
    } else {
      console.log('❌ Get all restaurants failed:', result.error);
      return false;
    }
  },

  testGetRestaurantById: async () => {
    console.log('\n🍜 Testing: Get Restaurant by ID');
    const result = await request('GET', '/restaurants/1');
    
    if (result.success && result.data.data.restaurant) {
      console.log('✅ Get restaurant by ID successful!');
      console.log('   Restaurant:', result.data.data.restaurant.name);
      return true;
    } else {
      console.log('❌ Get restaurant by ID failed:', result.error);
      return false;
    }
  },

  testSearchRestaurants: async () => {
    console.log('\n🔍 Testing: Search Restaurants');
    const result = await request('GET', '/restaurants/search?q=寿司&cuisine=和食');
    
    if (result.success) {
      console.log('✅ Search restaurants successful!');
      console.log(`   Found ${result.data.data.restaurants.length} results`);
      return true;
    } else {
      console.log('❌ Search restaurants failed:', result.error);
      return false;
    }
  },

  testGetPopularRestaurants: async () => {
    console.log('\n🔥 Testing: Get Popular Restaurants');
    const result = await request('GET', '/restaurants/popular?limit=5');
    
    if (result.success) {
      console.log('✅ Get popular restaurants successful!');
      console.log(`   Found ${result.data.data.restaurants.length} popular restaurants`);
      return true;
    } else {
      console.log('❌ Get popular restaurants failed:', result.error);
      return false;
    }
  },

  testGetCuisines: async () => {
    console.log('\n🌏 Testing: Get Cuisine Types');
    const result = await request('GET', '/restaurants/cuisines');
    
    if (result.success) {
      console.log('✅ Get cuisines successful!');
      console.log('   Cuisines:', result.data.data.cuisines.join(', '));
      return true;
    } else {
      console.log('❌ Get cuisines failed:', result.error);
      return false;
    }
  },

  // ==================== FAVORITES TESTS ====================
  testAddToFavorites: async () => {
    console.log('\n⭐ Testing: Add to Favorites');
    const result = await request('POST', '/favorites/1', null, true);
    
    if (result.success) {
      console.log('✅ Add to favorites successful!');
      return true;
    } else {
      console.log('⚠️  Add to favorites failed:', result.error);
      return false;
    }
  },

  testGetFavorites: async () => {
    console.log('\n💖 Testing: Get All Favorites');
    const result = await request('GET', '/favorites', null, true);
    
    if (result.success) {
      console.log('✅ Get favorites successful!');
      console.log(`   You have ${result.data.data.count} favorites`);
      return true;
    } else {
      console.log('❌ Get favorites failed:', result.error);
      return false;
    }
  },

  testToggleFavorite: async () => {
    console.log('\n🔄 Testing: Toggle Favorite');
    const result = await request('PUT', '/favorites/2/toggle', null, true);
    
    if (result.success) {
      console.log('✅ Toggle favorite successful!');
      console.log(`   Status: ${result.data.data.isFavorite ? 'Added' : 'Removed'}`);
      return true;
    } else {
      console.log('❌ Toggle favorite failed:', result.error);
      return false;
    }
  },

  // ==================== HISTORY TESTS ====================
  testAddToHistory: async () => {
    console.log('\n📝 Testing: Add to History');
    const historyData = {
      restaurantId: 1,
      action: 'view'
    };
    
    const result = await request('POST', '/history', historyData, true);
    
    if (result.success) {
      console.log('✅ Add to history successful!');
      return true;
    } else {
      console.log('❌ Add to history failed:', result.error);
      return false;
    }
  },

  testGetHistory: async () => {
    console.log('\n📜 Testing: Get History');
    const result = await request('GET', '/history?limit=10', null, true);
    
    if (result.success) {
      console.log('✅ Get history successful!');
      console.log(`   Found ${result.data.data.count} history entries`);
      return true;
    } else {
      console.log('❌ Get history failed:', result.error);
      return false;
    }
  },

  testGetRecentlyViewed: async () => {
    console.log('\n👀 Testing: Get Recently Viewed');
    const result = await request('GET', '/history/recently-viewed?limit=5', null, true);
    
    if (result.success) {
      console.log('✅ Get recently viewed successful!');
      console.log(`   Found ${result.data.data.count} recently viewed`);
      return true;
    } else {
      console.log('❌ Get recently viewed failed:', result.error);
      return false;
    }
  },

  // ==================== PROFILE TESTS ====================
  testGetProfile: async () => {
    console.log('\n👤 Testing: Get Profile');
    const result = await request('GET', '/profile', null, true);
    
    if (result.success) {
      console.log('✅ Get profile successful!');
      console.log('   User:', result.data.data.user.name);
      console.log('   Stats:', result.data.data.stats);
      return true;
    } else {
      console.log('❌ Get profile failed:', result.error);
      return false;
    }
  },

  testUpdateProfile: async () => {
    console.log('\n✏️  Testing: Update Profile');
    const updateData = {
      name: 'Updated Test User'
    };
    
    const result = await request('PUT', '/profile', updateData, true);
    
    if (result.success) {
      console.log('✅ Update profile successful!');
      console.log('   New name:', result.data.data.user.name);
      return true;
    } else {
      console.log('❌ Update profile failed:', result.error);
      return false;
    }
  },

  testUpdatePreferences: async () => {
    console.log('\n⚙️  Testing: Update Preferences');
    const preferences = {
      max_distance: 1500,
      max_walk_time: 20,
      cuisine_types: ['和食', '中華'],
      price_range: [1, 3]
    };
    
    const result = await request('PUT', '/profile/preferences', preferences, true);
    
    if (result.success) {
      console.log('✅ Update preferences successful!');
      return true;
    } else {
      console.log('❌ Update preferences failed:', result.error);
      return false;
    }
  },

  testGetRecommendations: async () => {
    console.log('\n🤖 Testing: Get Recommendations');
    const result = await request('GET', '/restaurants/recommendations', null, true);
    
    if (result.success) {
      console.log('✅ Get recommendations successful!');
      console.log(`   Found ${result.data.data.count} recommendations`);
      return true;
    } else {
      console.log('❌ Get recommendations failed:', result.error);
      return false;
    }
  }
};

// Main test runner
const runTests = async () => {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   🍜 GohanGo API Test Suite 🍜                       ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('\n⚠️  Make sure backend server is running at http://localhost:5000\n');

  let passed = 0;
  let failed = 0;

  // Test authentication first
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  AUTHENTICATION TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (await tests.testRegister()) passed++; else failed++;
  if (await tests.testGetCurrentUser()) passed++; else failed++;

  // Restaurant tests
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  RESTAURANT TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (await tests.testGetAllRestaurants()) passed++; else failed++;
  if (await tests.testGetRestaurantById()) passed++; else failed++;
  if (await tests.testSearchRestaurants()) passed++; else failed++;
  if (await tests.testGetPopularRestaurants()) passed++; else failed++;
  if (await tests.testGetCuisines()) passed++; else failed++;

  // Favorites tests
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  FAVORITES TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (await tests.testAddToFavorites()) passed++; else failed++;
  if (await tests.testGetFavorites()) passed++; else failed++;
  if (await tests.testToggleFavorite()) passed++; else failed++;

  // History tests
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  HISTORY TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (await tests.testAddToHistory()) passed++; else failed++;
  if (await tests.testGetHistory()) passed++; else failed++;
  if (await tests.testGetRecentlyViewed()) passed++; else failed++;

  // Profile tests
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  PROFILE TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (await tests.testGetProfile()) passed++; else failed++;
  if (await tests.testUpdateProfile()) passed++; else failed++;
  if (await tests.testUpdatePreferences()) passed++; else failed++;
  if (await tests.testGetRecommendations()) passed++; else failed++;

  // Summary
  console.log('\n\n╔═══════════════════════════════════════════════════════╗');
  console.log('║              TEST RESULTS                             ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log(`\n✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total:  ${passed + failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Backend API is working correctly! 🎉\n');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above.\n');
  }
};

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test suite error:', error.message);
  console.error('\n⚠️  Make sure:');
  console.error('   1. Backend server is running (npm run dev in backend folder)');
  console.error('   2. MySQL database is running');
  console.error('   3. Database schema has been created\n');
});
