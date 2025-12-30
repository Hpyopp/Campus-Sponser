import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axios.get('/api/events');
        setEvents(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      width: '100%' // Ensure full width on mobile
    }}>
      
      {/* --- HEADER SECTION --- */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px',
        flexWrap: 'wrap', // Mobile pe title aur button upar-niche ho jayenge agar jagah kam hogi
        gap: '10px'
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#333',
          margin: 0
        }}>
          🔥 Trending Events
        </h1>
        
        {/* Sirf Student ko Create button dikhega */}
        {user && user.role === 'student' && (
          <Link to="/create-event" style={{ 
            background: '#2563eb', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '8px', 
            textDecoration: 'none', 
            fontWeight: '600',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap' // Text ko tutne se rokega
          }}>
            + Create Event
          </Link>
        )}
      </div>

      {/* --- EVENTS GRID (MOBILE RESPONSIVE) --- */}
      <div style={{ 
        display: 'grid', 
        // Mobile pe 1 column, Tablet pe 2, Desktop pe 3
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '20px'
      }}>
        {events.map((event) => (
          <div key={event._id} style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            boxShadow: '0 4px 10px rgba(0,0,0,0.08)', 
            border: '1px solid #eee',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '10px', color: '#111' }}>{event.title}</h2>
              <p style={{ margin: '5px 0', color: '#555', fontSize: '0.9rem' }}>📅 {event.date}</p>
              <p style={{ margin: '5px 0', color: '#555', fontSize: '0.9rem' }}>📍 {event.location}</p>
              <p style={{ margin: '5px 0', color: '#333', fontWeight: 'bold' }}>💰 ₹{event.budget}</p>
              <p style={{ color: '#666', margin: '15px 0', fontSize: '0.95rem', lineHeight: '1.4' }}>
                {event.description}
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '20px',
              borderTop: '1px solid #f0f0f0',
              paddingTop: '15px'
            }}>
              <span style={{ 
                background: '#e0f2fe', 
                color: '#0369a1', 
                padding: '6px 12px', 
                borderRadius: '20px', 
                fontSize: '0.75rem', 
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                {event.category}
              </span>

              {/* Sponsor Button Logic */}
              {user && user.role === 'sponsor' ? (
                <a 
                  href={`https://wa.me/91902248960?text=Hi, I want to sponsor ${event.title}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: '#f59e0b', 
                    color: 'white', 
                    padding: '8px 16px', 
                    borderRadius: '6px', 
                    textDecoration: 'none', 
                    fontWeight: 'bold', 
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 4px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  🤝 Sponsor Now
                </a>
              ) : (
                <span style={{ color: '#16a34a', fontSize: '0.85rem', fontWeight: '600' }}>
                  ✅ {event.sponsors?.length || 0} Sponsors
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Agar koi event na ho */}
        {events.length === 0 && (
            <p style={{ textAlign: 'center', gridColumn: '1/-1', color: '#888', marginTop: '20px' }}>
                No approved events yet.
            </p>
        )}
      </div>
    </div>
  );
};

export default Home;