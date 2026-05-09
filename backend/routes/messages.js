const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

// Get conversations (list of users you've messaged with)
router.get('/conversations', auth, (req, res) => {
  const conversations = db.prepare(`
    SELECT 
      u.id as user_id, u.name, u.avatar, u.university,
      (SELECT content FROM messages WHERE (sender_id = ? AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = ?) ORDER BY created_at DESC LIMIT 1) as last_message,
      (SELECT created_at FROM messages WHERE (sender_id = ? AND receiver_id = u.id) OR (sender_id = u.id AND receiver_id = ?) ORDER BY created_at DESC LIMIT 1) as last_message_time,
      (SELECT COUNT(*) FROM messages WHERE sender_id = u.id AND receiver_id = ? AND is_read = 0) as unread_count
    FROM (
      SELECT sender_id as other_id FROM messages WHERE receiver_id = ?
      UNION
      SELECT receiver_id as other_id FROM messages WHERE sender_id = ?
    ) as msg_users
    JOIN users u ON u.id = msg_users.other_id
    ORDER BY last_message_time DESC
  `).all(req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id, req.user.id);
  res.json(conversations);
});

// Get messages with a specific user
router.get('/:userId', auth, (req, res) => {
  const messages = db.prepare(`
    SELECT m.*, u.name as sender_name, u.avatar as sender_avatar
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at ASC
  `).all(req.user.id, req.params.userId, req.params.userId, req.user.id);

  // Mark messages as read
  db.prepare('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0').run(req.params.userId, req.user.id);

  res.json(messages);
});

// Send message
router.post('/', auth, (req, res) => {
  const { receiver_id, content, task_id } = req.body;
  if (!receiver_id || !content) {
    return res.status(400).json({ message: 'Receiver and content are required' });
  }

  const result = db.prepare('INSERT INTO messages (sender_id, receiver_id, content, task_id) VALUES (?, ?, ?, ?)')
    .run(req.user.id, receiver_id, content, task_id || null);
  res.status(201).json({ message: 'Message sent', id: result.lastInsertRowid });
});

// Mark messages as read
router.put('/read/:userId', auth, (req, res) => {
  db.prepare('UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0').run(req.params.userId, req.user.id);
  res.json({ message: 'Messages marked as read' });
});

module.exports = router;
