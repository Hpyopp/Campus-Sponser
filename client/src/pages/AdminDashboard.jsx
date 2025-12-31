import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // 👇 TERA BACKEND URL (Isko Note Karle)
  // Agar kabhi URL change ho toh yahan badal dena
  const API_URL = "https://campus-sponser-api.onrender.com";

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser || storedUser.email !== 'admin@gmail.com') {
      navigate('/');
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
      console.log(error);
    }
  };

  const verifyUser = async (id, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (status) {
        await axios.put(`/api/users/approve/${id}`, {}, config);
      } else {
        await axios.put(`/api/users/unapprove/${id}`, {}, config);
      }
      fetchUsers(user.token);
    } catch (error) {
      alert('Action Failed');
    }
  };

  const deleteUser = async (id) => {
    if(!window.confirm("Are you sure?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/users/${id}`, config);
      fetchUsers(user.token);
    } catch (error) {
      alert('Delete Failed');
    }
  };

  // Styles
  const th = { padding: '12px', background: '#f1f5f9', borderBottom: '2px solid #ddd' };
  const td = { padding: '12px', borderBottom: '1px solid #eee' };
  const btn = { padding: '5px 10px', margin: '0 5px', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', fontWeight: 'bold' };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Poppins' }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h2 style={{color: '#1e293b'}}>🛡️ Admin Dashboard</h2>
        <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} style={{...btn, background: '#ef4444'}}>Logout</button>
      </div>

      <div style={{overflowX: 'auto'}}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{textAlign:'left'}}>
              <th style={th}>User Info</th>
              <th style={th}>Role</th>
              <th style={th}>Document</th>
              <th style={th}>Status</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td style={td}>
                  <div style={{fontWeight:'bold'}}>{u.name}</div>
                  <div style={{fontSize:'0.85rem', color:'#64748b'}}>{u.email}</div>
                </td>
                
                <td style={td}>
                    <span style={{
                        padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                        background: u.role === 'sponsor' ? '#dbeafe' : '#fef3c7',
                        color: u.role === 'sponsor' ? '#1e40af' : '#92400e'
                    }}>
                        {u.role ? u.role.toUpperCase() : 'USER'}
                    </span>
                </td>

                <td style={td}>
                  {u.verificationDoc ? (
                    <a 
                      // 👇 FIX: Backend URL + File Path
                      href={`${API_URL}${u.verificationDoc}`} 
                      target="_blank" 
                      rel="noreferrer"
                      style={{color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline'}}
                    >
                      View Doc 📎
                    </a>
                  ) : (
                    <span style={{color: '#94a3b8'}}>No File</span>
                  )}
                </td>

                <td style={td}>
                  {u.isVerified 
                    ? <span style={{color:'green', fontWeight:'bold'}}>✅ Verified</span> 
                    : <span style={{color:'orange', fontWeight:'bold'}}>⏳ Pending</span>}
                </td>

                <td style={td}>
                  {!u.isVerified && (
                    <button onClick={() => verifyUser(u._id, true)} style={{...btn, background: '#22c55e'}}>Approve</button>
                  )}
                  {u.isVerified && (
                    <button onClick={() => verifyUser(u._id, false)} style={{...btn, background: '#f59e0b'}}>Revoke</button>
                  )}
                  <button onClick={() => deleteUser(u._id)} style={{...btn, background: '#ef4444'}}>Delete</button>
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