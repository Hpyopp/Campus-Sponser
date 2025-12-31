import { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      // ✅ Fetching Users and Events from correct live routes
      const usersRes = await axios.get('/api/users', config);
      const eventsRes = await axios.get('/api/events', config);

      setUsers(usersRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };
      await axios.put(`/api/users/approve/${id}`, {}, config);
      alert("User Approved Successfully! ✅");
      fetchData(); // Refresh list
    } catch (error) {
      alert("Approval Failed!");
    }
  };

  useEffect(() => {
    if (user && user.token) {
      fetchData();
    }
  }, []);

  if (loading) return <h2 style={{ textAlign: 'center', marginTop: '50px' }}>Loading Admin Data... ⏳</h2>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      <h1 style={{ color: '#e11d48', borderBottom: '2px solid #e11d48', paddingBottom: '10px' }}>🛡️ Admin Control Panel</h1>

      {/* --- USERS SECTION --- */}
      <section style={{ marginTop: '30px' }}>
        <h2 style={{ color: '#1e293b' }}>👥 Registered Users ({users.length})</h2>
        <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
          {users.map(u => (
            <div key={u._id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '1.1rem' }}>{u.name}</strong> 
                <span style={{ marginLeft: '10px', fontSize: '0.8rem', padding: '3px 8px', borderRadius: '12px', background: u.isVerified ? '#dcfce7' : '#fee2e2', color: u.isVerified ? '#166534' : '#991b1b' }}>
                  {u.isVerified ? 'Verified' : 'Pending Approval'}
                </span>
                <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' }}>{u.email} | Role: {u.role}</p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {/* 👁️ View ID Card Button */}
                {u.verificationDoc ? (
                  <a href={u.verificationDoc} target="_blank" rel="noreferrer" 
                     style={{ background: '#3b82f6', color: 'white', padding: '8px 15px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '500' }}>
                    View ID 👁️
                  </a>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', alignSelf: 'center' }}>No Doc</span>
                )}

                {/* ✅ Approve Button */}
                {!u.isVerified && (
                  <button onClick={() => handleApprove(u._id)} 
                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- EVENTS SECTION --- */}
      <section style={{ marginTop: '50px' }}>
        <h2 style={{ color: '#1e293b' }}>📅 Active Events ({events.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '15px' }}>
          {events.map(e => (
            <div key={e._id} style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 10px', color: '#0f172a' }}>{e.title}</h4>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '5px' }}>📍 {e.location}</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#2563eb' }}>Budget: ₹{e.budget}</p>
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>Created by: {e.createdBy?.name || 'User'}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;