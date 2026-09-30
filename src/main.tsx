// import ReactDOM from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import { App } from './App';
// import './index.css'; // Asegúrate de que el archivo CSS está importado

// const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
// root.render(
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>
// );
import React from 'react';
import ReactDOM from 'react-dom/client';
import './fonts';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { App } from './App';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);