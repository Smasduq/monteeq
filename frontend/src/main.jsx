import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Force-unregister potential legacy service workers to prevent stale caching/lag
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    for (let registration of regs) {
      registration.unregister();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
