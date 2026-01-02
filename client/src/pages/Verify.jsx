import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Verify = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first!");

    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      const formData = new FormData();
      formData.append('doc', file); 

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`
        }
      };

      // 👇 FIX: Yahan 'verify' nahi, 'upload-doc' aayega
      await axios.post('/api/users/upload-doc', formData, config);
      
      alert("✅ Document Uploaded! Admin will verify shortly.");
      navigate('/');
      window.location.reload(); 
      
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Upload Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', background:'#f8fafc', fontFamily:'Poppins' }}>
        <div style={{ background:'white', padding:'40px', borderRadius:'15px', boxShadow:'0 10px 30px rgba(0,0,0,0.1)', textAlign:'center', maxWidth:'400px' }}>
            
            <h2 style={{color:'#1e293b', marginBottom:'10px'}}>📂 Upload ID Proof</h2>
            <p style={{color:'#64748b', marginBottom:'30px', fontSize:'0.9rem'}}>
                Please upload your College ID or Aadhar to activate your account.
            </p>
            
            <div style={{border:'2px dashed #cbd5e1', padding:'30px', borderRadius:'10px', background:'#f1f5f9', marginBottom:'20px'}}>
                <input type="file" onChange={handleFileChange} accept="image/*,.pdf" />
            </div>

            <button 
                onClick={handleSubmit} 
                disabled={loading}
                style={{ width:'100%', padding:'15px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', cursor:'pointer', fontSize:'1rem' }}
            >
                {loading ? 'Uploading... ⏳' : 'Submit Document 🚀'}
            </button>
            
            <button onClick={() => navigate('/')} style={{marginTop:'20px', background:'none', border:'none', color:'#64748b', cursor:'pointer', textDecoration:'underline'}}>
                Cancel
            </button>
        </div>
    </div>
  );
};
export default Verify;