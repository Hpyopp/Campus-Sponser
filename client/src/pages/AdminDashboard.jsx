import { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [uRes, eRes] = await Promise.all([
        axios.get('/api/users', config),
        axios.get('/api/events', config)
      ]);
      setUsers(uRes.data);
      setEvents(eRes.data);
    } catch (err) { console.error("Fetch Error:", err); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (user?.token) fetchData(); }, []);

  const handleApprove = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/users/approve/${id}`, {}, config);
      alert("Success! User is now Verified. ✅");
      fetchData();
    } catch (err) { alert("Approval failed!"); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Syncing Data... ⏳</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto', background: '#f1f5f9', minHeight: '100vh' }}>
      <h1 style={{ color: '#0f172a', marginBottom: '40px' }}>🛡️ CampusSponsor Admin Portal</h1>

      {/* --- USERS MANAGEMENT --- */}
      <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <h2>👥 User Approvals ({users.length})</h2>
        {users.map(u => (
          <div key={u._id} style={{ borderBottom: '1px solid #e2e8f0', padding: '15px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{u.name}</strong> <span style={{ color: u.isVerified ? '#10b981' : '#f59e0b', fontSize: '0.8rem' }}>({u.isVerified ? 'VERIFIED' : 'PENDING'})</span>
              <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#64748b' }}>{u.email}</p>
              
              {/* ID CARD LINK */}
              {u.verificationDoc ? (
                <a href={u.verificationDoc} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '5px', color: '#2563eb', fontWeight: '600', textDecoration: 'none' }}>
                  👁️ View ID Proof
                </a>
              ) : <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>No Document Uploaded</span>}
            </div>

            {!u.isVerified && (
              <button onClick={() => handleApprove(u._id)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                Approve ✅
              </button>
            )}
          </div>
        ))}
      </div>

      {/* --- LIVE EVENTS MONITOR --- */}
      <h2 style={{ marginTop: '50px' }}>📅 Live Events ({events.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {events.map(e => (
          <div key={e._id} style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 10px' }}>{e.title}</h3>
            <p style={{ fontSize: '0.9rem', color: '#475569' }}>📍 {e.location} | 💰 ₹{e.budget}</p>
            <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>
              Organizer: <span style={{ color: '#2563eb' }}>{e.createdBy?.name || 'Manual Entry'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;