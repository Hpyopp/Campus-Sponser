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
      // Dono requests ek saath bhejo
      const [uRes, eRes] = await Promise.all([
        axios.get('/api/users', config),
        axios.get('/api/events', config)
      ]);
      setUsers(uRes.data);
      setEvents(eRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      alert("Failed to fetch admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchData();
    }
  }, []);

  const handleApprove = async (id) => {
    // Confirmation lo taaki galti se click na ho
    if (!window.confirm("Are you sure you have verified the document and want to approve this user?")) return;

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`/api/users/approve/${id}`, {}, config);
      alert("User Approved Successfully! ✅");
      fetchData(); // List refresh karo
    } catch (err) {
      alert("Approval failed! Please try again.");
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem' }}>Loading Dashboard... ⏳</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'sans-serif', background: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ color: '#0f172a', borderBottom: '3px solid #0f172a', paddingBottom: '15px', marginBottom: '30px' }}>🛡️ Admin Control Portal</h1>

      {/* --- USERS APPROVAL SECTION --- */}
      <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#334155', marginBottom: '20px' }}>👥 Pending Verifications ({users.filter(u => !u.isVerified).length})</h2>
        
        {users.map(u => (
          <div key={u._id} style={{ border: '1px solid #e2e8f0', padding: '20px', marginBottom: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: u.isVerified ? '#f0fdf4' : '#ffffff' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <strong style={{ fontSize: '1.1rem' }}>{u.name}</strong>
                {/* 👇 ROLE DIKHAO (Student/Sponsor) */}
                <span style={{ background: '#e2e8f0', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', textTransform: 'capitalize', fontWeight: 'bold', color: '#475569' }}>
                  {u.role}
                </span>
                <span style={{ marginLeft: '5px', fontSize: '0.8rem', padding: '3px 8px', borderRadius: '12px', background: u.isVerified ? '#dcfce7' : '#fee2e2', color: u.isVerified ? '#166534' : '#991b1b', fontWeight: 'bold' }}>
                  {u.isVerified ? '✅ Verified' : '⏳ Pending'}
                </span>
              </div>
              <p style={{ margin: '5px 0', color: '#64748b', fontSize: '0.9rem' }}>{u.email}</p>
              
              {/* 👇 IMAGE LINK (Ye tabhi dikhega jab backend URL bhejega) */}
              <div style={{ marginTop: '10px' }}>
                {u.verificationDoc ? (
                  <a href={u.verificationDoc} target="_blank" rel="noreferrer" 
                     style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#3b82f6', color: 'white', padding: '8px 12px', borderRadius: '6px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: '600' }}>
                    📄 View Uploaded Document
                  </a>
                ) : (
                  <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    ⚠️ No Document Uploaded Yet
                  </span>
                )}
              </div>
            </div>

            {/* Approve Button */}
            {!u.isVerified && (
              <button onClick={() => handleApprove(u._id)} 
                      disabled={!u.verificationDoc} // Document nahi toh button disable
                      style={{ background: u.verificationDoc ? '#10b981' : '#94a3b8', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: u.verificationDoc ? 'pointer' : 'not-allowed', fontWeight: '600', transition: 'background 0.3s' }}>
                {u.verificationDoc ? 'Approve User ✅' : 'Wait for Doc ⏳'}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* --- EVENTS SECTION --- */}
      <h2 style={{ marginTop: '50px', color: '#334155' }}>📅 Live Events Monitor ({events.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {events.map(e => (
          <div key={e._id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 10px', color: '#0f172a' }}>{e.title}</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b', marginBottom: '15px' }}>
              <span>📍 {e.location}</span>
              <span style={{ fontWeight: 'bold', color: '#2563eb' }}>💰 ₹{e.budget}</span>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '0.8rem', color: '#475569' }}>
              Organizer: <strong>{e.createdBy?.name || 'Unknown'}</strong> ({e.createdBy?.email})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;