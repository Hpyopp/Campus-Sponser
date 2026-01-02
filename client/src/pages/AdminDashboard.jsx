import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [refundCount, setRefundCount] = useState(0);
  
  // 👇 Stats State
  const [stats, setStats] = useState({
      totalRaised: 0,
      totalEvents: 0,
      totalUsers: 0,
      pendingEvents: 0
  });

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

      // 👇 CALCULATE STATS
      let raised = 0;
      let pending = 0;
      let refundReqs = 0;

      if(Array.isArray(eventRes.data)){
        eventRes.data.forEach(ev => {
            raised += (ev.raisedAmount || 0);
            if(!ev.isApproved) pending++;
            ev.sponsors?.forEach(s => { if(s.status === 'refund_requested') refundReqs++; });
        });
      }

      setStats({
          totalRaised: raised,
          totalEvents: eventRes.data.length,
          totalUsers: userRes.data.length,
          pendingEvents: pending
      });

      setRefundCount(refundReqs);

    } catch (error) { console.error(error); }
  };

  const handleVerifyUser = async (id, status) => {
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const url = status ? `/api/users/approve/${id}` : `/api/users/unverify/${id}`;
          await axios.put(url, {}, config);
          fetchData();
      } catch(e) { alert("Action Failed"); }
  };

  const handleToggleEvent = async (id, currentStatus) => {
      const action = currentStatus ? "Revoke" : "Approve";
      if(!window.confirm(`${action} this Event?`)) return;
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const url = currentStatus ? `/api/events/admin/revoke/${id}` : `/api/events/admin/approve/${id}`;
          await axios.put(url, {}, config);
          alert(`Event ${action}d!`);
          fetchData();
      } catch(e) { alert("Error"); }
  };

  const handleDelete = async (id, type) => {
      if(!window.confirm("Delete permanently?")) return;
      try { 
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.delete(`/api/${type}/${id}`, config);
          fetchData();
      } catch(e) { alert("Error"); }
  };

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins' }}>
      
      {/* HEADER */}
      <div style={{ background: '#1e293b', color:'white', padding: '20px', borderRadius: '15px', marginBottom: '30px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
        <div>
            <h2 style={{ margin: 0 }}>🛡️ Command Center</h2>
            <p style={{ margin: 0, opacity: 0.8, fontSize:'0.9rem' }}>Welcome back, Admin</p>
        </div>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{background:'#ef4444', color:'white', padding:'10px 25px', borderRadius:'8px', border:'none', cursor:'pointer', fontWeight:'bold', boxShadow:'0 4px 10px rgba(239, 68, 68, 0.3)'}}>Logout</button>
      </div>

      {/* 👇 NEW: BUSINESS ANALYTICS CARDS */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'20px', marginBottom:'40px'}}>
          
          {/* Card 1: Money */}
          <div style={{background:'white', padding:'25px', borderRadius:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', borderLeft:'5px solid #16a34a'}}>
              <div style={{color:'#64748b', fontSize:'0.9rem', fontWeight:'bold', textTransform:'uppercase'}}>Total Raised</div>
              <div style={{fontSize:'2rem', fontWeight:'bold', color:'#1e293b'}}>₹{stats.totalRaised}</div>
          </div>

          {/* Card 2: Users */}
          <div style={{background:'white', padding:'25px', borderRadius:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', borderLeft:'5px solid #2563eb'}}>
              <div style={{color:'#64748b', fontSize:'0.9rem', fontWeight:'bold', textTransform:'uppercase'}}>Total Users</div>
              <div style={{fontSize:'2rem', fontWeight:'bold', color:'#1e293b'}}>{stats.totalUsers}</div>
          </div>

          {/* Card 3: Events */}
          <div style={{background:'white', padding:'25px', borderRadius:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', borderLeft:'5px solid #9333ea'}}>
              <div style={{color:'#64748b', fontSize:'0.9rem', fontWeight:'bold', textTransform:'uppercase'}}>Total Events</div>
              <div style={{fontSize:'2rem', fontWeight:'bold', color:'#1e293b'}}>{stats.totalEvents}</div>
          </div>

          {/* Card 4: Action Items */}
          <div style={{background:'white', padding:'25px', borderRadius:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', borderLeft:'5px solid #f59e0b'}}>
              <div style={{color:'#64748b', fontSize:'0.9rem', fontWeight:'bold', textTransform:'uppercase'}}>Pending Approvals</div>
              <div style={{fontSize:'2rem', fontWeight:'bold', color:'#f59e0b'}}>{stats.pendingEvents}</div>
          </div>
      </div>

      {/* ALERT SECTION */}
      {refundCount > 0 ? (
          <div style={{ background: '#fee2e2', border: '2px solid #ef4444', padding: '20px', borderRadius: '15px', marginBottom: '40px', display:'flex', justifyContent:'space-between', alignItems:'center', animation: 'pulse 2s infinite' }}>
              <div>
                  <h2 style={{color:'#b91c1c', margin:'0 0 5px 0'}}>🚨 High Priority!</h2>
                  <p style={{margin:0, color:'#7f1d1d', fontSize:'1.1rem'}}><strong>{refundCount} Sponsors</strong> requested a refund.</p>
              </div>
              <button onClick={() => navigate('/admin/refunds')} style={{padding:'12px 30px', background:'#dc2626', color:'white', fontSize:'1rem', fontWeight:'bold', border:'none', borderRadius:'8px', cursor:'pointer'}}>Resolve Now ➡️</button>
          </div>
      ) : (
          <div style={{ background: '#dcfce7', border: '1px solid #16a34a', padding: '15px', borderRadius: '10px', marginBottom: '40px', color:'#166534', fontWeight:'bold', textAlign:'center' }}>
              ✅ All Systems Nominal. No pending refunds.
          </div>
      )}

      {/* --- USERS TABLE --- */}
      <h3 style={{ color: '#1e293b', borderLeft:'5px solid #2563eb', paddingLeft:'10px', marginTop:'40px' }}>👤 User Verification</h3>
      <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom:'2px solid #e2e8f0' }}><th style={{padding:'15px', color:'#475569'}}>User Details</th><th style={{padding:'15px', color:'#475569'}}>Role</th><th style={{padding:'15px', color:'#475569'}}>ID Proof</th><th style={{padding:'15px', color:'#475569'}}>Status</th><th style={{padding:'15px', color:'#475569'}}>Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{padding:'15px'}}><strong>{u.name}</strong><br/><span style={{fontSize:'0.8rem', color:'#666'}}>{u.email}</span></td>
                <td style={{padding:'15px', textTransform:'capitalize'}}><span style={{background: u.role==='sponsor'?'#f0f9ff':'#fdf4ff', color: u.role==='sponsor'?'#0369a1':'#a21caf', padding:'4px 8px', borderRadius:'4px', fontSize:'0.85rem', fontWeight:'bold'}}>{u.role}</span></td>
                <td style={{padding:'15px'}}>{u.verificationDoc ? <a href={u.verificationDoc} target="_blank" rel="noreferrer" style={{color:'blue', fontWeight:'bold', textDecoration:'underline'}}>📄 View ID</a> : <span style={{color:'#ccc'}}>Pending</span>}</td>
                <td style={{padding:'15px'}}>{u.isVerified ? <span style={{color:'#16a34a', fontWeight:'bold', background:'#dcfce7', padding:'4px 8px', borderRadius:'4px'}}>Verified</span> : <span style={{color:'#d97706', fontWeight:'bold', background:'#ffedd5', padding:'4px 8px', borderRadius:'4px'}}>Pending</span>}</td>
                <td style={{padding:'15px'}}>
                    {!u.isVerified ? 
                        <button onClick={() => handleVerifyUser(u._id, true)} style={{background:'#16a34a', color:'white', padding:'8px 15px', border:'none', borderRadius:'6px', cursor:'pointer', marginRight:'5px', fontWeight:'bold'}}>Approve</button> :
                        <button onClick={() => handleVerifyUser(u._id, false)} style={{background:'#f59e0b', color:'white', padding:'8px 15px', border:'none', borderRadius:'6px', cursor:'pointer', marginRight:'5px', fontWeight:'bold'}}>Revoke</button>
                    }
                    <button onClick={() => handleDelete(u._id, 'users')} style={{background:'#ef4444', color:'white', padding:'8px 15px', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold'}}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- EVENTS TABLE --- */}
      <h3 style={{ color: '#1e293b', borderLeft:'5px solid #ec4899', paddingLeft:'10px', marginTop:'40px' }}>🎉 Event Requests</h3>
      <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f8fafc', textAlign: 'left', borderBottom:'2px solid #e2e8f0' }}><th style={{padding:'15px', color:'#475569'}}>Event & Organizer</th><th style={{padding:'15px', color:'#475569'}}>Budget</th><th style={{padding:'15px', color:'#475569'}}>Notice</th><th style={{padding:'15px', color:'#475569'}}>Status</th><th style={{padding:'15px', color:'#475569'}}>Action</th></tr></thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{padding:'15px'}}>
                    <strong>{ev.title}</strong><br/>
                    <span style={{fontSize:'0.85rem', color:'#64748b'}}>By: {ev.user?.name || "Unknown"} <span style={{color:'#2563eb'}}>({ev.user?.email})</span></span>
                </td>
                <td style={{padding:'15px', fontWeight:'bold'}}>₹{ev.budget}</td>
                <td style={{padding:'15px'}}>{ev.permissionLetter ? <a href={ev.permissionLetter} target="_blank" rel="noreferrer" style={{color:'#ec4899', fontWeight:'bold', textDecoration:'underline'}}>📄 Notice</a> : 'No File'}</td>
                <td style={{padding:'15px'}}>{ev.isApproved ? <span style={{color:'#16a34a', fontWeight:'bold', background:'#dcfce7', padding:'4px 8px', borderRadius:'4px'}}>LIVE</span> : <span style={{color:'#dc2626', fontWeight:'bold', background:'#fee2e2', padding:'4px 8px', borderRadius:'4px'}}>Pending</span>}</td>
                <td style={{padding:'15px'}}>
                    {ev.isApproved ? (
                        <button onClick={() => handleToggleEvent(ev._id, true)} style={{background:'#f59e0b', color:'white', padding:'8px 15px', border:'none', borderRadius:'6px', cursor:'pointer', marginRight:'5px', fontWeight:'bold'}}>Revoke</button>
                    ) : (
                        <button onClick={() => handleToggleEvent(ev._id, false)} style={{background:'#16a34a', color:'white', padding:'8px 15px', border:'none', borderRadius:'6px', cursor:'pointer', marginRight:'5px', fontWeight:'bold'}}>Approve</button>
                    )}
                    <button onClick={() => handleDelete(ev._id, 'events')} style={{background:'#ef4444', color:'white', padding:'8px 15px', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'bold'}}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); } 100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); } }`}</style>
    </div>
  );
};
export default AdminDashboard;