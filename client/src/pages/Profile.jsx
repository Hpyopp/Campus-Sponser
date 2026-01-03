import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event("storage"));
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '40px 20px', fontFamily: 'Poppins' }}>
      
      {/* 1. MAIN PROFILE CARD */}
      <div style={{ 
          background: 'white', 
          maxWidth: '800px', 
          margin: '0 auto', 
          borderRadius: '20px', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)', 
          padding: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
      }}>
        
        {/* Left Side: Avatar & Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            
            {/* Avatar Circle */}
            <div style={{ 
                width: '100px', height: '100px', 
                background: 'linear-gradient(135deg, #2563eb, #1e40af)', 
                borderRadius: '50%', 
                color: 'white', fontSize: '40px', fontWeight: 'bold', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
            }}>
                {user.name.charAt(0).toUpperCase()}
            </div>

            {/* Name & Status */}
            <div>
                <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {user.name}
                    
                    {/* 👇 STATUS BADGE */}
                    {user.isVerified ? (
                        <span style={{ 
                            fontSize: '0.8rem', background: '#dcfce7', color: '#166534', 
                            padding: '4px 12px', borderRadius: '20px', border: '1px solid #16a34a',
                            display: 'flex', alignItems: 'center', gap: '5px' 
                        }}>
                            ✅ Verified
                        </span>
                    ) : (
                        <span style={{ 
                            fontSize: '0.8rem', background: '#fef3c7', color: '#b45309', 
                            padding: '4px 12px', borderRadius: '20px', border: '1px solid #d97706',
                            display: 'flex', alignItems: 'center', gap: '5px' 
                        }}>
                            ⚠️ Unverified
                        </span>
                    )}
                </h2>

                <p style={{ margin: '5px 0', color: '#64748b' }}>{user.email}</p>
                
                {/* Role Badge */}
                <span style={{ 
                    display: 'inline-block', marginTop: '10px', 
                    padding: '5px 15px', borderRadius: '6px', 
                    background: '#f1f5f9', color: '#475569', 
                    fontWeight: '600', fontSize: '0.85rem', letterSpacing: '1px', textTransform: 'uppercase'
                }}>
                    {user.role}
                </span>

                {/* 👇 CHECK STATUS BUTTON (Only if Unverified) */}
                {!user.isVerified && (
                    <div style={{ marginTop: '15px' }}>
                        <button 
                            onClick={() => navigate('/verify')}
                            style={{
                                background: '#e11d48', color: 'white', border: 'none',
                                padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                                fontSize: '0.9rem', fontWeight: '600', boxShadow: '0 4px 12px rgba(225, 29, 72, 0.3)',
                                transition: '0.3s'
                            }}
                        >
                            🚀 Complete Verification
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Right Side: Logout Button */}
        <button 
            onClick={handleLogout} 
            style={{ 
                padding: '12px 25px', background: '#cbd5e1', color: '#334155', 
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold',
                transition: '0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#94a3b8'}
            onMouseOut={(e) => e.target.style.background = '#cbd5e1'}
        >
            Logout
        </button>
      </div>

      {/* 2. LOWER SECTION (PORTFOLIO / EVENTS) */}
      <div style={{ maxWidth: '800px', margin: '40px auto' }}>
          <h3 style={{ borderLeft: '5px solid #2563eb', paddingLeft: '15px', color: '#1e293b' }}>
              My Dashboard
          </h3>
          
          <div style={{ background: 'white', padding: '30px', borderRadius: '15px', marginTop: '20px', textAlign: 'center', color: '#64748b', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              {user.role === 'sponsor' ? (
                  <p>You haven't sponsored any events yet. <span style={{color:'#2563eb', cursor:'pointer'}} onClick={() => navigate('/')}>Explore Events</span></p>
              ) : (
                  <p>You haven't created any events yet. <span style={{color:'#2563eb', cursor:'pointer'}} onClick={() => navigate('/create-event')}>Create Event</span></p>
              )}
          </div>
      </div>

    </div>
  );
};

export default Profile;