# 🏠 EstateElite - Real Estate Web Application

<div align="center">
  
## 🚀 A Modern Full-Stack Real Estate Platform

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![JWT](https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=json-web-tokens)](https://jwt.io/)

**A complete real estate platform where users can browse, search, and inquire about properties, and admins can manage everything.**

</div>

### 🌟 Find Your Dream Home with EstateElite

[Live Demo](https://real-estateelite.vercel.app/)

---

## 📋 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Folder Structure](#-folder-structure)
- [Environment Variables](#-environment-variables)
- [Admin Panel](#-admin-panel)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 👤 User Side
- **Authentication** - Register/Login with JWT
- **Property Listing** - Browse with filters (location, price, type)
- **Property Details** - Images, map, contact form, WhatsApp button
- **Wishlist** - Save favorite properties
- **Responsive** - Works on mobile, tablet, desktop
- **Dark Mode** - Toggle between light/dark themes

### 👑 Admin Side
- **Dashboard** - View total properties, users, inquiries
- **Property Management** - Add/Edit/Delete properties
- **Image Upload** - Multiple images with Cloudinary
- **User Management** - View and delete users
- **Inquiry Management** - Track and update inquiry status

---

## 🛠️ Tech Stack

| Frontend | Backend | Database | Other |
|----------|---------|----------|-------|
| React | Node.js | MongoDB | JWT |
| Tailwind CSS | Express | Mongoose | Cloudinary |
| React Router | | | Multer |
| Axios | | | |

---

## 🚀 Quick Start

### Prerequisites
```bash
node --version  # v14+
npm --version   # v6+
git --version
```

### 1️⃣ Clone & Install
```bash
# Clone repository
git clone https://github.com/mdtanveer0786/real-estate-app
cd real-estate-app

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials

# Frontend setup
cd ../frontend
npm install
cp .env.example .env
```

### 2️⃣ Database Setup (MongoDB Atlas)
```bash
1. Go to https://mongodb.com/atlas
2. Create free account
3. Build cluster (FREE tier M0)
4. Create database user
5. Whitelist IP: 0.0.0.0/0
6. Get connection string
7. Add to backend/.env
```

### 3️⃣ Run Application
```bash
# Terminal 1 - Backend
cd backend
npm run seed    # Create admin user
npm run dev     # Start server (port 5000)

# Terminal 2 - Frontend
cd frontend
npm run dev     # Start app (port 3000)
```

### 4️⃣ Access
```
Frontend: http://localhost:3000
Backend:  http://localhost:5000/api/health
Admin:    http://localhost:3000/admin
```

---

## 📁 Folder Structure (Simplified)

```
real-estate-app/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Logic for routes
│   │   ├── models/         # Database schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Auth, admin checks
│   │   ├── utils/          # Helper functions
│   │   └── server.js       # Entry point
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI
│   │   ├── pages/          # Page components
│   │   ├── context/        # Auth, Theme, Wishlist
│   │   ├── services/       # API calls
│   │   ├── App.jsx
│   │   └── index.js
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## 🔧 Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 👑 Admin Panel

### Default Admin
After running `npm run seed`:
```
Email:    admin@estateelite.com
Password: admin123
```

### Admin Features
- **Dashboard** - `/admin` - View statistics
- **Properties** - `/admin/properties` - Manage all properties
- **Add Property** - `/admin/add-property` - Create new property
- **Users** - `/admin/users` - View/delete users
- **Inquiries** - `/admin/inquiries` - Manage inquiries

---

## 🚢 Deployment

### Backend (Render)
```bash
1. Push code to GitHub
2. Go to render.com
3. New Web Service → Connect repo
4. Set:
   - Build: npm install
   - Start: npm start
5. Add environment variables
6. Deploy
```

### Frontend (Vercel)
```bash
1. Push code to GitHub
2. Go to vercel.com
3. Import project
4. Set:
   - Framework: Vite
   - VITE_API_URL: your-backend-url
5. Deploy
```

---

## ❓ Common Issues & Fixes

| Problem | Solution |
|---------|----------|
| MongoDB connection fails | Check IP whitelist in Atlas (add 0.0.0.0/0) |
| Login not working | Clear browser localStorage and login again |
| Admin access denied | Check if user role is "admin" in database |
| Images not uploading | Verify Cloudinary credentials |
| CORS error | Check FRONTEND_URL in backend .env |

### Quick Debug
```bash
# Check backend health
curl http://localhost:5000/api/health

# Clear localStorage (in browser console)
localStorage.clear()
```

---

## 📝 API Testing

### Test with curl
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \

```

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m "Add feature"`)
4. Push to branch (`git push origin feature/name`)
5. Open Pull Request

---

## 📄 License

MIT License - Free to use and modify

---

## 📞 Contact

- **Email**: support@estateelite.com
- **GitHub**: [mdtanveer0786](https://github.com/mdtanveer0786)
- **Live Demo**: https://real-estateelite.vercel.app/

---

<div align="center">
  
**⭐ Star this repo if you found it useful!**

Made with ❤️ by [mdtanveer0786]

</div>
```
