import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '15px 20px', // Thoda padding kam kiya mobile ke liye
      background: 'white', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      flexWrap: 'wrap', // 👈 YE HAI MAGIC (Items ko niche girne dega)
      gap: '10px'       // Logo aur Buttons ke beech gap
    }}>
      {/* --- LOGO --- */}
      <Link to="/" style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold', 
        textDecoration: 'none', 
        color: '#333',
        flexShrink: 0 // Logo ko dabne mat do
      }}>
        🚀 CampuSponsor
      </Link>

      {/* --- MENU ITEMS --- */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        alignItems: 'center',
        flexWrap: 'wrap' // Buttons ko bhi adjust hone do
      }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#555', fontSize: '0.9rem' }}>Home</Link>
        
        {/* Admin Button */}
        {user && user.role === 'admin' && (
          <Link to="/admin" style={{ color: 'red', fontWeight: 'bold', textDecoration: 'none', fontSize: '0.9rem' }}>
            🛡️ Admin
          </Link>
        )}

        {user ? (
          <>
            <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{user.name.split(' ')[0]} 👋</span>
            <button onClick={handleLogout} style={{ 
              background: '#e74c3c', color: 'white', border: 'none', padding: '8px 12px', 
              borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem' 
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none', color: '#555', fontSize: '0.9rem' }}>Login</Link>
            <Link to="/register" style={{ 
              background: '#2563eb', color: 'white', padding: '8px 12px', 
              borderRadius: '5px', textDecoration: 'none', fontSize: '0.9rem' 
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