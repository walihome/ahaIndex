import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import App from './App.tsx';
import Archive from './pages/Archive.tsx';
import History from './pages/History.tsx';
import './index.css';

function AppOrArchive() {
  const { dateOrMonth } = useParams<{ dateOrMonth: string }>();
  if (dateOrMonth && dateOrMonth.length === 7) {
    // YYYY-MM
    return <Archive />;
  }
  // YYYY-MM-DD or other
  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/daily" element={<Archive />} />
        <Route path="/daily/:dateOrMonth" element={<AppOrArchive />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
