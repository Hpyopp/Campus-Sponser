import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [refundCount, setRefundCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const userRes = await axios.get('/api/users/all');
        const eventRes = await axios.get('/api/events');
        
        setUsers(userRes.data || []);
        setEvents(eventRes.data || []);

        // 👇 SAFE COUNTER LOGIC
        let count = 0;
        if (Array.isArray(eventRes.data)) {
            eventRes.data.forEach(ev => {
                if (ev.sponsors && Array.isArray(ev.sponsors)) {
                    ev.sponsors.forEach(s => {
                        if(s.status === 'refund_requested') count++;
                    });
                }
            });
        }
        setRefundCount(count);

      } catch (error) {
        console.error(error);
      }
    };
    fetchAdminData();
  }, []);

  const handleDeleteEvent = async (id) => {
    if(!window.confirm("Delete Event?")) return;
    try { await axios.delete(`/api/events/${id}`); window.location.reload(); } catch(e){ alert("Error"); }
  };

  const handleDeleteUser = async (id) => {
    if(!window.confirm("Delete User?")) return;
    try { await axios.delete(`/api/users/${id}`); window.location.reload(); } catch(e){ alert("Error"); }
  };

  return (
    <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins' }}>
      
      {/* HEADER */}
      <div style={{ background: '#fee2e2', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #fecaca', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2 style={{ margin: 0, color: '#b91c1c', display:'flex', alignItems:'center', gap:'10px' }}>
            🛡️ Super Admin Panel
        </h2>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ padding: '10px 20px', background: '#b91c1c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            Logout 🔒
        </button>
      </div>

      {/* REFUND ALERT */}
      <div style={{ marginBottom: '30px', display:'flex', gap:'20px' }}>
          <div style={{ flex: 1, background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft:'5px solid #f97316' }}>
              <div>
                  <h3 style={{ margin: 0, color: '#1e293b' }}>Refund Requests</h3>
                  <p style={{ margin: 0, color: '#64748b' }}>Pending Approvals: <strong style={{color:'#c2410c', fontSize:'1.2rem'}}>{refundCount}</strong></p>
              </div>
              <button 
                onClick={() => navigate('/admin/refunds')}
                style={{ padding: '12px 25px', background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Manage Refunds ➡️
              </button>
          </div>
      </div>

      {/* EVENTS TABLE */}
      <h3 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>🎉 Event Management</h3>
      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', marginBottom: '40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '15px', color: '#475569' }}>Event Title</th>
              <th style={{ padding: '15px', color: '#475569' }}>Created By</th>
              <th style={{ padding: '15px', color: '#475569' }}>Budget</th>
              <th style={{ padding: '15px', color: '#475569' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{event.title}</td>
                <td style={{ padding: '15px', color: '#64748b' }}>{event.user?.name || "Unknown"}</td>
                <td style={{ padding: '15px' }}>₹{event.budget}</td>
                <td style={{ padding: '15px' }}>
                  <button onClick={() => handleDeleteEvent(event._id)} style={{ padding: '8px 15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' }}>DELETE 🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* USERS TABLE */}
      <h3 style={{ color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>👤 User Management</h3>
      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
              <th style={{ padding: '15px', color: '#475569' }}>Name</th>
              <th style={{ padding: '15px', color: '#475569' }}>Role</th>
              <th style={{ padding: '15px', color: '#475569' }}>Status</th>
              <th style={{ padding: '15px', color: '#475569' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{u.name}</td>
                <td style={{ padding: '15px', textTransform:'capitalize' }}>{u.role}</td>
                <td style={{ padding: '15px' }}>
                    {u.isVerified ? <span style={{color:'green', fontWeight:'bold'}}>Verified</span> : <span style={{color:'orange'}}>Pending</span>}
                </td>
                <td style={{ padding: '15px' }}>
                  <button onClick={() => handleDeleteUser(u._id)} style={{ padding: '8px 15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' }}>DELETE 🗑️</button>
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