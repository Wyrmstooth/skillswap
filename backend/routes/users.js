const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

// Get current user profile
router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, bio, avatar, university, major, semester, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Get user by ID
router.get('/:id', (req, res) => {
  const user = db.prepare('SELECT id, name, email, bio, avatar, university, major, semester, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Update profile
router.put('/me', auth, (req, res) => {
  const { name, bio, university, major, semester } = req.body;
  db.prepare('UPDATE users SET name = COALESCE(?, name), bio = COALESCE(?, bio), university = COALESCE(?, university), major = COALESCE(?, major), semester = COALESCE(?, semester) WHERE id = ?')
    .run(name, bio, university, major, semester, req.user.id);
  res.json({ message: 'Profile updated' });
});

// Get all users (for browsing)
router.get('/', auth, (req, res) => {
  const users = db.prepare('SELECT id, name, email, bio, avatar, university, major, semester FROM users WHERE id != ?').all(req.user.id);
  res.json(users);
});

module.exports = router;
