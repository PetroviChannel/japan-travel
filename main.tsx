import React from 'react';
import { createRoot } from 'react-dom/client';
import Planner from './app/planner';
import './app/globals.css';
createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Planner />
  </React.StrictMode>,
);
