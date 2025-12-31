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

      // 👇 CORRECT ADDRESS: /api/users/verify
      const { data } = await axios.post('/api/users/verify', formData, config);
      
      // Update LocalStorage
      localStorage.setItem('user', JSON.stringify({ ...user, isVerified: true }));
      
      alert("Verification Successful! Access Granted. ✅");
      navigate('/create-event');
      window.location.reload(); 

    } catch (error) {
      console.error(error);
      // Agar error aaye toh alert mein dikhao
      alert(error.response?.data?.message || "Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '30px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
      <h1>🔒 Identity Verification</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>Upload College ID / Company Proof</p>
      
      <form onSubmit={handleUpload}>
        <div style={{ marginBottom: '20px', border: '2px dashed #ccc', padding: '20px', borderRadius: '10px' }}>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} required />
        </div>

        <button type="submit" disabled={loading} style={{ 
            background: '#2563eb', color: 'white', padding: '12px 25px', border: 'none', 
            borderRadius: '5px', fontSize: '1rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 
        }}>
          {loading ? 'Verifying... ⏳' : 'Verify & Unlock 🔓'}
        </button>
      </form>
    </div>
  );
};

export default Verify;