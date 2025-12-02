# 🚀 GohanGo - Complete Deployment Guide

## 📋 Table of Contents
- [Docker Deployment](#docker-deployment)
- [Railway Deployment](#railway-deployment)
- [Render Deployment](#render-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)

---

## 🐳 Docker Deployment

### Prerequisites
- Docker Desktop installed
- Docker Compose installed

### Quick Start
```bash
# Clone repository
git clone <your-repo-url>
cd gohan-go-app

# Create .env file
cp .env.example .env

# Edit .env with your values
# DB_PASSWORD, JWT_SECRET, etc.

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes (reset database)
docker-compose down -v
```

### Services
- **Frontend**: http://localhost (port 80)
- **Backend**: http://localhost:5000
- **MySQL**: localhost:3306

### Useful Commands
```bash
# Rebuild containers
docker-compose up -d --build

# View service status
docker-compose ps

# Execute commands in backend
docker-compose exec backend npm run test

# Database backup
docker-compose exec db mysqldump -u root -p gohan_go > backup.sql

# Database restore
docker-compose exec -T db mysql -u root -p gohan_go < backup.sql
```

---

## 🚂 Railway Deployment

### Backend Deployment

1. **Create New Project**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub"

2. **Configure Backend**
   ```bash
   # Select backend folder as root
   Root Directory: backend
   
   # Build Command (auto-detected)
   npm install
   
   # Start Command
   node server.js
   ```

3. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=<railway-mysql-host>
   DB_PORT=3306
   DB_USER=<mysql-user>
   DB_PASSWORD=<mysql-password>
   DB_NAME=gohan_go
   JWT_SECRET=<your-secret-key>
   JWT_EXPIRE=7d
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

4. **Add MySQL Database**
   - Click "New" → "Database" → "MySQL"
   - Copy connection details to backend environment variables
   - Import schema using Railway CLI:
     ```bash
     railway login
     railway link
     railway run mysql -u root -p < database/schema.sql
     ```

### Frontend Deployment (Vercel)

1. **Deploy to Vercel**
   - Go to https://vercel.com
   - Import Git Repository
   - Select `frontend` as root directory

2. **Build Settings**
   ```
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   Install Command: npm install
   ```

3. **Environment Variables**
   ```
   REACT_APP_API_URL=https://your-backend.railway.app/api
   ```

---

## 🎨 Render Deployment

### Backend on Render

1. **Create Web Service**
   - Go to https://render.com
   - New → Web Service
   - Connect GitHub repository

2. **Configuration**
   ```
   Name: gohan-go-backend
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: node server.js
   Instance Type: Free
   ```

3. **Environment Variables**
   ```
   NODE_ENV=production
   PORT=5000
   DB_HOST=<render-postgres-host>
   DB_USER=<db-user>
   DB_PASSWORD=<db-password>
   DB_NAME=gohan_go
   JWT_SECRET=<random-secret>
   CORS_ORIGIN=https://your-app.vercel.app
   ```

4. **Add MySQL Database**
   - Render doesn't offer MySQL, use PostgreSQL or external MySQL
   - Alternative: Use PlanetScale (free MySQL)

### Frontend on Vercel
Same as Railway frontend deployment above.

---

## ⚡ Vercel Deployment (Full Stack)

### Backend as Serverless Functions

1. **Create `api` folder structure**
   ```
   frontend/
   ├── api/
   │   ├── auth.js
   │   ├── restaurants.js
   │   ├── favorites.js
   │   └── ...
   └── package.json
   ```

2. **Convert Express routes to Vercel functions**
   ```javascript
   // api/restaurants.js
   module.exports = async (req, res) => {
     // Handle request
   };
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Limitations
- Serverless functions have cold starts
- No persistent MySQL connection
- Better to use Vercel for frontend + Railway/Render for backend

---

## 🔐 Environment Variables

### Backend (.env)
```env
# Server
NODE_ENV=production
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=gohan_go

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000,https://your-production-url.com
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Production Frontend (.env.production)
```env
REACT_APP_API_URL=https://your-backend-url.railway.app/api
```

---

## 📊 Database Setup

### Option 1: Railway MySQL
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Import schema
railway run mysql -u root -p$MYSQL_PASSWORD < database/schema.sql

# Create demo user
railway run node backend/create-demo-user.js
```

### Option 2: PlanetScale (Free MySQL)
```bash
# Install PlanetScale CLI
brew install planetscale/tap/pscale

# Login
pscale auth login

# Create database
pscale database create gohan-go

# Connect and import
pscale connect gohan-go main --execute "source database/schema.sql"
```

### Option 3: AWS RDS MySQL
1. Create RDS MySQL instance
2. Configure security groups (allow your IP)
3. Connect using MySQL client
4. Import schema

---

## 🔍 Health Checks

### Backend Health
```bash
curl http://localhost:5000/
# Should return: { success: true, message: "GohanGo API Server is running!" }
```

### Frontend Health
```bash
curl http://localhost/health
# Should return: healthy
```

### Database Health
```bash
docker-compose exec db mysqladmin ping -h localhost -u root -p
# Should return: mysqld is alive
```

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Common issues:
# 1. Database not ready - wait for DB healthcheck
# 2. Wrong environment variables
# 3. Port already in use
```

### Frontend build fails
```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build

# Check Node version
node --version  # Should be 18+
```

### Database connection failed
```bash
# Test connection
mysql -h localhost -u root -p

# Check environment variables
echo $DB_HOST
echo $DB_USER

# Reset database
docker-compose down -v
docker-compose up -d
```

---

## 📈 Performance Optimization

### Backend
- Enable PM2 for process management
- Use Redis for caching
- Enable gzip compression
- Add rate limiting

### Frontend
- Enable code splitting
- Optimize images (WebP format)
- Use CDN for static assets
- Enable service worker for PWA

### Database
- Add indexes for frequently queried columns
- Use connection pooling
- Enable query caching
- Regular ANALYZE and OPTIMIZE

---

## 🔒 Security Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong database passwords
- [ ] Enable HTTPS in production
- [ ] Set secure CORS_ORIGIN
- [ ] Enable rate limiting
- [ ] Add security headers
- [ ] Sanitize user inputs
- [ ] Use prepared statements
- [ ] Enable SQL injection protection
- [ ] Regular security updates

---

## 📞 Support

Issues? Check:
1. Logs: `docker-compose logs -f`
2. Environment variables
3. Database connection
4. Port availability
5. GitHub Issues

---

## 🎉 Deployment Complete!

Your GohanGo application is now deployed and ready for production use!

**Next Steps:**
1. Configure custom domain
2. Enable SSL/HTTPS
3. Set up monitoring (e.g., Sentry)
4. Configure backups
5. Add analytics

---

**Built with ❤️ by GitHub Copilot**  
**Version**: 1.7.0  
**Last Updated**: December 2025
