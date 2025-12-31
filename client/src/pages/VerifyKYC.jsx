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
    if (!storedUser) navigate('/login');
    setUser(storedUser);
  }, [navigate]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  // 👇 DEBUGGING FUNCTION
  const handleUpload = async (e) => {
    // 🛑 1. REFRESH ROKO
    if(e) e.preventDefault();
    e?.stopPropagation();

    alert("1. Button Clicked! Starting Process...");

    if (!file) return alert("❌ No File Selected");
    if (!user) return alert("❌ User Not Found");

    const formData = new FormData();
    formData.append('document', file);

    setLoading(true);
    try {
      alert("2. Sending Request to Server...");

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const res = await axios.post('/api/users/verify', formData, config);

      alert(`3. SERVER RESPONSE: ${res.data.message}`);
      navigate('/');

    } catch (error) {
      console.error("Upload Error:", error);
      alert(`💥 ERROR: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ padding: '30px', textAlign: 'center' }}>
      <h2>📂 Upload Document</h2>
      <input type="file" onChange={handleFileChange} style={{ margin: '20px 0' }} />
      <br />

      {/* 👇 TYPE=BUTTON IS CRITICAL */}
      <button
        type="button"
        onClick={handleUpload}
        disabled={loading}
        style={{ padding: '10px 20px', background: 'blue', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        {loading ? 'Wait...' : 'CLICK ME TO UPLOAD'}
      </button>

      <p onClick={() => navigate('/')} style={{cursor:'pointer', marginTop:'10px'}}>Skip</p>
    </div>
  );
};

export default VerifyKYC;