import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Verify = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkServerStatus = async () => {
      // 1. Get user info from local storage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      // If user is not logged in, redirect to login page
      if (!storedUser || !storedUser.token) {
        navigate('/login');
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
        // 2. Fetch latest user data from server
        const res = await axios.get('https://campus-sponser-api.onrender.com/api/users/me', config);
        setUserData(res.data);
        // Update local storage with fresh data
        localStorage.setItem('user', JSON.stringify({ ...storedUser, ...res.data }));
        // If already verified, redirect to home
        if (res.data.isVerified) { navigate('/'); }
      } catch (error) { console.error("Sync Error:", error); } 
      finally { setChecking(false); }
    };
    checkServerStatus();
  }, [navigate]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Select file!");
    const storedUser = JSON.parse(localStorage.getItem('user'));
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('document', file); // Use 'document' key if backend expects it
    
    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${storedUser.token}` } };
      // 3. Upload document to backend
      const res = await axios.post('https://campus-sponser-api.onrender.com/api/users/upload-doc', formData, config);
      
      const updatedData = { ...userData, verificationDoc: res.data.docUrl, isVerified: false };
      setUserData(updatedData);
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...updatedData }));
      toast.success("✅ Uploaded! Waiting for Admin.");
    } catch (error) { 
        console.error(error);
        toast.error("Upload Failed"); 
    } 
    finally { setUploading(false); }
  };

  if (checking) return <div style={{textAlign:'center', marginTop:'100px'}}>Checking Status...</div>;

  // Logic to lock the form if a document is already uploaded
  const isLocked = userData && userData.verificationDoc && userData.verificationDoc.length > 5;

  // 👇 DYNAMIC TEXT LOGIC (Sponsor vs Student)
  const isSponsor = userData?.role === 'sponsor';
  
  const title = isSponsor ? "Business Verification (KYC)" : "Student Verification";
  
  const label = isSponsor 
    ? "Upload GST Certificate / Business Proof 📄" 
    : "Upload College ID Card / Stamped Letter 🎓";
    
  const instruction = isSponsor
    ? "To verify your business, please upload a valid GST Certificate or Business Registration Proof."
    : "To verify your student status, please upload your valid College ID Card.";

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', fontFamily: 'Poppins', padding: '20px', background: '#f8fafc' }}>
      
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', maxWidth: '500px', width: '90%', textAlign: 'center' }}>
        
        {/* ICON */}
        <div style={{ fontSize: '4rem', marginBottom: '10px' }}>
            {isSponsor ? '🏢' : '🛡️'}
        </div>
        
        <h2 style={{ color: '#1e293b', margin: '0 0 10px 0' }}>{title}</h2>

        {isLocked ? (
            <div style={{ background: '#f1f5f9', border: '2px solid #cbd5e1', padding: '25px', borderRadius: '15px' }}>
                <div style={{fontSize:'3rem', marginBottom:'10px'}}>🔒</div>
                <h3 style={{ margin: '0 0 10px 0', color: '#334155' }}>Submission Locked</h3>
                <p style={{ fontSize: '0.9rem', color:'#64748b', marginBottom:'20px' }}>Document submitted. Waiting for Admin approval.</p>
                <a href={userData.verificationDoc} target="_blank" rel="noreferrer" style={{color:'#2563eb', fontWeight:'bold', display:'block', marginBottom:'15px'}}>📄 View Uploaded Document</a>
                <button onClick={() => navigate('/')} style={{padding:'10px 20px', background:'#334155', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>Go Home</button>
            </div>
        ) : (
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    {instruction}
                </p>
                
                {/* UPLOAD BOX */}
                <div style={{ border: '2px dashed #cbd5e1', padding: '30px', borderRadius: '15px', background: '#f8fafc', position:'relative', cursor: 'pointer' }}>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.target.files[0])} required style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer' }} />
                    <div style={{fontSize:'2rem', color:'#94a3b8', marginBottom:'10px'}}>📂</div>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#334155' }}>
                        {file ? file.name : "Click to Upload Document"}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>
                        {label}
                    </p>
                </div>
                
                <button type="submit" disabled={uploading} style={{ padding: '15px', background: uploading ? '#94a3b8' : '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: '0.3s' }}>
                    {uploading ? 'Uploading...' : 'Submit Document'}
                </button>
            </form>
        )}
      </div>
    </div>
  );
};
export default Verify;