import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Form Data State
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    location: '',
    budget: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);

  // Security Check: Login hai ya nahi? Verified hai ya nahi?
  useEffect(() => {
    if (!user) navigate('/login');
    else if (!user.isVerified) {
      alert("You need to be verified first!");
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` }
      };

      // Backend ko data bhejo
      await axios.post('/api/events', formData, config);
      
      alert("Success! Event Created Successfully. 🎉");
      navigate('/'); // Wapas Home par bhej do

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '50px auto', padding: '30px', background: '#fff', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontFamily: 'Poppins, sans-serif' }}>
      <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '20px' }}>📢 Create New Event</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Title */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Event Title</label>
          <input type="text" name="title" placeholder="e.g. Hackathon 2025" onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
        </div>

        {/* Date */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Event Date</label>
          <input type="date" name="date" onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
        </div>

        {/* Location */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Location</label>
          <input type="text" name="location" placeholder="e.g. Main Auditorium" onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
        </div>

        {/* Budget */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Budget Needed (₹)</label>
          <input type="number" name="budget" placeholder="e.g. 50000" onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
        </div>

        {/* Description */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
          <textarea name="description" rows="4" placeholder="Tell sponsors why they should fund you..." onChange={handleChange} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1', resize: 'vertical' }}></textarea>
        </div>

        {/* Submit Button */}
        <button type="submit" disabled={loading} style={{ marginTop: '10px', padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
          {loading ? 'Publishing... ⏳' : '🚀 Publish Event'}
        </button>

      </form>
    </div>
  );
};

export default CreateEvent;