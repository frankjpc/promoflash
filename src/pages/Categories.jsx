import React from 'react';
import { Search, Flame, Zap, Navigation, Gift } from 'lucide-react';
import './CustomerTabs.css';

export default function Categories() {
  return (
    <div className="tab-container">
      <div className="search-header">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search Massage" />
          <span className="search-location">Chicago</span>
        </div>
      </div>

      <div className="categories-content">
        <h3 className="section-title">Popular Categories</h3>
        <div className="popular-grid">
          <button className="popular-btn"><Flame size={18} color="#a855f7" /> Summer Deals</button>
          <button className="popular-btn"><Zap size={18} /> Things To Do</button>
          <button className="popular-btn"><Navigation size={18} /> Auto & Home</button>
          <button className="popular-btn"><Gift size={18} /> Beauty & Spas</button>
        </div>

        <h3 className="section-title mt-4">All Categories</h3>
        <div className="accordion-list">
          <div className="accordion-item active">
            <span>Local</span>
            <span className="chevron">^</span>
          </div>
          <div className="accordion-sub-item">Browse All</div>
          <div className="accordion-sub-item">Food & Drink (300+)</div>
          <div className="accordion-sub-item">Things To Do (500+)</div>
          <div className="accordion-sub-item">Beauty & Spas (1,000+)</div>
          <div className="accordion-sub-item">Health & Fitness (500+)</div>
        </div>
      </div>
    </div>
  );
}
