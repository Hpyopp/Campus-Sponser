import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 👇 NAYA STATE: Search aur Filter ke liye
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get('/api/events');
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // 👇 FILTER LOGIC (Asli Jaadu Yahan Hai)
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* --- HEADER SECTION --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333', margin: 0 }}>
          🔥 Trending Events
        </h1>
        
        {user && user.role === 'student' && (
          <Link to="/create-event" style={{ background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
            + Create Event
          </Link>
        )}
      </div>

      {/* 👇 SEARCH & FILTER BAR (Naya Design) */}
      <div style={{ 
        background: 'white', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', 
        marginBottom: '30px', display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', border: '1px solid #eee'
      }}>
        {/* Search Input */}
        <input 
          type="text" 
          placeholder="🔍 Search events..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            flex: 1, minWidth: '200px', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '1rem' 
          }}
        />

        {/* Category Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['All', 'Technical', 'Cultural', 'Sports', 'Workshop'].map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 15px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
                background: selectedCategory === cat ? '#333' : '#f0f0f0', // Jo select hoga wo Black, baaki Grey
                color: selectedCategory === cat ? 'white' : '#333',
                transition: '0.3s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* --- LOADING STATE --- */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>⏳</div>
          <h2>Server is waking up...</h2>
          <p>Please wait 30 seconds (Free Hosting limitation)</p>
        </div>
      ) : (
        
        /* --- EVENTS GRID --- */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* 👇 'filteredEvents' ko map karenge, 'events' ko nahi */}
          {filteredEvents.map((event) => (
            <div key={event._id} style={{ 
              background: 'white', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', 
              border: '1px solid #eee', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' 
            }}>
              
              {/* IMAGE */}
              <div style={{ height: '180px', width: '100%', overflow: 'hidden', background: '#f0f0f0' }}>
                <img 
                  src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80'} 
                  alt={event.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* CONTENT */}
              <div style={{ padding: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '10px', color: '#111' }}>{event.title}</h2>
                <p style={{ margin: '5px 0', color: '#555', fontSize: '0.9rem' }}>📅 {event.date}</p>
                <p style={{ margin: '5px 0', color: '#555', fontSize: '0.9rem' }}>📍 {event.location}</p>
                <p style={{ margin: '5px 0', color: '#333', fontWeight: 'bold' }}>💰 ₹{event.budget}</p>
                <p style={{ color: '#666', margin: '15px 0', fontSize: '0.95rem', lineHeight: '1.4' }}>{event.description}</p>
                
                {/* SOCIAL LINKS */}
                {(event.socialLinks?.instagram || event.socialLinks?.linkedin) && (
                  <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', paddingTop: '10px', borderTop: '1px dashed #eee' }}>
                    {event.socialLinks.instagram && (
                      <a href={event.socialLinks.instagram} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#E1306C', fontWeight: 'bold', fontSize: '0.9rem' }}>📸 Instagram</a>
                    )}
                    {event.socialLinks.linkedin && (
                      <a href={event.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: '#0077b5', fontWeight: 'bold', fontSize: '0.9rem' }}>💼 LinkedIn</a>
                    )}
                  </div>
                )}

                {/* FOOTER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>
                    {event.category}
                  </span>

                  {user && user.role === 'sponsor' ? (
                    <a 
                      href={`https://wa.me/919022489602?text=Hi, I want to sponsor ${event.title}`} 
                      target="_blank" rel="noopener noreferrer"
                      style={{ background: '#f59e0b', color: 'white', padding: '8px 16px', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold', fontSize: '0.9rem', boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)' }}>
                      🤝 Sponsor Now
                    </a>
                  ) : (
                    <span style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: '600' }}>
                      ✅ {event.sponsors?.length || 0} Sponsors
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredEvents.length === 0 && (
            <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#888', marginTop: '20px', fontSize: '1.2rem' }}>
                🚫 No events found. Try changing the filter.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;