import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // all, pending, sponsor, student
  const navigate = useNavigate();

  // 1. FETCH DATA
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'admin') {
          navigate('/login');
          return;
      }

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // 👇 Backend se saare users laao
      const { data } = await axios.get('/api/users/all', config);
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. FILTER LOGIC (Search + Tabs)
  useEffect(() => {
    let result = users;

    // Filter by Tab
    if (filterTab === 'pending') result = users.filter(u => !u.isVerified);
    if (filterTab === 'sponsor') result = users.filter(u => u.role === 'sponsor');
    if (filterTab === 'student') result = users.filter(u => u.role === 'student');

    // Filter by Search
    if (searchTerm) {
      result = result.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredUsers(result);
  }, [searchTerm, filterTab, users]);

  // 3. ACTIONS (Approve/Revoke/Delete)
  const handleAction = async (id, action) => {
    const config = { headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem('user')).token}` } };
    let promise;

    if (action === 'approve') promise = axios.put(`/api/users/${id}/approve`, {}, config);
    if (action === 'revoke') promise = axios.put(`/api/users/${id}/unverify`, {}, config);
    if (action === 'delete') {
        if(!window.confirm("Permanently delete user?")) return;
        promise = axios.delete(`/api/users/${id}`, config);
    }

    toast.promise(promise, {
      loading: 'Processing...',
      success: () => {
        fetchUsers(); // Refresh Data
        return 'Action Successful! 🚀';
      },
      error: 'Action Failed ❌'
    });
  };

  // Stats Calculation
  const stats = {
    total: users.length,
    pending: users.filter(u => !u.isVerified).length,
    sponsors: users.filter(u => u.role === 'sponsor').length,
    verified: users.filter(u => u.isVerified).length
  };

  return (
    <div style={{ padding: '30px', background: '#f1f5f9', minHeight: '100vh', fontFamily: 'Poppins' }}>
      
      {/* HEADER */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'30px' }}>
          <div>
            <h1 style={{ color: '#0f172a', margin:0 }}>⚡ Admin Command Center</h1>
            <p style={{ color: '#64748b', margin:'5px 0 0 0' }}>Manage users, approvals, and system health.</p>
          </div>
          <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} style={{ background:'#ef4444', color:'white', border:'none', padding:'10px 20px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold' }}>Logout</button>
      </div>

      {/* STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <StatCard label="Total Users" value={stats.total} color="#3b82f6" icon="👥" />
        <StatCard label="Pending Requests" value={stats.pending} color="#f59e0b" icon="⚠️" />
        <StatCard label="Active Sponsors" value={stats.sponsors} color="#10b981" icon="💰" />
        <StatCard label="Verified Accounts" value={stats.verified} color="#6366f1" icon="✅" />
      </div>

      {/* FILTERS & SEARCH */}
      <div style={{ background:'white', padding:'20px', borderRadius:'15px', marginBottom:'20px', boxShadow:'0 4px 10px rgba(0,0,0,0.05)', display:'flex', flexWrap:'wrap', gap:'20px', justifyContent:'space-between', alignItems:'center' }}>
        
        {/* Tabs */}
        <div style={{ display:'flex', gap:'10px' }}>
            {['all', 'pending', 'sponsor', 'student'].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    style={{
                        padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', textTransform: 'capitalize',
                        background: filterTab === tab ? '#0f172a' : '#e2e8f0',
                        color: filterTab === tab ? 'white' : '#64748b',
                        transition: '0.2s'
                    }}
                >
                    {tab}
                </button>
            ))}
        </div>

        {/* Search */}
        <input 
            type="text" 
            placeholder="🔍 Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding:'10px 15px', borderRadius:'8px', border:'1px solid #cbd5e1', width:'300px', outline:'none' }}
        />
      </div>

      {/* MAIN TABLE */}
      <div style={{ background: 'white', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                    <th style={{ padding: '20px' }}>User Info</th>
                    <th style={{ padding: '20px' }}>Role</th>
                    <th style={{ padding: '20px' }}>Document</th>
                    <th style={{ padding: '20px' }}>Status</th>
                    <th style={{ padding: '20px' }}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan="5" style={{textAlign:'center', padding:'30px'}}>Loading data...</td></tr>
                ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan="5" style={{textAlign:'center', padding:'30px', color:'#94a3b8'}}>No users found matching filters.</td></tr>
                ) : (
                    filteredUsers.map(user => (
                        <tr key={user._id} style={{ borderBottom: '1px solid #f1f5f9', transition:'0.2s' }}>
                            <td style={{ padding: '20px' }}>
                                <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize:'1rem' }}>{user.name}</div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{user.email}</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>ID: {user._id}</div>
                            </td>
                            <td style={{ padding: '20px' }}>
                                <span style={{ 
                                    background: user.role === 'sponsor' ? '#dbeafe' : '#f3e8ff', 
                                    color: user.role === 'sponsor' ? '#1e40af' : '#7e22ce',
                                    padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', letterSpacing:'0.5px'
                                }}>
                                    {user.role.toUpperCase()}
                                </span>
                            </td>
                            <td style={{ padding: '20px' }}>
                                {user.verificationDoc ? (
                                    <a href={user.verificationDoc} target="_blank" rel="noreferrer" style={{ textDecoration:'none', color:'#2563eb', fontWeight:'600', display:'flex', alignItems:'center', gap:'5px' }}>
                                        📄 View Doc
                                    </a>
                                ) : (
                                    <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>No Doc</span>
                                )}
                            </td>
                            <td style={{ padding: '20px' }}>
                                {user.isVerified ? 
                                    <span style={{ color: '#16a34a', fontWeight: 'bold', background:'#dcfce7', padding:'5px 10px', borderRadius:'6px' }}>Verified</span> : 
                                    <span style={{ color: '#b45309', fontWeight: 'bold', background:'#fef3c7', padding:'5px 10px', borderRadius:'6px' }}>Pending</span>
                                }
                            </td>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {!user.isVerified ? (
                                        <button onClick={() => handleAction(user._id, 'approve')} style={{ ...btnStyle, background: '#16a34a' }}>Approve</button>
                                    ) : (
                                        <button onClick={() => handleAction(user._id, 'revoke')} style={{ ...btnStyle, background: '#f59e0b' }}>Revoke</button>
                                    )}
                                    <button onClick={() => handleAction(user._id, 'delete')} style={{ ...btnStyle, background: '#ef4444' }}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper Components & Styles
const StatCard = ({ label, value, color, icon }) => (
    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderLeft: `5px solid ${color}` }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'start' }}>
            <div>
                <h3 style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', textTransform:'uppercase' }}>{label}</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '5px 0', color: '#1e293b' }}>{value}</p>
            </div>
            <span style={{ fontSize:'1.5rem', background: color+'20', padding:'10px', borderRadius:'50%' }}>{icon}</span>
        </div>
    </div>
);

const btnStyle = { padding: '8px 12px', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight:'600', fontSize:'0.85rem' };

export default AdminDashboard;