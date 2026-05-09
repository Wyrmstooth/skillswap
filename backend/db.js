const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'db', 'skillswap.db');
const db = new Database(dbPath);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    bio TEXT DEFAULT '',
    avatar TEXT DEFAULT '',
    university TEXT DEFAULT '',
    major TEXT DEFAULT '',
    semester TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT DEFAULT 'Intermediate',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    budget TEXT DEFAULT 'Skill Exchange',
    status TEXT DEFAULT 'open',
    assigned_to INTEGER DEFAULT NULL,
    deadline TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    task_id INTEGER DEFAULT NULL,
    content TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user_id INTEGER NOT NULL,
    to_user_id INTEGER NOT NULL,
    task_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    UNIQUE(from_user_id, to_user_id, task_id)
  );
`);

// Seed demo data if empty
const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (userCount.count === 0) {
  const insertUser = db.prepare('INSERT INTO users (name, email, password, bio, university, major, semester) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insertSkill = db.prepare('INSERT INTO skills (user_id, title, description, category, level) VALUES (?, ?, ?, ?, ?)');
  const insertTask = db.prepare('INSERT INTO tasks (user_id, title, description, category, budget, status, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)');

  const hashedPassword = bcrypt.hashSync('password123', 10);

  // Demo users
  const users = [
    { name: 'Ayesha Khan', email: 'ayesha@demo.com', bio: 'Full-stack developer passionate about web technologies', university: 'FAST-NUCES', major: 'Computer Science', semester: '6th' },
    { name: 'Ali Hassan', email: 'ali@demo.com', bio: 'Graphic designer with 3 years of experience', university: 'NUST', major: 'Design', semester: '4th' },
    { name: 'Sara Ahmed', email: 'sara@demo.com', bio: 'Content writer and social media manager', university: 'LUMS', major: 'Media Studies', semester: '5th' },
    { name: 'Hamza Malik', email: 'hamza@demo.com', bio: 'Video editor and motion graphics artist', university: 'IBA', major: 'Media Sciences', semester: '7th' },
    { name: 'Fatima Noor', email: 'fatima@demo.com', bio: 'Math tutor and data science enthusiast', university: 'COMSATS', major: 'Mathematics', semester: '3rd' }
  ];

  const userIds = [];
  users.forEach(u => {
    const result = insertUser.run(u.name, u.email, hashedPassword, u.bio, u.university, u.major, u.semester);
    userIds.push(result.lastInsertRowid);
  });

  // Demo skills
  const skills = [
    { userId: userIds[0], title: 'React.js Development', description: 'I can build modern React applications with hooks, context, and state management.', category: 'Web Development', level: 'Advanced' },
    { userId: userIds[0], title: 'Node.js Backend', description: 'RESTful APIs, Express.js, database integration.', category: 'Web Development', level: 'Intermediate' },
    { userId: userIds[1], title: 'Logo Design', description: 'Professional logo and brand identity design using Adobe Illustrator.', category: 'Graphic Design', level: 'Advanced' },
    { userId: userIds[1], title: 'UI/UX Design', description: 'Figma prototyping, wireframing, and user research.', category: 'Graphic Design', level: 'Intermediate' },
    { userId: userIds[2], title: 'Blog Writing', description: 'SEO-optimized blog posts and articles on various topics.', category: 'Content Writing', level: 'Advanced' },
    { userId: userIds[2], title: 'Social Media Management', description: 'Content calendar, post creation, and analytics.', category: 'Marketing', level: 'Intermediate' },
    { userId: userIds[3], title: 'Video Editing', description: 'Adobe Premiere Pro and After Effects for professional video editing.', category: 'Video Editing', level: 'Advanced' },
    { userId: userIds[3], title: 'Motion Graphics', description: 'Animated intros, explainer videos, and social media content.', category: 'Video Editing', level: 'Intermediate' },
    { userId: userIds[4], title: 'Math Tutoring', description: 'Calculus, Linear Algebra, Statistics tutoring for university students.', category: 'Tutoring', level: 'Advanced' },
    { userId: userIds[4], title: 'Data Analysis', description: 'Python, Pandas, and visualization for data projects.', category: 'Data Science', level: 'Intermediate' }
  ];

  skills.forEach(s => {
    insertSkill.run(s.userId, s.title, s.description, s.category, s.level);
  });

  // Demo tasks
  const tasks = [
    { userId: userIds[0], title: 'Need a Logo for My App', description: 'Looking for a clean, modern logo for a student productivity app. Minimalist style preferred.', category: 'Graphic Design', budget: 'Skill Exchange', status: 'open', deadline: '2024-03-15' },
    { userId: userIds[1], title: 'Need Help with React Project', description: 'Building a dashboard and need help with state management and API integration.', category: 'Web Development', budget: 'Skill Exchange', status: 'open', deadline: '2024-03-20' },
    { userId: userIds[2], title: 'Video Editing for YouTube', description: 'Need someone to edit a 10-minute educational video with captions and transitions.', category: 'Video Editing', budget: 'Skill Exchange', status: 'open', deadline: '2024-03-10' },
    { userId: userIds[3], title: 'Content Writing for Blog', description: 'Need 5 blog posts about technology trends for university magazine.', category: 'Content Writing', budget: 'Skill Exchange', status: 'open', deadline: '2024-03-25' },
    { userId: userIds[4], title: 'Statistics Homework Help', description: 'Need help understanding hypothesis testing and regression analysis concepts.', category: 'Tutoring', budget: 'Skill Exchange', status: 'open', deadline: '2024-03-12' }
  ];

  tasks.forEach(t => {
    insertTask.run(t.userId, t.title, t.description, t.category, t.budget, t.status, t.deadline);
  });
}

module.exports = db;
