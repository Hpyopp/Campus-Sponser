import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  // User data check karo
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{ 
      display: 'flex', justifyContent: 'space-between', padding: '1rem 2rem', 
      background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', alignItems: 'center' 
    }}>
      <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', textDecoration: 'none', color: '#333' }}>
        🚀 CampuSponsor
      </Link>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#555' }}>Home</Link>
        
        {/* 👇 Ye Magic Line Add Kar: Sirf Admin ko ye button dikhega */}
        {user && user.role === 'admin' && (
          <Link to="/admin" style={{ color: 'red', fontWeight: 'bold', textDecoration: 'none' }}>
            🛡️ Admin Panel
          </Link>
        )}

        {user ? (
          <>
            <span style={{ fontWeight: 'bold' }}>Hi, {user.name.split(' ')[0]} 👋</span>
            <button onClick={handleLogout} style={{ 
              background: '#e74c3c', color: 'white', border: 'none', padding: '8px 15px', 
              borderRadius: '5px', cursor: 'pointer' 
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none', color: '#555' }}>Login</Link>
            <Link to="/register" style={{ 
              background: '#2563eb', color: 'white', padding: '8px 15px', 
              borderRadius: '5px', textDecoration: 'none' 
            }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;