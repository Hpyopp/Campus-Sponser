import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  // 👇 TERA RENDER SERVER URL (Isse hardcode kiya taaki galti na ho)
  const API_BASE_URL = "https://campus-sponser-api.onrender.com";

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    // 🔒 SECURITY CHECK
    if (!storedUser) {
      navigate('/login');
    } else if (storedUser.role.toLowerCase() !== 'admin') {
      alert("⛔ Only Admins are allowed here!");
      navigate('/'); 
    } else {
      setUser(storedUser);
      fetchUsers(storedUser.token);
      fetchEvents();
    }
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(res.data);
    } catch (error) { console.error(error); }
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/events`);
      setEvents(res.data);
    } catch (error) { console.error(error); }
  };

  // 👇 REAL DELETE FUNCTION (Using Full URL)
  const deleteEvent = async (id) => {
    if(!window.confirm("⚠️ DELETE PERMANENTLY? This cannot be undone.")) return;

    try {
      // 1. Server ko call karo (FULL URL USE KAR RAHE HAIN)
      await axios.delete(`${API_BASE_URL}/api/events/${id}`, { 
        headers: { Authorization: `Bearer ${user.token}` } 
      });

      // 2. SUCCESS: Ab UI se hatao
      alert("✅ Event Deleted Successfully!");
      setEvents(events.filter(e => e._id !== id));

    } catch (error) {
      // 3. FAILURE: Error dikhao
      console.error("Delete Error:", error);
      alert(`❌ Delete Failed: ${error.response?.data?.message || "Server Error"}`);
    }
  };

  const deleteUser = async (id) => {
    if(!window.confirm("Delete User?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
      setUsers(users.filter(u => u._id !== id));
    } catch (error) { alert('Delete Failed'); }
  };

  const verifyUser = async (id, status) => {
    try {
      const url = status ? `${API_BASE_URL}/api/users/approve/${id}` : `${API_BASE_URL}/api/users/unapprove/${id}`;
      await axios.put(url, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      fetchUsers(user.token);
    } catch (error) { alert('Action Failed'); }
  };

  const getDocLink = (path) => {
    if (!path) return "#";
    return path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  };

  if (!user) return null;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins' }}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px', background:'#fee2e2', padding:'15px', borderRadius:'10px'}}>
        <h2 style={{color:'#b91c1c', margin:0}}>🛡️ Super Admin Panel</h2>
        <button onClick={() => {localStorage.removeItem('user'); navigate('/login')}} style={{background:'#b91c1c', color:'white', border:'none', padding:'10px 20px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Logout 🔒</button>
      </div>

      {/* EVENTS TABLE */}
      <h3>🎉 Event Management</h3>
      <div style={{overflowX: 'auto', marginBottom:'40px', boxShadow:'0 4px 10px rgba(0,0,0,0.1)', borderRadius:'10px'}}>
        <table style={{width:'100%', borderCollapse:'collapse'}}>
            <thead>
                <tr style={{background:'#f1f5f9', textAlign:'left'}}>
                    <th style={{padding:'15px'}}>Event Title</th>
                    <th style={{padding:'15px'}}>Created By</th>
                    <th style={{padding:'15px'}}>Budget</th>
                    <th style={{padding:'15px'}}>Action</th>
                </tr>
            </thead>
            <tbody>
                {events.map(e => (
                    <tr key={e._id} style={{borderBottom:'1px solid #eee'}}>
                        <td style={{padding:'15px', fontWeight:'bold'}}>{e.title}</td>
                        <td style={{padding:'15px'}}>{e.user?.name}<br/><span style={{fontSize:'0.8rem', color:'#666'}}>{e.user?.email}</span></td>
                        <td style={{padding:'15px'}}>₹{e.budget}</td>
                        <td style={{padding:'15px'}}>
                            <button onClick={() => deleteEvent(e._id)} style={{background:'#ef4444', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>DELETE 🗑</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* USERS TABLE */}
      <h3>👤 User Management</h3>
      <div style={{overflowX: 'auto', boxShadow:'0 4px 10px rgba(0,0,0,0.1)', borderRadius:'10px'}}>
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
                        <td style={{padding:'15px'}}>{u.verificationDoc ? <a href={getDocLink(u.verificationDoc)} target="_blank" rel="noreferrer" style={{color:'blue', textDecoration:'underline'}}>View Doc</a> : "No File"}</td>
                        <td style={{padding:'15px'}}>{u.isVerified ? <span style={{color:'green'}}>✅ Verified</span> : <span style={{color:'orange'}}>⏳ Pending</span>}</td>
                        <td style={{padding:'15px'}}>
                            {!u.isVerified ? <button onClick={() => verifyUser(u._id, true)} style={{background:'#22c55e', color:'white', padding:'5px', border:'none', marginRight:'5px', cursor:'pointer'}}>Approve</button> : 
                            <button onClick={() => verifyUser(u._id, false)} style={{background:'#f59e0b', color:'white', padding:'5px', border:'none', marginRight:'5px', cursor:'pointer'}}>Revoke</button>}
                            <button onClick={() => deleteUser(u._id)} style={{background:'#ef4444', color:'white', padding:'5px', border:'none', cursor:'pointer'}}>Delete</button>
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