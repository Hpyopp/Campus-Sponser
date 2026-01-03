import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px', fontFamily: 'Poppins' }}>
      
      {/* 1. Fun Illustration/Emoji */}
      <div style={{ fontSize: '6rem', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>
        🛸
      </div>

      {/* 2. Message */}
      <h1 style={{ fontSize: '3rem', color: '#1e293b', margin: '0' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', color: '#475569', marginBottom: '10px' }}>Lost in Space?</h2>
      <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 30px auto' }}>
        The page you are looking for doesn't exist or has been moved. Let's get you back on track.
      </p>

      {/* 3. Back Button */}
      <button 
        onClick={() => navigate('/')} 
        style={{ padding: '12px 30px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)', transition: 'transform 0.2s' }}
        onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
      >
        🚀 Go Back Home
      </button>

      {/* Animation Style */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default NotFound;