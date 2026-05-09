import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { taskAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Clock } from 'lucide-react';

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ category: '', status: '', search: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', category: '', budget: 'Skill Exchange', deadline: '' });
  const categories = ['Web Development', 'Graphic Design', 'Content Writing', 'Video Editing', 'Tutoring', 'Data Science', 'Marketing', 'Mobile Development', 'Music', 'Photography', 'Other'];

  useEffect(() => {
    taskAPI.getAll(filters).then(res => setTasks(res.data)).finally(() => setLoading(false));
  }, [filters]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await taskAPI.create(newTask);
    setShowModal(false);
    setNewTask({ title: '', description: '', category: '', budget: 'Skill Exchange', deadline: '' });
    const res = await taskAPI.getAll(filters);
    setTasks(res.data);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase();

  const getStatusBadge = (status) => {
    const map = { open: 'badge-success', 'in-progress': 'badge-warning', completed: 'badge-gray' };
    return map[status] || 'badge-gray';
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Task Board</h1>
          <p style={{ color: '#64748b' }}>Find tasks to help with or post your own</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Post Task
        </button>
      </div>

      <div className="filters">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="filter-input" style={{ paddingLeft: 40, width: '100%' }} placeholder="Search tasks..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <select className="filter-input" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="filter-input" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="cards-grid">
        {tasks.map(task => (
          <div key={task.id} className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{task.title}</div>
                <div className="card-subtitle">{task.category}</div>
              </div>
              <span className={`badge ${getStatusBadge(task.status)}`}>{task.status}</span>
            </div>
            <div className="card-body">{task.description?.substring(0, 120)}...</div>
            <div className="card-footer">
              <Link to={`/tasks/${task.id}`} className="card-user" style={{ textDecoration: 'none' }}>
                <div className="card-user-avatar">{getInitials(task.user_name)}</div>
                <span className="card-user-name">{task.user_name}</span>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {task.deadline && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}><Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {task.deadline}</span>}
                <span className="badge badge-gray">{task.budget}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="empty-state">
          <Search size={64} />
          <h3>No tasks found</h3>
          <p>Try adjusting your filters or post a new task</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Post New Task</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Task Title</label>
                  <input className="form-input" value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })} placeholder="e.g., Need help with React project" required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-input" value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} placeholder="Describe what you need help with..." required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select className="form-input" value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value })} required>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Budget</label>
                    <input className="form-input" value={newTask.budget} onChange={e => setNewTask({ ...newTask, budget: e.target.value })} placeholder="Skill Exchange" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Deadline (optional)</label>
                  <input type="date" className="form-input" value={newTask.deadline} onChange={e => setNewTask({ ...newTask, deadline: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Post Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
