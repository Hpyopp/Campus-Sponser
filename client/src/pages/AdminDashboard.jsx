import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [view, setView] = useState('pending'); // Default view: 'pending' (Kaam ki cheez pehle)
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. DATA FETCHING (GOD SPEED)
  const fetchUsers = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'admin') return navigate('/login');

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Load All Users
      const { data } = await axios.get('/api/users/all', config);
      setUsers(data);
      setLoading(false);
      
      // Agar koi Pending hai, toh seedha wahi dikhao
      const pendingCount = data.filter(u => !u.isVerified).length;
      if (pendingCount > 0 && view !== 'all') setView('pending');

    } catch (error) {
      toast.error("Database Connection Failed!");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. GOD ACTIONS (POWER BUTTONS)
  const executeAction = async (id, actionType) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      let url = '';
      if (actionType === 'approve') url = `/api/users/${id}/approve`;
      if (actionType === 'revoke') url = `/api/users/${id}/unverify`;
      if (actionType === 'delete') url = `/api/users/${id}`;

      // API CALL
      if (actionType === 'delete') {
          if(!window.confirm("⚠️ DELETE USER PERMANENTLY?")) return;
          await axios.delete(url, config);
          toast.success("🗑️ User Deleted Forever");
      } else {
          await axios.put(url, {}, config);
          toast.success(actionType === 'approve' ? "✅ User Verified!" : "🚫 User Blocked!");
      }

      // Refresh Data Instantly
      fetchUsers(); 

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Command Failed ❌");
    }
  };

  // 3. FILTER LOGIC
  const pendingUsers = users.filter(u => !u.isVerified);
  const verifiedUsers = users.filter(u => u.isVerified);
  const sponsors = users.filter(u => u.role === 'sponsor');
  
  // Current View ka data decide karo
  let displayUsers = [];
  if (view === 'pending') displayUsers = pendingUsers;
  if (view === 'verified') displayUsers = verifiedUsers;
  if (view === 'sponsors') displayUsers = sponsors;
  if (view === 'all') displayUsers = users;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'Poppins', padding: '30px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
        <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#38bdf8' }}>⚡ GOD MODE PANEL</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>Absolute Control Center</p>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#facc15' }}>{pendingUsers.length}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>PENDING</div>
            </div>
            <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80' }}>{users.length}</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>TOTAL USERS</div>
            </div>
            <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginLeft: '20px' }}>LOGOUT</button>
        </div>
      </div>

      {/* CONTROLS (TABS) */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
        <TabButton active={view === 'pending'} onClick={() => setView('pending')} label={`⚠️ Pending Approvals (${pendingUsers.length})`} color="#eab308" />
        <TabButton active={view === 'sponsors'} onClick={() => setView('sponsors')} label={`💰 Sponsors`} color="#22c55e" />
        <TabButton active={view === 'verified'} onClick={() => setView('verified')} label={`✅ Verified Users`} color="#3b82f6" />
        <TabButton active={view === 'all'} onClick={() => setView('all')} label={`👥 All Users`} color="#6366f1" />
      </div>

      {/* MAIN TABLE */}
      <div style={{ background: '#1e293b', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#334155', color: '#cbd5e1', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                <tr>
                    <th style={{ padding: '20px' }}>User Identity</th>
                    <th style={{ padding: '20px' }}>Role</th>
                    <th style={{ padding: '20px' }}>Proof</th>
                    <th style={{ padding: '20px' }}>Status</th>
                    <th style={{ padding: '20px' }}>GOD ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading Database...</td></tr>
                ) : displayUsers.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No records found in this category.</td></tr>
                ) : (
                    displayUsers.map(user => (
                        <tr key={user._id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '20px' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white' }}>{user.name}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{user.email}</div>
                                <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '5px' }}>ID: {user._id}</div>
                            </td>
                            <td style={{ padding: '20px' }}>
                                <span style={{ 
                                    background: user.role === 'sponsor' ? '#1e3a8a' : '#581c87', 
                                    color: user.role === 'sponsor' ? '#bfdbfe' : '#e9d5ff',
                                    padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase'
                                }}>
                                    {user.role}
                                </span>
                            </td>
                            <td style={{ padding: '20px' }}>
                                {user.verificationDoc ? (
                                    <a href={user.verificationDoc} target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #38bdf8', padding: '5px 10px', borderRadius: '5px' }}>
                                        📄 View Doc
                                    </a>
                                ) : (
                                    <span style={{ color: '#64748b' }}>No Doc</span>
                                )}
                            </td>
                            <td style={{ padding: '20px' }}>
                                {user.isVerified ? 
                                    <span style={{ color: '#4ade80', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>✅ Verified</span> : 
                                    <span style={{ color: '#facc15', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>⚠️ Pending</span>
                                }
                            </td>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {!user.isVerified ? (
                                        <button onClick={() => executeAction(user._id, 'approve')} style={actionBtn('#16a34a')}>✅ APPROVE</button>
                                    ) : (
                                        <button onClick={() => executeAction(user._id, 'revoke')} style={actionBtn('#f59e0b')}>⛔ REVOKE</button>
                                    )}
                                    <button onClick={() => executeAction(user._id, 'delete')} style={actionBtn('#ef4444')}>🗑️ DELETE</button>
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

// Styles & Helpers
const TabButton = ({ active, onClick, label, color }) => (
    <button 
        onClick={onClick}
        style={{
            padding: '12px 25px', borderRadius: '8px', border: active ? `2px solid ${color}` : '2px solid transparent',
            background: active ? `${color}20` : '#1e293b', color: active ? color : '#94a3b8',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem', transition: '0.3s',
            boxShadow: active ? `0 0 15px ${color}40` : 'none'
        }}
    >
        {label}
    </button>
);

const actionBtn = (bg) => ({
    padding: '8px 16px', background: bg, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', letterSpacing: '0.5px'
});

export default AdminDashboard;