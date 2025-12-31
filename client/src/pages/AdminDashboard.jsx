import { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const uRes = await axios.get('/api/users', config);
      const eRes = await axios.get('/api/events', config);
      setUsers(uRes.data);
      setEvents(eRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { if (user?.token) fetchData(); }, []);

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>🛡️ Admin Dashboard</h1>
      {users.map(u => (
        <div key={u._id} style={{ background: '#fff', padding: '20px', marginBottom: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{u.name}</strong> <span style={{ color: u.isVerified ? 'green' : 'orange' }}>({u.isVerified ? '✅' : '⏳'})</span>
            <p style={{ color: '#64748b', margin: '5px 0' }}>{u.email}</p>
            {/* 👇 Dynamic ID Check */}
            {u.verificationDoc ? (
              <a href={u.verificationDoc} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                View ID Card 👁️
              </a>
            ) : <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>No ID Uploaded</span>}
          </div>
          {!u.isVerified && (
            <button onClick={async () => {
              await axios.put(`/api/users/approve/${u._id}`, {}, { headers: { Authorization: `Bearer ${user.token}` } });
              fetchData();
            }} style={{ background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Approve</button>
          )}
        </div>
      ))}

      <h2 style={{ marginTop: '50px' }}>📅 Active Events ({events.length})</h2>
      {events.map(e => (
        <div key={e._id} style={{ padding: '15px', background: '#f8fafc', borderRadius: '10px', marginBottom: '10px' }}>
          <strong>{e.title}</strong> - Organizer: {e.createdBy?.name || 'Unknown'}
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;