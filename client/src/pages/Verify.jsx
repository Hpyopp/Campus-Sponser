import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Verify = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) { navigate('/login'); return; }
    
    // Agar pehle se verified hai, toh home bhej do
    if (user.isVerified) { navigate('/'); return; }
    
    setCurrentUser(user);
  }, [navigate]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file");

    const formData = new FormData();
    formData.append('verificationDoc', file);

    setLoading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${currentUser.token}` } };
      const res = await axios.post('/api/users/upload-doc', formData, config);
      
      // Update Local Storage to reflect uploaded doc but NOT verified yet
      const updatedUser = { ...currentUser, verificationDoc: res.data.docUrl, isVerified: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser); // Update local state to refresh UI
      window.dispatchEvent(new Event("storage"));

      // 👇 CLEAR MESSAGE
      toast.success("🎉 Document Uploaded! Status: Pending Admin Approval (Approx 24 hrs).");

    } catch (error) {
      toast.error(error.response?.data?.message || "Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', fontFamily: 'Poppins', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        
        <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>🛡️</h1>
        <h2 style={{ color: '#1e293b', margin: '0 0 15px 0' }}>Account Verification</h2>

        {/* 👇 STATE 1: Document Uploaded but PENDING */}
        {currentUser.verificationDoc && !currentUser.isVerified ? (
            <div style={{ background: '#fff7ed', border: '2px solid #f59e0b', padding: '25px', borderRadius: '10px', color: '#92400e' }}>
                <h3 style={{ margin: '0 0 10px 0', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                    ⏳ Status: Pending Approval
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                    Your document has been submitted successfully. Our Admin team will verify your details within <strong>24 hours</strong>.
                </p>
                <p style={{ fontSize: '0.9rem', marginTop:'15px', color:'#78350f' }}>
                    You will get full access once approved. Please check back later.
                </p>
            </div>
        ) : (
            /* 👇 STATE 2: Document NOT Uploaded Yet */
            <>
                <p style={{ color: '#64748b', marginBottom: '25px', lineHeight: '1.6' }}>
                To ensure trust, please upload a valid College ID (for Students) or Company Registration/Visiting Card (for Sponsors).
                </p>
                
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '10px', background: '#f8fafc', cursor: 'pointer', position:'relative' }}>
                        <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        onChange={(e) => setFile(e.target.files[0])} 
                        required 
                        style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' }}
                        />
                        <div style={{fontSize:'2rem', color:'#94a3b8', marginBottom:'10px'}}>📁</div>
                        {file ? (
                            <div style={{ color: '#2563eb', fontWeight: 'bold' }}>Selected: {file.name}</div>
                        ) : (
                            <div style={{ color: '#64748b' }}>Click or Drag to Upload Document<br/><span style={{fontSize:'0.8rem'}}>(Image or PDF, Max 5MB)</span></div>
                        )}
                    </div>
                    
                    <button type="submit" disabled={loading} style={{ padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: '0.3s', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Uploading & Submitting...' : 'Submit for Verification'}
                    </button>
                </form>
            </>
        )}

      </div>
    </div>
  );
};

export default Verify;