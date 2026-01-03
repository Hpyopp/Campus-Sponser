import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Verify = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingServer, setCheckingServer] = useState(true); // 👇 New Loading State
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser) { navigate('/login'); return; }
        
        // Pehle LocalStorage wala data set kar do (Instant UI)
        setCurrentUser(storedUser);

        // 👇 SERVER SE PUCHO: "Kya sach mein document nahi hai?"
        try {
            const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
            const res = await axios.get('/api/users/me', config);
            
            const serverUser = res.data;
            
            // Update LocalStorage with Server Data (Sync)
            const freshUser = { ...storedUser, ...serverUser };
            localStorage.setItem('user', JSON.stringify(freshUser));
            setCurrentUser(freshUser);
            
            // Agar Verified hai toh Home bhejo
            if (serverUser.isVerified) { navigate('/'); }

        } catch (error) {
            console.log("Sync Error");
        } finally {
            setCheckingServer(false);
        }
    };

    init();
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
      
      // Update State Immediately
      const updatedUser = { ...currentUser, verificationDoc: res.data.docUrl, isVerified: false };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      // Force App Sync
      window.dispatchEvent(new Event("storage"));

      toast.success("✅ Document Uploaded! Redirecting...");
      
      // Home bhejo
      setTimeout(() => navigate('/'), 1500);

    } catch (error) {
      toast.error(error.response?.data?.message || "Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser || checkingServer) {
      return (
        <div style={{display:'flex', justifyContent:'center', marginTop:'100px'}}>
            <div style={{color:'#2563eb', fontWeight:'bold'}}>🔄 Checking Verification Status...</div>
        </div>
      );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', fontFamily: 'Poppins', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        
        <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>🛡️</h1>
        <h2 style={{ color: '#1e293b', margin: '0 0 15px 0' }}>Account Verification</h2>

        {/* 👇 FINAL CHECK: Agar Doc hai (Server ya Local), toh LOCK dikhao */}
        {currentUser.verificationDoc ? (
            <div style={{ background: '#f8fafc', border: '2px solid #cbd5e1', padding: '25px', borderRadius: '10px' }}>
                <div style={{fontSize:'3rem', marginBottom:'10px'}}>🔒</div>
                <h3 style={{ margin: '0 0 10px 0', color: '#334155' }}>Submission Under Review</h3>
                
                <p style={{ fontSize: '0.9rem', color:'#64748b', marginBottom:'20px' }}>
                    You have already submitted your document. Please wait for Admin approval (approx 24 hrs).
                </p>

                {/* Preview */}
                <div style={{marginBottom:'20px', border:'1px dashed #ccc', padding:'10px', background:'white', borderRadius:'8px'}}>
                    <p style={{fontSize:'0.8rem', fontWeight:'bold', margin:'0 0 5px 0', color:'#475569'}}>Uploaded Document:</p>
                    {currentUser.verificationDoc.endsWith('.pdf') ? (
                        <a href={currentUser.verificationDoc} target="_blank" rel="noreferrer" style={{color:'#2563eb', fontWeight:'bold'}}>📄 View Uploaded PDF</a>
                    ) : (
                        <img src={currentUser.verificationDoc} alt="ID Proof" style={{width:'100%', maxHeight:'200px', objectFit:'contain', borderRadius:'5px'}} />
                    )}
                </div>

                <div style={{ fontSize: '0.85rem', color:'#dc2626', background:'#fee2e2', padding:'10px', borderRadius:'5px' }}>
                    <strong>Note:</strong> You cannot change this document now. If rejected, this form will unlock.
                </div>
                
                <button onClick={() => navigate('/')} style={{marginTop:'20px', padding:'12px 25px', background:'#334155', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>
                    Go Back Home
                </button>
            </div>
        ) : (
            /* UPLOAD FORM (Sirf tab jab Doc NULL ho) */
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
                        {loading ? '🚀 Upload & Submit' : 'Submit for Verification'}
                    </button>
                </form>
            </>
        )}

      </div>
    </div>
  );
};

export default Verify;