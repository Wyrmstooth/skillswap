import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Briefcase, MessageSquare, User, LogOut, Zap } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { path: '/skills', icon: <Zap size={18} />, label: 'Skills' },
    { path: '/tasks', icon: <Briefcase size={18} />, label: 'Tasks' },
    { path: '/messages', icon: <MessageSquare size={18} />, label: 'Messages' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <Zap size={28} />
          SkillSwap
        </Link>
        <ul className="navbar-nav">
          {navItems.map(item => (
            <li key={item.path}>
              <Link to={item.path} className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}>
                {item.icon}
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="nav-user">
          <Link to="/profile" className="nav-avatar">
            {user.name?.charAt(0).toUpperCase()}
          </Link>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={14} style={{ marginRight: 6 }} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
