import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { BracketProvider } from './context/BracketContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <BracketProvider>
        <App />
      </BracketProvider>
    </BrowserRouter>
  </React.StrictMode>
);
