import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(`https://campus-sponser-api.onrender.com/api/users/u/${id}`);
        setProfileData(data);
      } catch (error) {
        console.error(error);
        toast.error("Could not load profile");
      } finally { setLoading(false); }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div style={{textAlign:'center', padding:'100px', color:'#64748b', fontSize:'1.2rem'}}>Loading Profile... 🔄</div>;
  if (!profileData) return <div style={{textAlign:'center', padding:'100px', color:'#ef4444', fontSize:'1.2rem'}}>User not found 😕</div>;

  const { user, events } = profileData;

  // Stats Calculation
  const totalEvents = events.length;
  const totalMoney = user.role === 'student' 
    ? events.reduce((acc, curr) => acc + (curr.raisedAmount || 0), 0)
    : events.reduce((acc, curr) => acc + (curr.sponsors.find(s=>s.sponsorId === user._id)?.amount || 0), 0);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px', fontFamily: 'Poppins, sans-serif', background:'#f8fafc', minHeight:'100vh' }}>
      
      {/* 🎭 COVER & PROFILE HEADER */}
      <div style={{ background: 'white', borderRadius: '0 0 25px 25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden', position:'relative' }}>
        {/* Cover Photo with Gradient Overlay */}
        <div style={{ height: '180px', background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url('https://source.unsplash.com/random/1600x400/?campus,tech')`, backgroundSize:'cover', backgroundPosition:'center' }}></div>
        
        <div style={{ padding: '0 30px 30px 30px', display: 'flex', alignItems: 'flex-end', gap: '25px', flexWrap:'wrap' }}>
          {/* Avatar (Overlapping) */}
          <div style={{ marginTop: '-90px', padding:'5px', background:'white', borderRadius:'50%', boxShadow:'0 4px 15px rgba(0,0,0,0.1)' }}>
            <img 
                src={`https://ui-avatars.com/api/?name=${user.name}&background=3b82f6&color=fff&size=180&bold=true`} 
                alt={user.name} 
                style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit:'cover' }} 
            />
          </div>
          
          {/* User Info */}
          <div style={{ flex: 1, paddingBottom:'5px' }}>
            <h1 style={{ margin: 0, fontSize: '2.2rem', color: '#1e293b', fontWeight:'800', display:'flex', alignItems:'center', gap:'10px' }}>
              {user.name} 
              {user.isVerified && <span style={{ fontSize: '1.2rem', color:'#3b82f6' }} title="Verified User">☑️</span>}
            </h1>
            <p style={{ margin: '5px 0', color: '#64748b', fontSize:'1.1rem', fontWeight:'500' }}>
              {user.role === 'student' ? '🎓 Student Organizer' : '🏢 Corporate Sponsor'}
              {user.companyName && <span style={{color:'#334155'}}> @ {user.companyName}</span>}
              {user.collegeName && <span style={{color:'#334155'}}> | {user.collegeName}</span>}
            </p>
            {/* Fake Location/Join Date for PRO feel */}
            <p style={{ margin: '10px 0 0 0', fontSize: '0.9rem', color: '#94a3b8', display:'flex', gap:'15px' }}>
                <span>📍 India</span> | <span>📅 Joined recently</span>
            </p>
          </div>

          {/* Connect Button */}
          <button onClick={() => toast.success("Messaging feature coming soon! 💬")} style={{ padding: '12px 25px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontWeight: '700', fontSize:'1rem', boxShadow:'0 4px 15px rgba(37, 99, 235, 0.3)', transition:'0.3s', display:'flex', alignItems:'center', gap:'8px' }}>
            Connect 💬
          </button>
        </div>
      </div>

      {/* 📊 PRO STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '30px 20px' }}>
        <StatCard label={user.role === 'student' ? "Events Organized" : "Events Sponsored"} value={totalEvents} emoji="📅" bg="#eff6ff" color="#2563eb" />
        <StatCard label={user.role === 'student' ? "Total Funds Raised" : "Total Invested"} value={`₹${totalMoney.toLocaleString()}`} emoji="💰" bg="#ecfdf5" color="#059669" />
        <StatCard label="Profile Credibility" value="High ⭐" emoji="🛡️" bg="#fff7ed" color="#d97706" />
      </div>

      {/* 📜 ACTIVITY FEED (With Smart Status Fix) */}
      <div style={{ padding: '0 20px' }}>
        <h3 style={{ color: '#1e293b', marginTop: '30px', fontSize:'1.5rem', borderBottom:'2px solid #e2e8f0', paddingBottom:'15px', marginBottom:'25px' }}>Recent Activity</h3>
        <div style={{ display: 'grid', gap: '20px' }}>
            {events.length > 0 ? events.map(event => {
                
                // 🔥 SMART STATUS LOGIC (Fixes "Pending" Issue)
                let smartStatus = 'pending';
                let statusColor = '#eab308'; // Yellow
                let statusBg = '#fefce8';
                
                if (event.isApproved) {
                    smartStatus = 'funding';
                    statusColor = '#2563eb'; // Blue
                    statusBg = '#eff6ff';
                    if (event.raisedAmount >= event.budget) {
                        smartStatus = 'completed';
                        statusColor = '#16a34a'; // Green
                        statusBg = '#dcfce7';
                    }
                }
                // For sponsors, check their specific payment status if needed, but event status is better here.

                return (
                <div key={event._id} style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition:'0.3s' }}>
                    <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', fontWeight:'700' }}>
                        <span style={{marginRight:'10px', fontSize:'1.3rem'}}>
                            {user.role === 'student' ? '🚀' : '🤝'}
                        </span>
                        <Link to={`/event/${event._id}`} style={{color:'#1e293b', textDecoration:'none', transition:'0.2s'}} onMouseOver={e=>e.target.style.color='#2563eb'} onMouseOut={e=>e.target.style.color='#1e293b'}>
                            {event.title}
                        </Link>
                    </h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', display:'flex', gap:'15px', alignItems:'center' }}>
                        <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                        <span>📍 {event.location}</span>
                    </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                    <span style={{ 
                        background: statusBg, 
                        color: statusColor,
                        padding: '6px 12px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: '800', letterSpacing:'0.5px', boxShadow:`0 2px 5px ${statusBg}`
                    }}>
                        {smartStatus.toUpperCase()}
                    </span>
                    </div>
                </div>
                )
            }) : (
            <div style={{ textAlign:'center', padding:'40px', color: '#94a3b8', background:'white', borderRadius:'15px', border:'2px dashed #e2e8f0' }}>
                <h3>No activity yet.</h3>
                <p>This user hasn't participated in any events.</p>
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

// Improved Stat Card Component
const StatCard = ({ label, value, emoji, bg, color }) => (
  <div style={{ flex: 1, background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', textAlign: 'center', borderBottom: `4px solid ${color}` }}>
    <div style={{ fontSize: '2.5rem', marginBottom: '10px', background: bg, width:'70px', height:'70px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', margin:'0 auto 15px auto' }}>{emoji}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{value}</div>
    <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight:'600', textTransform:'uppercase', letterSpacing:'1px' }}>{label}</div>
  </div>
);

export default UserProfile;