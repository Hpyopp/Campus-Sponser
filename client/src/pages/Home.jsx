import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // 1. Load User on Startup
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(storedUser);
    }
  }, [navigate]);

  // 2. LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 3. CHECK STATUS FUNCTION (Ye hai wo Magic Button Logic 🛠️)
  const checkStatus = async () => {
    setLoading(true);
    try {
      // Token ke saath Server ko call karo
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      
      const res = await axios.get('/api/users/me', config);
      
      // Naya data (updated verification status) save karo
      // Dhyan rakhna: Token purana wala hi use karenge agar naya nahi aaya
      const updatedUser = { ...user, ...res.data }; 
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      // Result batao
      if (res.data.isVerified) {
        alert("🎉 Congrats! You are VERIFIED by Admin.");
      } else if (res.data.verificationDoc) {
        alert("⏳ Status: PENDING Admin Approval.");
      } else {
        alert("⚠️ Status: Not Verified. Please Upload ID.");
        navigate('/verify'); // Upload page pe bhejo
      }

    } catch (error) {
      console.error(error);
      alert("Error checking status. Try login again.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div style={{ fontFamily: 'Poppins', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h2 style={{ color: '#1e293b' }}>🚀 CampusSponsor</h2>
        <button onClick={handleLogout} style={{ padding: '8px 15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>

      {/* USER CARD */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', textAlign: 'center' }}>
        
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>
          {user.isVerified ? '✅' : '⏳'}
        </div>

        <h1 style={{ color: '#0f172a' }}>Welcome, {user.name}!</h1>
        <p style={{ color: '#64748b' }}>Role: <strong style={{ textTransform: 'capitalize' }}>{user.role}</strong></p>

        {/* STATUS BADGE */}
        <div style={{ 
            display: 'inline-block', padding: '8px 20px', borderRadius: '20px', 
            background: user.isVerified ? '#dcfce7' : '#fff7ed', 
            color: user.isVerified ? '#166534' : '#c2410c',
            fontWeight: 'bold', marginTop: '10px', border: user.isVerified ? '1px solid #22c55e' : '1px solid #f97316'
        }}>
          {user.isVerified ? 'Verified Account' : 'Verification Pending'}
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap:'wrap' }}>
          
          {/* 👇 YE BUTTON AB PAKKA CHALEGA */}
          <button 
            onClick={checkStatus} 
            disabled={loading}
            style={{ 
              padding: '12px 25px', background: '#2563eb', color: 'white', 
              border: 'none', borderRadius: '8px', cursor: 'pointer', 
              fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            {loading ? 'Checking...' : '🔄 Check Status'}
          </button>

          {!user.isVerified && (
            <button 
              onClick={() => navigate('/verify')} 
              style={{ padding: '12px 25px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}
            >
              📂 Upload ID Proof
            </button>
          )}

          {user.isVerified && (
            <button 
              onClick={() => navigate('/create-event')} 
              style={{ padding: '12px 25px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}
            >
              ➕ Create Event
            </button>
          )}

        </div>
      </div>

    </div>
  );
};

export default Home;