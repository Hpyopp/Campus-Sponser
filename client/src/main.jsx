import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' // 👈 YE LINE SABSE ZAROORI HAI (Isse add kar!)
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)