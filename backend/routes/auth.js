const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// Register
router.post('/register', (req, res) => {
  const { name, email, password, bio, university, major, semester } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (name, email, password, bio, university, major, semester) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(name, email, hashedPassword, bio || '', university || '', major || '', semester || '');

  const token = jwt.sign({ id: result.lastInsertRowid, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    message: 'User registered successfully',
    token,
    user: { id: result.lastInsertRowid, name, email, bio: bio || '', university: university || '', major: major || '', semester: semester || '' }
  });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email, bio: user.bio, university: user.university, major: user.major, semester: user.semester, avatar: user.avatar }
  });
});

module.exports = router;
