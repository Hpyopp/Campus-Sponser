import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const onLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">🚀 CampuSponsor</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/" className="nav-link">Home</Link></li>
        
        {user ? (
          <>
            <li style={{fontWeight: '600'}}>Hi, {user.name.split(' ')[0]} 👋</li>
            <li>
                <button onClick={onLogout} className="btn btn-logout">Logout</button>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login" className="nav-link">Login</Link></li>
            <li><Link to="/register" className="btn btn-primary">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;