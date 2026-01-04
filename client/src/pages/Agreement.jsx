import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

const Agreement = () => {
  const { id } = useParams(); // Event ID
  const [searchParams] = useSearchParams();
  const sponsorId = searchParams.get('sponsorId'); // Specific sponsor (for Admin/Organizer)
  
  const [event, setEvent] = useState(null);
  const [sponsor, setSponsor] = useState(null);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef(); // PDF area reference
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return navigate('/login');

        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`/api/events/${id}`, config);
        setEvent(data);

        // Logic: Kaunsa sponsor dikhana hai?
        let currentSponsor;
        if (sponsorId) {
            // Agar URL mein sponsorId hai (Admin/Organizer view)
            currentSponsor = data.sponsors.find(s => s.sponsorId === sponsorId);
        } else {
            // Agar khud Sponsor dekh raha hai
            currentSponsor = data.sponsors.find(s => s.sponsorId === user._id);
        }

        setSponsor(currentSponsor);
      } catch (error) {
        toast.error("Could not load agreement data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, sponsorId, navigate]);

  // 👇 PDF DOWNLOAD MAGIC
  const downloadPDF = async () => {
    const element = pdfRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Sponsorship_Agreement_${event?.title}.pdf`);
    toast.success("PDF Downloaded! 📄");
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Loading Agreement...</div>;
  if (!event || !sponsor) return <div style={{textAlign:'center', marginTop:'50px', color:'red'}}>Agreement Details Not Found</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#52525b', padding: '40px 0', fontFamily: 'Times New Roman' }}>
      
      {/* BUTTONS */}
      <div style={{ maxWidth: '800px', margin: '0 auto 20px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={() => navigate(-1)} style={{ padding: '10px 20px', background: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>⬅ Back</button>
          <button onClick={downloadPDF} style={{ padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.4)' }}>⬇ Download PDF</button>
      </div>

      {/* 👇 AGREEMENT PAPER (Iska PDF banega) */}
      <div ref={pdfRef} style={{ background: 'white', width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '25mm', boxShadow: '0 0 20px rgba(0,0,0,0.3)', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '24pt', margin: 0, textTransform: 'uppercase', letterSpacing: '2px' }}>Sponsorship Agreement</h1>
            <p style={{ margin: '5px 0 0', fontSize: '12pt' }}>Official Memorandum of Understanding</p>
        </div>

        {/* Content */}
        <div style={{ fontSize: '12pt', lineHeight: '1.6' }}>
            <p>This Agreement is entered into on <strong>{new Date(sponsor.date).toLocaleDateString()}</strong>, by and between:</p>
            
            <p style={{ margin: '20px 0' }}>
                <strong>1. THE ORGANIZER:</strong><br/>
                Name: {event.user.name}<br/>
                Event: {event.title}<br/>
                Location: {event.location}
            </p>

            <p style={{ margin: '20px 0' }}>
                <strong>2. THE SPONSOR:</strong><br/>
                Company: {sponsor.companyName}<br/>
                Representative: {sponsor.name}<br/>
                Email: {sponsor.email}
            </p>

            <h3 style={{ textDecoration: 'underline', marginTop: '30px' }}>TERMS & CONDITIONS:</h3>
            <ol style={{ paddingLeft: '20px' }}>
                <li>The Sponsor agrees to provide a sum of <strong>₹{sponsor.amount}</strong> to the Organizer.</li>
                <li>The Organizer agrees to use these funds strictly for the purpose of the event <strong>"{event.title}"</strong>.</li>
                <li>In return, the Organizer will provide branding/marketing exposure as discussed.</li>
                <li>Refund Policy: Refunds are subject to the approval of the Organizer and Admin platform policies.</li>
                <li>This agreement is binding and verified digitally by the CampusSponsor Platform.</li>
            </ol>
        </div>

        {/* Digital Stamp */}
        <div style={{ position: 'absolute', top: '40%', right: '10%', opacity: 0.1, transform: 'rotate(-20deg)', border: '5px solid #000', padding: '10px 30px', fontSize: '4rem', fontWeight: 'bold', color: 'red' }}>
            {sponsor.status === 'verified' ? 'PAID & VERIFIED' : 'DRAFT / PENDING'}
        </div>

        {/* Signatures */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '100px', paddingTop: '20px' }}>
            <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ fontFamily: 'Cursive', fontSize: '1.5rem', color: '#2563eb' }}>{sponsor.name}</div>
                <div style={{ borderTop: '1px solid #000', marginTop: '5px', paddingTop: '5px' }}>Signature of Sponsor</div>
            </div>

            <div style={{ textAlign: 'center', width: '200px' }}>
                <div style={{ fontFamily: 'Cursive', fontSize: '1.5rem', color: '#2563eb' }}>CampusSponsor Auth</div>
                <div style={{ borderTop: '1px solid #000', marginTop: '5px', paddingTop: '5px' }}>Platform Verification</div>
            </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '20mm', left: '0', width: '100%', textAlign: 'center', fontSize: '10pt', color: '#666' }}>
            Generated via CampusSponsor | Date: {new Date().toLocaleString()} | ID: {sponsor.sponsorId}
        </div>

      </div>
    </div>
  );
};

export default Agreement;