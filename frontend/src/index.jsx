import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

// Register service worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js');
    });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <>
        <App />
    </>
);