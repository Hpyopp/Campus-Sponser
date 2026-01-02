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

      // Count Refunds
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
          // Logic: Approve (true) ya Unverify (false)
          const url = status ? `/api/users/approve/${id}` : `/api/users/unverify/${id}`;
          await axios.put(url, {}, config);
          fetchData(); // List Refresh
      } catch(e) { alert("Error updating status"); }
  };

  const handleDeleteUser = async (id) => {
      if(!window.confirm("Permanently Delete User?")) return;
      try { 
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.delete(`/api/users/${id}`, config);
          fetchData();
      } catch(e) { alert("Error deleting"); }
  };

  const handleApproveEvent = async (id) => {
      if(!window.confirm("Make this Event LIVE?")) return;
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.put(`/api/events/admin/approve/${id}`, {}, config);
          alert("✅ Event is now Live!");
          fetchData();
      } catch(e) { alert("Error approving event"); }
  };

  const handleDeleteEvent = async (id) => {
      if(!window.confirm("Delete Event?")) return;
      try { 
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.delete(`/api/events/${id}`, config);
          fetchData();
      } catch(e) { alert("Error deleting event"); }
  };

  return (
    <div style={{ padding: '30px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins' }}>
      
      {/* HEADER */}
      <div style={{ background: '#b91c1c', color:'white', padding: '20px', borderRadius: '10px', marginBottom: '30px', display:'flex', justifyContent:'space-between', alignItems:'center', boxShadow:'0 4px 15px rgba(185, 28, 28, 0.3)' }}>
        <h2 style={{ margin: 0 }}>🛡️ Super Admin Panel</h2>
        <div style={{display:'flex', gap:'10px'}}>
             <button onClick={() => navigate('/admin/refunds')} style={{background:'white', color:'#b91c1c', padding:'8px 15px', borderRadius:'5px', border:'none', fontWeight:'bold', cursor:'pointer'}}>
                Manage Refunds ({refundCount})
             </button>
             <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{background:'#7f1d1d', color:'white', padding:'8px 15px', borderRadius:'5px', border:'none', cursor:'pointer'}}>Logout</button>
        </div>
      </div>

      {/* --- 1. USER MANAGEMENT SECTION --- */}
      <h3 style={{ color: '#1e293b', borderLeft:'5px solid #2563eb', paddingLeft:'10px' }}>👤 User Verification</h3>
      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom:'40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>User Details</th>
              <th style={{ padding: '15px' }}>Role</th>
              <th style={{ padding: '15px' }}>ID Proof</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px', textAlign:'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px' }}>
                    <strong>{u.name}</strong><br/>
                    <span style={{fontSize:'0.85rem', color:'#64748b'}}>{u.email}</span>
                </td>
                <td style={{ padding: '15px', textTransform:'capitalize' }}>{u.role}</td>
                <td style={{ padding: '15px' }}>
                    {u.verificationDoc ? (
                        <a href={u.verificationDoc} target="_blank" rel="noreferrer" style={{color:'#2563eb', fontWeight:'bold', textDecoration:'underline'}}>📄 View Doc</a>
                    ) : (
                        <span style={{color:'#94a3b8'}}>No Doc</span>
                    )}
                </td>
                <td style={{ padding: '15px' }}>
                    {u.isVerified ? 
                        <span style={{background:'#dcfce7', color:'#166534', padding:'3px 8px', borderRadius:'4px', fontSize:'0.8rem', fontWeight:'bold'}}>VERIFIED</span> : 
                        <span style={{background:'#fff7ed', color:'#c2410c', padding:'3px 8px', borderRadius:'4px', fontSize:'0.8rem', fontWeight:'bold'}}>PENDING</span>
                    }
                </td>
                <td style={{ padding: '15px', textAlign:'center' }}>
                    {!u.isVerified ? (
                        <button onClick={() => handleVerifyUser(u._id, true)} style={{marginRight:'8px', background:'#16a34a', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}>Approve</button>
                    ) : (
                        <button onClick={() => handleVerifyUser(u._id, false)} style={{marginRight:'8px', background:'#f59e0b', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}>Revoke</button>
                    )}
                    <button onClick={() => handleDeleteUser(u._id)} style={{background:'#ef4444', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- 2. EVENT MANAGEMENT SECTION --- */}
      <h3 style={{ color: '#1e293b', borderLeft:'5px solid #ec4899', paddingLeft:'10px' }}>🎉 Event Approvals</h3>
      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '15px' }}>Event</th>
              <th style={{ padding: '15px' }}>Organizer</th>
              <th style={{ padding: '15px' }}>Notice Letter</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px', textAlign:'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontWeight:'bold' }}>{ev.title}</td>
                <td style={{ padding: '15px' }}>{ev.user?.name}</td>
                <td style={{ padding: '15px' }}>
                    {ev.permissionLetter ? (
                        <a href={ev.permissionLetter} target="_blank" rel="noreferrer" style={{color:'#ec4899', fontWeight:'bold', textDecoration:'underline'}}>📄 Check Notice</a>
                    ) : (
                        <span style={{color:'red'}}>Missing</span>
                    )}
                </td>
                <td style={{ padding: '15px' }}>
                    {ev.isApproved ? 
                        <span style={{background:'#dcfce7', color:'#166534', padding:'3px 8px', borderRadius:'4px', fontSize:'0.8rem', fontWeight:'bold'}}>LIVE</span> : 
                        <span style={{background:'#f1f5f9', color:'#64748b', padding:'3px 8px', borderRadius:'4px', fontSize:'0.8rem', fontWeight:'bold'}}>PENDING</span>
                    }
                </td>
                <td style={{ padding: '15px', textAlign:'center' }}>
                    {!ev.isApproved && (
                        <button onClick={() => handleApproveEvent(ev._id)} style={{marginRight:'8px', background:'#16a34a', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}>Approve</button>
                    )}
                    <button onClick={() => handleDeleteEvent(ev._id)} style={{background:'#ef4444', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}>Delete</button>
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