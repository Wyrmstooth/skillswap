import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { skillAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Filter } from 'lucide-react';

const Skills = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({ category: '', search: '' });
  const [newSkill, setNewSkill] = useState({ title: '', description: '', category: '', level: 'Intermediate' });

  useEffect(() => {
    Promise.all([skillAPI.getAll(), skillAPI.getCategories()])
      .then(([skillsRes, catRes]) => {
        setSkills(skillsRes.data);
        setCategories(catRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    skillAPI.getAll(filters).then(res => setSkills(res.data));
  }, [filters]);

  const handleCreate = async (e) => {
    e.preventDefault();
    await skillAPI.create(newSkill);
    setShowModal(false);
    setNewSkill({ title: '', description: '', category: '', level: 'Intermediate' });
    const res = await skillAPI.getAll(filters);
    setSkills(res.data);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase();

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>Browse Skills</h1>
          <p style={{ color: '#64748b' }}>Discover what your peers have to offer</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Skill
        </button>
      </div>

      <div className="filters">
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input className="filter-input" style={{ paddingLeft: 40, width: '100%' }} placeholder="Search skills..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <select className="filter-input" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="cards-grid">
        {skills.map(skill => (
          <div key={skill.id} className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{skill.title}</div>
                <div className="card-subtitle">{skill.category}</div>
              </div>
              <span className="badge badge-primary">{skill.level}</span>
            </div>
            <div className="card-body">{skill.description}</div>
            <div className="card-footer">
              <Link to={`/profile/${skill.user_id}`} className="card-user" style={{ textDecoration: 'none' }}>
                <div className="card-user-avatar">{getInitials(skill.user_name)}</div>
                <span className="card-user-name">{skill.user_name}</span>
              </Link>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{skill.university}</span>
            </div>
          </div>
        ))}
      </div>

      {skills.length === 0 && (
        <div className="empty-state">
          <Search size={64} />
          <h3>No skills found</h3>
          <p>Try adjusting your filters or add a new skill</p>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Skill</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Skill Title</label>
                  <input className="form-input" value={newSkill.title} onChange={e => setNewSkill({ ...newSkill, title: e.target.value })} placeholder="e.g., React Development" required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-input" value={newSkill.description} onChange={e => setNewSkill({ ...newSkill, description: e.target.value })} placeholder="Describe what you can do..." required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select className="form-input" value={newSkill.category} onChange={e => setNewSkill({ ...newSkill, category: e.target.value })} required>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Level</label>
                    <select className="form-input" value={newSkill.level} onChange={e => setNewSkill({ ...newSkill, level: e.target.value })}>
                      <option>Beginner</option>
                      <option>Intermediate</option>
                      <option>Advanced</option>
                      <option>Expert</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>Add Skill</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
