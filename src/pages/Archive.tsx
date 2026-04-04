import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Masthead } from '../components/Masthead';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { 
  fetchStats, 
  fetchMonths, 
  fetchWeeks, 
  fetchDays, 
  fetchItems,
  GlobalStats,
  MonthlyArchive,
  WeeklyArchive,
  DailyArchive,
  DisplayItem
} from '../lib/api';
import './Archive.css';

const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

export default function Archive() {
  const { dateOrMonth } = useParams<{ dateOrMonth?: string }>();
  const navigate = useNavigate();
  
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [months, setMonths] = useState<MonthlyArchive[]>([]);
  
  // For specific month view
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [weeks, setWeeks] = useState<WeeklyArchive[]>([]);
  const [days, setDays] = useState<DailyArchive[]>([]);
  
  // For expanded days
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [dayItems, setDayItems] = useState<Record<string, DisplayItem[]>>({});

  useEffect(() => {
    fetchStats().then(setStats);
  }, []);

  useEffect(() => {
    let year = new Date().getFullYear();
    let month: number | null = null;

    if (dateOrMonth && dateOrMonth.length === 7) {
      const [y, m] = dateOrMonth.split('-');
      year = parseInt(y, 10);
      month = parseInt(m, 10);
    }

    setSelectedYear(year);
    setSelectedMonth(month);

    fetchMonths(year).then(setMonths);

    if (month) {
      fetchWeeks(year, month).then(setWeeks);
      fetchDays(year, month).then(setDays);
    } else {
      setWeeks([]);
      setDays([]);
    }
  }, [dateOrMonth]);

  const handleYearClick = (year: number) => {
    window.scrollTo(0, 0);
    navigate('/daily');
    setSelectedYear(year);
  };

  const toggleDay = async (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
      setExpandedDays(newExpanded);
    } else {
      newExpanded.add(date);
      setExpandedDays(newExpanded);
      if (!dayItems[date]) {
        const items = await fetchItems(date);
        setDayItems(prev => ({ ...prev, [date]: items }));
      }
    }
  };

  const renderMonthGrid = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    return (
      <div className="month-grid">
        {Array.from({ length: 12 }, (_, i) => {
          const monthNum = 12 - i;
          const monthData = months.find(m => new Date(m.month).getUTCMonth() + 1 === monthNum);
          const isFuture = selectedYear === currentYear && monthNum > currentMonth;
          const isCurrent = selectedYear === currentYear && monthNum === currentMonth;

          if (isFuture) {
            return (
              <div key={monthNum} className="month-cell future">
                <div className="mc-label">{MONTH_NAMES[monthNum - 1]}</div>
                <div className="mc-score">--</div>
                <div className="mc-score-sub">平均 Aha 指数</div>
                <div className="mc-count">0 篇</div>
                <div className="mc-bar"><div></div><div></div><div></div></div>
              </div>
            );
          }

          if (!monthData) {
            return (
              <Link onClick={() => window.scrollTo(0, 0)} to={`/daily/${selectedYear}-${String(monthNum).padStart(2, '0')}`} key={monthNum} className={`month-cell ${isCurrent ? 'current' : ''}`}>
                <div className="mc-label">{MONTH_NAMES[monthNum - 1]}</div>
                <div className="mc-score">--</div>
                <div className="mc-score-sub">平均 Aha 指数</div>
                <div className="mc-count">0 篇</div>
                <div className="mc-bar"><div></div><div></div><div></div></div>
              </Link>
            );
          }

          return (
            <Link onClick={() => window.scrollTo(0, 0)} to={`/daily/${selectedYear}-${String(monthNum).padStart(2, '0')}`} key={monthNum} className={`month-cell ${isCurrent ? 'current' : ''}`}>
              <div className="mc-label">{MONTH_NAMES[monthNum - 1]}</div>
              <div className="mc-score">{monthData.avg_aha_score.toFixed(1)}</div>
              <div className="mc-score-sub">平均 Aha 指数</div>
              <div className="mc-top">{monthData.top_story_title}</div>
              <div className="mc-count">{monthData.item_count} 篇</div>
              <div className="mc-bar">
                <div className="f"></div>
                <div className="f"></div>
                <div className={monthData.avg_aha_score > 85 ? 'fh' : ''}></div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  const renderMonthDetail = () => {
    if (!selectedMonth) return null;
    const monthData = months.find(m => new Date(m.month).getUTCMonth() + 1 === selectedMonth);

    return (
      <div id={`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`}>
        <div className="month-detail-header">
          <h2>{selectedYear}年{MONTH_NAMES[selectedMonth - 1]}</h2>
          <span className="cnt">共收录 {monthData?.item_count || 0} 篇</span>
          <Link to="/daily" className="lnk" onClick={() => {
            window.scrollTo(0, 0);
          }}>返回概览 ↑</Link>
        </div>
        
        {monthData?.summary && (
          <div className="month-summary">
            <strong>AI 总结：</strong> {monthData.summary}
          </div>
        )}

        {weeks.map(week => {
          const weekDays = days.filter(d => d.snapshot_date >= week.start_date && d.snapshot_date <= week.end_date);
          
          return (
            <div key={week.week_number} className="week-section">
              <div className="week-header">
                <h3>第 {week.week_number} 周</h3>
                <span className="week-range">{week.start_date.substring(5).replace('-', '.')} - {week.end_date.substring(5).replace('-', '.')}</span>
                <span className="week-stats">平均分: {week.avg_aha_score.toFixed(1)}</span>
              </div>
              
              {weekDays.map(day => {
                const isToday = day.snapshot_date === new Date().toISOString().split('T')[0];
                const isOpen = expandedDays.has(day.snapshot_date);
                const items = dayItems[day.snapshot_date] || [];
                const dateObj = new Date(day.snapshot_date);
                const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dateObj.getDay()];

                if (isToday && day.item_count === 0) {
                  return (
                    <div key={day.snapshot_date} className="day-block">
                      <div className="day-head today-row">
                        <div className="dh-toggle"></div>
                        <div className="dh-date">{day.snapshot_date.substring(5).replace('-', '.')}</div>
                        <div className="dh-weekday">{weekday}</div>
                        <div className="today-tag">今日</div>
                        <div className="pending">正在编译今日简报...</div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={day.snapshot_date} className="day-block">
                    <div className="day-head" onClick={() => toggleDay(day.snapshot_date)}>
                      <div className={`dh-toggle ${isOpen ? 'open' : ''}`}>▶</div>
                      <div className="dh-date">{day.snapshot_date.substring(5).replace('-', '.')}</div>
                      <div className="dh-weekday">{weekday}</div>
                      <div className="dh-score">{day.aha_score.toFixed(1)}</div>
                      <div className="dh-delta" style={{ color: 'var(--green)' }}>{day.aha_delta}</div>
                      <div className="dh-top">{day.top_story_title}</div>
                      <div className="dh-count">{day.item_count} 篇</div>
                      <div className="dh-bar">
                        <div className="f"></div>
                        <div className="f"></div>
                        <div className={day.aha_score > 90 ? 'fh' : ''}></div>
                      </div>
                    </div>
                    
                    <div className={`day-items ${isOpen ? 'open' : ''}`}>
                      {items.slice(0, 3).map((item, idx) => (
                        <div key={item.id} className="item-row">
                          <div className="ir-num">{String(idx + 1).padStart(2, '0')}</div>
                          <div className="ir-title">{item.processed_title || item.title}</div>
                          <div className="ir-tags">
                            {item.tags?.slice(0, 2).map(tag => (
                              <span key={tag} className="ir-tag">{tag}</span>
                            ))}
                          </div>
                          <div className="ir-src">{item.source_name}</div>
                          <a href={item.original_url || item.url} target="_blank" rel="noopener noreferrer" className="ir-link">阅读全文 →</a>
                        </div>
                      ))}
                      <Link onClick={() => window.scrollTo(0, 0)} to={`/daily/${day.snapshot_date}`} className="ir-more">查看当日全部 {day.item_count} 篇简报 →</Link>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="archive-page">
      <Helmet>
        <title>{selectedMonth ? `历史归档 - ${selectedYear}年${MONTH_NAMES[selectedMonth - 1]} | AmazingIndex` : `历史归档 | AmazingIndex`}</title>
        <meta name="description" content={selectedMonth ? `在 AmazingIndex 探索 ${selectedYear}年${MONTH_NAMES[selectedMonth - 1]} 的 AI 行业动态与突破。` : `深入探索 AmazingIndex 过去 AI 行业动态的综合数据库，经过评分和分类，方便您发现。`} />
        <link rel="canonical" href={selectedMonth ? `https://amazingindex.com/daily/${selectedYear}-${String(selectedMonth).padStart(2, '0')}` : `https://amazingindex.com/daily`} />
        <meta property="og:title" content={selectedMonth ? `历史归档 - ${selectedYear}年${MONTH_NAMES[selectedMonth - 1]} | AmazingIndex` : `历史归档 | AmazingIndex`} />
        <meta property="og:description" content={selectedMonth ? `在 AmazingIndex 探索 ${selectedYear}年${MONTH_NAMES[selectedMonth - 1]} 的 AI 行业动态与突破。` : `深入探索 AmazingIndex 过去 AI 行业动态的综合数据库，经过评分和分类，方便您发现。`} />
        <meta property="og:url" content={selectedMonth ? `https://amazingindex.com/daily/${selectedYear}-${String(selectedMonth).padStart(2, '0')}` : `https://amazingindex.com/daily`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": selectedMonth ? `历史归档 - ${selectedYear}年${MONTH_NAMES[selectedMonth - 1]} | AmazingIndex` : `历史归档 | AmazingIndex`,
            "description": selectedMonth ? `在 AmazingIndex 探索 ${selectedYear}年${MONTH_NAMES[selectedMonth - 1]} 的 AI 行业动态与突破。` : `深入探索 AmazingIndex 过去 AI 行业动态的综合数据库，经过评分和分类，方便您发现。`,
            "url": selectedMonth ? `https://amazingindex.com/daily/${selectedYear}-${String(selectedMonth).padStart(2, '0')}` : `https://amazingindex.com/daily`
          })}
        </script>
      </Helmet>
      <Masthead />
      <NavBar />
      
      <div className="layout">
        <div className="main-col">
          <div className="breadcrumb">
            <Link onClick={() => window.scrollTo(0, 0)} to="/">首页</Link><span className="sep">/</span>历史归档
          </div>
          
          <div className="page-header">
            <h1>历史归档</h1>
            <div className="sub">AI 行业动态的完整记录</div>
          </div>

          <div className="year-tabs">
            {[2026].map(year => (
              <button 
                key={year} 
                className={`year-tab ${selectedYear === year ? 'active' : ''}`}
                onClick={() => handleYearClick(year)}
              >
                {year}
              </button>
            ))}
          </div>

          {!selectedMonth && (
            <>
              <div className="year-meta">{selectedYear} 年度概览</div>
              {renderMonthGrid()}
            </>
          )}

          {selectedMonth && (
            <>
              {renderMonthGrid()}
              <hr className="section-divider" />
              {renderMonthDetail()}
            </>
          )}
        </div>

        <div className="side-col">
          <div className="side-section">
            <div className="side-title">全局统计</div>
            <div className="side-stats">
              <div className="side-stat">
                <span className="ss-label">总期数</span>
                <span className="ss-val">{stats?.total_editions || 0}</span>
              </div>
              <div className="side-stat">
                <span className="ss-label">收录文章</span>
                <span className="ss-val">{stats?.total_items?.toLocaleString() || 0}</span>
              </div>
              <div className="side-stat">
                <span className="ss-label">历史平均分</span>
                <span className="ss-val">{stats?.avg_aha_score?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="side-stat">
                <span className="ss-label">最高得分</span>
                <span className="ss-val" style={{ color: 'var(--accent)' }}>{stats?.peak_aha_score?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </div>

          <div className="side-section">
            <div className="side-title">分数分布</div>
            <div className="sb-row">
              <div className="sb-label">90-100</div>
              <div className="sb-track"><div className="sb-fill high" style={{ width: '15%' }}></div></div>
              <div className="sb-count">15%</div>
            </div>
            <div className="sb-row">
              <div className="sb-label">80-89</div>
              <div className="sb-track"><div className="sb-fill mid" style={{ width: '45%' }}></div></div>
              <div className="sb-count">45%</div>
            </div>
            <div className="sb-row">
              <div className="sb-label">70-79</div>
              <div className="sb-track"><div className="sb-fill low" style={{ width: '30%' }}></div></div>
              <div className="sb-count">30%</div>
            </div>
            <div className="sb-row">
              <div className="sb-label">&lt; 70</div>
              <div className="sb-track"><div className="sb-fill low" style={{ width: '10%', opacity: 0.3 }}></div></div>
              <div className="sb-count">10%</div>
            </div>
          </div>

          <div className="side-section">
            <div className="side-title">热门简报</div>
            <div className="te-row">
              <div className="te-date">02.14</div>
              <div className="te-story">Gemini 1.5 Pro Context Window Expansion</div>
              <div className="te-score peak">98.5</div>
            </div>
            <div className="te-row">
              <div className="te-date">01.22</div>
              <div className="te-story">AlphaGeometry Solves Olympiad Math</div>
              <div className="te-score">96.2</div>
            </div>
          </div>

          <div className="side-section">
            <div className="side-title">关于归档</div>
            <div className="about-box">
              AmazingIndex 历史归档保存了 AI 行业的每日演进。
              每一期都是最具影响力新闻的快照，由我们的 <strong>Aha Index</strong> 算法进行评分，以在噪音中凸显真正的突破。
            </div>
          </div>
          
          <div className="side-footer">
            <span>AmazingIndex</span>
            <span>始于 2024</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
