import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Masthead } from '../components/Masthead';
import { Footer } from '../components/Footer';

export function Contact() {
  return (
    <div>
      <Helmet>
        <title>联系方式 · AmazingIndex</title>
        <meta name="description" content="与 AmazingIndex 团队联系，发送内容建议、合作咨询或任何反馈至 hi@amazingindex.com。" />
        <link rel="canonical" href="https://amazingindex.com/contact" />
        <meta property="og:title" content="联系方式 · AmazingIndex" />
        <meta property="og:url" content="https://amazingindex.com/contact" />
      </Helmet>
      <Masthead />
      <div className="page-hero">
        <div style={{ marginBottom: '24px' }}>
          <Link to="/" style={{ color: 'var(--ink2)', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ink)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink2)'}>
            ← 返回首页
          </Link>
        </div>
        <div className="vol">Contact · 联系方式</div>
        <h1>与我们联系</h1>
        <p className="subtitle">内容反馈、合作咨询或任何建议，我们认真对待每一封来信。</p>
      </div>

      <main className="page-content">
        <div className="static-section">
          <div className="static-section-label">Primary · 主要联系方式</div>
          <div className="contact-grid">
            <div className="contact-card">
              <div className="card-label">Email · 邮件</div>
              <div className="card-value"><a href="mailto:hi@amazingindex.com">hi@amazingindex.com</a></div>
              <div className="card-desc">适用于所有类型的咨询，包括内容反馈、商务合作、媒体联络。</div>
            </div>
            <div className="contact-card">
              <div className="card-label">Website · 网站</div>
              <div className="card-value"><a href="https://amazingindex.com" style={{ color: 'var(--ink)' }}>amazingindex.com</a></div>
              <div className="card-desc">每日更新，订阅 AI 行业精选简报，发现真正值得关注的信号。</div>
            </div>
          </div>
          <div className="response-note">
            通常在 1–3 个工作日内回复。我们不发送冷邮件，也不出售联系人信息。
          </div>
        </div>

        <div className="static-section">
          <div className="static-section-label">Topics · 欢迎讨论的话题</div>
          <h2>我们期待听到你的声音</h2>
          <ul>
            <li><strong>内容建议</strong> — 你认为哪些来源或话题值得纳入日常追踪</li>
            <li><strong>错误纠正</strong> — 如果发现某条摘要存在事实偏差，请告诉我们</li>
            <li><strong>商务合作</strong> — 赞助、联名、数据授权等合作方向</li>
            <li><strong>读者反馈</strong> — 哪些内容对你真正有用，哪些可以删减</li>
          </ul>
        </div>

        <div className="static-section">
          <div className="static-section-label">Note · 说明</div>
          <h2>关于回复速度</h2>
          <p>
            AmazingIndex 由独立开发者运营，我们尽力在合理时间内回复每一封邮件。
            如果你的问题比较紧急，请在邮件标题注明 <span style={{ fontFamily: 'var(--fm)', fontSize: '13px' }}>[紧急]</span>，我们会优先处理。
          </p>
          <p>
            对于重复性或明显的推广邮件，我们可能不会一一回复，敬请理解。
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
