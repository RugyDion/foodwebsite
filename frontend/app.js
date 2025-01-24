require('dotenv').config(); // Ensure this is at the top of your file

const express = require('express');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const RedisStore = require('connect-redis').default;
const redis = require('redis');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/User'); // Import the User model

const app = express();

// Initialize Redis client
const redisClient = redis.createClient({
    url: 'redis://localhost:6379',
    retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
            console.error('Redis connection refused');
            return new Error('Redis connection refused');
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            console.error('Redis retry time exhausted');
            return new Error('Retry time exhausted');
        }
        if (options.attempt > 10) {
            console.error('Too many Redis attempts');
            return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
    }
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Session configuration
app.use(session({
    store: new RedisStore({ client: redisClient }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'Strict',
        maxAge: 1000 * 60 * 30 // 30 minutes
    }
}));

// CORS configuration
app.use(cors({
    origin: 'https://localhost:8443',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/foodwebsite')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Helmet for security headers
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://localhost:8443"],
        styleSrc: ["'self'", "https://localhost:8443", "'unsafe-inline'"],
        scriptSrc: ["'self'", "https://localhost:8443", "'unsafe-inline'", "'unsafe-eval'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "https://localhost:8443"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"]
    }
}));

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
    if (!req.secure && process.env.NODE_ENV === 'production') {
        return res.redirect('https://' + req.get('Host') + req.url);
    }
    next();
});

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve the HTML files
app.get('/admin-register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-register.html'));
});

app.get('/admin-login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin-login.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, 'favicon_io', 'favicon.ico'));
});

// Middleware to validate the token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = user;
        next();
    });
};

app.post('/admin/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required.' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({
            username,
            password: hashedPassword
        });
        await newUser.save();

        res.status(201).json({ message: 'Registration successful!' });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// JWT Token generation function
const generateToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });
};

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        const token = generateToken({ username: user.username });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid login credentials' });
    }
});

app.post('/admin/reset-user-data', authenticateToken, async (req, res) => {
    try {
        // Logic to reset user data, e.g., clearing all users from the database
        const result = await User.deleteMany({}); // Deletes all users

        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'User data reset successful!' });
        } else {
            res.status(400).json({ message: 'No user data found to reset.' });
        }
    } catch (error) {
        console.error('Error during user data reset:', error);
        res.status(500).json({ message: 'Failed to reset user data.' });
    }
});

// Define paths to key and certificate files
const keyPath = path.join(__dirname, 'private-key.pem');
const certPath = path.join(__dirname, 'certificate.pem');

// Check if files exist (optional, for debugging)
if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
    console.error('Key or certificate file not found');
    process.exit(1);
}

const key = fs.readFileSync(path.join(__dirname, 'private-key.pem'), 'utf8');
const cert = fs.readFileSync(path.join(__dirname, 'certificate.pem'), 'utf8');

const options = {
    key: key,
    cert: cert
};

https.createServer(options, app).listen(8443, () => {
    console.log('HTTPS Server is running on port 8443');
});
