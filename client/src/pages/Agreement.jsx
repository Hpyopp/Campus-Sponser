import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const Agreement = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const link = document.createElement('link'); link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap"; link.rel = "stylesheet"; document.head.appendChild(link);
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(storedUser);
    if (!storedUser) { navigate('/login'); return; }

    const fetchEvent = async () => {
      try { const res = await axios.get(`/api/events/${id}`); setEvent(res.data); } 
      catch (error) { alert("Error loading receipt."); }
    };
    fetchEvent();
  }, [id, navigate]);

  if (!event || !currentUser) return null;

  // ADMIN VIEW LOGIC
  const queryParams = new URLSearchParams(location.search);
  const paramSponsorId = queryParams.get('sponsorId');
  const targetSponsorId = (currentUser.role === 'admin' && paramSponsorId) ? paramSponsorId : currentUser._id;
  const mySponsorship = event.sponsors?.find(s => s.sponsorId === targetSponsorId);

  if (!mySponsorship) return <div style={{textAlign:'center', padding:'50px'}}><h2>❌ Proof Not Found</h2><button onClick={() => navigate(-1)}>Go Back</button></div>;

  return (
    <div style={{ background: '#525659', minHeight: '100vh', padding: '40px 0' }}>
      {currentUser.role === 'admin' && <div className="no-print" style={{textAlign:'center', color:'white', marginBottom:'10px'}}>Admin View Mode</div>}
      
      <div className="print-area" style={{ padding: '50px 60px', maxWidth: '800px', margin: '0 auto', background: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.3)', minHeight: '900px' }}>
        <h1 style={{ textAlign: 'center' }}>Sponsorship Receipt</h1>
        <div style={{textAlign:'center', margin:'20px 0', padding:'20px', border:'2px solid black'}}>
            <h2>₹ {mySponsorship.amount}</h2>
            <p>Paid by: {mySponsorship.name}</p>
            <p>To: {event.user?.collegeName || "Event Committee"}</p>
        </div>
        <p style={{textAlign:'center', fontStyle:'italic'}}>Verified by CampuSponsor System</p>
      </div>

      <div className="no-print" style={{ marginTop: '30px', textAlign: 'center' }}>
        <button onClick={() => window.print()} style={{ padding: '10px 20px', marginRight:'10px' }}>🖨️ Print</button>
        <button onClick={() => navigate(-1)} style={{ padding: '10px 20px' }}>Go Back</button>
      </div>
      <style>{`@media print { body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; left: 0; top: 0; width: 100%; } .no-print { display: none; } }`}</style>
    </div>
  );
};
export default Agreement;