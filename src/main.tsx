import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getTodayDate } from './lib/date';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={`/daily/${getTodayDate()}`} replace />} />
        <Route path="/daily/:date" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
