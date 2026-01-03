import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'; // 👈 1. Import Axios

// 👇 2. YE LINE ADD KAR (Tera Render URL yahan daal)
axios.defaults.baseURL = 'https://campus-sponser-api.onrender.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)