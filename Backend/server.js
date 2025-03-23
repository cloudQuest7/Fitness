import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import session from 'express-session';
import User from './models/user.js';

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/fitraDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(join(__dirname, "public")));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).send('User not found');
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        
        if (!isMatch) {
            return res.status(400).send('Invalid password');
        }

        req.session.userId = user._id;
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error logging in');
    }
});

// Register routes
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();
        
        req.session.userId = user._id;
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Error registering user');
    }
});

// Protected route middleware
const requireAuth = async (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    try {
        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/login');
        }
        req.user = user;
        next();
    } catch (error) {
        res.redirect('/login');
    }
};

// Protected dashboard route
app.get('/dashboard', requireAuth, (req, res) => {
    res.render('dashboard', { user: req.user });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});