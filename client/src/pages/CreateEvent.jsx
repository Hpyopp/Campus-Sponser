import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', budget: '', contactEmail: '', instagramLink: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Upload College Permission Letter!");
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('permissionLetter', file);

      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/events', data, config);
      alert("Event Created! Waiting for Admin Approval.");
      navigate('/');
    } catch (error) { alert("Error creating event"); } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily:'Poppins' }}>
      <h2>🚀 Create Event</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input name="title" placeholder="Title" onChange={handleChange} required style={{padding:'10px'}} />
        <textarea name="description" placeholder="Description" onChange={handleChange} required style={{padding:'10px'}} />
        <input name="date" type="date" onChange={handleChange} required style={{padding:'10px'}} />
        <input name="location" placeholder="Location" onChange={handleChange} required style={{padding:'10px'}} />
        <input name="budget" type="number" placeholder="Budget (₹)" onChange={handleChange} required style={{padding:'10px'}} />
        <input name="contactEmail" type="email" placeholder="Email" onChange={handleChange} required style={{padding:'10px'}} />
        <input name="instagramLink" placeholder="Instagram (Optional)" onChange={handleChange} style={{padding:'10px'}} />
        
        <div style={{padding:'15px', border:'1px dashed blue', background:'#f0f9ff'}}>
            <label>Upload Permission Letter:</label>
            <input type="file" onChange={handleFileChange} required style={{marginTop:'10px'}} />
        </div>
        <button type="submit" disabled={loading} style={{padding:'15px', background:'blue', color:'white', border:'none', cursor:'pointer'}}>{loading ? 'Uploading...' : 'Submit'}</button>
      </form>
    </div>
  );
};
export default CreateEvent;