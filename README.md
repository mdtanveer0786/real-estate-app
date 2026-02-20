# EstateElite - Real Estate Web Application

A full-stack real estate web application built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

### User Side
- 🏠 Home page with hero section and property search
- 🔍 Property listing with advanced filters
- 📱 Property details with image gallery and Google Maps
- 💖 Save properties to wishlist
- 📝 Contact form and WhatsApp integration
- 🔐 User authentication (register/login)
- 🌓 Dark/Light mode toggle

### Admin Side
- 📊 Dashboard with statistics
- 🏢 CRUD operations for properties
- 📸 Multiple image upload with Cloudinary
- 👥 User management
- 💬 Inquiry management

## Tech Stack

- **Frontend**: React, Tailwind CSS, Framer Motion, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Upload**: Cloudinary
- **Deployment**: Vercel (frontend), Render (backend)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/real-estate-app.git
cd real-estate-app

cd backend
npm install

cd frontend
npm install

Backend (.env):

PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000

Frontend (.env):

VITE_API_URL=http://localhost:5000/api
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key


Run the application

Backend:

cd backend
npm run dev

Frontend:

cd frontend
npm run dev