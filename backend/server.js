require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { User, Specimen, Slide } = require('./models');
const authRoutes = require('./routes/auth.routes');
const specimenRoutes = require('./routes/specimen.routes');
const slideRoutes = require('./routes/slide.routes');

const app = express();

// Configure CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'], // Add your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const MONGODB_URI = 'mongodb+srv://annie:annie25@data.d1uty.mongodb.net/pathology_museum?retryWrites=true&w=majority&appName=Data';

console.log('Attempting to connect to MongoDB Atlas...');
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
  .then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas');
    console.log('📁 Database: pathology_museum');
    console.log('🔌 Connection state:', mongoose.connection.readyState);
    console.log('📚 Models loaded:', Object.keys({ User, Specimen, Slide }).join(', '));
    startServer();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Monitor database connection
mongoose.connection.on('error', err => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
  // Attempt to reconnect
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    family: 4
  }).catch(err => console.error('❌ Reconnection failed:', err.message));
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully');
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/specimens', specimenRoutes);
app.use('/api/slides', slideRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working',
    models: {
      user: !!User,
      specimen: !!Specimen,
      slide: !!Slide
    },
    database: {
      connected: mongoose.connection.readyState === 1
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: Object.values(err.errors).map(e => e.message).join(', ')
    });
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      status: 'error',
      message: 'Duplicate key error'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
});

// Start server function
function startServer() {
  const PORT = process.env.PORT || 5001;
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Trying ${PORT + 1}...`);
      server.close();
      app.listen(PORT + 1, () => {
        console.log(`🚀 Server is running on port ${PORT + 1}`);
        console.log(`📡 API endpoints available at http://localhost:${PORT + 1}/api`);
      });
    } else {
      console.error('❌ Server error:', err.message);
    }
  });
}
