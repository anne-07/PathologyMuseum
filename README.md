# Pathology Learning Management System

A comprehensive learning platform for pathology education featuring 3D specimens, digital slides, and interactive learning resources.

## Project Structure

```
pathology-lms/
├── frontend/           # React frontend application
│   ├── public/        # Static files
│   ├── src/           # Source files
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/           # Node.js backend application
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── server.js     # Entry point
│   └── package.json
│
└── package.json      # Root package.json for running both frontend and backend
```

## Getting Started

1. Install dependencies for both frontend and backend:
   ```bash
   npm run install-all
   ```

2. Start both frontend and backend servers:
   ```bash
   npm start
   ```

   This will start:
   - Frontend on http://localhost:3000
   - Backend on http://localhost:5000

## Development

- Frontend (React.js + Tailwind CSS)
  ```bash
  cd frontend
  npm start
  ```

- Backend (Node.js + Express + MongoDB)
  ```bash
  cd backend
  npm run dev
  ```

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
