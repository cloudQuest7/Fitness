import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import session from 'express-session';
import connectDB from './config/db.js';
import User from './models/user.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Connect to MongoDB
connectDB();

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Add this after your existing uploadDir setup
const meditationDir = path.join(__dirname, 'public', 'images', 'meditation');
if (!fs.existsSync(meditationDir)) {
    fs.mkdirSync(meditationDir, { recursive: true });
    console.log('Created meditation images directory:', meditationDir);
}

// Add after the meditation directory creation
try {
    // Set directory permissions (readable/writable)
    fs.chmodSync(meditationDir, 0o755);
    console.log('Set permissions for meditation directory');
} catch (error) {
    console.error('⚠️ Error setting directory permissions:', error.message);
    // Continue running the app even if permissions fail
}

// Middleware
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(join(__dirname, "public")));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB limit
    },
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only JPEG, JPG, and PNG files are allowed'));
    }
});

// Add static middleware for serving uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Add this middleware to track current path
app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
});

// Add this before your routes
app.use((req, res, next) => {
    // Extract the current page from the URL
    res.locals.activePage = req.path.substring(1) || 'home';
    next();
});

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

// Add this route with your other routes
app.get('/yoga', async (req, res) => {
    try {
        let user = null;
        if (req.session.userId) {
            user = await User.findById(req.session.userId);
        }
        
        res.render('yoga', {
            user: user,
            activePage: 'yoga'
        });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/login');
    }
});

app.get('/session/:id', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.redirect('/login');
        }

        res.render('session', {
            user,
            sessionId: req.params.id
        });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/yoga');
    }
});

app.get('/meditation', async (req, res) => {
    try {
        let user = null;
        if (req.session.userId) {
            user = await User.findById(req.session.userId);
        }

        res.render('meditation', {
            user,
            meditations: [], // Your meditation data here
            activePage: 'meditation', // Add this line to fix the error
            title: 'Meditation - Fitra'
        });
    } catch (error) {
        console.error('Error:', error);
        res.redirect('/home');
    }
});

// Profile picture upload route
app.post('/api/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete old profile picture if exists
        if (user.profilePic) {
            const oldFilePath = path.join(__dirname, 'public', user.profilePic);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        // Update user's profile picture path
        user.profilePic = `/uploads/${req.file.filename}`;
        await user.save();

        res.json({ 
            message: 'Profile picture uploaded successfully',
            profilePic: user.profilePic 
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
});

// Delete profile picture route
app.delete('/api/delete-profile-pic', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Delete the file if it exists
        if (user.profilePic) {
            const filePath = path.join(__dirname, 'public', user.profilePic);
            fs.unlink(filePath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('File deletion error:', err);
                }
            });
        }

        user.profilePic = null;
        await user.save();

        res.json({ message: 'Profile picture deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Delete failed' });
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