import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Masthead } from "./components/Masthead";
import { NavBar } from "./components/NavBar";
import { BriefingCard } from "./components/BriefingCard";
import { Sidebar } from "./components/Sidebar";
import { Footer } from "./components/Footer";
import { Modal } from "./components/Modal";
import { ShareModal } from "./components/ShareModal";
import { ProcessedItem } from "./types";

const OSS_BASE = "";

export default function App() {
  const { dateOrMonth: date } = useParams<{ dateOrMonth: string }>();
  const location = useLocation();
  const itemIdMatch = location.pathname.match(/\/article\/([^/]+)$/);
  const itemId = itemIdMatch ? itemIdMatch[1] : undefined;
  const navigate = useNavigate();
  const [items, setItems] = useState<ProcessedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ProcessedItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("全部");

  // Handle browser back/forward for modal
  useEffect(() => {
    const handlePopState = () => {
      const match = window.location.pathname.match(/\/article\/([^/]+)$/);
      if (match) {
        const target = items.find((i) => i.processed_item_id === match[1]);
        setSelectedItem(target || null);
      } else {
        setSelectedItem(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [items]);

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }

    async function fetchItems() {
      try {
        let targetDate = date;

        if (!targetDate) {
          // 首页：直接从 OSS 拉最新数据
          try {
            const resp = await fetch("/api/latest.json");
            if (!resp.ok) throw new Error("Failed to fetch latest");
            const json = await resp.json();
            setItems(json.items || []);
            // 拿到日期后跳转到对应 URL
            if (json.snapshot_date) {
              navigate(`/daily/${json.snapshot_date}`, { replace: true });
            }
          } catch (err) {
            console.warn("Failed to fetch latest.json");
            setItems([]);
          }
          setLoading(false);
          return;
        }

        // 历史日期：逻辑不变
        setLoading(true);
        try {
          const resp = await fetch(
            `/api/daily/${targetDate.slice(0, 4)}/${targetDate.slice(5, 7)}/${targetDate}.json`,
          );
          if (resp.ok) {
            const json = await resp.json();
            setItems(json.items && json.items.length > 0 ? json.items : []);
          } else {
            setItems([]);
          }
        } catch (err) {
          console.warn(`Failed to fetch daily data for ${targetDate}`);
          setItems([]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [date, navigate]);

  // Async Hydration: Simulate fetching dynamic data (views, likes) after initial render
  useEffect(() => {
    if (loading) return;

    const hydrateData = async () => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setItems((prevItems) =>
        prevItems.map((item) => ({
          ...item,
          views: Math.floor(Math.random() * 10000) + 100,
          likes: Math.floor(Math.random() * 1000) + 10,
        })),
      );
    };

    hydrateData();
  }, [loading]);

  useEffect(() => {
    if (itemId && items.length > 0) {
      const target = items.find((i) => i.processed_item_id === itemId);
      if (target) {
        setSelectedItem(target);
      }
    }
  }, [itemId, items]);

  const handleItemClick = (item: ProcessedItem) => {
    if (date) {
      window.history.pushState(
        null,
        "",
        `/daily/${date}/article/${item.processed_item_id}`,
      );
    }
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    if (date && selectedItem) {
      window.history.pushState(null, "", `/daily/${date}`);
    }
    setSelectedItem(null);
  };

  const categories = [
    "全部",
    ...Array.from(
      new Set(items.map((item) => item.category).filter(Boolean) as string[]),
    ),
  ];

  const filteredItems =
    selectedCategory === "全部"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const [showShare, setShowShare] = useState(false);

  return (
    <div>
      <Helmet>
        {selectedItem ? (
          <>
            <title>
              {selectedItem.processed_title || selectedItem.title || "无标题"} -
              AmazingIndex
            </title>
            <meta
              name="description"
              content={selectedItem.summary?.slice(0, 150)}
            />
            {itemId && date ? (
              <>
                <link
                  rel="canonical"
                  href={`https://www.amazingindex.com/daily/${date}/article/${selectedItem.processed_item_id}`}
                />
                <meta
                  property="og:url"
                  content={`https://www.amazingindex.com/daily/${date}/article/${selectedItem.processed_item_id}`}
                />
              </>
            ) : (
              <>
                <link rel="canonical" href="https://www.amazingindex.com" />
                <meta
                  property="og:url"
                  content="https://www.amazingindex.com"
                />
              </>
            )}
            <meta
              property="og:title"
              content={
                selectedItem.processed_title || selectedItem.title || "无标题"
              }
            />
            <meta
              property="og:description"
              content={selectedItem.summary?.slice(0, 150)}
            />
          </>
        ) : date ? (
          <>
            <title>AmazingIndex · {date} AI 行业精选简报</title>
            <meta
              name="description"
              content={`AmazingIndex ${date} 每日 AI 行业精选简报。基于多维度量化算法，为您筛选当日最具价值的 AI 行业动态与创新洞察。`}
            />
            <link
              rel="canonical"
              href={`https://www.amazingindex.com/daily/${date}`}
            />
            <meta
              property="og:title"
              content={`AmazingIndex · ${date} AI 行业精选简报`}
            />
            <meta
              property="og:description"
              content={`AmazingIndex ${date} 每日 AI 行业精选简报。基于多维度量化算法，为您筛选当日最具价值的 AI 行业动态与创新洞察。`}
            />
            <meta
              property="og:url"
              content={`https://www.amazingindex.com/daily/${date}`}
            />
            <script type="application/ld+json">
              {JSON.stringify({
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                name: `AmazingIndex · ${date} AI 行业精选简报`,
                description: `AmazingIndex ${date} 每日 AI 行业精选简报。基于多维度量化算法，为您筛选当日最具价值的 AI 行业动态与创新洞察。`,
                url: `https://www.amazingindex.com/daily/${date}`,
              })}
            </script>
          </>
        ) : (
          <>
            <title>AmazingIndex · 每日 AI 行业精选简报</title>
            <meta
              name="description"
              content="AmazingIndex 基于多维度量化算法，每日从数十个来源精选最值得关注的 AI 行业动态，过滤噪音，直达洞察。"
            />
            <link rel="canonical" href="https://www.amazingindex.com/" />
            <meta
              property="og:title"
              content="AmazingIndex · 每日 AI 行业精选简报"
            />
            <meta
              property="og:description"
              content="基于多维度量化算法，每日精选最值得关注的 AI 行业动态。"
            />
            <meta property="og:url" content="https://www.amazingindex.com/" />
          </>
        )}
      </Helmet>
      <Masthead
        items={items}
        onShare={() => setShowShare(true)}
        generating={false}
      />
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
                  key={item.id ? `${item.id}-${index}` : index}
                  item={item}
                  index={index}
                  onClick={handleItemClick}
                />
              ))
            ) : (
              <div className="loading-state">今日暂无更新</div>
            )}
          </div>
        </main>

        <Sidebar items={items} />
      </div>

      <Footer
        showArchiveBanner={true}
        date={items.length > 0 ? items[0].snapshot_date : undefined}
      />

      {selectedItem && <Modal item={selectedItem} onClose={handleCloseModal} />}

      {showShare && (
        <ShareModal items={items} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}
