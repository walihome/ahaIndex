import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Masthead } from '../components/Masthead';
import { NavBar } from '../components/NavBar';
import { BriefingCard } from '../components/BriefingCard';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { Modal } from '../components/Modal';
import { ProcessedItem } from '../types';

const OSS_BASE = '';

export default function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ProcessedItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('全部');

  useEffect(() => {
    async function fetchHistoryItems() {
      try {
        const resp = await fetch(`${OSS_BASE}/api/dates.json`);
        const { dates } = await resp.json();
        
        if (!dates || dates.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }

        // Fetch the latest 5 days to get enough items for history
        const latestDates = dates.slice(0, 5);
        const promises = latestDates.map(async (date: string) => {
          const year = date.slice(0, 4);
          const month = date.slice(5, 7);
          const res = await fetch(`${OSS_BASE}/api/daily/${year}/${month}/${date}.json`);
          if (res.ok) {
            const data = await res.json();
            return data.items || [];
          }
          return [];
        });

        const results = await Promise.all(promises);
        let allItems: ProcessedItem[] = [];
        results.forEach(dayItems => {
          allItems = allItems.concat(dayItems);
        });

        // Sort by aha_index descending
        allItems.sort((a, b) => ((b.aha_index || 0) - (a.aha_index || 0)));
        
        // Limit to top 100
        setItems(allItems.slice(0, 100));
      } catch (err) {
        console.error('Unexpected error:', err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchHistoryItems();
  }, []);

  const categories = ['全部', ...Array.from(new Set(items.map(item => item.category).filter(Boolean) as string[]))];
  
  const filteredItems = selectedCategory === '全部' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <>
      <Helmet>
        <title>历史精选 · AmazingIndex</title>
        <meta name="description" content="AmazingIndex 历史精选：回顾过往最具价值的 AI 行业动态与创新洞察。" />
        <link rel="canonical" href="https://www.amazingindex.com/history" />
        <meta property="og:title" content="历史精选 · AmazingIndex" />
        <meta property="og:description" content="AmazingIndex 历史精选：回顾过往最具价值的 AI 行业动态与创新洞察。" />
        <meta property="og:url" content="https://www.amazingindex.com/history" />
      </Helmet>
      <Masthead items={items} />
      <NavBar 
        categories={categories} 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />

      <div className="layout">
        <main className="main-col">
          <div className="section-label">历史精选 · History</div>
          
          <div className="article-list">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>正在加载历史精选...</span>
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <BriefingCard 
                  key={item.id ? `${item.id}-${index}` : index} 
                  item={item} 
                  index={index} 
                  onClick={setSelectedItem}
                  showDate={true}
                />
              ))
            ) : (
              <div className="loading-state">暂无历史数据</div>
            )}
          </div>
        </main>

        <Sidebar items={items} />
      </div>

      <Footer />

      {selectedItem && (
        <Modal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </>
  );
}
