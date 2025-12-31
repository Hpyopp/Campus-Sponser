import { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` }
        };

        // ✅ SAHI ADDRESSES: /api/users aur /api/events
        // Pehle yahan /api/admin/... tha jo 404 de raha tha
        const usersRes = await axios.get('/api/users', config); 
        const eventsRes = await axios.get('/api/events', config);

        setUsers(usersRes.data);
        setEvents(eventsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.token) {
      fetchData();
    }
  }, []);

  if (loading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading Dashboard... ⏳</h2>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#e11d48', marginBottom: '30px' }}>🛡️ Admin Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Users Section */}
        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3>👥 Users ({users.length})</h3>
          {users.map(u => (
            <div key={u._id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{u.name}</strong> <br />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>{u.email} ({u.role})</span>
              </div>
            </div>
          ))}
        </div>

        {/* Events Section */}
        <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <h3>📅 Events ({events.length})</h3>
          {events.map(e => (
            <div key={e._id} style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>{e.title}</strong> <br />
                <span style={{ fontSize: '0.8rem', color: '#666' }}>By: {e.createdBy?.name || 'Unknown'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;