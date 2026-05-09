const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

// Get ratings for a user
router.get('/user/:userId', (req, res) => {
  const ratings = db.prepare(`
    SELECT r.*, u.name as from_user_name, u.avatar as from_user_avatar, t.title as task_title
    FROM ratings r
    JOIN users u ON r.from_user_id = u.id
    JOIN tasks t ON r.task_id = t.id
    WHERE r.to_user_id = ?
    ORDER BY r.created_at DESC
  `).all(req.params.userId);

  const avgRating = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as count FROM ratings WHERE to_user_id = ?').get(req.params.userId);
  res.json({ ratings, average: avgRating.avg || 0, count: avgRating.count });
});

// Create rating
router.post('/', auth, (req, res) => {
  const { to_user_id, task_id, rating, comment } = req.body;
  if (!to_user_id || !task_id || !rating) {
    return res.status(400).json({ message: 'User, task, and rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
    db.prepare('INSERT INTO ratings (from_user_id, to_user_id, task_id, rating, comment) VALUES (?, ?, ?, ?, ?)')
      .run(req.user.id, to_user_id, task_id, rating, comment || '');
    res.status(201).json({ message: 'Rating submitted' });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ message: 'You have already rated this task' });
    }
    throw error;
  }
});

module.exports = router;
