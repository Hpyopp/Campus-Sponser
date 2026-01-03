import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalRaised: 0, totalUsers: 0, totalEvents: 0, pending: 0 });

  // 1. DATA FETCH KARO
  const fetchUsers = async () => {
    try {
      // Token Headers mein bhejna zaroori hai
      const config = {
          headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` }
      };

      const { data } = await axios.get('/api/users/all', config);
      setUsers(data);

      // Stats Calculate karo
      const raised = data.reduce((acc, user) => acc + (user.raisedAmount || 0), 0);
      const pendingCount = data.filter(u => !u.isVerified).length;
      setStats({ 
          totalRaised: raised, 
          totalUsers: data.length, 
          totalEvents: 0, // Events ka alag API hai, abhi 0 rakha hai
          pending: pendingCount 
      });

    } catch (error) {
      console.error(error);
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. APPROVE FUNCTION (Backend Route: /api/users/:id/approve)
  const handleApprove = async (id) => {
    if(!window.confirm("Are you sure you want to verify this user?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` } };
      
      // 👇 SAHI ROUTE
      await axios.put(`/api/users/${id}/approve`, {}, config);
      
      toast.success("User Verified Successfully ✅");
      fetchUsers(); // List refresh karo
    } catch (error) {
      toast.error(error.response?.data?.message || "Action Failed");
    }
  };

  // 3. REVOKE FUNCTION (Backend Route: /api/users/:id/unverify)
  const handleRevoke = async (id) => {
    if(!window.confirm("Are you sure you want to un-verify this user?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` } };
      
      // 👇 SAHI ROUTE
      await axios.put(`/api/users/${id}/unverify`, {}, config);
      
      toast.success("User Unverified ⚠️");
      fetchUsers();
    } catch (error) {
      toast.error("Action Failed");
    }
  };

  // 4. DELETE FUNCTION (Backend Route: /api/users/:id)
  const handleDelete = async (id) => {
    if(!window.confirm("Delete this user permanently?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` } };
      
      await axios.delete(`/api/users/${id}`, config);
      
      toast.success("User Deleted 🗑️");
      fetchUsers();
    } catch (error) {
      toast.error("Action Failed");
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins' }}>
      
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px' }}>
          <h1 style={{ color: '#1e293b' }}>🚀 Command Center</h1>
          <span style={{ background:'#dbeafe', color:'#1e40af', padding:'5px 15px', borderRadius:'20px', fontWeight:'bold' }}>Admin Mode</span>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #16a34a' }}>
            <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>TOTAL USERS</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '5px 0', color: '#1e293b' }}>{stats.totalUsers}</p>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderLeft: '5px solid #f59e0b' }}>
            <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>PENDING REQUESTS</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '5px 0', color: '#1e293b' }}>{stats.pending}</p>
        </div>
      </div>

      {/* USERS TABLE */}
      <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, color: '#1e293b' }}>👤 User Verification</h3>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <tr>
                <th style={{ padding: '15px' }}>User Details</th>
                <th style={{ padding: '15px' }}>Role</th>
                <th style={{ padding: '15px' }}>Document</th>
                <th style={{ padding: '15px' }}>Status</th>
                <th style={{ padding: '15px' }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {users.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px' }}>
                        <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{user.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{user.email}</div>
                    </td>
                    <td style={{ padding: '15px' }}>
                        <span style={{ 
                            background: user.role === 'sponsor' ? '#dbeafe' : '#f3e8ff', 
                            color: user.role === 'sponsor' ? '#1e40af' : '#7e22ce',
                            padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600'
                        }}>
                            {user.role}
                        </span>
                    </td>
                    <td style={{ padding: '15px' }}>
                        {user.verificationDoc ? (
                            <a href={user.verificationDoc} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline' }}>View Doc</a>
                        ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No Doc</span>
                        )}
                    </td>
                    <td style={{ padding: '15px' }}>
                        {user.isVerified ? 
                            <span style={{ color: '#16a34a', fontWeight: 'bold' }}>Verified</span> : 
                            <span style={{ color: '#d97706', fontWeight: 'bold' }}>Pending</span>
                        }
                    </td>
                    <td style={{ padding: '15px', display: 'flex', gap: '10px' }}>
                        {!user.isVerified ? (
                            <button onClick={() => handleApprove(user._id)} style={{ padding: '6px 12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Approve</button>
                        ) : (
                            <button onClick={() => handleRevoke(user._id)} style={{ padding: '6px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Revoke</button>
                        )}
                        <button onClick={() => handleDelete(user._id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Del</button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;