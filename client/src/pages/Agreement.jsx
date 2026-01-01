import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const Agreement = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await axios.get('/api/events');
        const foundEvent = res.data.find(e => e._id === id);
        
        if (foundEvent) {
          setEvent(foundEvent);
        } else {
          alert("Event not found!");
          navigate('/');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  if (loading) return <div style={{textAlign:'center', padding:'50px', fontSize:'1.2rem'}}>Generating Legal Doc... ⚖️</div>;
  if (!event) return null;

  const sponsorName = event.sponsorName || "Authorized Sponsor";
  const sponsorEmail = event.sponsorEmail || "Email Not Provided";

  return (
    <div style={{ background: '#525659', minHeight: '100vh', padding: '40px 0' }}>
      <div style={{ 
          padding: '60px', fontFamily: '"Times New Roman", Times, serif', 
          maxWidth: '850px', margin: '0 auto', background: '#fff', 
          boxShadow: '0 0 20px rgba(0,0,0,0.3)', color: '#000' 
      }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', borderBottom: '3px double #000', paddingBottom: '20px', marginBottom: '40px' }}>
          <h1 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '2.5rem', margin: '0' }}>Sponsorship Agreement</h1>
          <p style={{ fontStyle: 'italic', color: '#444', marginTop: '10px' }}>Memorandum of Understanding (MoU)</p>
        </div>

        {/* BODY */}
        <div style={{ lineHeight: '1.8', fontSize: '1.15rem', textAlign: 'justify' }}>
          <p>
            This Agreement is made on <strong>{new Date(event.sponsoredAt || Date.now()).toLocaleDateString()}</strong>, by and between:
          </p>

          {/* PARTIES BOX */}
          <div style={{ background: '#f9f9f9', padding: '20px', border: '1px solid #ccc', margin: '20px 0' }}>
            <div style={{marginBottom: '10px'}}>
                <strong>THE SPONSOR:</strong><br/> 
                <span style={{fontSize: '1.2rem', textTransform: 'uppercase'}}>{sponsorName}</span><br/>
                <span style={{color: '#555', fontSize: '0.9rem'}}>({sponsorEmail})</span>
            </div>
            <hr style={{borderTop: '1px dashed #ccc'}}/>
            <div style={{marginTop: '10px'}}>
                <strong>THE ORGANIZER:</strong><br/> 
                {/* 👇 College Name Logic */}
                <span style={{fontSize: '1.2rem'}}>{event.user?.collegeName || "Campus Event Committee"}</span><br/>
                {/* 👇 Real Student Email Logic */}
                <span style={{color: '#555', fontSize: '0.9rem'}}>(Student Rep: {event.user?.name} - {event.user?.email})</span>
            </div>
          </div>

          <p>
            WHEREAS, the Organizer is hosting an event titled <strong>"{event.title}"</strong> scheduled for <strong>{new Date(event.date).toLocaleDateString()}</strong> at <strong>{event.location}</strong>.
          </p>

          <p>WHEREAS, the Sponsor desires to sponsor the Event by providing financial support.</p>

          {/* AMOUNT */}
          <div style={{ textAlign: 'center', margin: '30px 0', padding: '15px', border: '2px solid #000', display: 'inline-block', width: '100%' }}>
            <span style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Sponsorship Amount</span><br/>
            <strong style={{ fontSize: '2.5rem', color: '#000' }}>₹ {event.budget}</strong>
          </div>

          <p><strong>TERMS & CONDITIONS:</strong></p>
          <ol style={{ marginLeft: '20px' }}>
            <li>The Sponsor agrees to pay the full amount within 3 business days of signing this agreement.</li>
            <li>The Organizer agrees to display the Sponsor's logo/branding on all event banners and social media.</li>
          </ol>
        </div>

        {/* SIGNATURES SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '80px', paddingTop: '20px' }}>
          <div style={{ width: '45%' }}>
            <div style={{ borderBottom: '2px solid #000', marginBottom: '10px', height: '40px' }}></div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Authorized Signatory</p>
            <p style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>For {sponsorName}</p>
          </div>
          <div style={{ width: '45%' }}>
            <div style={{ borderBottom: '2px solid #000', marginBottom: '10px', height: '40px' }}></div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Event Coordinator</p>
            <p style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase' }}>CampusSponsor Verified</p>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="no-print" style={{ marginTop: '60px', textAlign: 'center', display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button onClick={() => window.print()} style={{ padding: '12px 25px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>🖨️ Print / Save PDF</button>
          
          {/* 👇 REFRESH FIX HERE: window.location.href */}
          <button onClick={() => window.location.href = '/'} style={{ padding: '12px 25px', background: 'transparent', border: '2px solid #0f172a', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>Go Back Home</button>
        </div>

        <style>{`@media print { .no-print { display: none !important; } body { background: white; } div { box-shadow: none !important; margin: 0 !important; width: 100% !important; } }`}</style>

      </div>
    </div>
  );
};
export default Agreement;