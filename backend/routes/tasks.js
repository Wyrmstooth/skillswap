const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');

// Get all tasks
router.get('/', (req, res) => {
  const { category, status, search } = req.query;
  let query = `
    SELECT t.*, u.name as user_name, u.avatar as user_avatar, u.university
    FROM tasks t
    JOIN users u ON t.user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (category) { query += ' AND t.category = ?'; params.push(category); }
  if (status) { query += ' AND t.status = ?'; params.push(status); }
  if (search) { query += ' AND (t.title LIKE ? OR t.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

  query += ' ORDER BY t.created_at DESC';
  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});

// Get tasks by user
router.get('/user/:userId', (req, res) => {
  const tasks = db.prepare('SELECT t.*, u.name as user_name FROM tasks t JOIN users u ON t.user_id = u.id WHERE t.user_id = ? ORDER BY t.created_at DESC').all(req.params.userId);
  res.json(tasks);
});

// Get single task
router.get('/:id', (req, res) => {
  const task = db.prepare(`
    SELECT t.*, u.name as user_name, u.avatar as user_avatar, u.university, u.bio as user_bio
    FROM tasks t
    JOIN users u ON t.user_id = u.id
    WHERE t.id = ?
  `).get(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

// Create task
router.post('/', auth, (req, res) => {
  const { title, description, category, budget, deadline } = req.body;
  if (!title || !description || !category) {
    return res.status(400).json({ message: 'Title, description, and category are required' });
  }
  const result = db.prepare('INSERT INTO tasks (user_id, title, description, category, budget, deadline) VALUES (?, ?, ?, ?, ?, ?)')
    .run(req.user.id, title, description, category, budget || 'Skill Exchange', deadline || '');
  res.status(201).json({ message: 'Task created', id: result.lastInsertRowid });
});

// Update task
router.put('/:id', auth, (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (task.user_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

  const { title, description, category, budget, status, deadline } = req.body;
  db.prepare('UPDATE tasks SET title = ?, description = ?, category = ?, budget = ?, status = COALESCE(?, status), deadline = ? WHERE id = ?')
    .run(title, description, category, budget, status, deadline, req.params.id);
  res.json({ message: 'Task updated' });
});

// Accept task
router.post('/:id/accept', auth, (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (task.status !== 'open') return res.status(400).json({ message: 'Task is not open' });
  if (task.user_id === req.user.id) return res.status(400).json({ message: 'Cannot accept your own task' });

  db.prepare('UPDATE tasks SET status = ?, assigned_to = ? WHERE id = ?').run('in-progress', req.user.id, req.params.id);
  res.json({ message: 'Task accepted' });
});

// Complete task
router.post('/:id/complete', auth, (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (task.user_id !== req.user.id && task.assigned_to !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  db.prepare('UPDATE tasks SET status = ? WHERE id = ?').run('completed', req.params.id);
  res.json({ message: 'Task marked as completed' });
});

// Delete task
router.delete('/:id', auth, (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  if (task.user_id !== req.user.id) return res.status(403).json({ message: 'Not authorized' });

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted' });
});

module.exports = router;
