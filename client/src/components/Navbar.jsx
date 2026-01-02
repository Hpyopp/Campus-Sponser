import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  // Initialize state directly from localStorage
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  useEffect(() => {
    // Function to update state when localStorage changes
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      setUser(updatedUser);
    };

    // Listen to custom events (from Login/Register pages)
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav style={{ background: 'white', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', fontFamily: 'Poppins' }}>
      
      {/* LEFT: LOGO & STATUS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', textDecoration: 'none', display:'flex', alignItems:'center', gap:'5px' }}>
          🚀 CampusSponsor
        </Link>

        {/* STATUS BUTTON */}
        {user && (
            user.isVerified ? (
                <span style={{ background: '#dcfce7', color: '#166534', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'5px' }}>
                    ✅ Verified
                </span>
            ) : (
                <Link to="/verify" style={{ textDecoration:'none', background: '#fff7ed', color: '#c2410c', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', display:'flex', alignItems:'center', gap:'5px', border:'1px solid #fdba74', cursor:'pointer' }}>
                    ⚠️ Unverified (Upload ID)
                </Link>
            )
        )}
      </div>

      {/* RIGHT: LINKS & USER NAME */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ color: '#475569', textDecoration: 'none', fontWeight: '500' }}>Home</Link>
        
        {user ? (
          <>
            {user.role === 'admin' && (
              <Link to="/admin" style={{ color: '#b91c1c', textDecoration: 'none', fontWeight: 'bold' }}>Admin Panel</Link>
            )}
            {/* 👇 FIX: Display User Name Correctly */}
            <span style={{ color: '#475569', fontWeight:'600' }}>
                Hi, {user.name ? user.name.split(' ')[0] : 'User'}
            </span>
            <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
            <Link to="/register" style={{ padding: '8px 15px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;