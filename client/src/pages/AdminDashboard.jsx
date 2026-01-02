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
      const eventRes = await axios.get('/api/events');
      
      setUsers(userRes.data);
      setEvents(eventRes.data);

      let count = 0;
      if(Array.isArray(eventRes.data)){
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
      } catch(e) { alert("Action Failed"); }
  };

  const handleApproveEvent = async (id) => {
      if(!window.confirm("Make this Event Live?")) return;
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.put(`/api/events/admin/approve/${id}`, {}, config);
          alert("✅ Event is LIVE!");
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
      <div style={{ background: '#b91c1c', color:'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 4px 15px rgba(185, 28, 28, 0.3)' }}>
        <h2 style={{ margin: 0 }}>🛡️ Super Admin</h2>
        <div style={{display:'flex', gap:'10px'}}>
             <button onClick={() => navigate('/admin/refunds')} style={{background:'white', color:'#b91c1c', padding:'8px 15px', borderRadius:'5px', border:'none', fontWeight:'bold', cursor:'pointer'}}>Refunds ({refundCount})</button>
             <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{background:'#7f1d1d', color:'white', padding:'8px 15px', borderRadius:'5px', border:'none', cursor:'pointer'}}>Logout</button>
        </div>
      </div>

      {/* --- USER TABLE --- */}
      <h3 style={{ color: '#1e293b', borderLeft:'5px solid #2563eb', paddingLeft:'10px' }}>👤 User Verification (KYC)</h3>
      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom:'40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f1f5f9', textAlign: 'left' }}><th style={{padding:'15px'}}>User Details</th><th style={{padding:'15px'}}>Role</th><th style={{padding:'15px'}}>ID Proof</th><th style={{padding:'15px'}}>Status</th><th style={{padding:'15px'}}>Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{padding:'15px'}}><strong>{u.name}</strong><br/><span style={{fontSize:'0.8rem', color:'#666'}}>{u.email}</span></td>
                <td style={{padding:'15px', textTransform:'capitalize'}}>{u.role}</td>
                <td style={{padding:'15px'}}>
                    {u.verificationDoc ? <a href={u.verificationDoc} target="_blank" rel="noreferrer" style={{color:'blue', textDecoration:'underline', fontWeight:'bold'}}>📄 View ID</a> : <span style={{color:'#ccc'}}>Pending</span>}
                </td>
                <td style={{padding:'15px'}}>{u.isVerified ? <span style={{color:'green', fontWeight:'bold'}}>Verified</span> : <span style={{color:'orange', fontWeight:'bold'}}>Pending</span>}</td>
                <td style={{padding:'15px'}}>
                    {!u.isVerified ? 
                        <button onClick={() => handleVerifyUser(u._id, true)} style={{background:'#16a34a', color:'white', padding:'6px 12px', border:'none', borderRadius:'4px', cursor:'pointer', marginRight:'5px'}}>Approve</button> :
                        <button onClick={() => handleVerifyUser(u._id, false)} style={{background:'#f59e0b', color:'white', padding:'6px 12px', border:'none', borderRadius:'4px', cursor:'pointer', marginRight:'5px'}}>Revoke</button>
                    }
                    <button onClick={() => handleDelete(u._id, 'users')} style={{background:'#ef4444', color:'white', padding:'6px 12px', border:'none', borderRadius:'4px', cursor:'pointer'}}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- EVENT TABLE --- */}
      <h3 style={{ color: '#1e293b', borderLeft:'5px solid #ec4899', paddingLeft:'10px' }}>🎉 Event Requests</h3>
      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f1f5f9', textAlign: 'left' }}><th style={{padding:'15px'}}>Event</th><th style={{padding:'15px'}}>Budget</th><th style={{padding:'15px'}}>College Notice</th><th style={{padding:'15px'}}>Status</th><th style={{padding:'15px'}}>Action</th></tr></thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{padding:'15px'}}><strong>{ev.title}</strong><br/><span style={{fontSize:'0.8rem'}}>By: {ev.user?.name}</span></td>
                <td style={{padding:'15px'}}>₹{ev.budget}</td>
                <td style={{padding:'15px'}}>{ev.permissionLetter ? <a href={ev.permissionLetter} target="_blank" rel="noreferrer" style={{color:'#ec4899', textDecoration:'underline', fontWeight:'bold'}}>📄 View Notice</a> : 'No File'}</td>
                <td style={{padding:'15px'}}>{ev.isApproved ? <span style={{color:'green'}}>LIVE</span> : <span style={{color:'red'}}>Pending</span>}</td>
                <td style={{padding:'15px'}}>
                    {!ev.isApproved && <button onClick={() => handleApproveEvent(ev._id)} style={{background:'#16a34a', color:'white', padding:'6px 12px', border:'none', borderRadius:'4px', cursor:'pointer', marginRight:'5px'}}>Approve</button>}
                    <button onClick={() => handleDelete(ev._id, 'events')} style={{background:'#ef4444', color:'white', padding:'6px 12px', border:'none', borderRadius:'4px', cursor:'pointer'}}>Del</button>
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