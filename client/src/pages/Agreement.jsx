import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const Agreement = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get('/api/events');
        const foundEvent = res.data.find(e => e._id === id);
        if (foundEvent) setEvent(foundEvent);
        else { alert("Event not found!"); navigate('/'); }
      } catch (error) { console.error(error); }
    };
    fetchEvent();
  }, [id, navigate]);

  if (!event) return <div style={{textAlign:'center', padding:'50px'}}>Loading Agreement...</div>;

  return (
    <div style={{ background: '#525659', minHeight: '100vh', padding: '40px 0' }}>
      <div style={{ padding: '60px', fontFamily: 'Times New Roman', maxWidth: '800px', margin: '0 auto', background: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.3)' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', borderBottom: '3px double #000', paddingBottom: '20px', marginBottom: '40px' }}>
          <h1 style={{ textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>Sponsorship Agreement</h1>
          <p style={{ fontStyle: 'italic', color: '#444', marginTop: '10px' }}>Official Memorandum of Understanding</p>
        </div>

        {/* PARTIES */}
        <div style={{ background: '#f8fafc', padding: '20px', border: '1px solid #ddd', margin: '20px 0' }}>
            {/* SPONSOR DETAILS */}
            <div style={{marginBottom:'15px'}}>
                <strong style={{textTransform:'uppercase', color:'#475569'}}>The Sponsor:</strong><br/>
                <span style={{fontSize:'1.2rem', fontWeight:'bold'}}>{event.sponsorName}</span><br/>
                <span style={{color:'blue', textDecoration:'underline'}}>{event.sponsorEmail}</span> 
            </div>
            
            <hr style={{borderTop:'1px dashed #ccc'}}/>

            {/* ORGANIZER (STUDENT) DETAILS */}
            <div style={{marginTop:'15px'}}>
                <strong style={{textTransform:'uppercase', color:'#475569'}}>The Organizer:</strong><br/>
                <span style={{fontSize:'1.2rem', fontWeight:'bold'}}>Student Representative</span><br/>
                <span style={{color:'blue', textDecoration:'underline'}}>
                    {/* 👇 Yahan Student ka Email aayega */}
                    {event.user?.email || "student@college.edu"}
                </span>
            </div>
        </div>

        {/* EVENT DETAILS */}
        <p style={{ lineHeight: '1.6', fontSize: '1.1rem', textAlign: 'justify' }}>
          This agreement confirms that <strong>{event.sponsorName}</strong> has agreed to sponsor the event <strong>"{event.title}"</strong> organized by the student committee. The total sponsorship amount of <strong>₹{event.budget}</strong> will be transferred to the organizer.
        </p>

        {/* SIGNATURES - EMAILS VISIBLE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '80px', paddingTop: '20px' }}>
          
          <div style={{ width: '45%' }}>
            <div style={{ borderBottom: '2px solid #000', marginBottom: '10px', height: '40px' }}></div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Authorized Signatory</p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{event.sponsorEmail}</p> {/* Sponsor Email */}
          </div>

          <div style={{ width: '45%' }}>
            <div style={{ borderBottom: '2px solid #000', marginBottom: '10px', height: '40px' }}></div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Organizer (Student)</p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{event.user?.email}</p> {/* Student Email */}
          </div>

        </div>

        {/* PRINT BUTTON */}
        <div className="no-print" style={{ marginTop: '60px', textAlign: 'center' }}>
          <button onClick={() => window.print()} style={{ padding: '12px 25px', background: '#0f172a', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor:'pointer' }}>
            🖨️ Print / Save PDF
          </button>
        </div>

        <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>
      </div>
    </div>
  );
};

export default Agreement;