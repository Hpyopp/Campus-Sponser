import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Verify = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [checking, setChecking] = useState(true); // Page load hote hi check karega
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // 1. PAGE LOAD: FETCH FRESH DATA FROM SERVER
  useEffect(() => {
    const fetchStatus = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      
      if (!storedUser || !storedUser.token) { 
        navigate('/login'); 
        return; 
      }

      try {
        const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
        
        // 🔥 DIRECT SERVER CALL (Sach yahi batayega)
        const res = await axios.get('/api/users/me', config);
        
        console.log("SERVER STATUS:", res.data); // Console check kar: verificationDoc hai ya nahi?

        // State update karo
        setUserData(res.data);
        
        // LocalStorage ko bhi taaza karo
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data }));

        // Agar verified hai toh Home bhej do
        if (res.data.isVerified) {
          navigate('/');
        }

      } catch (error) {
        console.error("Sync Error:", error);
        // Agar token expire ho gaya toh logout
        if(error.response?.status === 401) {
            localStorage.clear();
            navigate('/login');
        }
      } finally {
        setChecking(false);
      }
    };

    fetchStatus();
  }, [navigate]);

  // 2. UPLOAD HANDLER
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file first");

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const formData = new FormData();
    formData.append('verificationDoc', file);

    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${storedUser.token}` } };
      
      // Upload Call
      const res = await axios.post('/api/users/upload-doc', formData, config);
      
      console.log("UPLOAD RESPONSE:", res.data);

      // 🔥 IMMEDIATE UI UPDATE (Bina refresh ke Lock dikhao)
      const freshUser = { 
          ...userData, 
          verificationDoc: res.data.docUrl, // Server se jo URL aaya
          isVerified: false 
      };

      setUserData(freshUser);
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...freshUser }));
      
      // Force app-wide sync
      window.dispatchEvent(new Event("storage"));

      toast.success("✅ Uploaded Successfully! Application Locked.");

    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  // CHECK: Kya document exist karta hai? (Empty string nahi hona chahiye)
  const isLocked = userData && userData.verificationDoc && userData.verificationDoc.length > 5;

  if (checking) {
      return (
        <div style={{display:'flex', justifyContent:'center', marginTop:'100px', fontFamily:'Poppins', color:'#64748b'}}>
            <h3>🔄 Checking Verification Status...</h3>
        </div>
      );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', fontFamily: 'Poppins', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        
        <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>🛡️</h1>
        <h2 style={{ color: '#1e293b', margin: '0 0 15px 0' }}>Account Verification</h2>

        {isLocked ? (
            // === LOCKED VIEW (Jab Document Uploaded Ho) ===
            <div style={{ background: '#f8fafc', border: '2px solid #cbd5e1', padding: '25px', borderRadius: '10px', animation: 'fadeIn 0.5s' }}>
                <div style={{fontSize:'3rem', marginBottom:'10px'}}>🔒</div>
                <h3 style={{ margin: '0 0 10px 0', color: '#334155' }}>Submission Locked</h3>
                
                <p style={{ fontSize: '0.9rem', color:'#64748b', marginBottom:'20px' }}>
                    Your document has been submitted and is under review.
                </p>

                <div style={{marginBottom:'20px', border:'1px dashed #94a3b8', padding:'10px', background:'white', borderRadius:'8px'}}>
                    <p style={{fontSize:'0.8rem', fontWeight:'bold', margin:'0 0 5px 0', color:'#475569'}}>Uploaded Document:</p>
                    
                    {/* Document Link/Preview */}
                    <a href={userData.verificationDoc} target="_blank" rel="noreferrer" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', textDecoration:'none', color:'#2563eb', fontWeight:'bold', padding:'10px', background:'#eff6ff', borderRadius:'5px'}}>
                        📄 View Uploaded File
                    </a>
                </div>

                <div style={{ fontSize: '0.85rem', color:'#dc2626', background:'#fee2e2', padding:'10px', borderRadius:'5px' }}>
                    <strong>Note:</strong> You cannot change this document unless the Admin rejects your application.
                </div>
                
                <button onClick={() => navigate('/')} style={{marginTop:'20px', padding:'12px 25px', background:'#0f172a', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>
                    Go Back Home
                </button>
            </div>
        ) : (
            // === UPLOAD FORM (Jab Document NAHI Ho) ===
            <>
                <p style={{ color: '#64748b', marginBottom: '25px', lineHeight: '1.6' }}>
                To ensure trust, please upload a valid College ID (for Students) or Company Registration/Visiting Card (for Sponsors).
                </p>
                
                <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '10px', background: '#f8fafc', cursor: 'pointer', position:'relative', transition:'0.3s' }} onMouseOver={e=>e.currentTarget.style.borderColor='#2563eb'} onMouseOut={e=>e.currentTarget.style.borderColor='#cbd5e1'}>
                        <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        onChange={(e) => setFile(e.target.files[0])} 
                        required 
                        style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' }}
                        />
                        <div style={{fontSize:'2rem', color:'#94a3b8', marginBottom:'10px'}}>📁</div>
                        {file ? (
                            <div style={{ color: '#2563eb', fontWeight: 'bold', wordBreak:'break-all' }}>Selected: {file.name}</div>
                        ) : (
                            <div style={{ color: '#64748b' }}>Click or Drag to Upload<br/><span style={{fontSize:'0.8rem'}}>(Image or PDF)</span></div>
                        )}
                    </div>
                    
                    <button type="submit" disabled={uploading} style={{ padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: '0.3s', opacity: uploading ? 0.7 : 1 }}>
                        {uploading ? '🚀 Uploading & Saving...' : 'Submit for Verification'}
                    </button>
                </form>
            </>
        )}

      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
};

export default Verify;