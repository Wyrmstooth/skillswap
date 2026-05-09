import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', bio: '', university: '', major: '', semester: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: 500 }}>
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Zap size={40} color="#6366f1" />
          </div>
          <h1>Create Account</h1>
          <p>Join SkillSwap and start swapping skills</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input name="name" className="form-input" value={form.name} onChange={handleChange} placeholder="Your full name" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} placeholder="you@university.edu" required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" className="form-input" value={form.password} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input name="confirmPassword" type="password" className="form-input" value={form.confirmPassword} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>University</label>
              <input name="university" className="form-input" value={form.university} onChange={handleChange} placeholder="Your university" />
            </div>
            <div className="form-group">
              <label>Major</label>
              <input name="major" className="form-input" value={form.major} onChange={handleChange} placeholder="Your major" />
            </div>
          </div>
          <div className="form-group">
            <label>Bio (optional)</label>
            <textarea name="bio" className="form-input" value={form.bio} onChange={handleChange} placeholder="Tell others about yourself..." rows={3} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
