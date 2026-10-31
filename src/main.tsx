import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('PWA Service Worker registrado con éxito:', reg.scope);
      })
      .catch((err) => {
        console.error('Error registrando Service Worker:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
