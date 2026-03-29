import React from 'react';
import { Link } from 'react-router-dom';
import { Masthead } from '../components/Masthead';
import { Footer } from '../components/Footer';

export function About() {
  return (
    <div>
      <Masthead />
      <div className="page-hero">
        <div style={{ marginBottom: '24px' }}>
          <Link to="/" style={{ color: 'var(--ink2)', textDecoration: 'none', fontSize: '13px', transition: 'color 0.2s', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--ink)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--ink2)'}>
            ← 返回首页
          </Link>
        </div>
        <div className="vol">About · AmazingIndex</div>
        <h1>我们在做什么</h1>
        <p className="subtitle">每日精选 AI 行业最值得关注的信号，过滤噪音，直达洞察。</p>
      </div>

      <main className="page-content">
        <div className="static-section">
          <div className="static-section-label">Origin · 起源</div>
          <h2>为什么有 AmazingIndex</h2>
          <p>
            AI 行业每天产出的信息量已经超过任何人的消化能力。论文、开源项目、产品发布、社区讨论……大量内容混杂在一起，
            真正重要的信号反而淹没在噪音之中。
          </p>
          <p>
            AmazingIndex 从这个问题出发：<strong>如果每天只读一份简报，应该读什么？</strong>
            我们不追求数量，只追求每条内容对你真正有价值。
          </p>
        </div>

        <div className="static-section">
          <div className="static-section-label">How · 方法论</div>
          <h2>多维量化评估体系</h2>
          <p>
            我们构建了一套基于多维度量化算法的评估系统，从数十个来源中筛选内容，
            并从以下维度对每条信息进行评分：
          </p>
          <ul>
            <li><strong>可操作性</strong> — 对从业者的直接价值</li>
            <li><strong>技术深度</strong> — 内容的专业程度</li>
            <li><strong>宏观影响</strong> — 对行业格局的潜在影响</li>
            <li><strong>事件稀缺性</strong> — 是否具有独特性</li>
            <li><strong>受众契合度</strong> — 是否符合 AI 从业者的核心关注</li>
          </ul>
          <div className="highlight-box">
            "The Absolute Threshold" — 只有真正越过阈值的内容，才会出现在每日简报里。
          </div>
        </div>

        <div className="static-section">
          <div className="static-section-label">Identity · 定位</div>
          <h2>我们是谁</h2>
          <p>
            AmazingIndex 由独立开发者创立，专注于 AI 行业内容的聚合与深度筛选。
            我们不代表任何机构或投资方，保持完全独立的评估立场。
          </p>
          <p>
            所有内容基于算法与人工双重审核，来源涵盖 arXiv、HuggingFace、Hacker News、
            Reddit 等主流平台。
          </p>
        </div>

        <div className="static-section">
          <div className="static-section-label">Contact · 联系</div>
          <h2>与我们交流</h2>
          <p>
            有内容建议、合作想法或任何反馈，欢迎发邮件至
            <a href="mailto:hi@amazingindex.com" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>hi@amazingindex.com</a>。
            我们认真阅读每一封来信。
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
