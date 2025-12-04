# 🍱 GohanGo - Restaurant Finder Web App

<div align="center">

**Find Your Perfect Restaurant Match**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18.2-lightgrey.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3.2-purple.svg)](https://getbootstrap.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Quick Start](#-quick-start) • [API Docs](#-api-documentation) • [Deployment](#-deployment)

</div>

Link database: https://drive.google.com/drive/u/0/folders/1Ffjpj9qHjeDF1galtNHulALlS6PRHcXF

---

## 📖 About

**GohanGo** là ứng dụng web giúp người dùng tìm kiếm nhà hàng phù hợp dựa trên vị trí, loại ẩm thực, giá cả và đánh giá. Với AI-powered recommendations, ứng dụng gợi ý các nhà hàng phù hợp với sở thích cá nhân.

---

## ✨ Features

- 🔐 **User Authentication** - JWT-based register, login, reset password
- 🔍 **Advanced Search** - Filter by name, cuisine, price, distance, rating
- 🤖 **AI Recommendations** - Smart suggestions based on history & preferences
- ❤️ **Favorites System** - Save and manage favorite restaurants
- 📜 **History Tracking** - Track recently viewed restaurants
- 👤 **User Profile** - Manage personal info and preferences
- 📱 **Responsive Design** - Works on all devices
- 🎨 **Modern UI** - Bootstrap 5 with custom animations

---

## 🛠 Tech Stack

### Frontend
- React 18.2.0
- React Router DOM 6.20.1
- Bootstrap 5.3.2
- Axios 1.6.2
- React Toastify 11.0.5

### Backend
- Node.js 18+
- Express 4.18.2
- MySQL 8.0
- JWT (jsonwebtoken 9.0.2)
- bcryptjs 2.4.3

### DevOps
- Docker & docker-compose
- nginx (production)

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and navigate
git clone <your-repo-url>
cd gohan-go-app

# Create environment file
cp backend/.env.example backend/.env
# Edit .env with your MySQL password and JWT secret

# Start all services
docker-compose up -d

# Access:
# Frontend: http://localhost
# Backend: http://localhost:5000
# MySQL: localhost:3306
```

### Option 2: Manual Setup

**1. Database**
```bash
# Start MySQL (XAMPP or Windows service)

# Import schema
mysql -u root -p < database/schema.sql
```

**2. Backend**
```bash
cd backend
npm install

# Create .env
cp .env.example .env
# Edit: DB_PASSWORD, JWT_SECRET

npm run dev
# Runs on http://localhost:5000
```

**3. Frontend**
```bash
cd frontend
npm install

# Create .env
cp .env.example .env
# REACT_APP_API_URL=http://localhost:5000/api

npm start
# Runs on http://localhost:3000
```

---

## 📁 Project Structure

```
gohan-go-app/
├── backend/              # Node.js API
│   ├── controllers/      # Business logic
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   └── server.js        # Entry point
├── frontend/            # React app
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   └── services/    # API services
│   └── public/
├── database/            # SQL files
│   ├── schema.sql       # Database structure
│   └── seed-data.sql    # Sample data
└── docker-compose.yml   # Docker config
```

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

**Register**
```http
POST /api/auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```

**Login**
```http
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### Restaurants

**Get All**
```http
GET /api/restaurants
Authorization: Bearer <token>
```

**Search**
```http
GET /api/restaurants/search?keyword=sushi&cuisine=日本料理&maxPrice=2000
Authorization: Bearer <token>
```

**Get by ID**
```http
GET /api/restaurants/:id
Authorization: Bearer <token>
```

### Favorites

**Get Favorites**
```http
GET /api/favorites
Authorization: Bearer <token>
```

**Add to Favorites**
```http
POST /api/favorites/:restaurantId
Authorization: Bearer <token>
```

### Recommendations

**Get AI Recommendations**
```http
GET /api/recommendations
Authorization: Bearer <token>
```

**Update Preferences**
```http
POST /api/recommendations/preferences
{
  "favorite_cuisines": ["日本料理", "イタリアン"],
  "max_price": 3000,
  "max_distance": 2000
}
```

Full API docs: 28 endpoints available. See [API Reference](#) for details.

---

## 🧪 Testing

```bash
cd backend
node test-api.js
```

**Results:**
- ✅ 11/17 tests passing (64.7%)
- Tests: Auth, Restaurants, Favorites, History, Profile

---

## 🚢 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Production Deployment

See [DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md) for guides:
- Railway (Backend)
- Vercel (Frontend)
- Render (Full Stack)
- AWS/GCP/Azure

**Environment Variables:**

Backend:
```env
NODE_ENV=production
DB_HOST=your-host
DB_PASSWORD=your-password
JWT_SECRET=your-secret-min-32-chars
CORS_ORIGIN=https://your-frontend.com
```

Frontend:
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

---

## 🌟 Key Features Details

### AI Recommendations Algorithm
- Base Score: Rating × 10
- Cuisine Match: +30 points
- History Similarity: +20 points
- Preference Match: +25 points
- Distance: +15 points
- Budget: +10 points
- Popularity: +10 points
- Excellence: +15 points for 4.5+ rating

### Advanced Search
- Real-time search
- Multiple filters (cuisine, price, distance, rating)
- Sort options
- Active filter badges

---

## 📊 Database Schema

**5 Tables:**
- `users` - User accounts
- `restaurants` - Restaurant data (23 sample restaurants)
- `favorites` - User favorites
- `history` - View history
- `user_preferences` - Saved preferences

See `database/schema.sql` for complete structure.

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push branch (`git push origin feature/NewFeature`)
5. Open Pull Request

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file.

---

## 👥 Authors

Built with ❤️ using GitHub Copilot

---

## 🗺 Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time reservations
- [ ] Table booking system
- [ ] User reviews & ratings
- [ ] Map integration (Google Maps)
- [ ] Multi-language (EN/JP)
- [ ] Dark mode
- [ ] PWA support

---

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: [DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md)

---

<div align="center">

**[⬆ Back to Top](#-gohango---restaurant-finder-web-app)**

**Star ⭐ this repo if you find it helpful!**

</div>
