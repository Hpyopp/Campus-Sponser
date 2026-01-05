import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) return navigate('/login');
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('https://campus-sponser-api.onrender.com/api/notifications', config);
      setNotifications(data);
      // Mark as read immediately when page opens
      await axios.put('https://campus-sponser-api.onrender.com/api/notifications/read', {}, config);
    } catch (error) { console.error(error); }
  };

  // Helper for Icon styling
  const getIcon = (type) => {
      if (type === 'success') return '🎉';
      if (type === 'warning') return '⚠️';
      return '📢';
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'Poppins' }}>
      <h2 style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>Notifications 🔔</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        {notifications.length > 0 ? notifications.map((n) => (
            <div 
                key={n._id} 
                onClick={() => n.link && navigate(n.link)}
                style={{
                    padding: '20px', 
                    background: n.isRead ? 'white' : '#eff6ff', // Unread are blueish
                    borderLeft: `5px solid ${n.type === 'success' ? '#22c55e' : '#3b82f6'}`,
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    cursor: n.link ? 'pointer' : 'default',
                    transition: '0.2s'
                }}
            >
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ fontSize: '1.5rem' }}>{getIcon(n.type)}</div>
                    <div>
                        <p style={{ margin: 0, fontWeight: n.isRead ? 'normal' : 'bold', color: '#1e293b' }}>{n.message}</p>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                            {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </span>
                    </div>
                </div>
            </div>
        )) : (
            <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>No new notifications.</div>
        )}
      </div>
    </div>
  );
};

export default Notifications;