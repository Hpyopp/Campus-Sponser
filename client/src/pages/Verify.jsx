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
    if (!file) return alert("Please select a file");

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

      await axios.post('/api/users/verify', formData, config);
      
      // 👇 CLEAN MESSAGE (Ab user ko URL nahi dikhega)
      alert("Document Uploaded Successfully! 📤\nPlease wait for Admin approval.");
      navigate('/'); // Wapas Home par bhej do

    } catch (error) {
      console.error(error);
      alert("Upload Failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '30px', background: 'white', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontFamily: 'Poppins, sans-serif' }}>
      <h2 style={{ color: '#1e293b' }}>📂 Upload Verification ID</h2>
      <p style={{ color: '#64748b', marginBottom: '20px' }}>Upload your College ID or Company Proof.</p>
      
      <form onSubmit={handleUpload}>
        <div style={{ border: '2px dashed #cbd5e1', padding: '20px', borderRadius: '10px', marginBottom: '20px', background: '#f8fafc' }}>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])} 
            accept="image/*,.pdf"
            required 
            style={{ width: '100%' }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', width: '100%', padding: '12px', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Uploading... ⏳' : 'Submit Document 🚀'}
        </button>
      </form>
    </div>
  );
};

export default Verify;