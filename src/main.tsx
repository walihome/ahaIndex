import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import App from './App.tsx';
import Archive from './pages/Archive.tsx';
import History from './pages/History.tsx';
import { StaticPage } from './pages/StaticPage.tsx';
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
        <Route path="/about" element={<StaticPage title="关于我们 (About Us)" content={<p>AmazingIndex 致力于为您提供每日最新、最前沿的 AI 行业创新洞察报告。我们通过数据驱动的方式，筛选出最具价值的行业动态。</p>} />} />
        <Route path="/contact" element={<StaticPage title="联系方式 (Contact)" content={<p>如有任何问题或合作意向，请联系我们：<br/><br/>Email: contact@amazingindex.com</p>} />} />
        <Route path="/privacy" element={<StaticPage title="隐私政策 (Privacy Policy)" content={<p>我们非常重视您的隐私。本隐私政策说明了我们如何收集、使用和保护您的个人信息。在使用我们的服务前，请仔细阅读本政策。<br/><br/>1. 信息收集：我们会收集您在使用服务时提供的信息，以及通过 Cookie 等技术自动收集的使用数据。<br/>2. 信息使用：收集的信息将用于提供、维护和改进我们的服务。<br/>3. 信息保护：我们采取合理的安全措施保护您的信息免受未经授权的访问。</p>} />} />
        <Route path="/terms" element={<StaticPage title="服务条款 (Terms)" content={<p>欢迎使用 AmazingIndex。通过访问或使用我们的网站，即表示您同意遵守以下服务条款：<br/><br/>1. 服务内容：我们提供 AI 行业资讯和数据分析服务。<br/>2. 用户行为：您同意不利用本网站从事任何违法或侵权活动。<br/>3. 知识产权：网站上的所有内容（包括但不限于文本、图像、数据）均受知识产权法保护。<br/>4. 免责声明：我们不对信息的绝对准确性、完整性或及时性作任何保证。</p>} />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
