import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));

  // Form States
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    budget: '',
    email: '',
    instagramLink: ''
  });

  // File States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [permissionFile, setPermissionFile] = useState(null);

  const ENDPOINT = window.location.hostname === 'localhost'
    ? "http://127.0.0.1:5000"
    : "https://campus-sponser-api.onrender.com";

  // Handle Text Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image File Selection & Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Show preview
    }
  };

  // Handle Permission Letter Selection
  const handlePermissionChange = (e) => {
    setPermissionFile(e.target.files[0]);
  };

  // Handle Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { alert("Please Login First!"); return; }
    if (!imageFile || !permissionFile) { alert("Please upload both Event Image and Permission Letter."); return; }

    setLoading(true);
    
    // Create FormData to send files + text
    const data = new FormData();
    data.append('image', imageFile); // Ye naam backend mein same hona chahiye
    data.append('permissionLetter', permissionFile); // Ye naam bhi backend mein same hona chahiye
    
    // Append text data fields dynamically
    Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
    });

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      };

      // Make sure your backend route is ready to accept both files!
      await axios.post(`${ENDPOINT}/api/events/create`, data, config);
      
      alert('🎉 Event Created Successfully! Waiting for Admin Approval.');
      navigate('/'); // Redirect to home
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Something went wrong!');
    } finally {
      setLoading(false);
    }
  };

  // Input Style Helper
  const inputStyle = {
    width: '100%', padding: '12px 15px', borderRadius: '10px',
    border: '1px solid #cbd5e1', outline: 'none', fontSize: '1rem',
    backgroundColor: '#f8fafc', transition: '0.3s', color: '#334155'
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ backgroundColor: 'white', maxWidth: '700px', width: '100%', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}
      >
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
               🚀 Create New Event
            </h1>
            <p style={{ color: '#64748b', marginTop: '5px' }}>Fill in the details to attract top sponsors.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 🖼️ Event Cover Image Upload (New Feature) */}
            <div>
                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>📸 Event Cover Image (Required)</label>
                
                {/* Image Preview Area */}
                {imagePreview && (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px', border: '2px dashed #cbd5e1' }} />
                )}
                
                <input 
                    type="file" 
                    accept="image/*" // Only accept images
                    onChange={handleImageChange}
                    style={{ ...inputStyle, padding: '10px' }}
                    required
                />
                <small style={{color:'#94a3b8'}}>Upload a high-quality banner image (JPG/PNG).</small>
            </div>

            {/* Title */}
            <div>
                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>Event Title</label>
                <input name="title" placeholder="e.g. TechVision 2026" value={formData.title} onChange={handleChange} style={inputStyle} required />
            </div>

            {/* Description */}
            <div>
                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>Description & Footfall</label>
                <textarea name="description" rows="4" placeholder="Describe your event, expected crowd, and benefits for sponsors..." value={formData.description} onChange={handleChange} style={{ ...inputStyle, resize: 'vertical' }} required />
            </div>

            {/* Date & Location Flex Row */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>📅 Event Date</label>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} style={inputStyle} required />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>📍 Location (City, College)</label>
                    <input name="location" placeholder="e.g. IIT Bombay, Mumbai" value={formData.location} onChange={handleChange} style={inputStyle} required />
                </div>
            </div>

            {/* Budget Needed */}
            <div>
                <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>💰 Sponsorship Budget Needed (₹)</label>
                <input type="number" name="budget" placeholder="e.g. 50000" value={formData.budget} onChange={handleChange} style={inputStyle} required />
            </div>

            {/* Contact Info Flex Row */}
             <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>📧 Contact Email</label>
                    <input type="email" name="email" placeholder="organizer@college.edu" value={formData.email} onChange={handleChange} style={inputStyle} required />
                </div>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'block' }}>🔗 Instagram Link (Optional)</label>
                    <input type="url" name="instagramLink" placeholder="https://instagram.com/..." value={formData.instagramLink} onChange={handleChange} style={inputStyle} />
                </div>
            </div>

            {/* 📄 Permission Letter Upload (Improved UI) */}
            <div style={{ marginTop: '10px', background: '#f0f9ff', padding: '20px', borderRadius: '15px', border: '2px dashed #bae6fd' }}>
                <label style={{ fontWeight: '700', color: '#0369a1', marginBottom: '10px', display: 'block' }}>📄 Upload Permission Letter (PDF/Image)</label>
                <input 
                    type="file" 
                    accept=".pdf, image/*"
                    onChange={handlePermissionChange}
                    style={{ width: '100%', padding: '10px', background: 'white', borderRadius: '8px' }}
                    required
                />
                 <small style={{color:'#0c4a6e', display:'block', marginTop:'5px'}}>This document is required for admin approval and will be kept confidential.</small>
            </div>

            {/* Submit Button */}
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                style={{ width: '100%', padding: '15px', marginTop: '20px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: '800', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)', opacity: loading ? 0.7 : 1 }}
            >
                {loading ? 'Uploading & Creating...' : '🚀 Create Event Now'}
            </motion.button>

        </form>
      </motion.div>
    </div>
  );
};

export default CreateEvent;