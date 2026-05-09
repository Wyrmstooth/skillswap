import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskAPI, ratingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Clock, MapPin, Star } from 'lucide-react';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    taskAPI.getById(id).then(res => setTask(res.data)).finally(() => setLoading(false));
  }, [id]);

  const handleAccept = async () => {
    await taskAPI.accept(id);
    const res = await taskAPI.getById(id);
    setTask(res.data);
  };

  const handleComplete = async () => {
    await taskAPI.complete(id);
    const res = await taskAPI.getById(id);
    setTask(res.data);
    if (task.user_id === user.id) {
      setShowRating(true);
    }
  };

  const handleSubmitRating = async () => {
    await ratingAPI.create({ to_user_id: task.assigned_to || task.user_id, task_id: task.id, ...rating });
    setShowRating(false);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase();

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!task) return <div className="empty-state"><h3>Task not found</h3></div>;

  return (
    <div className="task-detail">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="task-detail-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1>{task.title}</h1>
            <div className="task-detail-meta">
              <span className="badge badge-primary">{task.category}</span>
              <span className={`badge ${task.status === 'open' ? 'badge-success' : task.status === 'in-progress' ? 'badge-warning' : 'badge-gray'}`}>{task.status}</span>
              <span className="badge badge-gray">{task.budget}</span>
            </div>
          </div>
        </div>

        <div className="task-detail-body">
          <p>{task.description}</p>
        </div>

        <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}><MapPin size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> {task.university}</span>
          {task.deadline && <span style={{ color: '#64748b', fontSize: '0.9rem' }}><Clock size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} /> Deadline: {task.deadline}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#f8fafc', borderRadius: 8, marginBottom: 24 }}>
          <Link to={`/profile/${task.user_id}`} style={{ textDecoration: 'none' }}>
            <div className="card-user-avatar" style={{ width: 40, height: 40, fontSize: '0.9rem' }}>{getInitials(task.user_name)}</div>
          </Link>
          <div>
            <div style={{ fontWeight: 600 }}>{task.user_name}</div>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{task.user_bio?.substring(0, 80)}</div>
          </div>
        </div>

        <div className="task-detail-actions">
          {task.status === 'open' && task.user_id !== user.id && (
            <button className="btn btn-primary" onClick={handleAccept}>Accept Task</button>
          )}
          {task.status === 'in-progress' && (task.user_id === user.id || task.assigned_to === user.id) && (
            <button className="btn btn-success" onClick={handleComplete}>Mark Complete</button>
          )}
        </div>
      </div>

      {showRating && (
        <div className="modal-overlay" onClick={() => setShowRating(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rate This Task</h2>
              <button className="modal-close" onClick={() => setShowRating(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Rating</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setRating({ ...rating, rating: n })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: n <= rating.rating ? '#fbbf24' : '#e2e8f0' }}>
                      <Star size={28} fill={n <= rating.rating ? '#fbbf24' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Comment (optional)</label>
                <textarea className="form-input" value={rating.comment} onChange={e => setRating({ ...rating, comment: e.target.value })} placeholder="Share your experience..." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowRating(false)}>Skip</button>
              <button className="btn btn-primary" style={{ width: 'auto' }} onClick={handleSubmitRating}>Submit Rating</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;
