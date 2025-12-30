import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();
  // Safe parsing for user
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    // Agar user login nahi hai ya admin nahi hai, toh bhaga do
    if (!user || user.role !== 'admin') {
      navigate('/'); 
    } else {
      fetchData();
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // Backend se data mangwao
      const usersRes = await axios.get('/api/admin/users', config);
      const eventsRes = await axios.get('/api/admin/events', config);
      setUsers(usersRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Delete Function
  const deleteHandler = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/admin/${type}s/${id}`, config);
        fetchData(); // List refresh
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  // Approve Function
  const approveHandler = async (id) => {
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`/api/admin/events/${id}/approve`, {}, config);
        fetchData(); // List refresh
        alert("Event Approved! 🚀");
    } catch (error) {
        alert("Error approving event");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#e74c3c', marginBottom: '20px', borderBottom: '2px solid #eee' }}>
        🛡️ Admin Dashboard
      </h1>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* --- USERS SECTION --- */}
        <div style={{ flex: 1, minWidth: '300px', background: '#f9f9f9', padding: '20px', borderRadius: '10px' }}>
          <h2>👥 Users ({users.length})</h2>
          {users.map(u => (
            <div key={u._id} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'white', padding: '10px', margin: '10px 0', borderRadius: '5px',
              borderLeft: u.role === 'admin' ? '5px solid red' : '5px solid #3498db'
            }}>
              <div>
                <strong>{u.name}</strong>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>{u.email} ({u.role})</p>
              </div>
              <button 
                onClick={() => deleteHandler(u._id, 'user')}
                style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* --- EVENTS SECTION --- */}
        <div style={{ flex: 1, minWidth: '300px', background: '#f9f9f9', padding: '20px', borderRadius: '10px' }}>
          <h2>📅 Events ({events.length})</h2>
          {events.map(e => (
            <div key={e._id} style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: 'white', padding: '10px', margin: '10px 0', borderRadius: '5px',
              borderLeft: e.status === 'approved' ? '5px solid #2ecc71' : '5px solid #f1c40f'
            }}>
              <div>
                <strong>{e.title}</strong>
                {/* Status Badge */}
                <span style={{ 
                    fontSize: '0.7rem', marginLeft: '10px', padding: '2px 6px', borderRadius: '4px',
                    background: e.status === 'approved' ? '#d1fae5' : '#fef3c7',
                    color: e.status === 'approved' ? '#065f46' : '#92400e',
                    fontWeight: 'bold'
                }}>
                    {e.status ? e.status.toUpperCase() : 'PENDING'}
                </span>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                  By: {e.organizer ? e.organizer.name : 'Unknown'}
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '5px' }}>
                {/* Approve Button (Sirf Pending ke liye) */}
                {(!e.status || e.status === 'pending') && (
                    <button 
                    onClick={() => approveHandler(e._id)}
                    title="Approve Event"
                    style={{ background: '#2ecc71', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer', fontSize: '1.2rem' }}>
                    ✓
                    </button>
                )}
                
                <button 
                  onClick={() => deleteHandler(e._id, 'event')}
                  title="Delete Event"
                  style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '5px', cursor: 'pointer' }}>
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;