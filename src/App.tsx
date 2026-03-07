import React, { useEffect, useState } from 'react';
import { Masthead } from './components/Masthead';
import { Ticker } from './components/Ticker';
import { NavBar } from './components/NavBar';
import { BriefingCard } from './components/BriefingCard';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Modal } from './components/Modal';
import { supabase } from './lib/supabase';
import { ProcessedItem } from './types';

const MOCK_DATA: ProcessedItem[] = [
  {
    item_id: '1',
    processed_title: 'Llama 3 8B：Meta 开源新标杆',
    raw_title: 'Llama 3 8B：Meta 开源新标杆',
    summary: 'Meta 开源的新一代大语言模型，在同等参数量下性能全面领先，支持广泛的推理和生成任务。采用 GQA 分组查询注意力机制，在保证推理质量的同时大幅降低了计算成本。',
    expert_insight: 'Llama 3 8B 的发布标志着开源模型在小参数量级上的又一次飞跃。其 GQA 机制的引入不仅提升了推理速度，还显著降低了部署成本，这对于边缘计算和本地化部署具有重要意义。',
    original_url: 'https://github.com/meta-llama/llama3',
    tags: ['人工智能', 'Meta-Llama/Llama3'],
    keywords: ['LLM', 'Meta', 'Llama 3'],
    aha_index: 0.85,
    updated_at: new Date().toISOString(),
    source_name: 'GitHub Search',
    category: '人工智能',
    display_metrics: {
      items: [
        { label: '⭐ Stars', value: '6,034' }
      ]
    },
    snapshot_date: new Date().toLocaleDateString('en-CA') // YYYY-MM-DD
  },
  {
    item_id: '2',
    processed_title: 'Stable Diffusion 3：图像生成新纪元',
    raw_title: 'Stable Diffusion 3：图像生成新纪元',
    summary: 'Stability AI 发布的最新一代文生图模型，采用 MMDiT 架构，大幅提升了文字生成能力和图像质量。',
    expert_insight: 'MMDiT 架构通过分离文本和图像的注意力机制，解决了以往模型在处理复杂文本提示时的混淆问题。这使得 SD3 在生成包含文字的图像时表现尤为出色。',
    original_url: 'https://stability.ai/news/stable-diffusion-3',
    tags: ['人工智能', 'StabilityAI'],
    keywords: ['AI', 'Image Generation', 'Stable Diffusion'],
    aha_index: 0.92,
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    source_name: 'hacker news',
    category: '人工智能',
    display_metrics: {
      items: [
        { label: '💬 Comments', value: '128' },
        { label: '⬆️ Points', value: '452' }
      ]
    },
    snapshot_date: new Date().toLocaleDateString('en-CA')
  },
  {
    item_id: '3',
    processed_title: 'vLLM：高吞吐量推理引擎',
    raw_title: 'vLLM：高吞吐量推理引擎',
    summary: '高吞吐量、低内存占用的 LLM 推理和服务引擎，采用 PagedAttention 技术，极大提升了推理效率。',
    expert_insight: 'PagedAttention 是 vLLM 的核心创新，它通过类似操作系统虚拟内存分页的方式管理 KV Cache，几乎消除了内存碎片，使得批处理能力大幅提升。',
    original_url: 'https://github.com/vllm-project/vllm',
    tags: ['开发者', 'vllm-project/vllm'],
    keywords: ['LLM', 'Inference', 'vLLM'],
    aha_index: 0.78,
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    source_name: 'GitHub Search',
    category: '开发者',
    display_metrics: {
      items: [
        { label: '⭐ Stars', value: '12,450' }
      ]
    },
    snapshot_date: new Date().toLocaleDateString('en-CA')
  },
  {
    item_id: '4',
    processed_title: 'Gemma 2：Google 轻量级旗舰',
    raw_title: 'Gemma 2：Google 轻量级旗舰',
    summary: 'Google DeepMind 推出的高效开放模型，9B 和 27B 参数版本在同类规模中表现卓越，支持多语言推理与代码生成。',
    expert_insight: 'Gemma 2 的 27B 版本在多项基准测试中甚至超越了部分 70B 级别的模型，这得益于其更深的网络结构和优化的注意力机制。',
    original_url: 'https://blog.google/technology/developers/gemma-2/',
    tags: ['人工智能', 'google/gemma-2'],
    keywords: ['LLM', 'Google', 'Gemma 2'],
    aha_index: 0.88,
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    source_name: 'Google Blog',
    category: '人工智能',
    display_metrics: {
      items: [
        { label: '📅 Date', value: '2024-06-27' }
      ]
    },
    snapshot_date: new Date().toLocaleDateString('en-CA')
  }
];

export default function App() {
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ProcessedItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('全部');

  useEffect(() => {
    async function fetchItems() {
      try {
        const now = new Date();
        const today = now.getFullYear() + '-' + 
                      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                      String(now.getDate()).padStart(2, '0');
        
        const { data, error } = await supabase
          .from('processed_items')
          .select('*')
          .eq('snapshot_date', today)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching items:', error);
          // Fallback to mock data on error (e.g., if Supabase is not configured)
          setItems(MOCK_DATA);
        } else if (data && data.length > 0) {
          setItems(data);
        } else {
          // Fallback to mock data if empty
          setItems(MOCK_DATA);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        setItems(MOCK_DATA);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  // Async Hydration: Simulate fetching dynamic data (views, likes) after initial render
  useEffect(() => {
    if (loading) return;

    const hydrateData = async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setItems(prevItems => 
        prevItems.map(item => ({
          ...item,
          views: Math.floor(Math.random() * 10000) + 100,
          likes: Math.floor(Math.random() * 1000) + 10,
        }))
      );
    };

    hydrateData();
  }, [loading]);

  const categories = ['全部', ...Array.from(new Set(items.map(item => item.category).filter(Boolean) as string[]))];
  
  const filteredItems = selectedCategory === '全部' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <>
      <Masthead />
      <Ticker />
      <NavBar 
        categories={categories} 
        selectedCategory={selectedCategory} 
        onSelectCategory={setSelectedCategory} 
      />

      <div className="layout">
        <main className="main-col">
          <div className="section-label">今日精选 · Today's Picks</div>
          
          <div className="article-list">
            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <span>正在加载今日精选...</span>
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item, index) => (
                <BriefingCard 
                  key={item.item_id ? `${item.item_id}-${index}` : index} 
                  item={item} 
                  index={index} 
                  onClick={setSelectedItem}
                />
              ))
            ) : (
              <div className="loading-state">今日暂无更新</div>
            )}
          </div>
        </main>

        <Sidebar />
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
