import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.tsx';
import Archive from './pages/Archive.tsx';
import History from './pages/History.tsx';
import { About } from './pages/About.tsx';
import { Contact } from './pages/Contact.tsx';
import { Privacy } from './pages/Privacy.tsx';
import { Terms } from './pages/Terms.tsx';
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
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/daily" element={<Archive />} />
          <Route path="/daily/:dateOrMonth" element={<AppOrArchive />} />
          <Route path="/daily/:dateOrMonth/article/:itemId" element={<App />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
);
