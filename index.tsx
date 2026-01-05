
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Registrar Service Worker para suporte Offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' })
      .then(reg => {
        console.log('Service Worker registrado com sucesso!', reg.scope);
        
        // Verificar atualizações
        reg.onupdatefound = () => {
          const installingWorker = reg.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('Nova versão disponível, recarregue a página.');
              }
            };
          }
        };
      })
      .catch(err => console.error('Falha ao registrar SW:', err));
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
