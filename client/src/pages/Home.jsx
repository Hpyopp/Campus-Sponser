import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('/api/events');
        const approvedEvents = res.data.filter(e => e.isApproved === true);
        setEvents(approvedEvents);
      } catch (error) { console.error(error); }
    };
    fetchEvents();
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1e293b', margin: 0 }}>🔥 Upcoming Events</h1>
        
        {user && user.role === 'student' && (
            <Link to="/create-event" style={{ padding: '12px 25px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: '30px', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)' }}>
                + Create Event
            </Link>
        )}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
        {events.map(event => (
          <div key={event._id} onClick={() => navigate(`/event/${event._id}`)} style={{ background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'pointer', border: '1px solid #f1f5f9' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#334155' }}>{event.title}</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>📍 {event.location} | 📅 {new Date(event.date).toLocaleDateString()}</p>
            
            <div style={{ marginTop: '15px', background: '#f0f9ff', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
               <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Funds Raised</span>
               <strong style={{ color: '#0284c7', fontSize: '1.1rem' }}>₹ {event.raisedAmount} / ₹ {event.budget}</strong>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: '50px', color: '#94a3b8' }}>
              <h3>No Live Events Yet 📭</h3>
              <p>Wait for students to post & admin to approve.</p>
          </div>
      )}
    </div>
  );
};

export default Home;