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
    if (!file) return alert("Please select a file first!");

    setLoading(true);
    const formData = new FormData();
    // 👇 Backend mein 'upload.single("document")' hai, toh yahan bhi "document" hona chahiye
    formData.append('document', file); 

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
      };

      const res = await axios.post('/api/users/verify', formData, config);
      console.log("Upload Response:", res.data); // Console mein check kar sakte ho
      
      alert("Success! Document Uploaded. Admin will check it now.");
      navigate('/');
      
    } catch (error) {
      console.error(error);
      alert("Upload Failed! Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2>📂 Upload Verification Document</h2>
      <form onSubmit={handleUpload}>
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files[0])} 
          accept="image/*,.pdf"
          required 
          style={{ margin: '20px 0' }}
        />
        <br />
        <button type="submit" disabled={loading} style={{ background: 'blue', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {loading ? 'Uploading...' : 'Submit Document 🚀'}
        </button>
      </form>
    </div>
  );
};

export default Verify;