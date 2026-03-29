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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
                <div className="mc-score-sub">Avg Aha Score</div>
                <div className="mc-count">0 Items</div>
                <div className="mc-bar"><div></div><div></div><div></div></div>
              </div>
            );
          }

          if (!monthData) {
            return (
              <Link onClick={() => window.scrollTo(0, 0)} to={`/daily/${selectedYear}-${String(monthNum).padStart(2, '0')}`} key={monthNum} className={`month-cell ${isCurrent ? 'current' : ''}`}>
                <div className="mc-label">{MONTH_NAMES[monthNum - 1]}</div>
                <div className="mc-score">--</div>
                <div className="mc-score-sub">Avg Aha Score</div>
                <div className="mc-count">0 Items</div>
                <div className="mc-bar"><div></div><div></div><div></div></div>
              </Link>
            );
          }

          return (
            <Link onClick={() => window.scrollTo(0, 0)} to={`/daily/${selectedYear}-${String(monthNum).padStart(2, '0')}`} key={monthNum} className={`month-cell ${isCurrent ? 'current' : ''}`}>
              <div className="mc-label">{MONTH_NAMES[monthNum - 1]}</div>
              <div className="mc-score">{monthData.avg_aha_score.toFixed(1)}</div>
              <div className="mc-score-sub">Avg Aha Score</div>
              <div className="mc-count">{monthData.item_count} Items</div>
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
          <h2>{MONTH_NAMES[selectedMonth - 1]} {selectedYear}</h2>
          <span className="cnt">{monthData?.item_count || 0} Items Recorded</span>
          <Link to="/daily" className="lnk" onClick={() => {
            window.scrollTo(0, 0);
          }}>Back to Overview ↑</Link>
        </div>
        
        {monthData?.summary && (
          <div className="month-summary">
            <strong>AI Summary:</strong> {monthData.summary}
          </div>
        )}

        {weeks.map(week => {
          const weekDays = days.filter(d => d.snapshot_date >= week.start_date && d.snapshot_date <= week.end_date);
          
          return (
            <div key={week.week_number} className="week-section">
              <div className="week-header">
                <h3>Week {week.week_number}</h3>
                <span className="week-range">{week.start_date.substring(5).replace('-', '.')} - {week.end_date.substring(5).replace('-', '.')}</span>
                <span className="week-stats">Avg Score: {week.avg_aha_score.toFixed(1)}</span>
              </div>
              
              {weekDays.map(day => {
                const isToday = day.snapshot_date === new Date().toISOString().split('T')[0];
                const isOpen = expandedDays.has(day.snapshot_date);
                const items = dayItems[day.snapshot_date] || [];
                const dateObj = new Date(day.snapshot_date);
                const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateObj.getDay()];

                if (isToday && day.item_count === 0) {
                  return (
                    <div key={day.snapshot_date} className="day-block">
                      <div className="day-head today-row">
                        <div className="dh-toggle"></div>
                        <div className="dh-date">{day.snapshot_date.substring(5).replace('-', '.')}</div>
                        <div className="dh-weekday">{weekday}</div>
                        <div className="today-tag">TODAY</div>
                        <div className="pending">Compiling today's briefing...</div>
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
                      <div className="dh-count">{day.item_count} Items</div>
                      <div className="dh-bar">
                        <div className="f"></div>
                        <div className="f"></div>
                        <div className={day.aha_score > 90 ? 'fh' : ''}></div>
                      </div>
                    </div>
                    
                    <div className={`day-items ${isOpen ? 'open' : ''}`}>
                      {items.map((item, idx) => (
                        <div key={item.id} className="item-row">
                          <div className="ir-num">{String(idx + 1).padStart(2, '0')}</div>
                          <div className="ir-title">{item.title}</div>
                          <div className="ir-tags">
                            {item.tags?.slice(0, 2).map(tag => (
                              <span key={tag} className="ir-tag">{tag}</span>
                            ))}
                          </div>
                          <div className="ir-src">{item.source_name}</div>
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="ir-link">Read Full Briefing →</a>
                        </div>
                      ))}
                      <Link onClick={() => window.scrollTo(0, 0)} to={`/daily/${day.snapshot_date}`} className="ir-more">View all {day.item_count} items for this day →</Link>
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
        <title>{selectedMonth ? `Archive - ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} | AmazingIndex` : `Historical Archive | AmazingIndex`}</title>
        <meta name="description" content={selectedMonth ? `Explore the AI industry shifts and breakthroughs in ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} on AmazingIndex.` : `Dive into the comprehensive database of past AI industry shifts, scored and categorized for easy discovery on AmazingIndex.`} />
        <link rel="canonical" href={selectedMonth ? `https://amazingindex.com/daily/${selectedYear}-${String(selectedMonth).padStart(2, '0')}` : `https://amazingindex.com/daily`} />
        <meta property="og:title" content={selectedMonth ? `Archive - ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} | AmazingIndex` : `Historical Archive | AmazingIndex`} />
        <meta property="og:description" content={selectedMonth ? `Explore the AI industry shifts and breakthroughs in ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} on AmazingIndex.` : `Dive into the comprehensive database of past AI industry shifts, scored and categorized for easy discovery on AmazingIndex.`} />
        <meta property="og:url" content={selectedMonth ? `https://amazingindex.com/daily/${selectedYear}-${String(selectedMonth).padStart(2, '0')}` : `https://amazingindex.com/daily`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": selectedMonth ? `Archive - ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} | AmazingIndex` : `Historical Archive | AmazingIndex`,
            "description": selectedMonth ? `Explore the AI industry shifts and breakthroughs in ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear} on AmazingIndex.` : `Dive into the comprehensive database of past AI industry shifts, scored and categorized for easy discovery on AmazingIndex.`,
            "url": selectedMonth ? `https://amazingindex.com/daily/${selectedYear}-${String(selectedMonth).padStart(2, '0')}` : `https://amazingindex.com/daily`
          })}
        </script>
      </Helmet>
      <Masthead />
      <NavBar />
      
      <div className="layout">
        <div className="main-col">
          <div className="breadcrumb">
            <Link onClick={() => window.scrollTo(0, 0)} to="/">Home</Link><span className="sep">/</span>Archive
          </div>
          
          <div className="page-header">
            <h1>Historical Archive</h1>
            <div className="sub">The complete record of AI industry shifts</div>
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
              <div className="year-meta">{selectedYear} Overview</div>
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
            <div className="side-title">Global Stats</div>
            <div className="side-stats">
              <div className="side-stat">
                <span className="ss-label">Total Editions</span>
                <span className="ss-val">{stats?.total_editions || 0}</span>
              </div>
              <div className="side-stat">
                <span className="ss-label">Items Processed</span>
                <span className="ss-val">{stats?.total_items?.toLocaleString() || 0}</span>
              </div>
              <div className="side-stat">
                <span className="ss-label">All-time Avg Score</span>
                <span className="ss-val">{stats?.avg_aha_score?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="side-stat">
                <span className="ss-label">Peak Score</span>
                <span className="ss-val" style={{ color: 'var(--accent)' }}>{stats?.peak_aha_score?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </div>

          <div className="side-section">
            <div className="side-title">Score Distribution</div>
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
            <div className="side-title">Top Editions</div>
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
            <div className="side-title">About Archive</div>
            <div className="about-box">
              The AmazingIndex archive preserves the daily evolution of the AI industry. 
              Each edition is a snapshot of the most impactful news, scored by our <strong>Aha Index</strong> algorithm to highlight true breakthroughs over noise.
            </div>
          </div>
          
          <div className="side-footer">
            <span>AmazingIndex</span>
            <span>Est. 2024</span>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
