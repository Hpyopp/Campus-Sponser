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

  // 👇 Dummy Download Logic (Replace with actual PDF logic later)
  const downloadAgreement = (eventId) => {
      alert("Agreement download starting... 📄");
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Loading Dashboard... ⏳</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: "'Poppins', sans-serif" }}>
      
      {/* HEADER CARD */}
      <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ height: '150px', background: 'linear-gradient(to right, #4f46e5, #06b6d4)' }}></div>
        <div style={{ padding: '0 30px 30px', display: 'flex', alignItems: 'flex-end', marginTop: '-60px', flexWrap: 'wrap', gap: '20px' }}>
            
            <div style={{ position: 'relative' }}>
                <img 
                    src={profile.imageUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                    alt="Profile" 
                    style={{ width: '130px', height: '130px', borderRadius: '50%', border: '5px solid white', objectFit: 'cover', background: 'white' }} 
                />
                {profile.isVerified && <span style={{ position: 'absolute', bottom: '10px', right: '10px', background: '#2563eb', color: 'white', borderRadius: '50%', width: '25px', height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white' }}>✓</span>}
            </div>

            <div style={{ flex: 1, marginBottom: '10px' }}>
                <h1 style={{ margin: '0', fontSize: '2rem', color: '#1e293b' }}>{profile.name}</h1>
                <p style={{ margin: '5px 0', color: '#64748b' }}>{profile.email}</p>
                <div style={{marginTop:'5px'}}>
                    <span style={{background: profile.role==='student' ? '#e0e7ff' : '#dcfce7', color: profile.role==='student' ? '#3730a3' : '#166534', padding:'4px 12px', borderRadius:'20px', fontSize:'0.85rem', fontWeight:'bold', textTransform:'capitalize'}}>
                        {profile.role} Account
                    </span>
                </div>
            </div>

            <button onClick={()=>{localStorage.removeItem('user'); window.location.href='/login'}} style={{ padding: '10px 20px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                Logout 🚪
            </button>
        </div>
      </div>

      {/* DASHBOARD CONTENT */}
      <div style={{ marginTop: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#1e293b', borderLeft:'5px solid #2563eb', paddingLeft:'15px' }}>
            My Dashboard & History
        </h2>

        {events.length > 0 ? (
            <div style={{ display: 'grid', gap: '20px' }}>
                {events.map((event) => (
                    <motion.div 
                        key={event._id}
                        whileHover={{ y: -2 }}
                        style={{ background: 'white', borderRadius: '15px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9', display:'flex', flexWrap:'wrap', gap:'20px', alignItems:'center' }}
                    >
                        <img src={event.imageUrl} alt={event.title} style={{ width: '100px', height: '100px', borderRadius: '10px', objectFit: 'cover' }} />
                        
                        <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{event.title}</h3>
                            <p style={{ margin: '0 0 5px 0', color: '#64748b', fontSize:'0.9rem' }}>📅 {new Date(event.date).toDateString()}</p>
                            
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '5px' }}>
                                <span style={{ fontSize: '0.9rem', color: '#475569' }}>
                                    Target: <b>₹{event.budget}</b>
                                </span>
                                {event.raisedAmount > 0 ? (
                                    <span style={{ fontSize: '0.9rem', color: '#16a34a', background:'#dcfce7', padding:'2px 8px', borderRadius:'5px', fontWeight:'bold' }}>
                                        Funds: ₹{event.raisedAmount}
                                    </span>
                                ) : (
                                    <span style={{ fontSize: '0.8rem', color: '#f59e0b', background:'#fef3c7', padding:'2px 8px', borderRadius:'5px' }}>
                                        No Funds Yet
                                    </span>
                                )}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '160px' }}>
                            <button 
                                onClick={() => navigate(`/events/${event._id}`)} 
                                style={{ padding: '8px 15px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', color: '#475569', fontSize: '0.9rem' }}
                            >
                                👁️ View Details
                            </button>

                            {/* 👇 FIX: Show button ONLY if raisedAmount > 0 */}
                            {event.raisedAmount > 0 && (
                                <button 
                                    onClick={() => downloadAgreement(event._id)}
                                    style={{ padding: '8px 15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}
                                >
                                    📄 Agreement
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        ) : (
            <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: '15px', color: '#94a3b8', border:'1px dashed #cbd5e1' }}>
                <p>No activity found yet.</p>
                {user.role === 'student' && (
                    <button onClick={()=>navigate('/create-event')} style={{marginTop:'10px', padding:'10px 20px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>
                        Create an Event
                    </button>
                )}
            </div>
        )}
      </div>

    </div>
  );
};

export default Profile;