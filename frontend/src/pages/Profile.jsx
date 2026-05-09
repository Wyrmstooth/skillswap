import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, skillAPI, taskAPI, ratingAPI, messageAPI } from '../services/api';
import { MapPin, BookOpen, Calendar, Star, Edit2, Save, X, Zap, Briefcase } from 'lucide-react';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [ratings, setRatings] = useState({ ratings: [], average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const isOwnProfile = !id || id === currentUser?.id;
  const profileId = id || currentUser?.id;

  useEffect(() => {
    Promise.all([
      userAPI.getById(profileId),
      skillAPI.getByUser(profileId),
      taskAPI.getByUser(profileId),
      ratingAPI.getByUser(profileId)
    ]).then(([userRes, skillsRes, tasksRes, ratingsRes]) => {
      setProfile(userRes.data);
      setEditForm(userRes.data);
      setSkills(skillsRes.data);
      setTasks(tasksRes.data);
      setRatings(ratingsRes.data);
    }).finally(() => setLoading(false));
  }, [profileId]);

  const handleUpdate = async () => {
    await userAPI.updateMe(editForm);
    const res = await userAPI.getById(profileId);
    setProfile(res.data);
    setEditing(false);
  };

  const handleMessage = async () => {
    await messageAPI.send({ receiver_id: profileId, content: `Hi ${profile.name}! I'd like to connect.` });
    alert('Message sent! Check your messages.');
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase();

  const renderStars = (avg) => {
    return [1, 2, 3, 4, 5].map(n => (
      <span key={n} className={`star ${n <= Math.round(avg) ? 'filled' : ''}`}>★</span>
    ));
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!profile) return <div className="empty-state"><h3>Profile not found</h3></div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">{getInitials(profile.name)}</div>
        <div className="profile-info" style={{ flex: 1 }}>
          {editing ? (
            <div>
              <input className="form-input" style={{ marginBottom: 8, fontSize: '1.3rem', fontWeight: 600 }} value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
              <textarea className="form-input" value={editForm.bio || ''} onChange={e => setEditForm({ ...editForm, bio: e.target.value })} rows={2} />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={handleUpdate}><Save size={14} /> Save</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}><X size={14} /> Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <h1>{profile.name}</h1>
              <p>{profile.bio || 'No bio yet'}</p>
              <div className="profile-meta">
                {profile.university && <span><MapPin size={16} /> {profile.university}</span>}
                {profile.major && <span><BookOpen size={16} /> {profile.major}</span>}
                {profile.semester && <span><Calendar size={16} /> {profile.semester} Semester</span>}
              </div>
              {ratings.count > 0 && (
                <div style={{ marginTop: 8 }}>
                  <div className="rating-stars">{renderStars(ratings.average)}</div>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{ratings.average.toFixed(1)} ({ratings.count} reviews)</span>
                </div>
              )}
            </>
          )}
        </div>
        {isOwnProfile && !editing && (
          <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}><Edit2 size={14} /> Edit</button>
        )}
        {!isOwnProfile && (
          <button className="btn btn-primary btn-sm" onClick={handleMessage}>Message</button>
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className="section-header">
          <h2><Zap size={20} style={{ display: 'inline', marginRight: 8 }} /> Skills ({skills.length})</h2>
        </div>
        {skills.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No skills listed yet</div>
        ) : (
          <div className="cards-grid">
            {skills.map(skill => (
              <div key={skill.id} className="card">
                <div className="card-header">
                  <div className="card-title">{skill.title}</div>
                  <span className="badge badge-primary">{skill.level}</span>
                </div>
                <div className="card-body">{skill.description}</div>
                <span className="badge badge-gray">{skill.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className="section-header">
          <h2><Briefcase size={20} style={{ display: 'inline', marginRight: 8 }} /> Tasks ({tasks.length})</h2>
        </div>
        {tasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No tasks posted yet</div>
        ) : (
          <div className="cards-grid">
            {tasks.map(task => (
              <div key={task.id} className="card">
                <div className="card-header">
                  <div className="card-title">{task.title}</div>
                  <span className={`badge ${task.status === 'open' ? 'badge-success' : task.status === 'in-progress' ? 'badge-warning' : 'badge-gray'}`}>{task.status}</span>
                </div>
                <div className="card-body">{task.description?.substring(0, 100)}...</div>
                <span className="badge badge-gray">{task.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {ratings.ratings.length > 0 && (
        <div>
          <div className="section-header">
            <h2><Star size={20} style={{ display: 'inline', marginRight: 8 }} /> Reviews</h2>
          </div>
          {ratings.ratings.map(r => (
            <div key={r.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="card-user-avatar">{getInitials(r.from_user_name)}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.from_user_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.task_title}</div>
                  </div>
                </div>
                <div className="rating-stars">{renderStars(r.rating)}</div>
              </div>
              {r.comment && <p style={{ color: '#475569', fontSize: '0.9rem' }}>{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
