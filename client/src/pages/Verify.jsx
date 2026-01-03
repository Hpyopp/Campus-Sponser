import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Verify = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [checking, setChecking] = useState(true); // Loading state
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  // 1. PAGE LOAD: Server Check
  useEffect(() => {
    const checkServerStatus = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      
      if (!storedUser || !storedUser.token) {
        navigate('/login');
        return;
      }

      try {
        const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
        
        // Server se pucho: "Mere paas doc hai kya?"
        const res = await axios.get('/api/users/me', config);
        
        console.log("FRESH DATA FROM SERVER:", res.data); 

        setUserData(res.data);
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data }));

        if (res.data.isVerified) {
          navigate('/');
        }

      } catch (error) {
        console.error("Sync Error:", error);
      } finally {
        setChecking(false);
      }
    };

    checkServerStatus();
  }, [navigate]);

  // 2. UPLOAD HANDLER
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Select file!");

    const storedUser = JSON.parse(localStorage.getItem('user'));
    const formData = new FormData();
    formData.append('verificationDoc', file);

    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${storedUser.token}` } };
      
      const res = await axios.post('/api/users/upload-doc', formData, config);
      
      // Update UI Immediately
      const updatedData = { 
          ...userData, 
          verificationDoc: res.data.docUrl, 
          isVerified: false 
      };
      
      setUserData(updatedData);
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedData }));
      
      toast.success("✅ Uploaded! Screen Locked.");

    } catch (error) {
      toast.error("Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  if (checking) return <div style={{textAlign:'center', marginTop:'100px'}}>Checking Verification Status...</div>;

  // 🔒 LOCK CHECK
  const isLocked = userData && userData.verificationDoc && userData.verificationDoc.length > 5;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', fontFamily: 'Poppins', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
        
        <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>🛡️</h1>
        <h2 style={{ color: '#1e293b', margin: '0 0 15px 0' }}>Account Verification</h2>

        {isLocked ? (
            // LOCKED VIEW
            <div style={{ background: '#f8fafc', border: '2px solid #cbd5e1', padding: '25px', borderRadius: '10px', animation: 'fadeIn 0.5s' }}>
                <div style={{fontSize:'3rem', marginBottom:'10px'}}>🔒</div>
                <h3 style={{ margin: '0 0 10px 0', color: '#334155' }}>Submission Locked</h3>
                <p style={{ fontSize: '0.9rem', color:'#64748b', marginBottom:'20px' }}>
                    Document submitted. Waiting for Admin approval.
                </p>

                <div style={{marginBottom:'20px', border:'1px dashed #ccc', padding:'10px', background:'white', borderRadius:'8px'}}>
                    <p style={{fontSize:'0.8rem', fontWeight:'bold', margin:'0 0 5px 0', color:'#475569'}}>Uploaded File:</p>
                    <a href={userData.verificationDoc} target="_blank" rel="noreferrer" style={{color:'#2563eb', fontWeight:'bold'}}>📄 View Document</a>
                </div>

                <div style={{ fontSize: '0.85rem', color:'#dc2626', background:'#fee2e2', padding:'10px', borderRadius:'5px' }}>
                    Note: You cannot re-upload unless Admin rejects it.
                </div>
                
                <button onClick={() => navigate('/')} style={{marginTop:'20px', padding:'10px 20px', background:'#334155', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>Go Home</button>
            </div>
        ) : (
            // UPLOAD VIEW
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ color: '#64748b' }}>Please upload your ID Proof.</p>
                <div style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '10px', background: '#f8fafc', position:'relative' }}>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0])} required style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' }} />
                    <div style={{fontSize:'2rem', color:'#94a3b8', marginBottom:'10px'}}>📁</div>
                    {file ? <div style={{ color: '#2563eb', fontWeight: 'bold' }}>{file.name}</div> : <div style={{ color: '#64748b' }}>Click to Upload</div>}
                </div>
                <button type="submit" disabled={uploading} style={{ padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>{uploading ? 'Uploading...' : 'Submit'}</button>
            </form>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
};

export default Verify;