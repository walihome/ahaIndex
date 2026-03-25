import React from 'react';

interface NavBarProps {
  categories?: string[];
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export function NavBar({ categories = [], selectedCategory = '', onSelectCategory = () => {} }: NavBarProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const weekDay = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()];

  return (
    <nav className="nav-bar">
      <div className="nav-inner">
        <div className="nav-tabs">
          {categories.map(category => (
            <button 
              key={category}
              className={`nav-tab ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => onSelectCategory(category)}
            >
              {category.toUpperCase() === 'ENTERTAINMENT' ? (
                <>
                  <span className="cat-desktop">{category}</span>
                  <span className="cat-mobile">ENT</span>
                </>
              ) : category}
            </button>
          ))}
        </div>
        <div className="nav-date">VOL. {year}.{month} &nbsp;·&nbsp; {weekDay}</div>
      </div>
    </nav>
  );
}
