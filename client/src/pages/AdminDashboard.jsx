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
      const usersRes = await axios.get('/api/users', config);
      const eventsRes = await axios.get('/api/events', config);
      setUsers(usersRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/users/approve/${id}`, {}, config);
      alert("User Approved! ✅");
      fetchData();
    } catch (error) { alert("Approval Failed!"); }
  };

  useEffect(() => { if (user?.token) fetchData(); }, []);

  if (loading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading... ⏳</h2>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🛡️ Admin Dashboard</h1>

      {/* --- USERS SECTION --- */}
      <h2 style={{ marginTop: '30px' }}>👥 Users ({users.length})</h2>
      {users.map(u => (
        <div key={u._id} style={{ background: '#fff', padding: '15px', borderRadius: '10px', marginBottom: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{u.name}</strong> <span style={{ color: u.isVerified ? 'green' : 'red', fontSize: '0.8rem' }}>({u.isVerified ? 'Verified' : 'Pending'})</span>
            <p style={{ margin: '5px 0', fontSize: '0.9rem', color: '#666' }}>{u.email}</p>
            {/* 👁️ ID Card Link */}
            {u.verificationDoc ? (
              <a href={u.verificationDoc} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: 'bold' }}>View ID Card 🖼️</a>
            ) : <span style={{ fontSize: '0.8rem', color: '#999' }}>No ID Uploaded</span>}
          </div>
          {!u.isVerified && <button onClick={() => handleApprove(u._id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>Approve</button>}
        </div>
      ))}

      {/* --- EVENTS SECTION --- */}
      <h2 style={{ marginTop: '50px' }}>📅 Active Events ({events.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {events.map(e => (
          <div key={e._id} style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4>{e.title}</h4>
            <p style={{ fontSize: '0.85rem' }}>📍 {e.location} | ₹{e.budget}</p>
            {/* ✅ Sahi Organizer Name display */}
            <div style={{ marginTop: '10px', fontSize: '0.8rem', fontWeight: 'bold', color: '#475569' }}>
              Created by: {e.createdBy?.name || 'Unknown Organizer'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;