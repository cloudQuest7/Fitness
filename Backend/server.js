import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import session from 'express-session';
import connectDB from './config/db.js';
import User from './models/user.js';

// Connect to MongoDB
connectDB();

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(join(__dirname, "public")));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

app.set("view engine", "ejs");

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

// Registration route - redirects to login after successful registration
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User already exists' 
            });
        }

        // Create new user
        await User.create({ username, email, password });
        
        // Redirect to login page after successful registration
        res.json({ 
            success: true, 
            redirect: '/login',
            message: 'Registration successful! Please login.' 
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ 
            success: false, 
            message: 'Registration failed' 
        });
    }
});

// Login route - checks credentials and renders home page
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user and verify credentials
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).render('login', { 
                error: 'User not found'
            });
        }

        // Check password
        if (user.password !== password) {
            return res.status(401).render('login', { 
                error: 'Invalid password'
            });
        }

        // Set session and render home page
        req.session.userId = user._id;
        res.render('home', {
            user,
            username: user.username,
            email: user.email
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(400).render('login', { 
            error: 'Login failed'
        });
    }
});

// Protected home route
app.get('/home', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/login');
        }

        res.render('home', {
            user,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        console.error('Error accessing home:', error);
        res.redirect('/login');
    }
});

// Fitness page route
app.get('/fitness', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }

    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/login');
        }

        res.render('fitness', {
            user,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        console.error('Error accessing fitness page:', error);
        res.redirect('/home');
    }
});

// Add this route to your server.js
app.get('/setting', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/login');
        }
        res.render('setting', { user });
    } catch (error) {
        console.error('Error accessing settings:', error);
        res.redirect('/home');
    }
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/login');
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});