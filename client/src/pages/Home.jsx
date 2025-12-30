import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/events');
      setEvents(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSponsor = async (eventId) => {
    if(!confirm("Are you sure you want to sponsor this event?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/events/${eventId}/sponsor`, {}, config);
      alert("Thanks for Sponsoring! 🎉");
      fetchEvents();
    } catch (error) {
      alert(error.response?.data?.message || "Error sponsoring");
    }
  };

  if (loading) return <div className="container"><h2>Loading amazing events... ⏳</h2></div>;

  return (
    <div className="container">
      
      <div className="header-flex">
        <h1>🔥 Trending Events</h1>
        {user && (
          <Link to="/create-event" className="btn btn-primary">+ Create Event</Link>
        )}
      </div>

      <div className="grid">
        {events.map((event) => {
          const isSponsored = event.sponsors.some(s => s._id === user?._id || s === user?._id);
          const date = new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

          return (
            <div key={event._id} className="card">
              <h2 className="card-title">{event.title}</h2>
              
              <div className="card-info">📅 {date}</div>
              <div className="card-info">📍 {event.location}</div>
              <div className="card-info">💰 ₹{event.budget.toLocaleString()}</div>
              
              <p style={{ margin: '15px 0', color: '#555', fontSize: '0.9rem' }}>
                {event.description.length > 100 ? event.description.substring(0, 100) + "..." : event.description}
              </p>
              
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span className="badge">{event.category}</span>
                  {event.sponsors.length > 0 && (
                      <span style={{color: '#16a34a', fontWeight: 'bold', fontSize: '0.85rem'}}>
                          ✅ {event.sponsors.length} Sponsors
                      </span>
                  )}
              </div>

              {user && user.role === 'sponsor' && (
                <button 
                    onClick={() => handleSponsor(event._id)} 
                    disabled={isSponsored}
                    className="btn btn-sponsor"
                >
                    {isSponsored ? '✨ Already Sponsored' : '🤝 Sponsor Now'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Home;