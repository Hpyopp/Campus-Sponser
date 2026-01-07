import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Assuming you use react-hot-toast, or replace with alert if preferred

const CreateEvent = () => {
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    date: '', 
    location: '', 
    budget: '', 
    contactEmail: '', 
    instagramLink: '' 
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false); // 👈 AI Loader
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Smart Endpoint (Add this if not globally configured)
  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  useEffect(() => {
    // 1. Check if user is logged in
    if (!user) return navigate('/login');

    // 2. Check Role (Only Students)
    if (user.role !== 'student') {
        alert("Only Students can create events.");
        navigate('/');
        return;
    } 
    
    // 3. Check Verification (KYC)
    if (!user.isVerified) {
        alert("⛔ Account Not Verified!\nPlease upload your ID proof and wait for Admin approval.");
        navigate('/verify'); // Redirect to KYC upload
    }
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  // 👇 AI GENERATE FUNCTION
  const handleAIGenerate = async () => {
    if (!formData.title || !formData.location) {
        return alert("Please enter Event Title & Location first for AI to understand context!");
    }
    
    setAiLoading(true);
    // Use toast or alert to notify user
    // toast("AI is writing your proposal... 🤖", { icon: '✍️' }); 

    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Use full URL or proxy path
        const { data } = await axios.post(`${ENDPOINT}/api/ai/generate`, {
            title: formData.title,
            description: formData.description || "A college tech fest", // Fallback if empty
            location: formData.location,
            budget: formData.budget
        }, config);

        setFormData({ ...formData, description: data.proposal }); // ✨ Auto Fill
        alert("Proposal Generated Successfully!");
    } catch (error) {
        console.error(error);
        alert("AI failed. Try again.");
    } finally {
        setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return alert("Upload Permission Letter!");
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      data.append('permissionLetter', file);

      const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
      // Use full URL or proxy path. Assuming your axios setup handles base URL or using full URL here
      await axios.post(`${ENDPOINT}/api/events`, data, config);
      alert("Event Submitted! Waiting for Admin Approval.");
      navigate('/');
    } catch (error) { 
      alert(error.response?.data?.message || "Error"); 
    } finally { setLoading(false); }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily:'Poppins' }}>
      <h2 style={{color:'#1e293b'}}>🚀 Create Event</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <input name="title" placeholder="Event Title" value={formData.title} onChange={handleChange} required style={{padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
        
        {/* Location & Budget Row */}
        <div style={{ display: 'flex', gap: '10px' }}>
            <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required style={{padding:'10px', flex:1, borderRadius:'5px', border:'1px solid #ccc'}} />
            <input name="budget" type="number" placeholder="Budget (₹)" value={formData.budget} onChange={handleChange} required style={{padding:'10px', flex:1, borderRadius:'5px', border:'1px solid #ccc'}} />
        </div>

        {/* AI SECTION */}
        <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px'}}>
                <label style={{fontWeight:'bold', fontSize:'0.9rem'}}>Description</label>
                <button type="button" onClick={handleAIGenerate} disabled={aiLoading} 
                    style={{
                        background: aiLoading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #a855f7)', 
                        color: 'white', border: 'none', padding: '5px 12px', 
                        borderRadius: '20px', fontSize: '0.8rem', cursor: aiLoading ? 'not-allowed' : 'pointer', 
                        fontWeight:'bold'
                    }}>
                    {aiLoading ? 'Writing...' : '✨ Write with AI'}
                </button>
            </div>
            <textarea name="description" placeholder="Description (AI can write this for you!)" value={formData.description} onChange={handleChange} required style={{padding:'10px', width:'100%', minHeight:'150px', borderRadius:'5px', border:'1px solid #ccc'}} />
        </div>

        <input name="date" type="date" value={formData.date} onChange={handleChange} required style={{padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
        <input name="contactEmail" type="email" placeholder="Contact Email" value={formData.contactEmail} onChange={handleChange} required style={{padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
        <input name="instagramLink" placeholder="Instagram Link" value={formData.instagramLink} onChange={handleChange} style={{padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
        
        <div style={{padding:'15px', background:'#f0f9ff', border:'1px dashed blue', borderRadius:'5px'}}>
            <label>Upload Permission Letter:</label><br/>
            <input type="file" onChange={handleFileChange} required style={{marginTop:'10px'}} />
        </div>

        <button type="submit" disabled={loading} style={{padding:'15px', background:'blue', color:'white', border:'none', cursor:'pointer', borderRadius:'5px', fontWeight:'bold', fontSize:'1rem'}}>
            {loading ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
};
export default CreateEvent;