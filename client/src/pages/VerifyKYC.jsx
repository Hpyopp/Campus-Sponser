import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VerifyKYC = () => {
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check karo user login hai ya nahi
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
        navigate('/login'); // Agar login nahi hai toh login page par bhejo
    } else {
        setUser(storedUser);
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    if(e) e.preventDefault(); // Refresh Roko

    if (!file) return alert("❌ Please select a document first!");
    if (!user) return alert("❌ Session Expired. Login Again.");

    const formData = new FormData();
    formData.append('document', file);

    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };

      // Backend ko file bhejo
      await axios.post('/api/users/verify', formData, config);
      
      alert("✅ Document Uploaded Successfully! Admin will verify soon.");
      navigate('/'); // Home page par wapas jao

    } catch (error) {
      console.error("Upload Error:", error);
      alert(`❌ Error: ${error.response?.data?.message || "Server Error"}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div style={{textAlign:'center', padding:'50px'}}>Loading...</div>;

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', textAlign: 'center', padding: '30px', border: '1px solid #ddd', borderRadius: '15px', fontFamily: 'Poppins' }}>
      <h2 style={{color: '#1e293b'}}>📂 Upload ID Proof</h2>
      
      <p style={{color: '#64748b', marginBottom: '20px'}}>
        Hello <strong>{user.name}</strong>, please upload your ID to activate account.
      </p>

      {/* Upload Box */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '2px dashed #94a3b8', marginBottom: '20px' }}>
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept="image/*,.pdf"
          style={{ marginTop: '10px' }} 
        />
      </div>

      <button 
        type="button" 
        onClick={handleUpload} 
        disabled={loading}
        style={{ padding: '12px 25px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
      >
        {loading ? 'Uploading... ⏳' : 'Submit Document 🚀'}
      </button>
      
      <button onClick={() => navigate('/')} style={{marginTop: '15px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline'}}>
        Cancel
      </button>
    </div>
  );
};

export default VerifyKYC;