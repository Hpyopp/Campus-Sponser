import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/api/events/${id}`);
        setEvent(res.data);
      } catch (error) { console.error("Error:", error); }
    };
    fetchEvent();
  }, [id]);

  // 👇 SMART LINK FIXER: Ye function link ko sahi karega
  const getInstaUrl = (link) => {
    if (!link) return "#";
    // Agar link me http pehle se hai, toh wahi use karo
    if (link.startsWith("http")) return link;
    // Agar www se shuru hai, toh https jodo
    if (link.startsWith("www.")) return `https://${link}`;
    // Agar sirf username hai, toh instagram.com jodo
    return `https://instagram.com/${link.replace('@', '')}`;
  };

  const handleSponsor = async () => {
    if(!window.confirm("Confirm Sponsorship? Deal will be locked. 🔒")) return;
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.put(`/api/events/sponsor/${id}`, {}, config);
        navigate(`/agreement/${id}`); 
    } catch (error) { alert("Sponsorship Failed"); }
  };

  if (!event) return <div style={{textAlign:'center', padding:'50px'}}>Loading Details...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '30px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontFamily: 'Poppins' }}>
      
      {/* HEADER */}
      <div style={{borderBottom:'2px solid #f1f5f9', paddingBottom:'20px', marginBottom:'20px'}}>
        <h1 style={{fontSize:'2.5rem', color:'#1e293b', margin:0}}>{event.title}</h1>
        <div style={{display:'flex', justifyContent:'space-between', marginTop:'10px', color:'#64748b'}}>
            <span>📍 {event.location}</span>
            <span>📅 {new Date(event.date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* ORGANIZER INFO */}
      <div style={{background:'#f8fafc', padding:'15px', borderRadius:'10px', marginBottom:'30px', border:'1px solid #e2e8f0'}}>
        <h4 style={{margin:'0 0 10px 0', color:'#475569'}}>🎓 Organized By:</h4>
        <p style={{margin:0, fontWeight:'bold', fontSize:'1.1rem'}}>{event.user?.collegeName || "Unknown College"}</p>
        <p style={{margin:'5px 0 0 0', fontSize:'0.9rem'}}>Student Rep: {event.user?.name}</p>
      </div>

      {/* DETAILS */}
      <h3 style={{color:'#334155'}}>📝 Description</h3>
      <p style={{lineHeight:'1.8', color:'#4b5563', fontSize:'1.05rem', marginBottom:'30px'}}>{event.description}</p>

      {/* CONTACT & BUDGET */}
      <div style={{display:'flex', gap:'20px', flexWrap:'wrap', marginBottom:'40px'}}>
        <div style={{flex:1, background:'#eff6ff', padding:'20px', borderRadius:'15px', textAlign:'center'}}>
            <span style={{display:'block', fontSize:'0.9rem', color:'#1e40af'}}>Sponsorship Needed</span>
            <strong style={{fontSize:'1.8rem', color:'#1e3a8a'}}>₹ {event.budget}</strong>
        </div>
        <div style={{flex:1, background:'#fdf4ff', padding:'20px', borderRadius:'15px', textAlign:'center'}}>
             <span style={{display:'block', fontSize:'0.9rem', color:'#86198f'}}>Contact Info</span>
             
             {event.contactEmail ? (
                <a href={`mailto:${event.contactEmail}`} style={{display:'block', fontWeight:'bold', color:'#c026d3', textDecoration:'none', wordBreak:'break-all'}}>{event.contactEmail}</a>
             ) : (
                <span style={{color:'#aaa', fontStyle:'italic'}}>Email not provided</span>
             )}

             {event.instagramLink && (
                // 👇 YAHAN HUMNE FIX FUNCTION USE KIYA HAI
                <a 
                    href={getInstaUrl(event.instagramLink)} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{fontSize:'0.9rem', color:'#c026d3', textDecoration:'underline', marginTop:'8px', display:'inline-block'}}
                >
                    📸 Instagram Profile
                </a>
             )}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div style={{borderTop:'1px solid #eee', paddingTop:'20px'}}>
        {event.isSponsored ? (
           <div style={{padding:'20px', background:'#dcfce7', color:'#166534', textAlign:'center', borderRadius:'15px', fontWeight:'bold', fontSize:'1.2rem'}}>
              ✅ EVENT ALREADY FUNDED
           </div>
        ) : (
           user && user.role === 'sponsor' ? (
              <button onClick={handleSponsor} style={{width:'100%', padding:'18px', background:'#0f172a', color:'white', border:'none', borderRadius:'15px', fontSize:'1.2rem', fontWeight:'bold', cursor:'pointer', boxShadow:'0 10px 20px rgba(15, 23, 42, 0.2)'}}>
                  🤝 Sponsor This Event Now
              </button>
           ) : (
              <div style={{textAlign:'center', padding:'15px', background:'#f8fafc', borderRadius:'10px', color:'#64748b', border:'1px dashed #cbd5e1'}}>
                  {user && user.role === 'student' ? (
                      <span>🚀 <strong>Your Event is Live!</strong> Waiting for Sponsors.</span>
                  ) : (
                      <span>Login as a <strong>Sponsor</strong> to fund this event.</span>
                  )}
              </div>
           )
        )}
      </div>

      <button onClick={() => navigate('/')} style={{display:'block', margin:'20px auto 0', background:'none', border:'none', textDecoration:'underline', cursor:'pointer', color:'#64748b'}}>Back to Home</button>
    </div>
  );
};
export default EventDetails;