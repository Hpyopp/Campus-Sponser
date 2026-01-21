import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // URL se query params nikalo (e.g. ?city=ulhasnagar)
  const queryParams = new URLSearchParams(location.search);
  const city = queryParams.get('city') || '';
  const keyword = queryParams.get('q') || '';

  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  useEffect(() => {
    const fetchAndFilterEvents = async () => {
        setLoading(true);
        try {
            // Saare events le aao, fir frontend pe filter karenge
            const { data } = await axios.get(`${ENDPOINT}/api/events`);
            
            // Filter Logic
            const filtered = data.filter(e => {
                const matchCity = city ? e.location.toLowerCase().includes(city.toLowerCase()) : true;
                const matchKeyword = keyword ? e.title.toLowerCase().includes(keyword.toLowerCase()) : true;
                return matchCity && matchKeyword;
            });

            setEvents(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    fetchAndFilterEvents();
  }, [city, keyword]); // Jab bhi search change ho, dubara run karo

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px', fontFamily: "'Poppins', sans-serif" }}>
      
      <h2 style={{ color: '#1e293b', marginBottom: '20px' }}>
        🔍 Search Results for "{keyword || city || 'All'}"
      </h2>

      {loading ? (
        <div style={{textAlign:'center', marginTop:'50px'}}>Searching Events... ⏳</div>
      ) : events.length === 0 ? (
        <div style={{textAlign:'center', padding:'50px', background:'#f8fafc', borderRadius:'15px', color:'#94a3b8'}}>
            <h3>No events found 🕵️‍♂️</h3>
            <p>Try searching for a different city or keyword.</p>
            <button onClick={() => navigate('/')} style={{marginTop:'10px', padding:'10px 20px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>Go Home</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
            {events.map((event) => (
                <div 
                    key={event._id}
                    onClick={() => navigate(`/events/${event._id}`)}
                    style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', cursor: 'pointer', border: '1px solid #f1f5f9', transition:'0.2s' }}
                >
                    <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                    <div style={{ padding: '15px' }}>
                        <span style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#3730a3', padding: '3px 8px', borderRadius: '5px', fontWeight: 'bold' }}>
                            {event.category || 'Event'}
                        </span>
                        <h3 style={{ margin: '10px 0 5px 0', fontSize: '1.1rem', color: '#1e293b' }}>{event.title}</h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>📍 {event.location}</p>
                        <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#2563eb' }}>Target: ₹{event.budget}</span>
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default SearchEvents;