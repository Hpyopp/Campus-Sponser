import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('users'); // users, events
  const [filter, setFilter] = useState('all'); // all, student, sponsor
  const navigate = useNavigate();

  // 1. DATA FETCHING
  useEffect(() => {
    const fetchData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'admin') { navigate('/'); return; }

      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Sabhi users ko fetch karo
        const res = await axios.get('https://campus-sponser-api.onrender.com/api/users/all', config);
        setUsers(res.data);
      } catch (error) {
        toast.error("Failed to fetch data");
      }
    };
    fetchData();
  }, [navigate]);

  // 2. APPROVE LOGIC
  const handleApprove = async (id) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`https://campus-sponser-api.onrender.com/api/users/${id}/approve`, {}, config);
      
      toast.success("User Approved! 🎉");
      // UI update bina refresh kiye
      setUsers(users.map(u => u._id === id ? { ...u, isVerified: true } : u));
    } catch (error) { toast.error("Approval Failed"); }
  };

  // 3. DELETE LOGIC (🗑️ NEW)
  const handleDelete = async (id) => {
    if(!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`https://campus-sponser-api.onrender.com/api/users/${id}`, config);
      
      toast.success("User Deleted Successfully 🗑️");
      // UI se hatao
      setUsers(users.filter(u => u._id !== id)); 
    } catch (error) { toast.error("Delete Failed"); }
  };

  // Filter Logic
  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Poppins', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1e293b', margin: 0 }}>⚡ Admin Dashboard</h1>
        <div style={{display:'flex', gap:'10px'}}>
             <button onClick={() => navigate('/')} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer' }}>Home</button>
             <button onClick={() => { localStorage.clear(); navigate('/login'); }} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', borderBottom:'1px solid #e2e8f0', paddingBottom:'10px' }}>
        <button onClick={() => setTab('users')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: tab === 'users' ? '#2563eb' : 'transparent', color: tab === 'users' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>👥 Users Management</button>
        <button onClick={() => setTab('events')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: tab === 'events' ? '#2563eb' : 'transparent', color: tab === 'events' ? 'white' : '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>🚀 Events</button>
      </div>

      {/* USER TABLE SECTION */}
      {tab === 'users' && (
        <>
          {/* FILTERS */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
            <button onClick={() => setFilter('all')} style={{ padding: '6px 15px', borderRadius: '20px', border: filter === 'all' ? '2px solid #2563eb' : '1px solid #ccc', background: filter === 'all' ? '#eff6ff' : 'white', color: filter === 'all' ? '#2563eb' : '#64748b', cursor: 'pointer', fontWeight:'bold' }}>All</button>
            <button onClick={() => setFilter('student')} style={{ padding: '6px 15px', borderRadius: '20px', border: filter === 'student' ? '2px solid #2563eb' : '1px solid #ccc', background: filter === 'student' ? '#eff6ff' : 'white', color: filter === 'student' ? '#2563eb' : '#64748b', cursor: 'pointer', fontWeight:'bold' }}>Students</button>
            <button onClick={() => setFilter('sponsor')} style={{ padding: '6px 15px', borderRadius: '20px', border: filter === 'sponsor' ? '2px solid #2563eb' : '1px solid #ccc', background: filter === 'sponsor' ? '#eff6ff' : 'white', color: filter === 'sponsor' ? '#2563eb' : '#64748b', cursor: 'pointer', fontWeight:'bold' }}>Sponsors</button>
          </div>

          <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '15px', color: '#475569', fontSize:'0.9rem' }}>User Info</th>
                  <th style={{ padding: '15px', color: '#475569', fontSize:'0.9rem' }}>Role</th>
                  <th style={{ padding: '15px', color: '#475569', fontSize:'0.9rem' }}>Verification Doc</th>
                  <th style={{ padding: '15px', color: '#475569', fontSize:'0.9rem' }}>Status</th>
                  <th style={{ padding: '15px', color: '#475569', fontSize:'0.9rem', textAlign:'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    
                    {/* 1. Name & Email */}
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{user.name}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{user.email}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user.phone}</div>
                    </td>

                    {/* 2. Role */}
                    <td style={{ padding: '15px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', background: user.role === 'student' ? '#dbeafe' : '#ffedd5', color: user.role === 'student' ? '#1e40af' : '#c2410c' }}>
                        {user.role.toUpperCase()}
                      </span>
                      <div style={{ fontSize: '0.8rem', marginTop:'5px', color: '#64748b' }}>
                        {user.companyName || user.collegeName}
                      </div>
                    </td>

                    {/* 3. Doc Link */}
                    <td style={{ padding: '15px' }}>
                      {user.verificationDoc ? (
                        <a href={user.verificationDoc} target="_blank" rel="noopener noreferrer" style={{ display:'inline-block', padding:'5px 10px', border:'1px solid #2563eb', borderRadius:'5px', textDecoration:'none', color:'#2563eb', fontSize:'0.85rem' }}>
                          📄 View Document
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle:'italic', fontSize:'0.9rem' }}>Not Uploaded</span>
                      )}
                    </td>

                    {/* 4. Status Badge (Logic Fix Here) */}
                    <td style={{ padding: '15px' }}>
                      {user.isVerified ? (
                        <div style={{ display:'flex', alignItems:'center', gap:'5px', color: '#16a34a', fontWeight: 'bold' }}>
                          ✅ Verified
                        </div>
                      ) : (
                        <div style={{ color: '#eab308', fontWeight: 'bold' }}>
                          ⏳ Pending
                        </div>
                      )}
                    </td>

                    {/* 5. Actions (Approve & Delete) */}
                    <td style={{ padding: '15px', textAlign: 'right' }}>
                      <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px' }}>
                        
                        {/* Approve Button: Only if NOT Verified AND HAS Doc */}
                        {!user.isVerified && user.verificationDoc && (
                          <button onClick={() => handleApprove(user._id)} style={{ padding: '8px 12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize:'0.85rem', fontWeight:'bold' }}>
                            Approve
                          </button>
                        )}

                        {/* DELETE BUTTON: Always Visible */}
                        <button onClick={() => handleDelete(user._id)} style={{ padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize:'0.85rem', fontWeight:'bold', display:'flex', alignItems:'center', gap:'5px' }}>
                          🗑️ Delete
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  No users found.
                </div>
            )}
          </div>
        </>
      )}

      {tab === 'events' && (
        <div style={{ textAlign: 'center', padding: '50px', background:'white', borderRadius:'10px' }}>
          <h2 style={{color:'#64748b'}}>🚀 Event Management Panel</h2>
          <p>Coming Soon...</p>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;