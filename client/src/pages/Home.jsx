import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. FETCH EVENTS ON LOAD
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get('/api/events');
        setEvents(data);
        setFilteredEvents(data);
      } catch (error) {
        toast.error("Failed to load events");
      } finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  // 2. SEARCH & FILTER LOGIC (Automatic)
  useEffect(() => {
    let result = events;

    // Filter by Name
    if (searchTerm) {
        result = result.filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    // Filter by Location
    if (filterLocation) {
        result = result.filter(e => e.location.toLowerCase().includes(filterLocation.toLowerCase()));
    }

    setFilteredEvents(result);
  }, [searchTerm, filterLocation, events]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Poppins' }}>
      
      {/* 🌟 HERO SECTION (Dark & Professional) */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '60px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '10px', fontWeight: '800' }}>🚀 CampusSponsor</h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 30px auto' }}>
            Connect with student organizers and sponsor the next big campus event.
        </p>

        {/* 🔍 SEARCH & FILTER INPUTS */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', maxWidth: '800px', margin: '0 auto' }}>
            <input 
                type="text" 
                placeholder="🔍 Search Event (e.g. Tech Fest)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '15px', borderRadius: '10px', border: 'none', width: '100%', maxWidth: '400px', fontSize: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', outline:'none' }}
            />
            
            <input 
                type="text" 
                placeholder="📍 Filter by City" 
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                style={{ padding: '15px', borderRadius: '10px', border: 'none', width: '100%', maxWidth: '300px', fontSize: '1rem', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', outline:'none' }}
            />
        </div>
      </div>

      {/* 📅 EVENTS GRID */}
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        
        {/* Result Count Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap:'wrap', gap:'10px' }}>
            <h2 style={{ color: '#334155', margin: 0, fontSize:'1.5rem' }}>🔥 Trending Events</h2>
            <span style={{ background: '#e2e8f0', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem', color: '#475569', fontWeight: 'bold' }}>
                {filteredEvents.length} Events Found
            </span>
        </div>

        {loading ? (
            <div style={{textAlign:'center', marginTop:'50px', color:'#64748b'}}>Loading amazing events...</div>
        ) : filteredEvents.length === 0 ? (
            // EMPTY STATE
            <div style={{textAlign:'center', padding:'50px', background:'white', borderRadius:'15px', boxShadow:'0 4px 20px rgba(0,0,0,0.05)', marginTop:'20px'}}>
                <div style={{fontSize:'3rem', marginBottom:'10px'}}>🔍</div>
                <h3 style={{color:'#1e293b'}}>No events found matching your search.</h3>
                <p style={{color:'#64748b'}}>Try searching for something else or clear filters.</p>
                <button onClick={()=>{setSearchTerm(''); setFilterLocation('')}} style={{marginTop:'15px', color:'#2563eb', background:'none', border:'none', cursor:'pointer', fontWeight:'bold', textDecoration:'underline', fontSize:'1rem'}}>Clear Filters</button>
            </div>
        ) : (
            // GRID LAYOUT
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {filteredEvents.map((event) => (
                <div key={event._id} style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', transition: '0.3s', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom:'10px' }}>
                        <h3 style={{ fontSize: '1.3rem', color: '#1e293b', fontWeight: '700', margin:0 }}>{event.title}</h3>
                        <span style={{ background: '#eff6ff', color: '#2563eb', padding: '5px 10px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace:'nowrap' }}>
                            ₹{event.budget}
                        </span>
                    </div>
                    
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '15px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden', lineHeight:'1.5' }}>
                        {event.description}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#475569', marginBottom: '20px' }}>
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>📅 <span>{new Date(event.date).toLocaleDateString()}</span></div>
                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>📍 <span>{event.location}</span></div>
                    </div>
                </div>

                <Link to={`/event/${event._id}`} style={{ display: 'block', textAlign: 'center', background: '#1e293b', color: 'white', padding: '12px', borderRadius: '10px', textDecoration: 'none', fontWeight: '600', transition: '0.3s' }}>
                    View Details &rarr;
                </Link>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Home;