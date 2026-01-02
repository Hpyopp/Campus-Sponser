import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', budget: '', contactEmail: '', instagramLink: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // 1. Check if user is logged in
    if (!user) return navigate('/login');

    // 2. Check Role (Only Students)
    if (user.role !== 'student') {
        alert("Only Students can create events.");
        navigate('/');
        return;
    } 
    
    // 3. Check Verification (KYC)
    if (!user.isVerified) {
        alert("⛔ Account Not Verified!\nPlease upload your ID proof and wait for Admin approval.");
        navigate('/verify'); // Redirect to KYC upload
    }
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Upload Permission Letter!");
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('permissionLetter', file);

      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/events', data, config);
      alert("Event Submitted! Waiting for Admin Approval.");
      navigate('/');
    } catch (error) { 
      alert(error.response?.data?.message || "Error"); 
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily:'Poppins' }}>
      <h2 style={{color:'#1e293b'}}>🚀 Create Event</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input name="title" placeholder="Event Title" onChange={handleChange} required style={{padding:'10px'}} />
        <textarea name="description" placeholder="Description" onChange={handleChange} required style={{padding:'10px'}} />
        <input name="date" type="date" onChange={handleChange} required style={{padding:'10px'}} />
        <input name="location" placeholder="Location" onChange={handleChange} required style={{padding:'10px'}} />
        <input name="budget" type="number" placeholder="Budget Needed (₹)" onChange={handleChange} required style={{padding:'10px'}} />
        <input name="contactEmail" type="email" placeholder="Contact Email" onChange={handleChange} required style={{padding:'10px'}} />
        <input name="instagramLink" placeholder="Instagram Link" onChange={handleChange} style={{padding:'10px'}} />
        
        <div style={{padding:'15px', background:'#f0f9ff', border:'1px dashed blue'}}>
            <label>Upload Permission Letter:</label><br/>
            <input type="file" onChange={handleFileChange} required style={{marginTop:'10px'}} />
        </div>

        <button type="submit" disabled={loading} style={{padding:'15px', background:'blue', color:'white', border:'none', cursor:'pointer', borderRadius:'5px'}}>
            {loading ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
};
export default CreateEvent;