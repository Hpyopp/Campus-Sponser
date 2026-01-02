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

  const handleVerifyUser = async (id, status) => {
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const url = status ? `/api/users/approve/${id}` : `/api/users/unverify/${id}`;
          await axios.put(url, {}, config);
          fetchData();
      } catch(e) { alert("Action Failed"); }
  };

  const handleToggleEvent = async (id, currentStatus) => {
      // Logic: Agar Approved hai toh Revoke karo, nahi toh Approve karo
      const action = currentStatus ? "Revoke" : "Approve";
      if(!window.confirm(`${action} this Event?`)) return;
      
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const url = currentStatus ? `/api/events/admin/revoke/${id}` : `/api/events/admin/approve/${id}`;
          
          await axios.put(url, {}, config);
          alert(`Event ${action}d Successfully!`);
          fetchData();
      } catch(e) { alert("Error updating event status"); }
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
      <div style={{ background: '#1e293b', color:'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 4px 15px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: 0 }}>🛡️ Super Admin Panel</h2>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{background:'#ef4444', color:'white', padding:'8px 20px', borderRadius:'5px', border:'none', cursor:'pointer', fontWeight:'bold'}}>Logout</button>
      </div>

      {/* ALERT SECTION */}
      {refundCount > 0 ? (
          <div style={{ background: '#fee2e2', border: '2px solid #ef4444', padding: '20px', borderRadius: '10px', marginBottom: '40px', display:'flex', justifyContent:'space-between', alignItems:'center', animation: 'pulse 2s infinite' }}>
              <div>
                  <h2 style={{color:'#b91c1c', margin:'0 0 5px 0'}}>🚨 Action Required!</h2>
                  <p style={{margin:0, color:'#7f1d1d', fontSize:'1.1rem'}}><strong>{refundCount} Sponsors</strong> requested a refund.</p>
              </div>
              <button onClick={() => navigate('/admin/refunds')} style={{padding:'12px 30px', background:'#dc2626', color:'white', fontSize:'1rem', fontWeight:'bold', border:'none', borderRadius:'8px', cursor:'pointer'}}>Review Refunds ➡️</button>
          </div>
      ) : (
          <div style={{ background: '#dcfce7', border: '1px solid #16a34a', padding: '15px', borderRadius: '10px', marginBottom: '40px', color:'#166534' }}>✅ <strong>All Clear:</strong> No pending refund requests.</div>
      )}

      {/* --- USERS TABLE --- */}
      <h3 style={{ color: '#1e293b', borderLeft:'5px solid #2563eb', paddingLeft:'10px' }}>👤 User Verification</h3>
      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom:'40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f1f5f9', textAlign: 'left' }}><th style={{padding:'15px'}}>User Details</th><th style={{padding:'15px'}}>Role</th><th style={{padding:'15px'}}>ID Proof</th><th style={{padding:'15px'}}>Status</th><th style={{padding:'15px'}}>Action</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{padding:'15px'}}><strong>{u.name}</strong><br/><span style={{fontSize:'0.8rem', color:'#666'}}>{u.email}</span></td>
                <td style={{padding:'15px', textTransform:'capitalize'}}>{u.role}</td>
                <td style={{padding:'15px'}}>{u.verificationDoc ? <a href={u.verificationDoc} target="_blank" rel="noreferrer" style={{color:'blue', fontWeight:'bold'}}>📄 View ID</a> : <span style={{color:'#ccc'}}>Pending</span>}</td>
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

      {/* --- EVENTS TABLE --- */}
      <h3 style={{ color: '#1e293b', borderLeft:'5px solid #ec4899', paddingLeft:'10px' }}>🎉 Event Requests</h3>
      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ background: '#f1f5f9', textAlign: 'left' }}><th style={{padding:'15px'}}>Event & Organizer</th><th style={{padding:'15px'}}>Budget</th><th style={{padding:'15px'}}>College Notice</th><th style={{padding:'15px'}}>Status</th><th style={{padding:'15px'}}>Action</th></tr></thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{padding:'15px'}}>
                    <strong>{ev.title}</strong><br/>
                    {/* 👇 FIX: Showing Organizer Name & Email now */}
                    <span style={{fontSize:'0.85rem', color:'#64748b'}}>
                        By: {ev.user?.name || "Unknown"} <br/>
                        <span style={{color:'#2563eb'}}>({ev.user?.email || "No Email"})</span>
                    </span>
                </td>
                <td style={{padding:'15px'}}>₹{ev.budget}</td>
                <td style={{padding:'15px'}}>{ev.permissionLetter ? <a href={ev.permissionLetter} target="_blank" rel="noreferrer" style={{color:'#ec4899', fontWeight:'bold'}}>📄 View Notice</a> : 'No File'}</td>
                <td style={{padding:'15px'}}>{ev.isApproved ? <span style={{color:'green', fontWeight:'bold'}}>LIVE</span> : <span style={{color:'red', fontWeight:'bold'}}>Pending</span>}</td>
                <td style={{padding:'15px'}}>
                    {/* 👇 FIX: Revoke Button Added */}
                    {ev.isApproved ? (
                        <button onClick={() => handleToggleEvent(ev._id, true)} style={{background:'#f59e0b', color:'white', padding:'6px 12px', border:'none', borderRadius:'4px', cursor:'pointer', marginRight:'5px'}}>Revoke</button>
                    ) : (
                        <button onClick={() => handleToggleEvent(ev._id, false)} style={{background:'#16a34a', color:'white', padding:'6px 12px', border:'none', borderRadius:'4px', cursor:'pointer', marginRight:'5px'}}>Approve</button>
                    )}
                    <button onClick={() => handleDelete(ev._id, 'events')} style={{background:'#ef4444', color:'white', padding:'6px 12px', border:'none', borderRadius:'4px', cursor:'pointer'}}>Del</button>
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