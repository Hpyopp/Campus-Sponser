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
      
      // 👇 Fixed Endpoint
      await axios.post('/api/users/upload-doc', formData, config);
      
      alert("✅ Document Uploaded! Wait for Admin Approval.");
      navigate('/');
      window.location.reload(); 
    } catch (error) {
      alert("Upload failed.");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px', background:'#f8fafc', height:'100vh', display:'flex', justifyContent:'center', alignItems:'center' }}>
      <div style={{ maxWidth: '400px', width:'100%', background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{color:'#1e293b'}}>📂 KYC Verification</h2>
        <p style={{color:'#666'}}>Upload College ID / Aadhar to unlock features.</p>
        <div style={{border:'2px dashed #ccc', padding:'20px', margin:'20px 0', borderRadius:'10px'}}>
            <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*,.pdf" />
        </div>
        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: '12px', background: '#2563eb', color: '#fff', borderRadius: '8px', cursor: 'pointer', border:'none', fontWeight:'bold' }}>
          {loading ? 'Uploading...' : 'Submit Document 🚀'}
        </button>
        <button onClick={() => navigate('/')} style={{marginTop:'15px', background:'none', border:'none', textDecoration:'underline', cursor:'pointer'}}>Cancel</button>
      </div>
    </div>
  );
};
export default Verify;