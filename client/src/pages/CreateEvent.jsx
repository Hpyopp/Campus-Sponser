import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast'; // Toast use kar raha hu taki error dikhe

const CreateEvent = () => {
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', budget: '', contactEmail: '', instagramLink: '' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false); // 👈 AI Loading State
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  // Smart URL Logic
  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  useEffect(() => {
    if (!user) return navigate('/login');
    if (user.role !== 'student') { alert("Only Students can create events."); navigate('/'); } 
    if (!user.isVerified) { alert("Account Not Verified!"); navigate('/verify'); }
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFile(e.target.files[0]);

  // 👇 AI GENERATE FUNCTION
  const handleAIGenerate = async () => {
    if (!formData.title || !formData.location) {
        return alert("Please enter 'Event Title' & 'Location' first!");
    }
    
    setAiLoading(true);
    toast("AI is writing... 🤖");

    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.post(`${ENDPOINT}/api/ai/generate`, {
            title: formData.title,
            description: formData.description || "College Event",
            location: formData.location,
            budget: formData.budget
        }, config);

        setFormData(prev => ({ ...prev, description: data.proposal })); 
        toast.success("Proposal Generated!");
    } catch (error) {
        console.error(error);
        alert("AI Failed. Check if Node Version is 20 in Render Settings.");
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
        
        {/* 👇 AI SECTION ADDED HERE */}
        <div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px'}}>
                <label style={{fontWeight:'bold', fontSize:'0.9rem'}}>Description</label>
                <button type="button" onClick={handleAIGenerate} disabled={aiLoading} 
                    style={{
                        background: aiLoading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #a855f7)', 
                        color: 'white', border: 'none', padding: '5px 15px', 
                        borderRadius: '20px', fontSize: '0.8rem', cursor: aiLoading ? 'not-allowed' : 'pointer', 
                        fontWeight:'bold'
                    }}>
                    {aiLoading ? 'Writing...' : '✨ Write with AI'}
                </button>
            </div>
            <textarea name="description" placeholder="Description (AI can write this for you!)" value={formData.description} onChange={handleChange} required style={{padding:'10px', width:'100%', minHeight:'120px', borderRadius:'5px', border:'1px solid #ccc'}} />
        </div>

        <input name="date" type="date" value={formData.date} onChange={handleChange} required style={{padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
        <input name="location" placeholder="Location" value={formData.location} onChange={handleChange} required style={{padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
        <input name="budget" type="number" placeholder="Budget Needed (₹)" value={formData.budget} onChange={handleChange} required style={{padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
        <input name="contactEmail" type="email" placeholder="Contact Email" value={formData.contactEmail} onChange={handleChange} required style={{padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
        <input name="instagramLink" placeholder="Instagram Link" value={formData.instagramLink} onChange={handleChange} style={{padding:'10px', borderRadius:'5px', border:'1px solid #ccc'}} />
        
        <div style={{padding:'15px', background:'#f0f9ff', border:'1px dashed blue', borderRadius:'5px'}}>
            <label>Upload Permission Letter:</label><br/>
            <input type="file" onChange={handleFileChange} required style={{marginTop:'10px'}} />
        </div>

        <button type="submit" disabled={loading} style={{padding:'15px', background:'blue', color:'white', border:'none', cursor:'pointer', borderRadius:'5px', fontWeight:'bold'}}>
            {loading ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </form>
    </div>
  );
};
export default CreateEvent;