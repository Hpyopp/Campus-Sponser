import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const VerifyKYC = () => {
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
        navigate('/login');
    } else {
        setUser(storedUser);
    }
  }, [navigate]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a document first!");
    if (!user) return alert("User session error. Login again.");

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

      await axios.post('/api/users/verify', formData, config);
      
      alert("✅ Document Uploaded! Admin will verify shortly.");
      navigate('/'); 

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Upload Failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div style={{textAlign:'center', marginTop:'50px'}}>Loading...</div>;

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', textAlign: 'center', padding: '30px', border: '1px solid #ddd', borderRadius: '15px', fontFamily: 'Poppins' }}>
      <h2 style={{color: '#1e293b'}}>📂 Upload KYC Document</h2>
      
      <p style={{color: '#64748b', marginBottom: '20px'}}>
        Verify your <strong>{user.role?.toUpperCase()}</strong> account.
      </p>

      {/* 🛑 NO FORM TAG HERE - Refresh Issue Solved */}
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px dashed #94a3b8', marginBottom: '20px' }}>
        <input 
          type="file" 
          onChange={handleFileChange} 
          accept="image/*,.pdf"
          style={{ marginTop: '15px' }} 
        />
      </div>

      <button 
        onClick={handleUpload} 
        disabled={loading}
        style={{ padding: '12px 25px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}
      >
        {loading ? 'Uploading... ⏳' : 'Submit Proof 🚀'}
      </button>
      
      <button onClick={() => navigate('/')} style={{marginTop: '15px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline'}}>
        Skip for now
      </button>
    </div>
  );
};

export default VerifyKYC;