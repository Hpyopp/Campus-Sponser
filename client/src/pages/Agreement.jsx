import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const Agreement = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 1. Signature Font Import
  useEffect(() => {
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

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
      
      {/* --- A4 PAPER START --- */}
      <div className="print-area" style={{ 
          padding: '60px', fontFamily: '"Times New Roman", Times, serif', 
          maxWidth: '800px', margin: '0 auto', background: '#fff', 
          boxShadow: '0 0 20px rgba(0,0,0,0.3)', color: '#000', minHeight: '1000px'
      }}>
        
        {/* LOGO (Document ke andar) */}
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                🚀 CampuSponsor
            </span>
        </div>

        {/* TITLE */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '2.2rem', margin: '0', textDecoration:'underline' }}>Sponsorship Agreement</h1>
          <p style={{ fontStyle: 'italic', color: '#444', marginTop: '5px', fontSize:'1.1rem' }}>Memorandum of Understanding (MoU)</p>
        </div>

        {/* CONTENT */}
        <div style={{ lineHeight: '1.8', fontSize: '1.1rem', textAlign: 'justify' }}>
          <p>
            This Agreement is made on <strong>{new Date(event.sponsoredAt || Date.now()).toLocaleDateString()}</strong>, by and between:
          </p>

          {/* PARTIES BOX */}
          <div style={{ background: '#f8fafc', padding: '25px', border: '1px solid #94a3b8', margin: '20px 0' }}>
            <div style={{marginBottom: '15px'}}>
                <strong style={{textDecoration:'underline'}}>THE SPONSOR:</strong><br/> 
                <span style={{fontSize: '1.3rem', textTransform: 'uppercase', fontWeight:'bold'}}>{sponsorName}</span><br/>
                <span style={{color: '#334155'}}>({sponsorEmail})</span>
            </div>
            
            <div style={{marginTop: '15px'}}>
                <strong style={{textDecoration:'underline'}}>THE ORGANIZER:</strong><br/> 
                <span style={{fontSize: '1.3rem', fontWeight:'bold'}}>{event.user?.collegeName || "Campus Event Committee"}</span><br/>
                <span style={{color: '#334155'}}>(Student Rep: {event.user?.name} - {event.user?.email})</span>
            </div>
          </div>

          <p>
            WHEREAS, the Organizer is hosting an event titled <strong>"{event.title}"</strong> scheduled for <strong>{new Date(event.date).toLocaleDateString()}</strong> at <strong>{event.location}</strong>.
          </p>
          <p>WHEREAS, the Sponsor desires to sponsor the Event by providing financial support.</p>

          {/* AMOUNT */}
          <div style={{ textAlign: 'center', margin: '30px 0', padding: '20px', border: '3px solid #000', display: 'block' }}>
            <span style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Total Sponsorship Amount</span><br/>
            <strong style={{ fontSize: '3rem', color: '#000', lineHeight:'1.2' }}>₹ {event.budget}</strong>
          </div>

          <p><strong>TERMS & CONDITIONS:</strong></p>
          <ol style={{ marginLeft: '20px' }}>
            <li>The Sponsor agrees to pay the full amount within 3 business days of signing this agreement.</li>
            <li>The Organizer agrees to display the Sponsor's logo/branding on all event banners and social media.</li>
            <li>This document serves as a binding proof of the sponsorship arrangement.</li>
          </ol>
        </div>

        {/* --- SIGNATURE SECTION (Solid Layout) --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '80px', alignItems: 'flex-end' }}>
          
          {/* SPONSOR SIDE */}
          <div style={{ width: '45%', textAlign: 'center' }}>
            {/* Fake Signature (Solid Block) */}
            <div style={{ 
                fontFamily: '"Dancing Script", cursive', fontSize: '2.5rem', color: '#1e3a8a', 
                height: '60px', marginBottom: '10px', transform: 'rotate(-5deg)'
            }}>
                {sponsorName}
            </div>
            <div style={{ borderBottom: '2px solid #000', marginBottom: '10px' }}></div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Authorized Signatory</p>
            <p style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase' }}>For {sponsorName}</p>
          </div>

          {/* ORGANIZER SIDE */}
          <div style={{ width: '45%', textAlign: 'center' }}>
             {/* Verified Stamp (Solid Block) */}
             <div style={{ 
                border: '4px solid #16a34a', color: '#16a34a', borderRadius: '50%', 
                width: '100px', height: '100px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', 
                margin: '0 auto 10px auto', transform: 'rotate(-10deg)',
                background: 'transparent', boxShadow: 'inset 0 0 10px rgba(22, 163, 74, 0.2)'
             }}>
                VERIFIED<br/>SPONSOR<br/>DEAL
             </div>

            <div style={{ borderBottom: '2px solid #000', marginBottom: '10px' }}></div>
            <p style={{ margin: 0, fontWeight: 'bold' }}>Event Coordinator</p>
            <p style={{ margin: 0, fontSize: '0.8rem', textTransform: 'uppercase' }}>CampusSponsor Verified</p>
          </div>
        </div>

      </div>
      {/* --- A4 PAPER END --- */}


      {/* BUTTONS (Screen Only) */}
      <div className="no-print" style={{ marginTop: '40px', textAlign: 'center', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <button onClick={() => window.print()} style={{ padding: '12px 25px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>🖨️ Print / Save PDF</button>
        <button onClick={() => window.location.href = '/'} style={{ padding: '12px 25px', background: 'transparent', border: '2px solid #fff', color:'white', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>Go Back Home</button>
      </div>

      {/* --- PRINT HACK STYLES --- */}
      <style>{`
        @media print {
            /* 1. Hide EVERYTHING else */
            body * {
                visibility: hidden;
            }
            /* 2. Show Only the Paper */
            .print-area, .print-area * {
                visibility: visible;
            }
            /* 3. Position the Paper at Top-Left */
            .print-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0 !important;
                padding: 40px !important;
                box-shadow: none !important;
                border: none !important;
            }
            /* 4. Force Colors (Stamp & Sign) */
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            /* 5. Hide Buttons */
            .no-print {
                display: none !important;
            }
        }
      `}</style>

    </div>
  );
};
export default Agreement;