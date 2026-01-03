import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState('newest');
  const [loading, setLoading] = useState(true);
  
  // Stats State
  const [stats, setStats] = useState({ totalMoney: 0, activeEvents: 0 });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('/api/events');
        const approved = res.data.filter(e => e.isApproved);
        setEvents(approved);
        setFilteredEvents(approved);

        // Calculate Stats
        const total = approved.reduce((acc, curr) => acc + (curr.raisedAmount || 0), 0);
        setStats({ totalMoney: total, activeEvents: approved.length });

      } catch (error) {
        toast.error("Could not load events");
      } finally { setLoading(false); }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
      let result = [...events];
      if(search) {
          result = result.filter(e => 
              e.title.toLowerCase().includes(search.toLowerCase()) || 
              (e.user?.collegeName && e.user.collegeName.toLowerCase().includes(search.toLowerCase()))
          );
      }
      if(sortType === 'low-budget') { result.sort((a,b) => a.budget - b.budget); }
      else if (sortType === 'high-budget') { result.sort((a,b) => b.budget - a.budget); }
      else { result.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); }
      setFilteredEvents(result);
  }, [search, sortType, events]);

  return (
    <div style={{ fontFamily: 'Poppins', minHeight:'80vh' }}>
      
      {/* 1. HERO SECTION */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '80px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '15px', fontWeight:'800', letterSpacing:'-1px' }}>
            🚀 Fund the <span style={{color:'#3b82f6'}}>Future</span>
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '1.3rem', maxWidth:'600px', margin:'0 auto' }}>
            India's #1 Marketplace for Campus Events. <br/>Connect with top sponsors in minutes.
        </p>
        
        {/* STATS */}
        <div style={{ display:'flex', justifyContent:'center', gap:'40px', marginTop:'40px' }}>
            <div>
                <div style={{fontSize:'2.5rem', fontWeight:'bold', color:'#3b82f6'}}>₹{stats.totalMoney.toLocaleString()}+</div>
                <div style={{color:'#cbd5e1', fontSize:'0.9rem', textTransform:'uppercase', letterSpacing:'1px'}}>Funds Raised</div>
            </div>
            <div style={{borderLeft:'1px solid #334155'}}></div>
            <div>
                <div style={{fontSize:'2.5rem', fontWeight:'bold', color:'#16a34a'}}>{stats.activeEvents}+</div>
                <div style={{color:'#cbd5e1', fontSize:'0.9rem', textTransform:'uppercase', letterSpacing:'1px'}}>Live Events</div>
            </div>
        </div>
      </div>

      {/* 2. HOW IT WORKS */}
      <div style={{ padding: '60px 20px', background: 'white', textAlign: 'center', borderBottom:'1px solid #f1f5f9' }}>
          <h2 style={{color:'#1e293b', marginBottom:'40px', fontSize:'2rem', fontWeight:'800'}}>How It Works?</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))', gap:'30px', maxWidth:'1000px', margin:'0 auto' }}>
              
              <div style={{padding:'20px'}}>
                  <div style={{width:'60px', height:'60px', background:'#eff6ff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', margin:'0 auto 15px auto'}}>📝</div>
                  <h3 style={{margin:'0 0 10px 0'}}>1. List Event</h3>
                  <p style={{color:'#64748b'}}>Students create an event profile with budget, details, and permission letters.</p>
              </div>

              <div style={{padding:'20px'}}>
                  <div style={{width:'60px', height:'60px', background:'#f0fdf4', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', margin:'0 auto 15px auto'}}>✅</div>
                  <h3 style={{margin:'0 0 10px 0'}}>2. Get Verified</h3>
                  <p style={{color:'#64748b'}}>Our Admin team verifies the college ID and documents within 24 hours.</p>
              </div>

              <div style={{padding:'20px'}}>
                  <div style={{width:'60px', height:'60px', background:'#fff7ed', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', margin:'0 auto 15px auto'}}>🤝</div>
                  <h3 style={{margin:'0 0 10px 0'}}>3. Get Funded</h3>
                  <p style={{color:'#64748b'}}>Sponsors browse, pledge funds, and sign the official agreement instantly.</p>
              </div>

          </div>
      </div>

      {/* 3. SEARCH & EVENTS SECTION */}
      <div style={{ padding: '50px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* 👇 FIXED ALIGNMENT HERE */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'20px', marginBottom:'40px' }}>
            
            <h2 style={{margin:0, color:'#1e293b', fontSize:'2rem', fontWeight:'800', display:'flex', alignItems:'center', gap:'10px'}}>
                🔥 Trending Opportunities
            </h2>
            
            {/* SEARCH & SORT WRAPPER */}
            <div style={{ display:'flex', gap:'15px', flexWrap:'wrap' }}>
                <div style={{position:'relative'}}>
                    <input 
                        type="text" 
                        placeholder="Search events..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ padding: '12px 20px 12px 40px', width: '280px', borderRadius: '30px', border: '1px solid #cbd5e1', outline: 'none', fontSize:'0.95rem', boxShadow:'0 2px 5px rgba(0,0,0,0.05)' }}
                    />
                    <span style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', opacity:0.5}}>🔍</span>
                </div>

                <select 
                    value={sortType} 
                    onChange={(e) => setSortType(e.target.value)}
                    style={{ padding: '12px 20px', borderRadius: '30px', border: '1px solid #cbd5e1', outline: 'none', cursor:'pointer', background:'white', fontSize:'0.95rem', boxShadow:'0 2px 5px rgba(0,0,0,0.05)' }}
                >
                    <option value="newest">✨ Newest First</option>
                    <option value="low-budget">💰 Budget: Low to High</option>
                    <option value="high-budget">💎 Budget: High to Low</option>
                </select>
            </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '50px', color:'#64748b' }}>Loading Opportunities...</div>
        ) : filteredEvents.length === 0 ? (
           <div style={{textAlign:'center', padding:'60px', background:'#f8fafc', borderRadius:'20px', border:'2px dashed #e2e8f0'}}>
               <div style={{fontSize:'3rem'}}>😕</div>
               <h3 style={{color:'#334155'}}>No Events Found</h3>
               <p style={{color:'#64748b'}}>Try adjusting your filters.</p>
           </div>
        ) : (
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
              {filteredEvents.map((event) => {
                const raised = event.raisedAmount || 0;
                const progress = Math.min((raised / event.budget) * 100, 100);

                return (
                  <div key={event._id} style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display:'flex', flexDirection:'column', transition:'transform 0.3s' }} onMouseOver={(e)=>e.currentTarget.style.transform='translateY(-5px)'} onMouseOut={(e)=>e.currentTarget.style.transform='translateY(0)'}>
                    
                    <div style={{ padding: '25px', flex: 1 }}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'10px'}}>
                          <h2 style={{ margin: 0, fontSize: '1.3rem', color: '#1e293b', fontWeight:'700', lineHeight:'1.4' }}>{event.title}</h2>
                          {progress >= 100 && <span style={{background:'#dcfce7', color:'#166534', fontSize:'0.7rem', padding:'4px 8px', borderRadius:'20px', fontWeight:'bold', marginLeft:'10px', whiteSpace:'nowrap'}}>FUNDED</span>}
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
                          style={{ width: '100%', padding: '12px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', letterSpacing:'0.5px' }}
                      >
                          View Details ➔
                      </button>
                    </div>
                  </div>
                );
              })}
           </div>
        )}
      </div>
    </div>
  );
};

export default Home;