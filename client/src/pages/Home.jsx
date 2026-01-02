import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('/api/events');
        // 👇 Filter Only Approved
        const approvedEvents = res.data.filter(e => e.isApproved === true);
        setEvents(approvedEvents);
      } catch (error) { console.error(error); }
    };
    fetchEvents();
  }, []);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily:'Poppins' }}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px'}}>
        <h1>🔥 Upcoming Events</h1>
        <Link to="/create-event" style={{padding:'10px 20px', background:'blue', color:'white', textDecoration:'none', borderRadius:'5px'}}>+ Add Event</Link>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
        {events.map(event => (
          <div key={event._id} onClick={() => navigate(`/event/${event._id}`)} style={{ background: 'white', padding: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', cursor:'pointer', borderRadius:'10px' }}>
            <h3>{event.title}</h3>
            <p>📍 {event.location} | 📅 {new Date(event.date).toLocaleDateString()}</p>
            <div style={{background:'#f0f9ff', padding:'10px', color:'blue', fontWeight:'bold', borderRadius:'5px', marginTop:'10px'}}>
                Funds: ₹{event.raisedAmount} / ₹{event.budget}
            </div>
          </div>
        ))}
      </div>
      {events.length === 0 && <p style={{textAlign:'center', color:'#888'}}>No events live right now.</p>}
    </div>
  );
};
export default Home;