import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [mySponsorships, setMySponsorships] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) { navigate('/login'); return; }
    setUser(storedUser);
    fetchMyData(storedUser);
  }, []);

  const fetchMyData = async (currentUser) => {
    try {
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      
      // 1. Get All Events
      const res = await axios.get('/api/events', config);
      const allEvents = res.data;

      if (currentUser.role === 'student') {
          // Filter: Events created by me
          const myCreated = allEvents.filter(e => e.user && e.user._id === currentUser._id);
          setMyEvents(myCreated);
      } else if (currentUser.role === 'sponsor') {
          // Filter: Events where I am a sponsor
          const myFunded = [];
          allEvents.forEach(ev => {
              if (ev.sponsors) {
                  const sponsorship = ev.sponsors.find(s => s.sponsorId === currentUser._id);
                  if (sponsorship) {
                      myFunded.push({ 
                          ...ev, 
                          myStatus: sponsorship.status, 
                          myAmount: sponsorship.amount,
                          mySponsorId: sponsorship.sponsorId // For Agreement Link
                      });
                  }
              }
          });
          setMySponsorships(myFunded);
      }
    } catch (error) { toast.error("Could not fetch history"); }
    finally { setLoading(false); }
  };

  const handleLogout = () => {
      localStorage.clear();
      toast.success("Logged out successfully");
      navigate('/login');
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Loading Profile...</div>;
  if (!user) return null;

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', fontFamily: 'Poppins' }}>
      
      {/* 1. HEADER SECTION */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap:'wrap', gap:'20px' }}>
        <div style={{display:'flex', gap:'20px', alignItems:'center'}}>
            <div style={{width:'80px', height:'80px', background:'#3b82f6', color:'white', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', fontWeight:'bold'}}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
                <h2 style={{margin:0, color:'#1e293b'}}>{user.name}</h2>
                <div style={{color:'#64748b'}}>{user.email}</div>
                <div style={{marginTop:'5px'}}>
                    <span style={{background: user.role==='sponsor'?'#dbeafe':'#fce7f3', color: user.role==='sponsor'?'#1e40af':'#be185d', padding:'4px 10px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'bold', display:'inline-block', marginRight:'10px'}}>
                        {user.role.toUpperCase()}
                    </span>
                    {user.isVerified && <span style={{color:'#16a34a', fontWeight:'bold', fontSize:'0.9rem'}}>✅ Verified Account</span>}
                </div>
            </div>
        </div>
        <button onClick={handleLogout} style={{padding:'10px 25px', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>Logout</button>
      </div>

      {/* 2. DASHBOARD CONTENT */}
      <div style={{ marginTop: '30px' }}>
        
        {/* === SPONSOR VIEW === */}
        {user.role === 'sponsor' && (
            <>
                <h3 style={{color:'#1e293b', borderLeft:'5px solid #2563eb', paddingLeft:'10px'}}>💼 My Investment Portfolio</h3>
                {mySponsorships.length === 0 ? (
                    <div style={{padding:'40px', background:'#f8fafc', borderRadius:'10px', textAlign:'center', color:'#64748b'}}>You haven't sponsored any events yet. <br/><button onClick={()=>navigate('/')} style={{marginTop:'10px', color:'#2563eb', background:'none', border:'none', cursor:'pointer', fontWeight:'bold'}}>Explore Events</button></div>
                ) : (
                    <div style={{display:'grid', gap:'15px'}}>
                        {mySponsorships.map((item, idx) => (
                            <div key={idx} style={{background:'white', padding:'20px', borderRadius:'10px', border:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'15px'}}>
                                <div>
                                    <h4 style={{margin:'0 0 5px 0', fontSize:'1.1rem'}}>{item.title}</h4>
                                    <div style={{fontSize:'0.9rem', color:'#64748b'}}>📅 {new Date(item.date).toLocaleDateString()}</div>
                                </div>
                                <div style={{textAlign:'right'}}>
                                    <div style={{fontSize:'1.2rem', fontWeight:'bold', color:'#16a34a'}}>₹{item.myAmount}</div>
                                    <div style={{fontSize:'0.8rem', fontWeight:'bold', color: item.myStatus==='verified'?'green':'#f59e0b'}}>
                                        {item.myStatus === 'verified' ? '✅ SEALED' : item.myStatus === 'refund_requested' ? '⚠️ REFUND REQ' : '⏳ PENDING'}
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/agreement/${item._id}?sponsorId=${item.mySponsorId}`)} style={{padding:'8px 15px', background:'#2563eb', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold'}}>
                                    📄 View Agreement
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )}

        {/* === STUDENT VIEW === */}
        {user.role === 'student' && (
            <>
                <h3 style={{color:'#1e293b', borderLeft:'5px solid #db2777', paddingLeft:'10px'}}>🎉 My Organized Events</h3>
                {myEvents.length === 0 ? (
                    <div style={{padding:'40px', background:'#f8fafc', borderRadius:'10px', textAlign:'center', color:'#64748b'}}>No events created yet. <br/><button onClick={()=>navigate('/create-event')} style={{marginTop:'10px', color:'#db2777', background:'none', border:'none', cursor:'pointer', fontWeight:'bold'}}>Create New Event</button></div>
                ) : (
                    <div style={{display:'grid', gap:'15px'}}>
                        {myEvents.map((item, idx) => (
                            <div key={idx} style={{background:'white', padding:'20px', borderRadius:'10px', border:'1px solid #e2e8f0', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'15px'}}>
                                <div>
                                    <h4 style={{margin:'0 0 5px 0', fontSize:'1.1rem'}}>{item.title}</h4>
                                    <div style={{fontSize:'0.85rem', color:'#64748b'}}>Target: ₹{item.budget}</div>
                                </div>
                                
                                {/* Progress Bar Mini */}
                                <div style={{flex:1, maxWidth:'200px', margin:'0 10px'}}>
                                    <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginBottom:'3px'}}><span>Raised</span><span>{Math.round((item.raisedAmount/item.budget)*100)}%</span></div>
                                    <div style={{width:'100%', height:'8px', background:'#f1f5f9', borderRadius:'5px', overflow:'hidden'}}><div style={{width:`${Math.min((item.raisedAmount/item.budget)*100, 100)}%`, height:'100%', background:'#16a34a'}}></div></div>
                                </div>

                                <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                                    <span style={{padding:'5px 10px', background: item.isApproved ? '#dcfce7' : '#fee2e2', color: item.isApproved ? '#166534' : '#991b1b', borderRadius:'5px', fontSize:'0.8rem', fontWeight:'bold'}}>
                                        {item.isApproved ? 'LIVE' : 'PENDING'}
                                    </span>
                                    <button onClick={() => navigate(`/event/${item._id}`)} style={{padding:'8px 15px', background:'#0f172a', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold'}}>
                                        Manage
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </>
        )}

      </div>
    </div>
  );
};

export default Profile;