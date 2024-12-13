require('dotenv').config();
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./config/database');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Import passport config
require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth');
const bookmarkRoutes = require('./routes/bookmarks');
const folderRoutes = require('./routes/folders');
const chatRoutes = require('./routes/chat');

// Initialize express
const app = express();

// Connect to MongoDB
connectDB();

// SSL configuration
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, '../ssl/server.key')),
    cert: fs.readFileSync(path.join(__dirname, '../ssl/server.crt'))
};

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware - MUST be before passport
app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true, // Always use secure cookies with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize passport and session
app.use(passport.initialize());
app.use(passport.session());

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/chat', chatRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Bookmark AI API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);

// Start server
const PORT = process.env.PORT || 5001;
httpsServer.listen(PORT, '0.0.0.0', () => {
    console.log(`HTTPS Server is running on port ${PORT}`);
    console.log(`Server URL: ${process.env.SERVER_URL}`);
    console.log(`Client URL: ${process.env.CLIENT_URL}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});
