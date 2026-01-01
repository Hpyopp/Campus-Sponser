import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '', description: '', date: '', location: '', budget: '',
    contactEmail: '', instagramLink: '' // 👈 New
  });
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/events', formData, config);
      alert('Event Created Successfully! 🎉');
      navigate('/');
    } catch (error) { alert('Error creating event'); }
  };

  const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ccc' };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '15px' }}>
      <h2 style={{ textAlign: 'center', color: '#1e293b' }}>+ Create New Event</h2>
      <form onSubmit={onSubmit}>
        <input type="text" name="title" onChange={onChange} placeholder="Event Title" required style={inputStyle} />
        <textarea name="description" onChange={onChange} placeholder="Description" required style={{...inputStyle, height:'100px'}} />
        <div style={{display:'flex', gap:'10px'}}>
            <input type="date" name="date" onChange={onChange} required style={inputStyle} />
            <input type="number" name="budget" onChange={onChange} placeholder="Budget (₹)" required style={inputStyle} />
        </div>
        <input type="text" name="location" onChange={onChange} placeholder="Location" required style={inputStyle} />
        
        {/* 👇 NEW CONTACT INPUTS */}
        <h4 style={{margin:'10px 0', color:'#64748b'}}>📞 Contact Details for Sponsors</h4>
        <input type="email" name="contactEmail" onChange={onChange} placeholder="Official Contact Email" required style={inputStyle} />
        <input type="text" name="instagramLink" onChange={onChange} placeholder="Instagram Link (Optional)" style={inputStyle} />

        <button type="submit" style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Publish Event 🚀</button>
      </form>
    </div>
  );
};
export default CreateEvent;