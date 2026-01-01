import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const API_URL = "https://campus-sponser-api.onrender.com";

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) navigate('/login');
    else {
      setUser(storedUser);
      fetchUsers(storedUser.token);
      fetchEvents();
    }
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      const res = await axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get('/api/events');
      setEvents(res.data);
    } catch (error) { console.error(error); }
  };

  const deleteUser = async (id) => {
    if(!window.confirm("Delete User?")) return;
    try {
      await axios.delete(`/api/users/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
      // Instant Update
      setUsers(users.filter(u => u._id !== id));
    } catch (error) { alert('Delete Failed'); }
  };

  const verifyUser = async (id, status) => {
    try {
      const url = status ? `/api/users/approve/${id}` : `/api/users/unapprove/${id}`;
      await axios.put(url, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      fetchUsers(user.token);
    } catch (error) { alert('Action Failed'); }
  };

  // 👇 FIXED DELETE EVENT FUNCTION
  const deleteEvent = async (id) => {
    if(!window.confirm("Delete Event Permanently?")) return;
    try {
      // 1. UI se pehle hi hata do (Fast Feel)
      setEvents(events.filter(e => e._id !== id));
      
      // 2. Phir Backend call karo
      await axios.delete(`/api/events/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
      alert("🗑️ Event Deleted");
    } catch (error) {
      console.error(error);
      alert('Delete Failed');
      fetchEvents(); // Galti hui toh wapas lao
    }
  };

  const getDocLink = (path) => {
    if (!path) return "#";
    return path.startsWith('http') ? path : `${API_URL}${path}`;
  };

  if (!user) return <div style={{padding:'50px'}}>Loading...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins' }}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
        <h2>🛡️ Admin Panel</h2>
        <button onClick={() => {localStorage.removeItem('user'); navigate('/login')}} style={{background:'#ef4444', color:'white', border:'none', padding:'10px 20px', borderRadius:'5px', cursor:'pointer'}}>Logout</button>
      </div>

      {/* EVENTS SECTION */}
      <h3>🎉 All Events</h3>
      <div style={{overflowX: 'auto', marginBottom:'40px', boxShadow:'0 0 10px rgba(0,0,0,0.1)', borderRadius:'10px'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
                <tr style={{background:'#f1f5f9', textAlign:'left'}}>
                    <th style={{padding:'15px'}}>Title</th>
                    <th style={{padding:'15px'}}>Creator (Student)</th>
                    <th style={{padding:'15px'}}>Budget</th>
                    <th style={{padding:'15px'}}>Action</th>
                </tr>
            </thead>
            <tbody>
                {events.map(e => (
                    <tr key={e._id} style={{borderBottom:'1px solid #eee'}}>
                        <td style={{padding:'15px'}}>{e.title}</td>
                        <td style={{padding:'15px'}}>
                            {e.user?.name || "Unknown"}<br/>
                            <span style={{fontSize:'0.8rem', color:'#666'}}>{e.user?.email}</span>
                        </td>
                        <td style={{padding:'15px'}}>₹{e.budget}</td>
                        <td style={{padding:'15px'}}>
                            <button onClick={() => deleteEvent(e._id)} style={{background:'#ef4444', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* USERS SECTION */}
      <h3>👤 All Users</h3>
      <div style={{overflowX: 'auto', boxShadow:'0 0 10px rgba(0,0,0,0.1)', borderRadius:'10px'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
                <tr style={{background:'#f1f5f9', textAlign:'left'}}>
                    <th style={{padding:'15px'}}>Name</th>
                    <th style={{padding:'15px'}}>Role</th>
                    <th style={{padding:'15px'}}>Doc</th>
                    <th style={{padding:'15px'}}>Status</th>
                    <th style={{padding:'15px'}}>Action</th>
                </tr>
            </thead>
            <tbody>
                {users.map(u => (
                    <tr key={u._id} style={{borderBottom:'1px solid #eee'}}>
                        <td style={{padding:'15px'}}>{u.name}<br/><span style={{fontSize:'0.8rem', color:'#666'}}>{u.email}</span></td>
                        <td style={{padding:'15px'}}>{u.role.toUpperCase()}</td>
                        <td style={{padding:'15px'}}>{u.verificationDoc ? <a href={getDocLink(u.verificationDoc)} target="_blank" rel="noreferrer">View Doc</a> : "No File"}</td>
                        <td style={{padding:'15px'}}>{u.isVerified ? "✅ Verified" : "⏳ Pending"}</td>
                        <td style={{padding:'15px'}}>
                            {!u.isVerified ? <button onClick={() => verifyUser(u._id, true)} style={{background:'#22c55e', color:'white', padding:'5px', border:'none', marginRight:'5px', cursor:'pointer'}}>✓</button> : 
                            <button onClick={() => verifyUser(u._id, false)} style={{background:'#f59e0b', color:'white', padding:'5px', border:'none', marginRight:'5px', cursor:'pointer'}}>↺</button>}
                            <button onClick={() => deleteUser(u._id)} style={{background:'#ef4444', color:'white', padding:'5px', border:'none', cursor:'pointer'}}>🗑</button>
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