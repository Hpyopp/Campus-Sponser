import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [refundCount, setRefundCount] = useState(0);
  
  // MODAL STATE
  const [showModal, setShowModal] = useState(false);
  const [selectedViewers, setSelectedViewers] = useState([]);

  const [stats, setStats] = useState({ totalRaised: 0, totalEvents: 0, totalUsers: 0, pendingEvents: 0 });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const userRes = await axios.get('/api/users/all', config);
      const eventRes = await axios.get('/api/events');
      setUsers(userRes.data);
      setEvents(eventRes.data);

      let raised = 0, pending = 0, refundReqs = 0;
      if(Array.isArray(eventRes.data)){
        eventRes.data.forEach(ev => {
            raised += (ev.raisedAmount || 0);
            if(!ev.isApproved) pending++;
            ev.sponsors?.forEach(s => { if(s.status === 'refund_requested') refundReqs++; });
        });
      }
      setStats({ totalRaised: raised, totalEvents: eventRes.data.length, totalUsers: userRes.data.length, pendingEvents: pending });
      setRefundCount(refundReqs);
    } catch (error) { console.error(error); }
  };

  const handleViewViewers = (viewers) => {
      setSelectedViewers(viewers || []);
      setShowModal(true);
  };

  const handleVerifyUser = async (id, status) => { try { const config = { headers: { Authorization: `Bearer ${user.token}` } }; const url = status ? `/api/users/approve/${id}` : `/api/users/unverify/${id}`; await axios.put(url, {}, config); fetchData(); } catch(e) { alert("Action Failed"); } };
  const handleToggleEvent = async (id, currentStatus) => { const action = currentStatus ? "Revoke" : "Approve"; if(!window.confirm(`${action} this Event?`)) return; try { const config = { headers: { Authorization: `Bearer ${user.token}` } }; const url = currentStatus ? `/api/events/admin/revoke/${id}` : `/api/events/admin/approve/${id}`; await axios.put(url, {}, config); fetchData(); } catch(e) { alert("Error"); } };
  const handleDelete = async (id, type) => { if(!window.confirm("Delete permanently?")) return; try { const config = { headers: { Authorization: `Bearer ${user.token}` } }; await axios.delete(`/api/${type}/${id}`, config); fetchData(); } catch(e) { alert("Error"); } };

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins', position:'relative' }}>
      
      {/* HEADER & STATS */}
      <div style={{ background: '#1e293b', color:'white', padding: '20px', borderRadius: '15px', marginBottom: '30px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
        <div><h2 style={{ margin: 0 }}>🛡️ Command Center</h2><p style={{ margin: 0, opacity: 0.8, fontSize:'0.9rem' }}>Welcome back, Admin</p></div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{background:'#ef4444', color:'white', padding:'10px 25px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'bold'}}>Logout</button>
      </div>
      
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'20px', marginBottom:'40px'}}>
          <div style={{background:'white', padding:'25px', borderRadius:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', borderLeft:'5px solid #16a34a'}}><div style={{color:'#64748b', fontSize:'0.9rem', fontWeight:'bold', textTransform:'uppercase'}}>Total Raised</div><div style={{fontSize:'2rem', fontWeight:'bold', color:'#1e293b'}}>₹{stats.totalRaised}</div></div>
          <div style={{background:'white', padding:'25px', borderRadius:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', borderLeft:'5px solid #2563eb'}}><div style={{color:'#64748b', fontSize:'0.9rem', fontWeight:'bold', textTransform:'uppercase'}}>Total Users</div><div style={{fontSize:'2rem', fontWeight:'bold', color:'#1e293b'}}>{stats.totalUsers}</div></div>
          <div style={{background:'white', padding:'25px', borderRadius:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', borderLeft:'5px solid #9333ea'}}><div style={{color:'#64748b', fontSize:'0.9rem', fontWeight:'bold', textTransform:'uppercase'}}>Total Events</div><div style={{fontSize:'2rem', fontWeight:'bold', color:'#1e293b'}}>{stats.totalEvents}</div></div>
          <div style={{background:'white', padding:'25px', borderRadius:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', borderLeft:'5px solid #f59e0b'}}><div style={{color:'#64748b', fontSize:'0.9rem', fontWeight:'bold', textTransform:'uppercase'}}>Pending Approvals</div><div style={{fontSize:'2rem', fontWeight:'bold', color:'#f59e0b'}}>{stats.pendingEvents}</div></div>
      </div>

      {refundCount > 0 && <div style={{ background: '#fee2e2', border: '2px solid #ef4444', padding: '20px', borderRadius: '15px', marginBottom: '40px', display:'flex', justifyContent:'space-between', alignItems:'center', animation: 'pulse 2s infinite' }}><div><h2 style={{color:'#b91c1c', margin:'0 0 5px 0'}}>🚨 High Priority!</h2><p style={{margin:0, color:'#7f1d1d', fontSize:'1.1rem'}}><strong>{refundCount} Sponsors</strong> requested a refund.</p></div><button onClick={() => navigate('/admin/refunds')} style={{padding:'12px 30px', background:'#dc2626', color:'white', fontSize:'1rem', fontWeight:'bold', border:'none', borderRadius:'8px', cursor:'pointer'}}>Resolve Now ➡️</button></div>}

      {/* USERS TABLE */}
      <h3 style={{ color: '#1e293b', borderLeft:'5px solid #2563eb', paddingLeft:'10px', marginTop:'40px' }}>👤 User Verification</h3>
      <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom:'2px solid #e2e8f0' }}><th style={{padding:'15px', color:'#475569'}}>User Details</th><th style={{padding:'15px', color:'#475569'}}>Role</th><th style={{padding:'15px', color:'#475569'}}>ID</th><th style={{padding:'15px', color:'#475569'}}>Status</th><th style={{padding:'15px', color:'#475569'}}>Action</th></tr></thead>
          <tbody>{users.map(u => (<tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}><td style={{padding:'15px'}}><strong>{u.name}</strong><br/><span style={{fontSize:'0.8rem', color:'#666'}}>{u.email}</span></td><td style={{padding:'15px'}}><span style={{background: u.role==='sponsor'?'#f0f9ff':'#fdf4ff', color: u.role==='sponsor'?'#0369a1':'#a21caf', padding:'4px 8px', borderRadius:'4px', fontSize:'0.85rem', fontWeight:'bold'}}>{u.role}</span></td><td style={{padding:'15px'}}>{u.verificationDoc ? <a href={u.verificationDoc} target="_blank" rel="noreferrer" style={{color:'blue', fontWeight:'bold', textDecoration:'underline'}}>📄 View ID</a> : <span style={{color:'#ccc'}}>Pending</span>}</td><td style={{padding:'15px'}}>{u.isVerified ? <span style={{color:'#16a34a', fontWeight:'bold'}}>Verified</span> : <span style={{color:'#d97706', fontWeight:'bold'}}>Pending</span>}</td><td style={{padding:'15px'}}>{!u.isVerified ? <button onClick={() => handleVerifyUser(u._id, true)} style={{background:'#16a34a', color:'white', padding:'6px 12px', border:'none', borderRadius:'4px', cursor:'pointer', marginRight:'5px'}}>Approve</button> : <button onClick={() => handleVerifyUser(u._id, false)} style={{background:'#f59e0b', color:'white', padding:'6px 12px', border:'none', borderRadius:'4px', cursor:'pointer', marginRight:'5px'}}>Revoke</button>}<button onClick={() => handleDelete(u._id, 'users')} style={{background:'#ef4444', color:'white', padding:'6px 12px', border:'none', borderRadius:'4px', cursor:'pointer'}}>Del</button></td></tr>))}</tbody>
        </table>
      </div>

      {/* EVENTS TABLE WITH NOTICE & VIEW COUNT */}
      <h3 style={{ color: '#1e293b', borderLeft:'5px solid #ec4899', paddingLeft:'10px', marginTop:'40px' }}>🎉 Event Requests</h3>
      <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom:'2px solid #e2e8f0' }}>
                  <th style={{padding:'15px', color:'#475569'}}>Event</th>
                  <th style={{padding:'15px', color:'#475569'}}>Budget</th>
                  {/* 👇 ADDED BACK: Notice Column */}
                  <th style={{padding:'15px', color:'#475569'}}>Notice</th>
                  <th style={{padding:'15px', color:'#475569'}}>Views</th>
                  <th style={{padding:'15px', color:'#475569'}}>Status</th>
                  <th style={{padding:'15px', color:'#475569'}}>Action</th>
              </tr>
          </thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{padding:'15px'}}><strong>{ev.title}</strong><br/><span style={{fontSize:'0.85rem', color:'#64748b'}}>By: {ev.user?.name}</span></td>
                <td style={{padding:'15px'}}>₹{ev.budget}</td>
                
                {/* 👇 NOTICE LINK */}
                <td style={{padding:'15px'}}>
                    {ev.permissionLetter ? (
                        <a href={ev.permissionLetter} target="_blank" rel="noreferrer" style={{color:'#ec4899', fontWeight:'bold', textDecoration:'underline', display:'flex', alignItems:'center', gap:'5px'}}>
                            📄 Open
                        </a>
                    ) : (
                        <span style={{color:'#94a3b8', fontStyle:'italic'}}>No File</span>
                    )}
                </td>

                {/* VIEW COUNT */}
                <td style={{padding:'15px'}}>
                    <span 
                        onClick={() => handleViewViewers(ev.views)}
                        style={{background:'#f1f5f9', padding:'5px 10px', borderRadius:'15px', cursor:'pointer', fontSize:'0.85rem', fontWeight:'bold', border:'1px solid #cbd5e1', color:'#2563eb'}}
                        title="Click to see who viewed"
                    >
                        👁️ {ev.views ? ev.views.length : 0}
                    </span>
                </td>
                
                <td style={{padding:'15px'}}>{ev.isApproved ? <span style={{color:'green', fontWeight:'bold'}}>LIVE</span> : <span style={{color:'red'}}>Pending</span>}</td>
                <td style={{padding:'15px'}}>{ev.isApproved ? <button onClick={() => handleToggleEvent(ev._id, true)} style={{background:'#f59e0b', color:'white', padding:'6px 12px', border:'none', borderRadius:'4px', cursor:'pointer', marginRight:'5px'}}>Revoke</button> : <button onClick={() => handleToggleEvent(ev._id, false)} style={{background:'#16a34a', color:'white', padding:'6px 12px', border:'none', borderRadius:'4px', cursor:'pointer', marginRight:'5px'}}>Approve</button>}<button onClick={() => handleDelete(ev._id, 'events')} style={{background:'#ef4444', color:'white', padding:'6px 12px', border:'none', borderRadius:'4px', cursor:'pointer'}}>Del</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEWERS MODAL */}
      {showModal && (
          <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
              <div style={{background:'white', padding:'30px', borderRadius:'15px', width:'90%', maxWidth:'400px', boxShadow:'0 10px 30px rgba(0,0,0,0.2)'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', borderBottom:'1px solid #eee', paddingBottom:'10px'}}>
                      <h3 style={{margin:0}}>👁️ Interested Users</h3>
                      <button onClick={() => setShowModal(false)} style={{background:'none', border:'none', fontSize:'1.2rem', cursor:'pointer'}}>✖</button>
                  </div>
                  <div style={{maxHeight:'300px', overflowY:'auto'}}>
                      {selectedViewers.length > 0 ? (
                          selectedViewers.map((v, i) => (
                              <div key={i} style={{marginBottom:'10px', padding:'12px', background:'#f8fafc', borderRadius:'8px', border:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:'10px'}}>
                                  <div style={{background:'#3b82f6', color:'white', width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>{v.name?.charAt(0).toUpperCase()}</div>
                                  <div>
                                      <div style={{fontWeight:'bold', color:'#334155', fontSize:'0.95rem'}}>{v.name}</div>
                                      <div style={{fontSize:'0.8rem', color:'#64748b'}}>{v.email}</div>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <p style={{color:'#94a3b8', textAlign:'center', fontStyle:'italic'}}>No one has viewed this yet.</p>
                      )}
                  </div>
                  <button onClick={() => setShowModal(false)} style={{width:'100%', marginTop:'20px', padding:'10px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>Close List</button>
              </div>
          </div>
      )}

      <style>{`@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); } 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); } }`}</style>
    </div>
  );
};
export default AdminDashboard;