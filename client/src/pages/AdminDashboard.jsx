import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
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
    }
  }, [navigate]);

  const fetchUsers = async (token) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('/api/users', config);
      setUsers(res.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

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

  // 👇 SMART LINK FUNCTION (Ye Error Fix Karega)
  const getDocLink = (path) => {
    if (!path) return "#";
    // Agar purana Cloudinary link hai, toh direct return karo
    if (path.startsWith('http')) return path;
    // Agar naya Local link hai, toh Backend URL lagao
    return `${API_URL}${path}`;
  };

  if (!user) return <div style={{padding:'50px', textAlign:'center'}}>Loading Dashboard...</div>;

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* HEADER */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px', background:'white', padding:'20px', borderRadius:'15px', boxShadow:'0 5px 15px rgba(0,0,0,0.05)'}}>
        <div>
            <h2 style={{color: '#1e293b', margin:0, fontSize:'1.8rem'}}>🛡️ Admin Control</h2>
            <p style={{color:'#64748b', margin:'5px 0 0 0'}}>Manage Users & Verification</p>
        </div>
        <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} style={{padding:'12px 25px', background:'#ef4444', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>
          Logout ➔
        </button>
      </div>

      {/* TABLE */}
      <div style={{overflowX: 'auto', background: 'white', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)', padding:'5px'}}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead>
            <tr style={{textAlign:'left', background:'#f8fafc', color:'#475569'}}>
              <th style={th}>User Details</th>
              <th style={th}>Role</th>
              <th style={th}>Document Proof</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map(u => (
              <tr key={u._id} style={{borderBottom:'1px solid #f1f5f9'}}>
                <td style={td}>
                  <div style={{fontWeight:'bold', color:'#0f172a', fontSize:'1rem'}}>{u.name}</div>
                  <div style={{fontSize:'0.85rem', color:'#64748b'}}>{u.email}</div>
                </td>
                
                <td style={td}>
                    <span style={{
                        padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', letterSpacing:'0.5px',
                        background: u.role === 'sponsor' ? '#dbeafe' : '#fef3c7',
                        color: u.role === 'sponsor' ? '#1e40af' : '#92400e',
                        border: u.role === 'sponsor' ? '1px solid #bfdbfe' : '1px solid #fde68a'
                    }}>
                        {u.role ? u.role.toUpperCase() : 'USER'}
                    </span>
                </td>

                <td style={td}>
                  {u.verificationDoc ? (
                    <a 
                      href={getDocLink(u.verificationDoc)} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{display:'inline-flex', alignItems:'center', gap:'5px', color: '#2563eb', fontWeight: '600', textDecoration: 'none', background:'#eff6ff', padding:'8px 12px', borderRadius:'8px'}}
                    >
                      📄 View Doc
                    </a>
                  ) : (
                    <span style={{color: '#94a3b8', fontStyle:'italic'}}>No Upload</span>
                  )}
                </td>

                <td style={td}>
                  {u.isVerified 
                    ? <span style={{color:'#16a34a', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px'}}>✅ Verified</span> 
                    : <span style={{color:'#d97706', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px'}}>⏳ Pending</span>}
                </td>

                <td style={td}>
                  <div style={{display:'flex', gap:'10px'}}>
                    {!u.isVerified ? (
                        <button onClick={() => verifyUser(u._id, true)} style={{...btn, background: '#22c55e'}}>Approve</button>
                    ) : (
                        <button onClick={() => verifyUser(u._id, false)} style={{...btn, background: '#f59e0b'}}>Revoke</button>
                    )}
                    <button onClick={() => deleteUser(u._id)} style={{...btn, background: '#ef4444'}}>Delete</button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" style={{padding:'40px', textAlign:'center', color:'#64748b'}}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// CSS Styles
const th = { padding: '18px 20px', fontSize:'0.9rem', textTransform:'uppercase', letterSpacing:'0.5px' };
const td = { padding: '18px 20px', verticalAlign: 'middle' };
const btn = { padding: '8px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', color: 'white', fontWeight: '600', fontSize:'0.85rem', transition:'0.2s' };

export default AdminDashboard;