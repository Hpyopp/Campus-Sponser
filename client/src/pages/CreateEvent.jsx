import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  // Form States (Category Added)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    budget: '',
    email: user ? user.email : '', 
    instagramLink: '',
    category: 'Other' // 👈 Default
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [permissionFile, setPermissionFile] = useState(null);

  const ENDPOINT = window.location.hostname === 'localhost'
    ? "http://127.0.0.1:5000"
    : "https://campus-sponser-api.onrender.com";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size too big! Max 5MB.");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handlePermissionChange = (e) => {
    const file = e.target.files[0];
    if (file) setPermissionFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { alert("Please Login First!"); return; }
    if (!imageFile) { alert("📸 Please upload an Event Cover Image."); return; }
    if (!permissionFile) { alert("📄 Please upload the Permission Letter."); return; }

    setLoading(true);
    
    const data = new FormData();
    data.append('image', imageFile); 
    data.append('permissionLetter', permissionFile);
    Object.keys(formData).forEach(key => data.append(key, formData[key]));

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
      await axios.post(`${ENDPOINT}/api/events/create`, data, config);
      alert('🎉 Event Created Successfully! Waiting for Admin Approval.');
      navigate('/'); 
    } catch (error) {
      const serverMsg = error.response?.data?.message || 'Something went wrong on Server!';
      alert(`❌ Error: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem', backgroundColor: '#f8fafc', transition: '0.3s', color: '#334155' };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: 'white', maxWidth: '700px', width: '100%', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b' }}>🚀 Create Event</h1>
            <p style={{ color: '#64748b' }}>Fill details to get sponsors.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>📸 Event Cover Image (Required)</label>
                {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px', border: '2px dashed #cbd5e1' }} />}
                <input type="file" accept="image/*" onChange={handleImageChange} style={{...inputStyle, padding:'10px'}} required />
            </div>

            <input name="title" placeholder="Event Title (e.g. TechFest)" value={formData.title} onChange={handleChange} style={inputStyle} required />
            <textarea name="description" rows="4" placeholder="Describe your event..." value={formData.description} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} required />

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                    <label style={{fontSize:'0.9rem', fontWeight:'600', color:'#64748b'}}>Event Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} style={inputStyle} required />
                </div>
                <div style={{ flex: 1 }}>
                    <label style={{fontSize:'0.9rem', fontWeight:'600', color:'#64748b'}}>Location</label>
                    <input name="location" placeholder="City / College" value={formData.location} onChange={handleChange} style={inputStyle} required />
                </div>
            </div>

            {/* 👇 NEW: CATEGORY DROPDOWN */}
            <div>
                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '5px', display: 'block' }}>🏷️ Event Category</label>
                <select name="category" value={formData.category} onChange={handleChange} style={inputStyle}>
                    <option value="Other">Select Category</option>
                    <option value="Tech">Tech / Hackathon 💻</option>
                    <option value="Cultural">Cultural / Dance 💃</option>
                    <option value="Music">Music Concert 🎵</option>
                    <option value="Sports">Sports / Gaming 🏏</option>
                    <option value="Business">Business / E-Summit 💼</option>
                </select>
            </div>

            <input type="number" name="budget" placeholder="💰 Budget Needed (₹)" value={formData.budget} onChange={handleChange} style={inputStyle} required />
            <input type="email" name="email" placeholder="📧 Contact Email" value={formData.email} onChange={handleChange} style={inputStyle} required />

            <div>
                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '5px', display: 'block' }}>🔗 Instagram Link / Username (Optional)</label>
                <input type="text" name="instagramLink" placeholder="Paste link or type username" value={formData.instagramLink} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ marginTop: '10px', background: '#f0f9ff', padding: '20px', borderRadius: '15px', border: '2px dashed #bae6fd' }}>
                <label style={{ fontWeight: '700', color: '#0369a1', marginBottom: '10px', display: 'block' }}>📄 Upload Permission Letter</label>
                <input type="file" onChange={handlePermissionChange} style={{ width: '100%' }} required />
            </div>

            <button disabled={loading} style={{ width: '100%', padding: '15px', marginTop: '20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? '⏳ Uploading... Please Wait' : '🚀 Create Event'}
            </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateEvent;