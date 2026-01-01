import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [refundCount, setRefundCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Security Check
    if (!user || user.role !== 'admin') {
        navigate('/login');
        return;
    }

    const fetchAdminData = async () => {
      try {
        // 👇 FIX: Send Token in Headers
        const config = { headers: { Authorization: `Bearer ${user.token}` } };

        const userRes = await axios.get('/api/users/all', config);
        const eventRes = await axios.get('/api/events'); // Public route, no token needed usually, but safe to keep
        
        setUsers(userRes.data || []);
        setEvents(eventRes.data || []);

        // Count Pending Refunds
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
        console.error("Error fetching admin data:", error);
        if (error.response?.status === 401) {
            alert("Session Expired. Login Again.");
            localStorage.clear();
            navigate('/login');
        }
      }
    };
    fetchAdminData();
  }, [navigate]);

  // DELETE HANDLERS (With Token)
  const handleDeleteEvent = async (id) => {
    if(!window.confirm("Delete Event?")) return;
    try { 
        const user = JSON.parse(localStorage.getItem('user'));
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/events/${id}`, config); 
        window.location.reload(); 
    } catch(e){ alert("Error deleting event"); }
  };

  const handleDeleteUser = async (id) => {
    if(!window.confirm("Delete User?")) return;
    try { 
        const user = JSON.parse(localStorage.getItem('user'));
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/users/${id}`, config); 
        window.location.reload(); 
    } catch(e){ alert("Error deleting user"); }
  };

  return (
    <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins' }}>
      
      {/* HEADER */}
      <div style={{ background: '#fee2e2', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #fecaca', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2 style={{ margin: 0, color: '#b91c1c' }}>🛡️ Super Admin Panel</h2>
        <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ padding: '10px 20px', background: '#b91c1c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Logout 🔒</button>
      </div>

      {/* REFUND ALERT */}
      <div style={{ marginBottom: '30px', background: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center', borderLeft:'5px solid #f97316' }}>
          <div>
              <h3 style={{ margin: 0, color: '#1e293b' }}>Refund Requests</h3>
              <p style={{ margin: 0, color: '#64748b' }}>Pending Approvals: <strong style={{color:'#c2410c', fontSize:'1.2rem'}}>{refundCount}</strong></p>
          </div>
          <button onClick={() => navigate('/admin/refunds')} style={{ padding: '12px 25px', background: '#f97316', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Manage Refunds ➡️</button>
      </div>

      {/* EVENTS TABLE */}
      <h3 style={{ color: '#1e293b' }}>🎉 Event Management</h3>
      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', marginBottom: '40px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}><th style={{ padding: '15px' }}>Title</th><th style={{ padding: '15px' }}>By</th><th style={{ padding: '15px' }}>Budget</th><th style={{ padding: '15px' }}>Action</th></tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{event.title}</td>
                <td style={{ padding: '15px' }}>{event.user?.name || "Unknown"}</td>
                <td style={{ padding: '15px' }}>₹{event.budget}</td>
                <td style={{ padding: '15px' }}><button onClick={() => handleDeleteEvent(event._id)} style={{ padding: '5px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>DELETE</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* USERS TABLE */}
      <h3 style={{ color: '#1e293b' }}>👤 User Management</h3>
      <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', textAlign: 'left' }}><th style={{ padding: '15px' }}>Name</th><th style={{ padding: '15px' }}>Role</th><th style={{ padding: '15px' }}>Status</th><th style={{ padding: '15px' }}>Action</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '15px', fontWeight: 'bold' }}>{u.name}</td>
                <td style={{ padding: '15px' }}>{u.role}</td>
                <td style={{ padding: '15px', color: u.isVerified ? 'green' : 'orange' }}>{u.isVerified ? 'Verified' : 'Pending'}</td>
                <td style={{ padding: '15px' }}><button onClick={() => handleDeleteUser(u._id)} style={{ padding: '5px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>DELETE</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminDashboard;