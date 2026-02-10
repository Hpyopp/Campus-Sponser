import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Update States
  const [updateMsg, setUpdateMsg] = useState('');
  const [updateFile, setUpdateFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`${ENDPOINT}/api/events/${id}`);
        setEvent(data);
      } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  // Handle Payment (Razorpay)
  const handlePayment = async () => {
    if (!user) return alert("Please Login to Sponsor!");
    if (!amount || amount <= 0) return alert("Enter valid amount");
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data: order } = await axios.post(`${ENDPOINT}/api/events/${id}/sponsor`, { amount }, config);

      const options = {
        key: "rzp_live_S0JHqtE8YaMmBs", // ⚠️ Put your Key here
        amount: order.amount,
        currency: "INR",
        name: "Campus Sponsor",
        description: `Sponsoring ${event.title}`,
        order_id: order.id,
        handler: async function (response) {
            try {
                const verifyRes = await axios.put(`${ENDPOINT}/api/events/verify-payment`, {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        amount: amount,
                        eventId: id
                    }, config);
                if(verifyRes.data.success) {
                    alert("🎉 Payment Successful!");
                    fetchEvent(); // Refresh Data
                }
            } catch (error) { alert("Verification Failed!"); }
        },
        theme: { color: "#2563eb" },
      };
      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) { alert("Payment Failed"); } 
    finally { setLoading(false); }
  };

  // Handle Post Update
  const handlePostUpdate = async (e) => {
      e.preventDefault();
      if(!updateMsg) return alert("Write something!");
      
      setUploading(true);
      const formData = new FormData();
      formData.append('message', updateMsg);
      if(updateFile) formData.append('updateImage', updateFile);

      try {
          const config = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` } };
          await axios.post(`${ENDPOINT}/api/events/${id}/updates`, formData, config);
          alert("Update Posted! 🚀");
          setUpdateMsg('');
          setUpdateFile(null);
          fetchEvent();
      } catch (error) {
          alert("Failed to post update");
      } finally {
          setUploading(false);
      }
  };

  if (!event) return <div style={{textAlign:'center', marginTop:'50px'}}>Loading...</div>;

  const isOwner = user && user._id === event.user?._id;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Poppins' }}>
      
      {/* Header Image */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ height: '350px', borderRadius: '20px', overflow: 'hidden', marginBottom: '30px', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right, #4f46e5, #06b6d4)' }}></div>
        )}
        <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'white', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem', color: '#2563eb' }}>
            {event.category || 'Event'}
        </div>
      </motion.div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        
        {/* LEFT: Details & Timeline */}
        <div style={{ flex: 2, minWidth:'300px' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1e293b', lineHeight: '1.2' }}>{event.title}</h1>
            <div style={{ display: 'flex', gap: '20px', color: '#64748b', margin: '15px 0 25px', fontSize: '1rem' }}>
                <span>📅 {new Date(event.date).toDateString()}</span>
                <span>📍 {event.location}</span>
                <span>👀 {event.views} Views</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '15px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '10px', color: '#334155' }}>About Event</h3>
                <p style={{ lineHeight: '1.8', color: '#475569' }}>{event.description}</p>
            </div>

            {/* 🔥 LIVE UPDATES TIMELINE */}
            <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    🔴 Live Updates <span style={{fontSize:'0.8rem', background:'#fee2e2', color:'#ef4444', padding:'3px 8px', borderRadius:'5px'}}>LIVE</span>
                </h2>

                {/* Create Update Box (Only for Owner) */}
                {isOwner && (
                    <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '15px', marginBottom: '30px', border: '1px dashed #3b82f6' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1d4ed8' }}>📢 Post an Update for Sponsors</h4>
                        <textarea 
                            rows="3" 
                            placeholder="What's happening? (e.g. Stage setup started...)" 
                            value={updateMsg}
                            onChange={(e)=>setUpdateMsg(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #bfdbfe', marginBottom: '10px' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <input type="file" onChange={(e)=>setUpdateFile(e.target.files[0])} accept="image/*" />
                            <button onClick={handlePostUpdate} disabled={uploading} style={{ padding: '8px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', opacity: uploading ? 0.7 : 1 }}>
                                {uploading ? 'Posting...' : 'Post Update'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Updates List */}
                {event.updates && event.updates.length > 0 ? (
                    <div style={{ borderLeft: '3px solid #e2e8f0', paddingLeft: '30px', position: 'relative' }}>
                        {event.updates.map((update, index) => (
                            <div key={index} style={{ marginBottom: '40px', position: 'relative' }}>
                                {/* Timeline Dot */}
                                <div style={{ position: 'absolute', left: '-38px', top: '0', width: '16px', height: '16px', background: '#3b82f6', borderRadius: '50%', border: '4px solid white', boxShadow: '0 0 0 2px #e2e8f0' }}></div>
                                
                                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '5px' }}>
                                    {new Date(update.date).toLocaleString()}
                                </div>
                                <div style={{ background: 'white', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}>
                                    <p style={{ fontSize: '1.05rem', color: '#334155', marginBottom: update.image ? '10px' : '0' }}>
                                        {update.message}
                                    </p>
                                    {update.image && (
                                        <img src={update.image} alt="Update" style={{ width: '100%', borderRadius: '10px', maxHeight: '300px', objectFit: 'cover' }} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No updates yet. Stay tuned! 🕒</p>
                )}
            </div>
        </div>

        {/* RIGHT: Sponsor Box */}
        <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', position: 'sticky', top: '100px' }}>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Become a Sponsor</h3>
                <div style={{ marginBottom: '20px', color: '#64748b' }}>
                    Target: <span style={{ fontWeight: 'bold', color: '#0f172a' }}>₹{event.budget}</span> <br/>
                    Raised: <span style={{ fontWeight: 'bold', color: '#059669' }}>₹{event.raisedAmount || 0}</span>
                </div>

                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', marginBottom: '25px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(((event.raisedAmount || 0) / event.budget) * 100, 100)}%`, height: '100%', background: '#2563eb' }}></div>
                </div>

                {isOwner ? (
                    <div style={{ textAlign: 'center', padding: '15px', background: '#f0f9ff', borderRadius: '10px', color: '#0369a1', fontWeight: 'bold' }}>
                        👋 You are the Organizer
                    </div>
                ) : (
                    <>
                        <input type="number" placeholder="Enter Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '15px' }} />
                        <button onClick={handlePayment} disabled={loading} style={{ width: '100%', padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>
                            {loading ? 'Processing...' : 'Sponsor Now 🚀'}
                        </button>
                    </>
                )}

                {/* Sponsor List */}
                <div style={{ marginTop: '30px' }}>
                    <h4 style={{ fontSize: '1rem', color: '#64748b', marginBottom: '15px' }}>Recent Sponsors</h4>
                    {event.sponsors && event.sponsors.filter(s=>s.status==='verified').length > 0 ? (
                        event.sponsors.filter(s=>s.status==='verified').map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ width: '35px', height: '35px', background: '#e0e7ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3730a3', fontWeight: 'bold' }}>{s.name[0]}</div>
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{s.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#16a34a' }}>₹{s.amount} contributed</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Be the first to sponsor! 🏆</p>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default EventDetails;