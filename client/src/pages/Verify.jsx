import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Verify = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Select file first!");
    setLoading(true);
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const formData = new FormData();
      formData.append('doc', file);

      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
      
      await axios.post('/api/users/upload-doc', formData, config);
      
      alert("✅ Your document uploaded successfully!\n\nAdmin will approve it under 24 hours.");
      
      navigate('/');
      window.dispatchEvent(new Event("storage")); 

    } catch (error) {
      alert("Upload failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px', background: '#f8fafc', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Poppins' }}>
      <div style={{ maxWidth: '400px', width: '100%', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#1e293b', margin: '0 0 10px 0' }}>📂 KYC Verification</h2>
        <p style={{ color: '#666', marginBottom: '30px' }}>Upload College ID / Aadhar to unlock features.</p>
        
        <div style={{ border: '2px dashed #3b82f6', padding: '20px', marginBottom: '25px', borderRadius: '10px', background: '#eff6ff' }}>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*,.pdf" style={{ width: '100%' }} />
        </div>
        
        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '15px', background: '#2563eb', color: '#fff', borderRadius: '8px', cursor: 'pointer', border: 'none', fontWeight: 'bold', fontSize: '1rem' }}>
          {loading ? 'Uploading... ⏳' : 'Submit Document 🚀'}
        </button>
        
        <button onClick={() => navigate('/')} style={{ marginTop: '20px', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: '#64748b' }}>
            Cancel
        </button>
      </div>
    </div>
  );
};
export default Verify;