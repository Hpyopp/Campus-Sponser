import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ background: '#0f172a', color: 'white', paddingTop: '60px', paddingBottom:'20px', fontFamily: 'Poppins', marginTop:'auto' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
        
        {/* 1. BRAND INFO */}
        <div>
          <h2 style={{ margin: 0, fontSize: '1.8rem', display:'flex', alignItems:'center', gap:'10px', fontWeight:'800' }}>
              <span>🚀</span> CampusSponsor
          </h2>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', marginTop:'15px', fontSize:'0.95rem' }}>
            Bridging the gap between ambitious student organizers and visionary corporate sponsors. Secure, Transparent, and Fast.
          </p>
        </div>

        {/* 2. QUICK LINKS */}
        <div>
          <h3 style={{ color: '#f8fafc', borderBottom:'3px solid #3b82f6', display:'inline-block', paddingBottom:'5px', marginBottom:'20px' }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color:'#cbd5e1', fontSize:'0.95rem' }}>
            <li style={{marginBottom:'12px'}}><Link to="/" style={{color:'inherit', textDecoration:'none', transition:'0.2s'}}>Home</Link></li>
            <li style={{marginBottom:'12px'}}><Link to="/register" style={{color:'inherit', textDecoration:'none', transition:'0.2s'}}>Join as Student</Link></li>
            <li style={{marginBottom:'12px'}}><Link to="/register" style={{color:'inherit', textDecoration:'none', transition:'0.2s'}}>Join as Sponsor</Link></li>
            <li style={{marginBottom:'12px'}}><Link to="/login" style={{color:'inherit', textDecoration:'none', transition:'0.2s'}}>Login / Sign Up</Link></li>
          </ul>
        </div>

        {/* 3. CONTACT INFO */}
        <div>
          <h3 style={{ color: '#f8fafc', borderBottom:'3px solid #3b82f6', display:'inline-block', paddingBottom:'5px', marginBottom:'20px' }}>Contact Us</h3>
          <div style={{ color: '#cbd5e1', fontSize:'0.95rem', display:'flex', flexDirection:'column', gap:'12px' }}>
            <div>📍 Ulhasnagar, Maharashtra, India</div>
            <div>📧 support@campussponsor.com</div>
            <div>📞 +91 98765 43210</div>
          </div>
        </div>

      </div>

      <div style={{ textAlign: 'center', marginTop: '50px', borderTop: '1px solid #1e293b', paddingTop: '25px', color: '#64748b', fontSize: '0.85rem' }}>
        &copy; {new Date().getFullYear()} CampusSponsor Inc. All rights reserved. <br/> Built with ❤️ for Shark Tank.
      </div>
    </footer>
  );
};

export default Footer;