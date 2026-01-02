import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState('newest'); // 'newest', 'low-budget', 'high-budget'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('/api/events');
        // Sirf Approved/Live events hi dikhao
        const approved = res.data.filter(e => e.isApproved);
        setEvents(approved);
        setFilteredEvents(approved);
      } catch (error) {
        toast.error("Could not load events");
      } finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  // 👇 SEARCH & SORT LOGIC (Real-time)
  useEffect(() => {
      let result = [...events];

      // 1. Search Filter (Title or College Name)
      if(search) {
          result = result.filter(e => 
              e.title.toLowerCase().includes(search.toLowerCase()) || 
              (e.user?.collegeName && e.user.collegeName.toLowerCase().includes(search.toLowerCase()))
          );
      }

      // 2. Sorting Logic
      if(sortType === 'low-budget') {
          result.sort((a,b) => a.budget - b.budget);
      } else if (sortType === 'high-budget') {
          result.sort((a,b) => b.budget - a.budget);
      } else {
          // Newest first (Default)
          result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      setFilteredEvents(result);
  }, [search, sortType, events]);

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins', minHeight:'80vh' }}>
      
      {/* HERO SECTION */}
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '3rem', color: '#1e293b', marginBottom: '10px', fontWeight:'800' }}>🚀 Fund the Future</h1>
        <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Connect with Top Campus Events & Sponsors instantly.</p>
        
        {/* 👇 SEARCH & FILTER BAR */}
        <div style={{ marginTop: '30px', display:'flex', justifyContent:'center', gap:'15px', flexWrap:'wrap' }}>
            <input 
                type="text" 
                placeholder="🔍 Search Event or College..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '15px 25px', width: '350px', borderRadius: '30px', border: '1px solid #cbd5e1', outline: 'none', fontSize:'1rem', boxShadow:'0 4px 10px rgba(0,0,0,0.05)' }}
            />
            
            <select 
                value={sortType} 
                onChange={(e) => setSortType(e.target.value)}
                style={{ padding: '15px 25px', borderRadius: '30px', border: '1px solid #cbd5e1', outline: 'none', cursor:'pointer', background:'white', fontSize:'1rem' }}
            >
                <option value="newest">🔥 Newest First</option>
                <option value="low-budget">💰 Budget: Low to High</option>
                <option value="high-budget">💎 Budget: High to Low</option>
            </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', marginTop: '50px', color:'#64748b' }}>Loading Opportunities...</div>
      ) : (
        <>
          <h3 style={{color:'#334155', borderLeft:'5px solid #2563eb', paddingLeft:'15px', marginBottom:'25px', fontSize:'1.5rem'}}>
              {search ? `Found ${filteredEvents.length} Results` : '🔥 Trending Events'}
          </h3>

          {filteredEvents.length === 0 ? (
             <div style={{textAlign:'center', padding:'50px', background:'#f8fafc', borderRadius:'15px', border:'2px dashed #e2e8f0', marginTop:'20px'}}>
                 <div style={{fontSize:'3rem'}}>😕</div>
                 <h3>No Events Found</h3>
                 <p style={{color:'#64748b'}}>Try adjusting your search filters.</p>
             </div>
          ) : (
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                {filteredEvents.map((event) => {
                  const raised = event.raisedAmount || 0;
                  const progress = Math.min((raised / event.budget) * 100, 100);

                  return (
                    <div key={event._id} style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', transition: 'transform 0.2s', border: '1px solid #f1f5f9', display:'flex', flexDirection:'column' }}>
                      
                      <div style={{ padding: '25px', flex: 1 }}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'10px'}}>
                            <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b', fontWeight:'700', lineHeight:'1.4' }}>{event.title}</h2>
                            {progress >= 100 && <span style={{background:'#dcfce7', color:'#166534', fontSize:'0.7rem', padding:'4px 8px', borderRadius:'20px', fontWeight:'bold', whiteSpace:'nowrap', marginLeft:'10px'}}>FUNDED</span>}
                        </div>
                        
                        <p style={{ color: '#64748b', fontSize: '0.9rem', display:'flex', alignItems:'center', gap:'5px', margin:'5px 0' }}>
                            🏫 <span style={{fontWeight:'600'}}>{event.user?.collegeName || "College Event"}</span>
                        </p>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin:'0' }}>
                            📍 {event.location} • 📅 {new Date(event.date).toLocaleDateString()}
                        </p>
                        
                        <div style={{ marginTop: '25px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px' }}>
                            <span style={{ color: '#16a34a' }}>Raised: ₹{raised}</span>
                            <span style={{ color: '#2563eb' }}>Goal: ₹{event.budget}</span>
                          </div>
                          <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                            <div style={{ width: `${progress}%`, height: '100%', background: progress >= 100 ? '#16a34a' : 'linear-gradient(90deg, #3b82f6, #2563eb)', borderRadius:'10px' }}></div>
                          </div>
                        </div>
                      </div>

                      <div style={{padding:'20px', background:'#f8fafc', borderTop:'1px solid #f1f5f9'}}>
                        <button 
                            onClick={() => navigate(`/event/${event._id}`)} 
                            style={{ width: '100%', padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', letterSpacing:'0.5px', transition:'0.3s' }}
                        >
                            View Details ➔
                        </button>
                      </div>
                    </div>
                  );
                })}
             </div>
          )}
        </>
      )}
    </div>
  );
};

export default Home;