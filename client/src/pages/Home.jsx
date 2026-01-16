import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [recommended, setRecommended] = useState([]); // 👈 NEW STATE
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const navigate = useNavigate();

  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const trendingRes = await axios.get(`${ENDPOINT}/api/events/trending`);
        const recRes = await axios.get(`${ENDPOINT}/api/events/recommended`); // 👈 FETCH RECOMMENDED
        
        setEvents(trendingRes.data);
        setRecommended(recRes.data);
      } catch (error) { console.error(error); }
    };
    fetchEvents();
  }, []);

  const handleSearch = () => {
    navigate(`/search?q=${query}&city=${city}`);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: '#f8fafc', overflowX: 'hidden' }}>
      
      {/* 🌟 HERO SECTION */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
        padding: '100px 20px 120px',
        textAlign: 'center',
        position: 'relative',
        clipPath: 'polygon(0 0, 100% 0, 100% 90%, 0 100%)' 
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.1, backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <motion.div initial="hidden" animate="visible" variants={fadeInUp} style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: '30px', fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.2)', color: '#fbbf24', fontWeight: '600' }}>
             🚀 India's #1 Sponsorship Platform
          </span>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '800', margin: '20px 0', lineHeight: '1.2' }}>
            Fund Your <span style={{ background: 'linear-gradient(to right, #60a5fa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Campus Dreams</span>
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
            Connect with premium sponsors instantly. Secure funding for your college fests, hackathons, and cultural events securely.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <Link to="/create-event" style={{ padding: '15px 35px', background: '#2563eb', color: 'white', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)', transition: '0.3s' }}>Start an Event</Link>
            <Link to="/register" style={{ padding: '15px 35px', background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.2)', borderRadius: '50px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>Become a Sponsor</Link>
          </div>
        </motion.div>
      </div>

      {/* 🔍 SEARCH BAR */}
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ marginTop: '-50px', display: 'flex', justifyContent: 'center', padding: '0 20px', position: 'relative', zIndex: 10 }}>
        <div style={{ background: 'white', padding: '15px', borderRadius: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', display: 'flex', gap: '10px', maxWidth: '800px', width: '100%', alignItems: 'center', flexWrap: 'wrap' }}>
            <input placeholder="🔍 Search Event" value={query} onChange={(e)=>setQuery(e.target.value)} style={{ flex: 1, padding: '15px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', outline: 'none', minWidth: '200px' }} />
            <input placeholder="📍 City" value={city} onChange={(e)=>setCity(e.target.value)} style={{ flex: 0.5, padding: '15px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '1rem', outline: 'none', minWidth: '150px' }} />
            <button onClick={handleSearch} style={{ padding: '15px 30px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>Search</button>
        </div>
      </motion.div>

      {/* 🔥 TRUST BADGES */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '50px', padding: '60px 20px', flexWrap: 'wrap', color: '#64748b' }}>
        {['🔒 100% Secure Payment', '✅ Verified Organizers', '⚡ 24 Hour Approval'].map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', fontSize: '1.1rem' }}>{item}</div>
        ))}
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        
        {/* ✨ NEW: RECOMMENDED FOR YOU (Netflix Style) */}
        {recommended.length > 0 && (
            <div style={{ marginBottom: '60px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    ✨ Recommended For You
                </h2>
                <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', scrollbarWidth: 'none' }}>
                    {recommended.map((event) => (
                        <motion.div 
                            key={event._id}
                            whileHover={{ scale: 1.05 }}
                            style={{ minWidth: '300px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', borderRadius: '20px', padding: '25px', color: 'white', boxShadow: '0 10px 25px rgba(59, 130, 246, 0.3)', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                            onClick={() => navigate(`/event/${event._id}`)}
                        >   
                            {/* Decorative Circle */}
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}></div>

                            <div style={{ background: 'rgba(255,255,255,0.2)', width: 'fit-content', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', marginBottom: '15px', backdropFilter: 'blur(5px)' }}>
                                {event.category || 'Featured'}
                            </div>
                            <h3 style={{ fontSize: '1.4rem', marginBottom: '5px', fontWeight: 'bold' }}>{event.title}</h3>
                            <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>📍 {event.location}</p>
                            <div style={{ marginTop: '20px', fontWeight: 'bold', fontSize: '1.2rem', background: 'white', color: '#2563eb', padding: '8px 15px', borderRadius: '10px', textAlign: 'center' }}>
                                ₹{event.budget} Goal
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        )}

        {/* 🚀 TRENDING EVENTS */}
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '30px', display:'flex', alignItems:'center', gap:'10px' }}>
          🔥 Trending Opportunities <span style={{fontSize:'1rem', color:'#ef4444', background:'#fee2e2', padding:'5px 10px', borderRadius:'20px'}}>Hot</span>
        </h2>
        
        {events.length === 0 ? (
           <p style={{textAlign:'center', padding:'40px', color:'#94a3b8'}}>Loading cool events...</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
            {events.map((event) => (
              <motion.div 
                key={event._id}
                whileHover={{ y: -10 }}
                style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', cursor: 'pointer', position: 'relative' }}
                onClick={() => navigate(`/event/${event._id}`)}
              >
                {/* IMAGE DISPLAY LOGIC */}
                <div style={{ height: '200px', overflow: 'hidden', background: '#e2e8f0' }}>
                   {event.imageUrl ? (
                      <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                   ) : null}
                   <div style={{ display: event.imageUrl ? 'none' : 'flex', width: '100%', height: '100%', background: 'linear-gradient(120deg, #a5b4fc 0%, #6366f1 100%)', alignItems:'center', justifyContent:'center', color:'white', fontSize:'3rem' }}>🎉</div>
                </div>
                
                <div style={{ padding: '25px' }}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                    <span style={{ background: '#ecfdf5', color: '#059669', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Needed: ₹{event.budget}</span>
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>📍 {event.location}</span>
                  </div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</h3>
                  <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6', height: '45px', overflow: 'hidden' }}>{event.description}</p>
                  <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '20px', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>📅 {new Date(event.date).toDateString().slice(4,10)}</span>
                    <button style={{ color: '#2563eb', background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>View Details →</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <div style={{textAlign:'center', marginTop:'50px'}}>
            <Link to="/all-events" style={{padding:'12px 30px', border:'2px solid #cbd5e1', borderRadius:'30px', textDecoration:'none', color:'#475569', fontWeight:'bold', transition:'0.3s'}}>View All Events</Link>
        </div>
      </div>
    </div>
  );
};

export default Home;