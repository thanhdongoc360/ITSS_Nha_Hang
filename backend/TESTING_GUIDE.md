# GohanGo API Testing Guide

## 📋 Overview
This guide covers testing the GohanGo backend API using two methods:
1. **Node.js Test Script** - Automated test suite
2. **Postman Collection** - Interactive API testing

## 🚀 Method 1: Node.js Test Script

### Prerequisites
- Backend server running on `http://localhost:5000`
- MySQL database running with schema created
- Node.js and npm installed

### Running the Tests

1. **Start the backend server** (in first terminal):
   ```bash
   cd backend
   npm run dev
   ```

2. **Run the test script** (in second terminal):
   ```bash
   cd backend
   node test-api.js
   ```

### What Gets Tested
The script tests all 19 API endpoints across 5 categories:

#### ✅ Authentication Tests (3 endpoints)
- ✓ Register new user
- ✓ Login with credentials
- ✓ Get current user info

#### ✅ Restaurant Tests (7 endpoints)
- ✓ Get all restaurants
- ✓ Get restaurant by ID
- ✓ Search restaurants by query/cuisine
- ✓ Get popular restaurants
- ✓ Get cuisine types
- ✓ Get personalized recommendations

#### ✅ Favorites Tests (3 endpoints)
- ✓ Add restaurant to favorites
- ✓ Get all user favorites
- ✓ Toggle favorite status

#### ✅ History Tests (3 endpoints)
- ✓ Add restaurant view to history
- ✓ Get user history with filters
- ✓ Get recently viewed restaurants

#### ✅ Profile Tests (4 endpoints)
- ✓ Get user profile with stats
- ✓ Update user profile
- ✓ Update user preferences
- ✓ Get recommendations based on preferences

### Test Output Example
```
╔═══════════════════════════════════════════════════════╗
║   🍜 GohanGo API Test Suite 🍜                       ║
╚═══════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AUTHENTICATION TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Testing: Register
✅ Register successful!
   Token: eyJhbGciOiJIUzI1NI...
   User: Test User

👤 Testing: Get Current User
✅ Get current user successful!
   User: Test User

...

╔═══════════════════════════════════════════════════════╗
║              TEST RESULTS                             ║
╚═══════════════════════════════════════════════════════╝

✅ Passed: 17
❌ Failed: 0
📊 Total:  17
📈 Success Rate: 100.0%

🎉 All tests passed! Backend API is working correctly! 🎉
```

## 🔧 Method 2: Postman Collection

### Import Collection

1. **Open Postman Desktop or Web**

2. **Import the collection**:
   - Click "Import" button
   - Select file: `backend/GohanGo_API_Tests.postman_collection.json`
   - Click "Import"

3. **Set up environment** (optional):
   - Click "Environments" → "+" to create new environment
   - Name it "GohanGo Local"
   - Add variables:
     - `base_url`: `http://localhost:5000/api`
     - `auth_token`: (leave empty, will auto-populate)
     - `user_id`: (leave empty, will auto-populate)

### Using the Collection

#### Step 1: Start with Authentication
1. **Register User**:
   - Open "Authentication" → "Register User"
   - Click "Send"
   - Token will auto-save to environment

2. **Or Login** (if user already exists):
   - Open "Authentication" → "Login User"
   - Update email/password in body
   - Click "Send"

#### Step 2: Test Restaurants
- **Get All Restaurants** - View all restaurants
- **Get Restaurant by ID** - View single restaurant details
- **Search Restaurants** - Test search with query parameters
- **Get Popular** - View most popular restaurants
- **Get Cuisines** - List all cuisine types
- **Get Recommendations** - Personalized suggestions (requires auth)

#### Step 3: Test Favorites
- **Add to Favorites** - Add restaurant to favorites
- **Get All Favorites** - View user's favorite list
- **Check if Favorite** - Check favorite status
- **Toggle Favorite** - Toggle on/off
- **Remove from Favorites** - Remove specific favorite

#### Step 4: Test History
- **Add to History** - Track restaurant view
- **Get User History** - View history with filters
- **Get Recently Viewed** - Last viewed restaurants
- **Delete History Entry** - Remove specific entry
- **Clear All History** - Delete all history

#### Step 5: Test Profile
- **Get Profile** - View profile with stats
- **Update Profile** - Change user name
- **Get Preferences** - View user preferences
- **Update Preferences** - Update search preferences

### Automated Test Scripts
Each request includes automated test scripts that:
- ✓ Verify response status codes
- ✓ Validate response structure
- ✓ Auto-save tokens and IDs to environment
- ✓ Show pass/fail in Test Results tab

### Running Collection Tests
1. Click "Collections" → "GohanGo API Tests"
2. Click "Run" button (⚡ icon)
3. Select all requests or specific folder
4. Click "Run GohanGo API Tests"
5. View results summary with pass/fail counts

## 🐛 Troubleshooting

### Common Issues

#### ❌ "ECONNREFUSED" Error
**Problem**: Cannot connect to backend server

**Solution**:
```bash
# Make sure backend is running
cd backend
npm run dev

# Should see: Server running on port 5000
```

#### ❌ "ER_BAD_DB_ERROR" - Unknown Database
**Problem**: MySQL database not created

**Solution**:
```bash
# Create database and import schema
mysql -u root -p

CREATE DATABASE gohan_go;
USE gohan_go;
SOURCE database/schema.sql;
```

#### ❌ 401 Unauthorized Error
**Problem**: Token missing or expired

**Solution**:
- Run "Register User" or "Login User" first
- Token auto-saves to environment
- For test script: Registration happens automatically

#### ❌ "Cannot find module 'axios'"
**Problem**: Dependencies not installed

**Solution**:
```bash
cd backend
npm install
```

#### ❌ No restaurants returned
**Problem**: Sample data not loaded

**Solution**:
```bash
# Import schema again (includes sample restaurants)
mysql -u root -p gohan_go < database/schema.sql
```

## 📊 Expected Test Results

### Successful Test Metrics
- ✅ **Authentication**: 3/3 passed
- ✅ **Restaurants**: 7/7 passed
- ✅ **Favorites**: 3-5/5 passed (depending on data state)
- ✅ **History**: 3-5/5 passed (depending on data state)
- ✅ **Profile**: 4/4 passed
- **Overall**: ~85-100% success rate

### Known Acceptable Failures
Some tests may show warnings on first run:
- Login test fails if test user doesn't exist (expected)
- Delete operations fail if no data exists (expected)
- These are normal and don't indicate API issues

## 🎯 Testing Best Practices

### Before Testing
1. ✓ Start MySQL server
2. ✓ Run database schema script
3. ✓ Start backend server
4. ✓ Verify server responds at http://localhost:5000/api/auth/me

### During Testing
1. Test authentication endpoints first
2. Save tokens for authenticated requests
3. Test read operations before write operations
4. Use realistic test data

### After Testing
1. Check test results for failures
2. Review error messages in console/Postman
3. Verify database state if needed
4. Clean up test data if desired

## 🔄 Continuous Testing

### Development Workflow
```bash
# Terminal 1: Run backend with auto-reload
cd backend
npm run dev

# Terminal 2: Run tests after code changes
cd backend
node test-api.js
```

### Integration with Git
Add to `.gitignore`:
```
# Test data
test-results.json
test-output.log
```

## 📝 Custom Test Data

### Modifying Test Script
Edit `backend/test-api.js`:

```javascript
// Change test user email
const testUser = {
  name: 'Your Name',
  email: 'your.email@example.com',
  password: 'yourpassword'
};

// Change search query
const result = await request('GET', '/restaurants/search?q=ラーメン&cuisine=和食');

// Change preferences
const preferences = {
  max_distance: 2000,
  cuisine_types: ['和食', 'イタリアン']
};
```

### Modifying Postman Requests
1. Open any request
2. Edit request body or query parameters
3. Save request
4. Re-run collection

## ✨ Next Steps

After successful testing:
1. ✓ API endpoints verified working
2. → Proceed to frontend testing
3. → Test frontend-backend integration
4. → Prepare for deployment

---

**Happy Testing! 🚀**
