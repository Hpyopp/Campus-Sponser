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
        toast.error("User not found");
      } finally { setLoading(false); }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading Profile...</div>;
  if (!profileData) return <div style={{textAlign:'center', padding:'50px'}}>User not found 😕</div>;

  const { user, events } = profileData;

  const totalEvents = events.length;
  const totalMoney = user.role === 'student' 
    ? events.reduce((acc, curr) => acc + (curr.raisedAmount || 0), 0)
    : events.reduce((acc, curr) => acc + (curr.sponsors.find(s=>s.sponsorId === user._id)?.amount || 0), 0);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{ background: 'white', borderRadius: '0 0 20px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ height: '150px', background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' }}></div>
        <div style={{ padding: '0 30px 30px 30px', marginTop: '-60px', display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap:'wrap' }}>
          <img 
            src={`https://ui-avatars.com/api/?name=${user.name}&background=0f172a&color=fff&size=150`} 
            alt={user.name} 
            style={{ width: '120px', height: '120px', borderRadius: '50%', border: '4px solid white' }} 
          />
          <div style={{ flex: 1, marginBottom: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#1e293b' }}>
              {user.name} 
              {user.isVerified && <span title="Verified" style={{ marginLeft: '10px', fontSize: '1rem' }}>✅</span>}
            </h1>
            <p style={{ margin: '5px 0', color: '#64748b' }}>
              {user.role === 'student' ? '🎓 Student Organizer' : '🏢 Corporate Sponsor'}
              {user.companyName && ` @ ${user.companyName}`}
            </p>
          </div>
          <button onClick={() => toast.success("Chat Coming Soon!")} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>
            Connect 💬
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'flex', gap: '20px', margin: '20px 0' }}>
        <StatCard label={user.role === 'student' ? "Events Organized" : "Events Sponsored"} value={totalEvents} emoji="📅" />
        <StatCard label={user.role === 'student' ? "Total Funds Raised" : "Total Invested"} value={`₹${totalMoney.toLocaleString()}`} emoji="💰" />
      </div>

      {/* ACTIVITY FEED */}
      <h3 style={{ color: '#334155', marginTop: '30px' }}>Recent Activity</h3>
      <div style={{ display: 'grid', gap: '20px' }}>
        {events.length > 0 ? events.map(event => (
          <div key={event._id} style={{ background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>
                <Link to={`/event/${event._id}`} style={{color:'#2563eb', textDecoration:'none'}}>{event.title}</Link>
              </h4>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{new Date(event.date).toLocaleDateString()}</p>
            </div>
            <span style={{ background: '#eff6ff', color: '#1e40af', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {event.status ? event.status.toUpperCase() : 'PENDING'}
            </span>
          </div>
        )) : (
          <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No activity yet.</p>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, emoji }) => (
  <div style={{ flex: 1, background: 'white', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>{emoji}</div>
    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b' }}>{value}</div>
    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{label}</div>
  </div>
);

export default UserProfile;