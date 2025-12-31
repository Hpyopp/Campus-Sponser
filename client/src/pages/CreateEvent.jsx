import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', date: '', location: '', budget: '', description: ''
  });

  // Check Status on Load
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    if (!storedUser) {
      navigate('/login'); // Login nahi hai toh bhagao
    } else {
      setUser(storedUser);
      // 👇 AGAR VERIFIED NAHI HAI TOH ALERT AUR REDIRECT
      if (!storedUser.isVerified) {
        alert("🚫 Access Denied!\n\nYou need Admin Approval to create events. Please upload documents and wait.");
        navigate('/'); // Home bhejo
      }
    }
  }, [navigate]);

  const { title, date, location, budget, description } = formData;
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !user.isVerified) return alert("Account not verified!");

    const config = { headers: { Authorization: `Bearer ${user.token}` } };

    try {
      await axios.post('/api/events', formData, config);
      alert('Event Created Successfully! 🎉');
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating event');
    }
  };

  if (!user) return <p style={{textAlign:'center', marginTop:'50px'}}>Loading...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '15px', fontFamily: 'Poppins' }}>
      <h2 style={{ textAlign: 'center', color: '#1e293b' }}>📢 Publish New Event</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" name="title" value={title} onChange={handleChange} required placeholder="Event Title" style={inputStyle} />
        <input type="date" name="date" value={date} onChange={handleChange} required style={inputStyle} />
        <input type="text" name="location" value={location} onChange={handleChange} required placeholder="Location" style={inputStyle} />
        <input type="number" name="budget" value={budget} onChange={handleChange} required placeholder="Budget Needed (₹)" style={inputStyle} />
        <textarea name="description" value={description} onChange={handleChange} rows="4" placeholder="Event Details..." style={inputStyle} />
        
        <button type="submit" style={btnStyle}>Publish Event 🚀</button>
      </form>
    </div>
  );
};

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ccc' };
const btnStyle = { padding: '12px', background: '#e11d48', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default CreateEvent;