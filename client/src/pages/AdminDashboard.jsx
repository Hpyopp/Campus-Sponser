import { useEffect, useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchData = async () => {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    const { data } = await axios.get('/api/users', config);
    setUsers(data);
  };

  const handleApprove = async (id) => {
    const config = { headers: { Authorization: `Bearer ${user.token}` } };
    await axios.put(`/api/users/approve/${id}`, {}, config);
    alert("User Approved! ✅");
    fetchData(); // List update karo
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>🛡️ Admin Dashboard</h1>
      {users.map(u => (
        <div key={u._id} style={{ border: '1px solid #ddd', padding: '10px', margin: '10px 0', display: 'flex', justifyContent: 'space-between' }}>
          <span>{u.name} - {u.isVerified ? '✅ Verified' : '⏳ Pending'}</span>
          {!u.isVerified && (
            <button onClick={() => handleApprove(u._id)} style={{ background: 'green', color: 'white' }}>Approve</button>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;