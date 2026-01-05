import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Home = () => {
  // --- STATES ---
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. FETCH REAL DATA
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get('https://campus-sponser-api.onrender.com/api/events');
        setEvents(data);
        setFilteredEvents(data);
      } catch (error) {
        console.error("Load failed");
      } finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  // 2. FILTER LOGIC
  useEffect(() => {
    let result = events;
    if (searchTerm) result = result.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterLocation) result = result.filter(e => e.location.toLowerCase().includes(filterLocation.toLowerCase()));
    setFilteredEvents(result);
  }, [searchTerm, filterLocation, events]);

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif', background: '#f8fafc', minHeight:'100vh' }}>
      
      {/* 🌟 HERO SECTION */}
      <div style={{ 
        background: '#0f172a', 
        color: 'white', 
        padding: '80px 20px 100px 20px', 
        textAlign: 'center',
        borderRadius: '0 0 40px 40px',
        position: 'relative',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px', fontWeight: 'bold', color: '#38bdf8' }}>
          Fund Your Campus Dreams.
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#cbd5e1', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
          The secure bridge between ambitious student organizers and visionary corporate sponsors. 
          No middlemen, 100% transparent funding.
        </p>
        
        {/* 👇 ACTION BUTTONS (UPDATED LINKS) */}
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px', flexWrap: 'wrap' }}>
          
          {/* Link to Create Event */}
          <Link to="/create-event" style={{ padding: '14px 28px', background: '#38bdf8', color: '#0f172a', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', transition: '0.3s' }}>
            🚀 Start an Event
          </Link>

          {/* 👇 YAHAN FIX KIYA HAI: Ab ye '/register' pe le jayega */}
          <Link to="/register" style={{ padding: '14px 28px', background: 'transparent', border: '1px solid #ffffff', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', transition: '0.3s' }}>
            🤝 Become a Sponsor
          </Link>

        </div>
      </div>

      {/* 🛡️ TRUST BADGES */}
      <div style={{ 
        display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap',
        padding: '30px', background: 'white', borderRadius: '15px', 
        boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
        width: '85%', maxWidth:'1000px', margin: '-60px auto 50px auto', 
        position: 'relative', zIndex: 10
      }}>
        <TrustBadge emoji="🔒" title="100% Secure" desc="Razorpay Integration" />
        <div style={{width:'1px', background:'#e2e8f0', display: window.innerWidth < 600 ? 'none' : 'block'}}></div>
        <TrustBadge emoji="✅" title="Verified Users" desc="Admin Checked KYC" />
        <div style={{width:'1px', background:'#e2e8f0', display: window.innerWidth < 600 ? 'none' : 'block'}}></div>
        <TrustBadge emoji="📄" title="Auto Agreements" desc="Digital Proof of Sponsorship" />
      </div>

      {/* 🔍 SEARCH & EVENTS SECTION */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
        
        {/* Search Bars */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
            <input 
                type="text" 
                placeholder="🔍 Search Event (e.g. Tech Fest)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', maxWidth: '400px', fontSize: '1rem', outline:'none', boxShadow:'0 2px 5px rgba(0,0,0,0.05)' }}
            />
            <input 
                type="text" 
                placeholder="📍 City (e.g. Mumbai)" 
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                style={{ padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%', maxWidth: '300px', fontSize: '1rem', outline:'none', boxShadow:'0 2px 5px rgba(0,0,0,0.05)' }}
            />
        </div>

        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.5rem' }}>Live Opportunities</h2>
            <span style={{ background: '#e2e8f0', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>
                {filteredEvents.length} Events Listed
            </span>
        </div>

        {/* Events Grid */}
        {loading ? (
            <div style={{textAlign:'center', padding:'50px', color:'#94a3b8'}}>Loading Events...</div>
        ) : filteredEvents.length === 0 ? (
            <div style={{textAlign:'center', padding:'50px', background:'white', borderRadius:'12px', border:'1px dashed #cbd5e1'}}>
                <h3 style={{color:'#64748b', fontSize:'1.1rem'}}>No events found.</h3>
                <p style={{fontSize:'0.9rem', color:'#94a3b8'}}>Be the first to list an event!</p>
                <button onClick={()=>{setSearchTerm(''); setFilterLocation('')}} style={{marginTop:'10px', color:'#2563eb', background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}>Clear Filters</button>
            </div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
            {filteredEvents.map((event) => (
                <div key={event._id} style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', transition: '0.2s', display:'flex', flexDirection:'column', justifyContent:'space-between', boxShadow:'0 2px 5px rgba(0,0,0,0.05)' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom:'10px' }}>
                            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', fontWeight: '700', margin:0 }}>{event.title}</h3>
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                Needs ₹{event.budget}
                            </span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:'1.5' }}>
                            {event.description}
                        </p>
                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#475569', marginBottom: '20px' }}>
                            <span style={{display:'flex', alignItems:'center', gap:'5px'}}>📅 {new Date(event.date).toLocaleDateString()}</span>
                            <span style={{display:'flex', alignItems:'center', gap:'5px'}}>📍 {event.location}</span>
                        </div>
                    </div>
                    {/* View Details Link */}
                    <Link to={`/event/${event._id}`} style={{ display: 'block', textAlign: 'center', background: '#0f172a', color: 'white', padding: '10px', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', transition: '0.3s' }}>
                        View Details
                    </Link>
                </div>
            ))}
            </div>
        )}
      </div>

      <footer style={{ background: '#0f172a', color: 'white', padding: '30px', textAlign: 'center', marginTop: '60px', fontSize: '0.9rem' }}>
        <p>&copy; 2024 CampusSponsor. A Secure Platform for Students & Sponsors.</p>
      </footer>
    </div>
  );
};

// Helper Component for Trust Badge
const TrustBadge = ({ emoji, title, desc }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', minWidth: '200px' }}>
        <div style={{ fontSize: '2rem' }}>{emoji}</div>
        <div>
            <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1rem' }}>{title}</h4>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>{desc}</p>
        </div>
    </div>
);

export default Home;