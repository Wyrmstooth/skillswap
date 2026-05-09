import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { skillAPI, taskAPI } from '../services/api';
import { Zap, Briefcase, Users, MessageSquare, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([skillAPI.getAll(), taskAPI.getAll({ status: 'open' })])
      .then(([skillsRes, tasksRes]) => {
        setSkills(skillsRes.data.slice(0, 4));
        setTasks(tasksRes.data.slice(0, 4));
      })
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase();

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p>Explore skills, find tasks, and connect with fellow students</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><Zap /></div>
          <div className="stat-info">
            <h3>{skills.length}+</h3>
            <p>Skills Available</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Briefcase /></div>
          <div className="stat-info">
            <h3>{tasks.length}+</h3>
            <p>Open Tasks</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Users /></div>
          <div className="stat-info">
            <h3>Active</h3>
            <p>Community</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><MessageSquare /></div>
          <div className="stat-info">
            <h3>Chat</h3>
            <p>Collaborate</p>
          </div>
        </div>
      </div>

      <div className="section-header">
        <h2>Recent Skills</h2>
        <Link to="/skills" className="btn btn-sm btn-outline">View All <ArrowRight size={14} /></Link>
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
            <div className="card-body">{skill.description?.substring(0, 100)}...</div>
            <div className="card-footer">
              <div className="card-user">
                <div className="card-user-avatar">{getInitials(skill.user_name)}</div>
                <span className="card-user-name">{skill.user_name}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{skill.university}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section-header">
        <h2>Open Tasks</h2>
        <Link to="/tasks" className="btn btn-sm btn-outline">View All <ArrowRight size={14} /></Link>
      </div>
      <div className="cards-grid">
        {tasks.map(task => (
          <div key={task.id} className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{task.title}</div>
                <div className="card-subtitle">{task.category}</div>
              </div>
              <span className="badge badge-success">{task.status}</span>
            </div>
            <div className="card-body">{task.description?.substring(0, 100)}...</div>
            <div className="card-footer">
              <div className="card-user">
                <div className="card-user-avatar">{getInitials(task.user_name)}</div>
                <span className="card-user-name">{task.user_name}</span>
              </div>
              <span className="badge badge-gray">{task.budget}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
