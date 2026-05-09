const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

// Get all skills with user info
router.get('/', (req, res) => {
  const { category, search, level } = req.query;
  let query = `
    SELECT s.*, u.name as user_name, u.avatar as user_avatar, u.university
    FROM skills s
    JOIN users u ON s.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (category) { query += ' AND s.category = ?'; params.push(category); }
  if (search) { query += ' AND (s.title LIKE ? OR s.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (level) { query += ' AND s.level = ?'; params.push(level); }

  query += ' ORDER BY s.created_at DESC';
  const skills = db.prepare(query).all(...params);
  res.json(skills);
});

// Get skills by user
router.get('/user/:userId', (req, res) => {
  const skills = db.prepare('SELECT * FROM skills WHERE user_id = ? ORDER BY created_at DESC').all(req.params.userId);
  res.json(skills);
});

// Create skill
router.post('/', auth, (req, res) => {
  const { title, description, category, level } = req.body;
  if (!title || !description || !category) {
    return res.status(400).json({ message: 'Title, description, and category are required' });
  }
  const result = db.prepare('INSERT INTO skills (user_id, title, description, category, level) VALUES (?, ?, ?, ?, ?)')
    .run(req.user.id, title, description, category, level || 'Intermediate');
  res.status(201).json({ message: 'Skill created', id: result.lastInsertRowid });
});

// Update skill
router.put('/:id', auth, (req, res) => {
  const skill = db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id);
  if (!skill) return res.status(404).json({ message: 'Skill not found' });
  if (skill.user_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

  const { title, description, category, level } = req.body;
  db.prepare('UPDATE skills SET title = ?, description = ?, category = ?, level = ? WHERE id = ?')
    .run(title, description, category, level, req.params.id);
  res.json({ message: 'Skill updated' });
});

// Delete skill
router.delete('/:id', auth, (req, res) => {
  const skill = db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id);
  if (!skill) return res.status(404).json({ message: 'Skill not found' });
  if (skill.user_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

  db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id);
  res.json({ message: 'Skill deleted' });
});

// Get categories
router.get('/categories', (req, res) => {
  const categories = ['Web Development', 'Graphic Design', 'Content Writing', 'Video Editing', 'Tutoring', 'Data Science', 'Marketing', 'Mobile Development', 'Music', 'Photography', 'Other'];
  res.json(categories);
});

module.exports = router;
