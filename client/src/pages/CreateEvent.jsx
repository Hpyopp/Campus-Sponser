import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '', date: '', location: '', budget: '', description: '', category: 'Technical',
    instagram: '', linkedin: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false); // Upload loading state

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) { navigate('/login'); return null; }

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  // File Change Handler
  const handleFileChange = (e) => setImageFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    // Saara data FormData mein append karo
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (imageFile) data.append('image', imageFile);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data', // Zaroori hai
        },
      };
      await axios.post('/api/events', data, config);
      alert('Event Created Successfully!');
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Error creating event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', color: '#333' }}>🚀 Create Event</h1>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
          
          <input type="text" name="title" placeholder="Event Title" required onChange={handleChange} style={inputStyle} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="date" name="date" required onChange={handleChange} style={{ ...inputStyle, flex: 1 }} />
            <input type="text" name="location" placeholder="Location" required onChange={handleChange} style={{ ...inputStyle, flex: 1 }} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" name="budget" placeholder="Budget (₹)" required onChange={handleChange} style={{ ...inputStyle, flex: 1 }} />
            <select name="category" onChange={handleChange} style={{ ...inputStyle, flex: 1 }}>
              <option value="Technical">Technical</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
            </select>
          </div>

          {/* 👇 FILE UPLOAD */}
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Event Poster (Upload)</label>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ ...inputStyle, background: '#f9f9f9' }} />
          </div>

          {/* 👇 SOCIAL LINKS */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="url" name="instagram" placeholder="Instagram URL (Optional)" onChange={handleChange} style={{ ...inputStyle, flex: 1 }} />
            <input type="url" name="linkedin" placeholder="LinkedIn URL (Optional)" onChange={handleChange} style={{ ...inputStyle, flex: 1 }} />
          </div>

          <textarea name="description" rows="4" placeholder="Description..." required onChange={handleChange} style={inputStyle}></textarea>

          <button type="submit" disabled={loading} style={{ 
            background: loading ? '#ccc' : '#2563eb', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer' 
          }}>
            {loading ? 'Uploading Image... ⏳' : 'Submit Event 📩'}
          </button>
        </form>
      </div>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' };

export default CreateEvent;