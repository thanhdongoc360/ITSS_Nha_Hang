# 🎉 GohanGo Backend API - Phase 2 Complete!

## ✅ Đã Hoàn Thành

Phase 2 - Backend API đã được xây dựng hoàn chỉnh với tất cả các tính năng.

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Response Format
Tất cả responses đều có format chuẩn:

**Success Response:**
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]  // Optional validation errors
}
```

---

## 🔐 Authentication APIs

### 1. Register (Đăng ký)
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Nguyen Van A",
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Nguyen Van A",
      "email": "test@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login (Đăng nhập)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response:** (Same as register)

### 3. Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### 4. Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

---

## 🍽️ Restaurant APIs

### 1. Get All Restaurants
```http
GET /api/restaurants?q=寿司&cuisine=和食&maxDistance=1000&maxPrice=3&sortBy=rating&order=DESC
```

**Query Parameters:**
- `q` - Search query (name)
- `cuisine` - Filter by cuisine type
- `maxDistance` - Max distance in meters
- `maxPrice` - Max price level (1-3)
- `minRating` - Min rating (0-5)
- `sortBy` - Sort field (rating, distance, price, reviews)
- `order` - ASC or DESC
- `limit` - Results per page (default: 50)
- `offset` - Pagination offset

### 2. Get Restaurant by ID
```http
GET /api/restaurants/1
```

### 3. Search Restaurants
```http
GET /api/restaurants/search?q=寿司&cuisine=和食&maxDistance=1000
```

### 4. Get Recommendations
```http
GET /api/restaurants/recommendations
Authorization: Bearer {token}
```

### 5. Get Popular Restaurants
```http
GET /api/restaurants/popular?limit=10
```

### 6. Get Nearby Restaurants
```http
GET /api/restaurants/nearby?limit=10
```

### 7. Get Cuisine Types
```http
GET /api/restaurants/cuisines
```

---

## ⭐ Favorites APIs

All favorites endpoints require authentication.

### 1. Get All Favorites
```http
GET /api/favorites
Authorization: Bearer {token}
```

### 2. Add to Favorites
```http
POST /api/favorites/1
Authorization: Bearer {token}
```

### 3. Remove from Favorites
```http
DELETE /api/favorites/1
Authorization: Bearer {token}
```

### 4. Toggle Favorite
```http
PUT /api/favorites/1/toggle
Authorization: Bearer {token}
```

### 5. Check Favorite Status
```http
GET /api/favorites/1/check
Authorization: Bearer {token}
```

---

## 📜 History APIs

All history endpoints require authentication.

### 1. Get All History
```http
GET /api/history?limit=50
Authorization: Bearer {token}
```

### 2. Add to History
```http
POST /api/history
Authorization: Bearer {token}
Content-Type: application/json

{
  "restaurantId": 1,
  "action": "view"  // view, search, visit, order
}
```

### 3. Get Recently Viewed
```http
GET /api/history/recently-viewed?limit=10
Authorization: Bearer {token}
```

### 4. Get History by Action
```http
GET /api/history/by-action/view
Authorization: Bearer {token}
```

### 5. Delete All History
```http
DELETE /api/history
Authorization: Bearer {token}
```

### 6. Delete Old History
```http
DELETE /api/history/old/30
Authorization: Bearer {token}
```

---

## 👤 Profile APIs

All profile endpoints require authentication.

### 1. Get Profile
```http
GET /api/profile
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Nguyen Van A",
      "email": "test@example.com"
    },
    "preferences": {
      "max_distance": 1000,
      "max_walk_time": 15,
      "cuisine_types": ["和食", "中華"],
      "price_range": [1, 3]
    },
    "stats": {
      "favoritesCount": 5,
      "historyCount": 20
    }
  }
}
```

### 2. Update Profile
```http
PUT /api/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

### 3. Get Preferences
```http
GET /api/profile/preferences
Authorization: Bearer {token}
```

### 4. Update Preferences
```http
PUT /api/profile/preferences
Authorization: Bearer {token}
Content-Type: application/json

{
  "max_distance": 1500,
  "max_walk_time": 20,
  "cuisine_types": ["和食", "中華", "イタリアン"],
  "price_range": [1, 2]
}
```

### 5. Delete Preferences
```http
DELETE /api/profile/preferences
Authorization: Bearer {token}
```

### 6. Get Stats
```http
GET /api/profile/stats
Authorization: Bearer {token}
```

---

## 🧪 Testing với Postman

### Bước 1: Import Collection

Tạo file `GohanGo.postman_collection.json` với các requests trên.

### Bước 2: Test Flow

1. **Register** - Tạo account mới
2. **Login** - Lấy JWT token
3. Copy token vào Authorization header cho các requests khác
4. Test các endpoints theo thứ tự:
   - Get restaurants
   - Get restaurant detail
   - Add to favorites
   - Add to history
   - Update preferences
   - Get recommendations

---

## 🚀 Chạy Server

```powershell
cd d:\gohan-go-app\backend

# Cài đặt dependencies
npm install

# Chạy development mode
npm run dev

# Hoặc production mode
npm start
```

Server chạy tại: **http://localhost:5000**

---

## 📁 File Structure

```
backend/
├── config/
│   └── database.js          ✅ MySQL connection
├── controllers/
│   ├── authController.js    ✅ Auth logic
│   ├── restaurantController.js  ✅ Restaurant logic
│   ├── favoriteController.js    ✅ Favorite logic
│   ├── historyController.js     ✅ History logic
│   └── profileController.js     ✅ Profile logic
├── models/
│   ├── User.js              ✅ User model
│   ├── Restaurant.js        ✅ Restaurant model
│   ├── Favorite.js          ✅ Favorite model
│   ├── History.js           ✅ History model
│   └── UserPreference.js    ✅ Preference model
├── routes/
│   ├── auth.js              ✅ Auth routes
│   ├── restaurants.js       ✅ Restaurant routes
│   ├── favorites.js         ✅ Favorite routes
│   ├── history.js           ✅ History routes
│   └── profile.js           ✅ Profile routes
├── middleware/
│   └── auth.js              ✅ JWT middleware
├── utils/
│   ├── jwtHelper.js         ✅ JWT functions
│   └── responseHelper.js    ✅ Response formatter
├── .env                     ✅ Environment config
├── .gitignore              ✅ Git ignore
├── package.json            ✅ Dependencies
└── server.js               ✅ Entry point
```

---

## ✨ Features Implemented

- ✅ JWT Authentication
- ✅ User Registration & Login
- ✅ Restaurant CRUD & Search
- ✅ Advanced Filtering (cuisine, distance, price, rating)
- ✅ Favorites Management
- ✅ History Tracking
- ✅ User Preferences
- ✅ AI Recommendations (based on preferences)
- ✅ Input Validation
- ✅ Error Handling
- ✅ Standardized API Responses
- ✅ MySQL Stored Procedures Integration
- ✅ Optional Authentication (for public endpoints)

---

## 🎯 Next: Phase 3 - Frontend React

Backend API hoàn chỉnh! Sẵn sàng cho Phase 3 - xây dựng React frontend.

**Phase 3 sẽ bao gồm:**
- Setup React app với Create React App
- Bootstrap 5 UI components
- React Router navigation
- Axios API integration
- Login/Register pages
- Restaurant listing & search
- Restaurant detail page
- Favorites & History pages
- Profile management

---

**🎊 Phase 2 Complete! Backend API is ready! 🎊**
