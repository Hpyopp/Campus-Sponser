import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const AllEvents = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');

  const navigate = useNavigate();

  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  // 1. Events Fetch Karo
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get(`${ENDPOINT}/api/events`);
        setEvents(data);
        setFilteredEvents(data);
        setLoading(false);
      } catch (error) { 
        console.error(error);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // 2. Filter Logic (Search karte hi list update hogi)
  useEffect(() => {
    let result = events;
    if (search) {
      result = result.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
    }
    if (city) {
      result = result.filter(e => e.location.toLowerCase().includes(city.toLowerCase()));
    }
    setFilteredEvents(result);
  }, [search, city, events]);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px' }}>
      
      {/* 🏷️ HEADER SECTION */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '10px' }}>
          Explore Sponsorships 🚀
        </h1>
        <p style={{ color: '#64748b' }}>Discover events matching your brand and budget.</p>
      </div>

      {/* 🔍 FILTERS BAR */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 40px', background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <input 
          placeholder="🔍 Search by Event Name..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', minWidth: '200px' }}
        />
        <input 
          placeholder="📍 Filter by City (e.g. Mumbai)" 
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none', minWidth: '200px' }}
        />
      </div>

      {/* 📦 EVENTS GRID */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {loading ? (
            <p style={{ textAlign: 'center', fontSize: '1.2rem', color: '#64748b' }}>Loading Opportunities...</p>
        ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '15px' }}>
                <h3>😢 No Events Found</h3>
                <p>Try changing your search filters.</p>
            </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
            {filteredEvents.map((event) => (
              <motion.div 
                key={event._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
                style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', cursor: 'pointer' }}
                onClick={() => navigate(`/event/${event._id}`)}
              >
                {/* Gradient Header */}
                <div style={{ height: '140px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:'2.5rem' }}>
                  🎓
                </div>
                
                <div style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                     <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: '20px' }}>
                        ₹{event.budget} Needed
                     </span>
                     <span style={{ fontSize: '0.8rem', color: '#64748b' }}>📍 {event.location}</span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {event.title}
                  </h3>
                  
                  <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5', height: '40px', overflow: 'hidden', marginBottom: '20px' }}>
                    {event.description}
                  </p>

                  <button style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontWeight: '600', color: '#334155', cursor: 'pointer', transition: '0.2s' }}>
                    View Full Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AllEvents;