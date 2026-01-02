import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <nav style={{ background: '#ffffff', padding: '15px 40px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position:'sticky', top:0, zIndex:1000 }}>
      
      {/* LOGO */}
      <Link to="/" style={{ textDecoration: 'none', display:'flex', alignItems:'center', gap:'10px' }}>
        <span style={{fontSize:'1.8rem'}}>🚀</span>
        <h2 style={{ margin: 0, color: '#1e293b', fontFamily: 'Poppins', fontWeight:'800' }}>CampusSponsor</h2>
      </Link>

      {/* LINKS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '25px', fontFamily:'Poppins', fontWeight:'500' }}>
        <Link to="/" style={{ textDecoration: 'none', color: '#64748b' }}>Home</Link>
        
        {user ? (
          <>
            {user.role === 'student' && (
                <Link to="/create-event" style={{ textDecoration: 'none', color: '#64748b' }}>Create Event</Link>
            )}
            
            {user.role === 'admin' && (
                <Link to="/admin" style={{ textDecoration: 'none', color: '#dc2626', fontWeight:'bold' }}>Admin Panel</Link>
            )}

            {/* 👇 UPDATED PROFILE LINK (Replaces Logout) */}
            <div 
                onClick={() => navigate('/profile')} 
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', background:'#f1f5f9', padding:'5px 15px 5px 5px', borderRadius:'30px', transition:'0.3s', border:'1px solid #e2e8f0' }}
            >
                <div style={{width:'32px', height:'32px', background:'#3b82f6', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'0.9rem', fontWeight:'bold'}}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{color:'#334155', fontSize:'0.9rem', fontWeight:'600'}}>
                    {user.name.split(' ')[0]}
                </span>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: 'bold' }}>Login</Link>
            <Link to="/register" style={{ padding: '10px 20px', background: '#2563eb', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', boxShadow:'0 4px 14px rgba(37, 99, 235, 0.3)' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;