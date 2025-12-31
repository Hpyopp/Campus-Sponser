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

      // Upload Request
      const res = await axios.post('/api/users/verify', formData, config);
      
      console.log("Server Response:", res.data);

      // 👇 ASLI TEST: Agar yahan Link dikha, toh Database mein save ho gaya!
      if (res.data.verificationDoc) {
        alert(`SUCCESS! ✅\nLink Saved: ${res.data.verificationDoc}\n\nGo to Admin Panel now.`);
        navigate('/');
      } else {
        alert("⚠️ Warning: Server sent 'Success' but Link is MISSING in response!");
      }

    } catch (error) {
      console.error(error);
      alert("Upload Failed! Check Console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '20px', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2>📂 Upload ID Proof</h2>
      <form onSubmit={handleUpload}>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
          required 
          style={{ margin: '20px 0' }}
        />
        <br />
        <button type="submit" disabled={loading} style={{ background: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {loading ? 'Uploading...' : 'Submit Document 🚀'}
        </button>
      </form>
    </div>
  );
};

export default Verify;