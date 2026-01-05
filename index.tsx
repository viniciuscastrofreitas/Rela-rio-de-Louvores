
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Registrar Service Worker para suporte Offline robusto
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        console.log('Service Worker ativo:', reg.scope);
        
        // Forçar controle imediato da página pelo SW
        if (reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Notificar usuário sobre atualização (opcional)
                console.log('App atualizado. Por favor, recarregue.');
              }
            };
          }
        };
      })
      .catch(err => console.error('Erro ao registrar Service Worker:', err));
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
