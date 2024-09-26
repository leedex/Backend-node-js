const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Connect to MongoDB without deprecated options
mongoose.connect('mongodb://localhost:27017/expense-tracker');

const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});
const User = mongoose.model('User', UserSchema);

// GET route for /api/register
app.get('/api/register', (req, res) => {
    res.send("Register endpoint - use POST to register a user.");
});

// POST route for user registration
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).send("User registered!");
});

// POST route for user login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.userId = user._id;
        res.send("Login successful!");
    } else {
        res.status(401).send("Invalid credentials");
    }
});

// GET route for user logout
app.get('/api/logout', (req, res) => {
    req.session.destroy();
    res.send("Logged out successfully!");
});

// Start the server
app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
});
