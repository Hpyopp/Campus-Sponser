import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // ✅ 1. Security Check: Agar user Admin nahi hai, toh bhaga do
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin' && user.email !== 'test@gmail.com') { // Apni admin email yahan daal sakta hai safe side ke liye
      // Optional: Redirect students to home
      // navigate('/'); 
    }
  }, [user, navigate]);

  const fetchData = async () => {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    
    // ✅ 2. Separate Requests: Ek fail hua toh dusra chalega
    try {
      const uRes = await axios.get('/api/users', config);
      setUsers(uRes.data);
    } catch (err) { console.error("Users fetch error:", err); }

    try {
      const eRes = await axios.get('/api/events', config);
      setEvents(eRes.data);
    } catch (err) { console.error("Events fetch error:", err); }
    
    setLoading(false);
  };

  useEffect(() => {
    if (user?.token) fetchData();
  }, []);

  const handleStatus = async (id, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // Agar approve hai toh status true, reject pe user delete ya status false
      if (status === 'approve') {
        await axios.put(`/api/users/approve/${id}`, {}, config);
        alert("User Approved! ✅");
      } else {
        // Reject logic (Optional: Delete user or set rejected flag)
        if(window.confirm("Are you sure you want to REJECT and DELETE this user?")) {
             // Tujhe delete route banana padega agar ye use karna hai, abhi ke liye bas alert
             alert("Feature coming soon: User Rejection"); 
        }
        return;
      }
      fetchData();
    } catch (err) { alert("Action Failed!"); }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Checking Permissions... ⏳</div>;

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#e11d48', margin: 0 }}>🛡️ Admin Control</h1>
        <div style={{ background: '#f1f5f9', padding: '5px 15px', borderRadius: '20px' }}>
          Logged in as: <strong>{user.name}</strong> ({user.role})
        </div>
      </div>

      {/* --- USERS SECTION --- */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h2 style={{ borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>👥 Verification Queue ({users.length})</h2>
        
        {users.length === 0 ? <p>No users found.</p> : users.map(u => (
          <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #eee' }}>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <div style={{ width: '40px', height: '40px', background: u.isVerified ? '#dcfce7' : '#fee2e2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                {u.isVerified ? '✓' : '⏳'}
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{u.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{u.email}</div>
                {u.verificationDoc ? (
                  <a href={u.verificationDoc} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'none', marginTop: '5px', display: 'inline-block' }}>
                    📄 View ID Document
                  </a>
                ) : <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>No Document</span>}
              </div>
            </div>

            {!u.isVerified && (
              <div style={{ display: 'flex', gap: '10px' }}>
                 <button onClick={() => handleStatus(u._id, 'approve')} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                   Approve
                 </button>
              </div>
            )}
            {u.isVerified && <span style={{ color: '#166534', fontWeight: 'bold', background: '#dcfce7', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>Verified</span>}
          </div>
        ))}
      </div>

      {/* --- EVENTS SECTION --- */}
      <h2 style={{ marginTop: '40px' }}>📅 System Events ({events.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {events.map(e => (
          <div key={e._id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h3>{e.title}</h3>
            <p>📍 {e.location}</p>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px' }}>
              Organizer: <strong>{e.createdBy?.name || 'Unknown'}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;