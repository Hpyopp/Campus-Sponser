import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Verify = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an ID Card image");

    setLoading(false); // Reset loading state if needed
    setLoading(true);
    
    const formData = new FormData();
    formData.append('document', file);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      // ✅ POST request to the correct backend route
      const { data } = await axios.post('/api/users/verify', formData, config);
      
      // ⚠️ IMPORTANT: We don't set isVerified to true in localStorage yet!
      // because the admin needs to approve it first.
      
      alert("ID Card Uploaded Successfully! 📤\nPlease wait for Admin to verify your account. ⏳");
      
      // Redirect to Home instead of Create Event
      navigate('/'); 

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Verification Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', background: 'white', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' }}>
      <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>🔒 Identity Verification</h2>
      <p style={{ color: '#64748b', marginBottom: '25px' }}>Upload your College ID or Company proof for manual review.</p>
      
      <form onSubmit={handleUpload}>
        <div style={{ marginBottom: '20px', border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '12px', background: '#f8fafc' }}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={(e) => setFile(e.target.files[0])} 
            required 
            style={{ fontSize: '0.9rem' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            background: '#2563eb', 
            color: 'white', 
            width: '100%',
            padding: '12px', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '1rem', 
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer', 
            transition: 'all 0.3s ease',
            opacity: loading ? 0.7 : 1 
          }}
        >
          {loading ? 'Uploading... ⏳' : 'Submit for Approval 🚀'}
        </button>
      </form>
      
      <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#94a3b8' }}>
        Note: Access to create events will be granted after manual verification.
      </p>
    </div>
  );
};

export default Verify;