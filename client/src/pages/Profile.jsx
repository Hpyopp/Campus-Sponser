import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  useEffect(() => {
    const fetchProfile = async () => {
        if(!user) { navigate('/login'); return; }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Hum khud ki profile la rahe hain (isliye /u/user._id use kar rahe hain)
            const { data } = await axios.get(`${ENDPOINT}/api/users/u/${user._id}`, config);
            setProfile(data.user);
            setEvents(data.events);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching profile");
            setLoading(false);
        }
    };
    fetchProfile();
  }, [user, navigate]);

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Loading Profile... ⏳</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* 🟢 TOP HEADER CARD */}
      <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden', position: 'relative' }}>
        
        {/* Cover Photo (Gradient) */}
        <div style={{ height: '150px', background: 'linear-gradient(to right, #4f46e5, #06b6d4)' }}></div>

        <div style={{ padding: '0 30px 30px', display: 'flex', alignItems: 'flex-end', marginTop: '-60px', flexWrap: 'wrap', gap: '20px' }}>
            
            {/* Profile Image */}
            <div style={{ position: 'relative' }}>
                <img 
                    src={profile.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                    alt="Profile" 
                    style={{ width: '130px', height: '130px', borderRadius: '50%', border: '5px solid white', objectFit: 'cover', background: 'white' }} 
                />
                {profile.isVerified && (
                    <span style={{ position: 'absolute', bottom: '10px', right: '10px', background: '#2563eb', color: 'white', borderRadius: '50%', width: '25px', height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>✓</span>
                )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, marginBottom: '10px' }}>
                <h1 style={{ margin: 0, fontSize: '2rem', color: '#1e293b' }}>{profile.name}</h1>
                <p style={{ margin: '5px 0', color: '#64748b', fontSize: '1rem' }}>
                    {profile.role === 'student' ? '🎓 Student Organizer' : '🏢 Corporate Sponsor'}
                    {profile.companyName && ` @ ${profile.companyName}`}
                </p>
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.9rem', color: '#64748b', marginTop: '10px' }}>
                    <span>📧 {profile.email}</span>
                    <span>📍 {profile.location || 'India'}</span>
                </div>
            </div>

            {/* Edit Button */}
            <button style={{ padding: '10px 20px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#475569', marginBottom: '15px' }}>
                ✏️ Edit Profile
            </button>
        </div>
      </div>

      {/* 🟢 STATS & CONTENT GRID */}
      <div style={{ display: 'flex', gap: '30px', marginTop: '30px', flexWrap: 'wrap' }}>
        
        {/* LEFT: Stats */}
        <div style={{ flex: 1, minWidth: '250px' }}>
            <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 20px 0', color: '#334155' }}>Insights 📊</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                    <span style={{ color: '#64748b' }}>Events Created</span>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{events.length}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                    <span style={{ color: '#64748b' }}>Total Views</span>
                    <span style={{ fontWeight: 'bold', color: '#1e293b' }}>
                        {events.reduce((acc, curr) => acc + (curr.views || 0), 0)}
                    </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Account Status</span>
                    <span style={{ fontWeight: 'bold', color: profile.isVerified ? '#16a34a' : '#eab308' }}>
                        {profile.isVerified ? 'Verified ✅' : 'Pending ⏳'}
                    </span>
                </div>
            </div>
        </div>

        {/* RIGHT: Portfolio (Events) */}
        <div style={{ flex: 2, minWidth: '300px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1e293b' }}>
                {profile.role === 'student' ? 'My Events Portfolio 🚀' : 'Sponsored Events 🤝'}
            </h3>

            {events.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {events.map((event) => (
                        <motion.div 
                            key={event._id}
                            whileHover={{ y: -5 }}
                            onClick={() => navigate(`/events/${event._id}`)}
                            style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', cursor: 'pointer', border: '1px solid #f1f5f9' }}
                        >
                            <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                            <div style={{ padding: '15px' }}>
                                <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 'bold', marginBottom: '5px' }}>
                                    {event.category || 'Event'}
                                </div>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#1e293b' }}>{event.title}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                                    <span style={{ color: event.status === 'completed' ? '#16a34a' : '#f59e0b', fontWeight: 'bold' }}>
                                        {event.status.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '15px', color: '#94a3b8' }}>
                    <p>No events found yet. Time to create history! 🌟</p>
                    {profile.role === 'student' && (
                        <button onClick={()=>navigate('/create-event')} style={{ marginTop: '10px', padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                            Create First Event
                        </button>
                    )}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default Profile;