require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieparser = require('cookie-parser');

const { User, Specimen, Slide, Notification } = require('./models');
const authRoutes = require('./routes/auth.routes');
const specimenRoutes = require('./routes/specimen.routes');
const slideRoutes = require('./routes/slide.routes');
const bookmarkRoutes = require('./routes/bookmark.routes');
const discussionRoutes = require('./routes/discussion.routes');
const notificationRoutes = require('./routes/notification.routes');
// const userRoutes = require('./routes/userRoutes'); 

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
// Cookie parser (required for reading access/refresh cookies)
app.use(cookieparser());

// Register API routes
app.use('/api/bookmarks', bookmarkRoutes);

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

console.log('Attempting to connect to MongoDB Atlas...');
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  family: 4
})
  .then(() => {
    console.log(' Successfully connected to MongoDB Atlas');
    console.log(' Database: pathology_museum');
    console.log(' Connection state:', mongoose.connection.readyState);
    console.log(' Models loaded:', Object.keys({ User, Specimen, Slide, Notification }).join(', '));
    startServer();
  })
  .catch((err) => {
    console.error(' MongoDB connection error:', err.message);
    process.exit(1);
  });

// Monitor database connection
mongoose.connection.on('error', err => {
  console.error(' MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 MongoDB disconnected');
  // Attempt to reconnect
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    family: 4
  }).catch(err => console.error(' Reconnection failed:', err.message));
});

mongoose.connection.on('connected', () => {
  console.log(' MongoDB connected successfully');
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
app.use('/api/filter-options', require('./routes/filterOption.routes'));
app.use('/api/upload', require('./routes/upload.routes'));
app.use('/api/discussions', discussionRoutes);
app.use('/api/notifications', notificationRoutes);
// app.use('/api/users', userRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working',
    models: {
      user: !!User,
      specimen: !!Specimen,
      slide: !!Slide,
      notification: !!Notification
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
  console.error(' Error:', err);

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
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    console.log(` Server is running on port ${PORT}`);
    
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(` Port ${PORT} is already in use. Trying ${PORT + 1}...`);
      server.close();
      app.listen(PORT + 1, () => {
        console.log(` Server is running on port ${PORT + 1}`);
        
      });
    } else {
      console.error(' Server error:', err.message);
    }
  });
}
