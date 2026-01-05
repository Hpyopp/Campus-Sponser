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
  const [stats, setStats] = useState({ events: 0, funds: 0, partners: 0 });

  // 1. STATS ANIMATION (Fake Effect for Impression)
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        events: prev.events < 150 ? prev.events + 5 : 150,
        funds: prev.funds < 500000 ? prev.funds + 15000 : 500000,
        partners: prev.partners < 50 ? prev.partners + 2 : 50
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // 2. FETCH EVENTS
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get('https://campus-sponser-api.onrender.com/api/events');
        setEvents(data);
        setFilteredEvents(data);
      } catch (error) {
        toast.error("Failed to load events");
      } finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  // 3. FILTER LOGIC
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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
        color: 'white', 
        padding: '80px 20px 120px 20px', // Extra padding bottom for overlap
        textAlign: 'center',
        borderRadius: '0 0 50px 50px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Circle */}
        <div style={{position:'absolute', top:'-50px', left:'-50px', width:'200px', height:'200px', background:'#38bdf8', opacity:'0.2', borderRadius:'50%', filter:'blur(80px)'}}></div>
        
        <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', fontWeight: '800', background: '-webkit-linear-gradient(45deg, #38bdf8, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Fund Your Campus Dreams.
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 40px auto' }}>
          The secure bridge between ambitious student organizers and visionary corporate sponsors.
        </p>
        
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '40px' }}>
          <Link to="/create-event" style={{ padding: '15px 30px', background: '#38bdf8', color: '#0f172a', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem', transition: '0.3s' }}>
            🚀 Start an Event
          </Link>
          <Link to="/join-sponsor" style={{ padding: '15px 30px', background: 'transparent', border: '2px solid #22c55e', color: '#22c55e', borderRadius: '30px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>
            🤝 Become a Sponsor
          </Link>
        </div>
      </div>

      {/* 📊 FLOATING STATS STRIP (Overlaps Hero) */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-around', alignItems:'center',
        padding: '30px', background: 'white', borderRadius: '20px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
        width: '85%', maxWidth:'1000px', margin: '-80px auto 50px auto', 
        position: 'relative', zIndex: 10, flexWrap:'wrap', gap:'20px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: 0 }}>{stats.events}+</h2>
          <p style={{ color: '#64748b', fontSize:'0.9rem', fontWeight:'bold' }}>EVENTS LISTED</p>
        </div>
        <div style={{ width: '2px', height:'50px', background: '#e2e8f0' }} className="hide-mobile"></div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', color: '#22c55e', margin: 0 }}>₹{stats.funds.toLocaleString()}+</h2>
          <p style={{ color: '#64748b', fontSize:'0.9rem', fontWeight:'bold' }}>FUNDS RAISED</p>
        </div>
        <div style={{ width: '2px', height:'50px', background: '#e2e8f0' }} className="hide-mobile"></div>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', color: '#38bdf8', margin: 0 }}>{stats.partners}+</h2>
          <p style={{ color: '#64748b', fontSize:'0.9rem', fontWeight:'bold' }}>PARTNERS</p>
        </div>
      </div>

      {/* 🔍 SEARCH SECTION */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px 40px 20px' }}>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
            <input 
                type="text" 
                placeholder="🔍 Search Event (e.g. Tech Fest)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '400px', fontSize: '1rem', outline:'none', boxShadow:'0 2px 5px rgba(0,0,0,0.05)' }}
            />
            <input 
                type="text" 
                placeholder="📍 Filter by City" 
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                style={{ padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0', width: '100%', maxWidth: '300px', fontSize: '1rem', outline:'none', boxShadow:'0 2px 5px rgba(0,0,0,0.05)' }}
            />
        </div>

        {/* 📅 EVENTS GRID */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#1e293b', margin: 0 }}>🔥 Trending Events</h2>
            <span style={{ background: '#e2e8f0', padding: '5px 15px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>
                {filteredEvents.length} Results
            </span>
        </div>

        {loading ? (
            <div style={{textAlign:'center', padding:'50px', color:'#94a3b8'}}>Loading Events...</div>
        ) : filteredEvents.length === 0 ? (
            <div style={{textAlign:'center', padding:'50px', background:'white', borderRadius:'15px', boxShadow:'0 4px 10px rgba(0,0,0,0.05)'}}>
                <h3 style={{color:'#64748b'}}>No events found.</h3>
                <button onClick={()=>{setSearchTerm(''); setFilterLocation('')}} style={{marginTop:'10px', color:'#38bdf8', background:'none', border:'none', cursor:'pointer', textDecoration:'underline'}}>Clear Filters</button>
            </div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
            {filteredEvents.map((event) => (
                <div key={event._id} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 10px 20px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', transition: '0.3s', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom:'10px' }}>
                            <h3 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: '700', margin:0 }}>{event.title}</h3>
                            <span style={{ background: '#dcfce7', color: '#166534', padding: '5px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                ₹{event.budget}
                            </span>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                            {event.description}
                        </p>
                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#475569', marginBottom: '20px' }}>
                            <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                            <span>📍 {event.location}</span>
                        </div>
                    </div>
                    <Link to={`/event/${event._id}`} style={{ display: 'block', textAlign: 'center', background: '#1e293b', color: 'white', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', transition: '0.3s', boxShadow:'0 4px 10px rgba(30,41,59,0.2)' }}>
                        View Details &rarr;
                    </Link>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', color: 'white', padding: '40px', textAlign: 'center', marginTop: '60px' }}>
        <p>&copy; 2024 CampusSponsor. Built for the Future.</p>
      </footer>
    </div>
  );
};

export default Home;