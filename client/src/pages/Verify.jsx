import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Verify = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // User ka data nikalo
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Logic: Agar Sponsor hai toh "Company Proof", nahi toh "College ID"
  const isSponsor = user?.role === 'sponsor';
  const docLabel = isSponsor ? "Company ID / Visiting Card 🏢" : "College ID Card 🎓";
  const docMessage = isSponsor 
    ? "Upload proof of your organization to sponsor events." 
    : "Upload your Student ID to create events.";

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a document");

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
      
      alert("Document Uploaded! 📤\nAdmin will verify your account shortly.");
      navigate('/'); 

    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '80px auto', padding: '30px', background: 'white', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>
        {isSponsor ? '🏢 Sponsor Verification' : '🎓 Student Verification'}
      </h2>
      <p style={{ color: '#64748b', marginBottom: '25px' }}>{docMessage}</p>
      
      <form onSubmit={handleUpload}>
        <div style={{ marginBottom: '20px', border: '2px dashed #cbd5e1', padding: '40px', borderRadius: '12px', background: '#f8fafc' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#475569' }}>
            {docLabel}
          </label>
          <input 
            type="file" 
            accept="image/*,application/pdf" 
            onChange={(e) => setFile(e.target.files[0])} 
            required 
            style={{ fontSize: '0.9rem' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={{ 
            background: isSponsor ? '#0f172a' : '#2563eb', // Sponsors ke liye Black, Students ke liye Blue
            color: 'white', 
            width: '100%',
            padding: '12px', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '1rem', 
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer', 
            transition: 'opacity 0.3s'
          }}
        >
          {loading ? 'Uploading... ⏳' : 'Submit for Verification 🚀'}
        </button>
      </form>
      
      <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#94a3b8' }}>
        Note: You cannot {isSponsor ? 'contact students' : 'create events'} until verified.
      </p>
    </div>
  );
};

export default Verify;