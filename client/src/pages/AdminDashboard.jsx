import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]); // 👈 Events State
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 👇 BACKEND URL
  const API_URL = "https://campus-sponser-api.onrender.com";

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(storedUser);
      fetchUsers(storedUser.token);
      fetchEvents(storedUser.token); // 👈 Events bhi fetch karo
    }
  }, [navigate]);

  // --- FETCH FUNCTIONS ---
  const fetchUsers = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/users', config);
      setUsers(res.data);
    } catch (error) {
      console.error("Fetch Users Error:", error);
    }
  };

  const fetchEvents = async (token) => {
    try {
      // Events public route par hain, toh token ki zaroorat nahi hoti usually
      // Par agar admin delete karega toh token chahiye
      const res = await axios.get('/api/events'); 
      setEvents(res.data);
    } catch (error) {
      console.error("Fetch Events Error:", error);
    }
  };

  // --- USER ACTIONS ---
  const verifyUser = async (id, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const url = status ? `/api/users/approve/${id}` : `/api/users/unapprove/${id}`;
      await axios.put(url, {}, config);
      fetchUsers(user.token);
      alert(status ? "✅ User Approved" : "❌ User Revoked");
    } catch (error) {
      alert('Action Failed');
    }
  };

  const deleteUser = async (id) => {
    if(!window.confirm("Delete this user permanently?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/users/${id}`, config);
      fetchUsers(user.token);
    } catch (error) {
      alert('Delete Failed');
    }
  };

  // --- EVENT ACTIONS ---
  const deleteEvent = async (id) => {
    if(!window.confirm("Are you sure you want to DELETE this event?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/events/${id}`, config);
      fetchEvents(user.token); // List refresh karo
      alert("🗑️ Event Deleted");
    } catch (error) {
      console.error(error);
      alert('Failed to delete event');
    }
  };

  const getDocLink = (path) => {
    if (!path) return "#";
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  if (!user) return <div style={{padding:'50px', textAlign:'center'}}>Loading Dashboard...</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', background:'white', padding:'20px', borderRadius:'15px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)'}}>
        <div>
            <h2 style={{color: '#1e293b', margin:0, fontSize:'1.8rem'}}>🛡️ Admin Panel</h2>
            <p style={{color:'#64748b', margin:'5px 0 0 0'}}>Manage Users & Campus Events</p>
        </div>
        <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} style={{padding:'12px 25px', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>
          Logout ➔
        </button>
      </div>

      {/* --- SECTION 1: USERS --- */}
      <h3 style={{color:'#334155', borderBottom:'2px solid #e2e8f0', paddingBottom:'10px', marginTop:'0'}}>👤 All Users</h3>
      <div style={{overflowX: 'auto', background: 'white', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', padding:'5px', marginBottom:'40px'}}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{textAlign:'left', background:'#f8fafc', color:'#475569'}}>
              <th style={th}>User Details</th>
              <th style={th}>Role</th>
              <th style={th}>Proof</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map(u => (
              <tr key={u._id} style={{borderBottom:'1px solid #f1f5f9'}}>
                <td style={td}>
                  <div style={{fontWeight:'bold', color:'#0f172a'}}>{u.name}</div>
                  <div style={{fontSize:'0.85rem', color:'#64748b'}}>{u.email}</div>
                </td>
                <td style={td}>
                    <span style={{
                        padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold',
                        background: u.role === 'sponsor' ? '#dbeafe' : '#fef3c7',
                        color: u.role === 'sponsor' ? '#1e40af' : '#92400e'
                    }}>
                        {u.role ? u.role.toUpperCase() : 'USER'}
                    </span>
                </td>
                <td style={td}>
                  {u.verificationDoc ? (
                    <a href={getDocLink(u.verificationDoc)} target="_blank" rel="noreferrer" style={{color: '#2563eb', fontWeight: 'bold'}}>View Doc</a>
                  ) : <span style={{color: '#94a3b8', fontStyle:'italic'}}>No File</span>}
                </td>
                <td style={td}>
                  {u.isVerified ? <span style={{color:'#16a34a'}}>✅ Verified</span> : <span style={{color:'#d97706'}}>⏳ Pending</span>}
                </td>
                <td style={td}>
                  <div style={{display:'flex', gap:'10px'}}>
                    {!u.isVerified ? 
                        <button onClick={() => verifyUser(u._id, true)} style={{...btn, background: '#22c55e'}}>✓</button> : 
                        <button onClick={() => verifyUser(u._id, false)} style={{...btn, background: '#f59e0b'}}>↺</button>
                    }
                    <button onClick={() => deleteUser(u._id)} style={{...btn, background: '#ef4444'}}>🗑</button>
                  </div>
                </td>
              </tr>
            )) : <tr><td colSpan="5" style={{padding:'20px', textAlign:'center'}}>No users found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* --- SECTION 2: EVENTS --- */}
      <h3 style={{color:'#334155', borderBottom:'2px solid #e2e8f0', paddingBottom:'10px'}}>🎉 All Events</h3>
      <div style={{overflowX: 'auto', background: 'white', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', padding:'5px'}}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{textAlign:'left', background:'#f8fafc', color:'#475569'}}>
              <th style={th}>Event Title</th>
              <th style={th}>Date</th>
              <th style={th}>Location</th>
              <th style={th}>Budget</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? events.map(e => (
              <tr key={e._id} style={{borderBottom:'1px solid #f1f5f9'}}>
                <td style={td}>
                  <div style={{fontWeight:'bold', color:'#0f172a'}}>{e.title}</div>
                  <div style={{fontSize:'0.85rem', color:'#64748b'}}>{e.description?.substring(0, 40)}...</div>
                </td>
                <td style={td}>{new Date(e.date).toLocaleDateString()}</td>
                <td style={td}>{e.location}</td>
                <td style={td} style={{fontWeight:'bold', color:'#1e40af'}}>₹{e.budget}</td>
                <td style={td}>
                  <button onClick={() => deleteEvent(e._id)} style={{...btn, background: '#ef4444', padding:'8px 15px'}}>Delete Event</button>
                </td>
              </tr>
            )) : <tr><td colSpan="5" style={{padding:'40px', textAlign:'center', color:'#64748b'}}>No events created yet.</td></tr>}
          </tbody>
        </table>
      </div>

    </div>
  );
};

// Styles
const th = { padding: '15px 20px', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.5px' };
const td = { padding: '15px 20px', verticalAlign: 'middle' };
const btn = { padding: '8px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: 'bold' };

export default AdminDashboard;