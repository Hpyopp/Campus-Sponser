import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [refundCount, setRefundCount] = useState(0);
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
      const eventRes = await axios.get('/api/events'); // Get ALL events
      
      setUsers(userRes.data || []);
      setEvents(eventRes.data || []);

      let count = 0;
      if(Array.isArray(eventRes.data)) {
        eventRes.data.forEach(ev => {
            ev.sponsors?.forEach(s => { if(s.status === 'refund_requested') count++; });
        });
      }
      setRefundCount(count);
    } catch (error) { console.error(error); }
  };

  // --- ACTIONS ---
  const handleVerifyUser = async (id, status) => {
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const url = status ? `/api/users/approve/${id}` : `/api/users/unverify/${id}`;
          await axios.put(url, {}, config);
          fetchData();
      } catch(e) { alert("Error"); }
  };

  const handleDeleteUser = async (id) => {
      if(!window.confirm("Delete?")) return;
      try { const config = { headers: { Authorization: `Bearer ${user.token}` } }; await axios.delete(`/api/users/${id}`, config); fetchData(); } catch(e) { alert("Error"); }
  };

  const handleApproveEvent = async (id) => {
      if(!window.confirm("Approve this event?")) return;
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.put(`/api/events/admin/approve/${id}`, {}, config);
          alert("✅ Event is LIVE!"); fetchData();
      } catch(e) { alert("Error"); }
  };

  const handleDeleteEvent = async (id) => {
      if(!window.confirm("Delete?")) return;
      try { const config = { headers: { Authorization: `Bearer ${user.token}` } }; await axios.delete(`/api/events/${id}`, config); fetchData(); } catch(e) { alert("Error"); }
  };

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins' }}>
      
      {/* HEADER */}
      <div style={{ background: '#b91c1c', color:'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2 style={{ margin: 0 }}>🛡️ Super Admin</h2>
        <div style={{display:'flex', gap:'10px'}}>
             <button onClick={() => navigate('/admin/refunds')} style={{background:'white', color:'#b91c1c', padding:'8px', borderRadius:'5px', border:'none', fontWeight:'bold', cursor:'pointer'}}>Refunds ({refundCount})</button>
             <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{background:'#7f1d1d', color:'white', padding:'8px', borderRadius:'5px', border:'none', cursor:'pointer'}}>Logout</button>
        </div>
      </div>

      {/* 1. USERS */}
      <h3 style={{ borderLeft:'5px solid #2563eb', paddingLeft:'10px' }}>👤 Users</h3>
      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', marginBottom:'40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f1f5f9', textAlign: 'left' }}><th style={{padding:'10px'}}>User</th><th style={{padding:'10px'}}>Role</th><th style={{padding:'10px'}}>Proof</th><th style={{padding:'10px'}}>Status</th><th style={{padding:'10px'}}>Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{padding:'10px'}}><strong>{u.name}</strong><br/><span style={{fontSize:'0.8rem'}}>{u.email}</span></td>
                <td style={{padding:'10px'}}>{u.role}</td>
                <td style={{padding:'10px'}}>{u.verificationDoc ? <a href={u.verificationDoc} target="_blank" rel="noreferrer">📄 View Doc</a> : 'No Doc'}</td>
                <td style={{padding:'10px'}}>{u.isVerified ? <span style={{color:'green'}}>Verified</span> : <span style={{color:'orange'}}>Pending</span>}</td>
                <td style={{padding:'10px'}}>
                    {!u.isVerified ? <button onClick={() => handleVerifyUser(u._id, true)} style={{background:'#16a34a', color:'white', padding:'5px', border:'none', cursor:'pointer'}}>Approve</button> : <button onClick={() => handleVerifyUser(u._id, false)} style={{background:'#f59e0b', color:'white', padding:'5px', border:'none', cursor:'pointer'}}>Revoke</button>}
                    <button onClick={() => handleDeleteUser(u._id)} style={{background:'#ef4444', color:'white', padding:'5px', border:'none', cursor:'pointer', marginLeft:'5px'}}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. EVENTS */}
      <h3 style={{ borderLeft:'5px solid #ec4899', paddingLeft:'10px' }}>🎉 Events</h3>
      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f1f5f9', textAlign: 'left' }}><th style={{padding:'10px'}}>Event</th><th style={{padding:'10px'}}>Budget</th><th style={{padding:'10px'}}>Notice</th><th style={{padding:'10px'}}>Status</th><th style={{padding:'10px'}}>Action</th></tr></thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{padding:'10px'}}><strong>{ev.title}</strong><br/><span style={{fontSize:'0.8rem'}}>By: {ev.user?.name}</span></td>
                <td style={{padding:'10px'}}>₹{ev.budget}</td>
                <td style={{padding:'10px'}}>{ev.permissionLetter ? <a href={ev.permissionLetter} target="_blank" rel="noreferrer">📄 View Notice</a> : 'Missing'}</td>
                <td style={{padding:'10px'}}>{ev.isApproved ? <span style={{color:'green'}}>LIVE</span> : <span style={{color:'red'}}>Pending</span>}</td>
                <td style={{padding:'10px'}}>
                    {!ev.isApproved && <button onClick={() => handleApproveEvent(ev._id)} style={{background:'#16a34a', color:'white', padding:'5px', border:'none', cursor:'pointer', marginRight:'5px'}}>Approve</button>}
                    <button onClick={() => handleDeleteEvent(ev._id)} style={{background:'#ef4444', color:'white', padding:'5px', border:'none', cursor:'pointer'}}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminDashboard;