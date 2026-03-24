import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Masthead } from '../components/Masthead';
import { NavBar } from '../components/NavBar';
import { BriefingCard } from '../components/BriefingCard';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';
import { Modal } from '../components/Modal';
import { ProcessedItem } from '../types';
import { MOCK_DATA } from '../App';

export default function History() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ProcessedItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('全部');

  useEffect(() => {
    async function fetchHistoryItems() {
      try {
        const { supabase } = await import('../lib/supabase');
        const { data, error } = await supabase
          .from('display_items')
          .select('*')
          .order('snapshot_date', { ascending: false })
          .order('rank', { ascending: true })
          .limit(100);

        if (error) {
          console.error('Error fetching history items:', error);
          setItems(MOCK_DATA);
        } else if (data && data.length > 0) {
          setItems(data);
        } else {
          setItems(MOCK_DATA);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setItems(MOCK_DATA);
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
