import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Backend se sirf Approved events aayenge
        const { data } = await axios.get('/api/events');
        setEvents(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>🔥 Trending Events</h1>
        
        {/* 👇 FIX 1: Ye Button sirf 'student' ko dikhega */}
        {user && user.role === 'student' && (
          <Link to="/create-event" style={{ 
            background: '#2563eb', color: 'white', padding: '10px 20px', 
            borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' 
          }}>
            + Create Event
          </Link>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {events.map((event) => (
          <div key={event._id} style={{ 
            background: 'white', padding: '20px', borderRadius: '10px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #eee' 
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{event.title}</h2>
            <p>📅 {event.date}</p>
            <p>📍 {event.location}</p>
            <p>💰 ₹{event.budget}</p>
            <p style={{ color: '#666', margin: '10px 0' }}>{event.description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
              <span style={{ 
                background: '#e0f2fe', color: '#0369a1', padding: '5px 10px', 
                borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold' 
              }}>
                {event.category}
              </span>

              {/* 👇 FIX 2: WhatsApp Sponsor Button (No Error, Direct Business) */}
              {user && user.role === 'sponsor' ? (
                <a 
                  href={`https://wa.me/919022489860?text=Hi, I want to sponsor ${event.title}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#f59e0b', color: 'white', padding: '8px 15px', 
                    borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold', cursor: 'pointer'
                  }}
                >
                  🤝 Sponsor Now
                </a>
              ) : (
                <span style={{ color: 'green', fontSize: '0.9rem' }}>✅ {event.sponsors?.length || 0} Sponsors</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;