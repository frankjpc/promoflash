import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Heart, ChevronDown, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Feed.css';

export default function Feed() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('offers')
        .select(`
          *,
          store:stores(name, location_lat, location_lng)
        `)
        .gt('expires_at', new Date().toISOString())
        .gt('current_stock', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Assign a random image to each offer for the MVP demo
      const images = [
        "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=800&q=80",
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
        "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=800&q=80",
        "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80"
      ];
      
      const offersWithImages = (data || []).map((o, idx) => ({
        ...o,
        imageUrl: images[idx % images.length]
      }));

      setOffers(offersWithImages);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeLeft = (expiresAt) => {
    const diff = new Date(expiresAt) - new Date();
    if (diff <= 0) return 'Expirado';
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / 1000 / 60) % 60);
    return `${h} Hours Left`; // Matching Groupon style
  };

  return (
    <div className="feed-container">
      <div className="search-header-explore">
        <div className="search-bar-explore">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search PromoFlash" />
          <span className="search-location">Chicago</span>
        </div>
      </div>

      <div className="trending-header">
        <h2>Trending in Chicago <ChevronDown size={20} /></h2>
      </div>

      <main className="feed-content">
        {loading ? (
          <p className="text-center text-secondary mt-4">Loading experiences...</p>
        ) : offers.length === 0 ? (
          <p className="text-center text-secondary mt-4">No active offers right now.</p>
        ) : (
          offers.map((offer, index) => (
            <div key={offer.id} className="groupon-card">
              <div className="card-image-container">
                <img src={offer.imageUrl} alt={offer.product_name} className="card-image" />
                <div className="card-tags">
                  <span className="tag-badge"><GiftIcon size={12}/> Popular Gift</span>
                  <button className="heart-btn"><Heart size={18} /></button>
                </div>
                <div className="card-bottom-tags">
                  <span className="tag-badge-light">📈 Trending</span>
                </div>
              </div>
              
              <div className="card-details">
                <h3 className="card-title">{offer.product_name}</h3>
                
                <div className="card-location">
                  <span>{offer.store?.name}, Chicago</span>
                  <span className="distance"><NavigationIcon size={12}/> 0.8 mi</span>
                </div>
                
                <div className="card-rating">
                  <span className="stars">⭐⭐⭐⭐⭐</span>
                  <span className="rating-score">4.8</span>
                  <span className="rating-count">(10,371)</span>
                </div>
                
                <div className="card-price-row">
                  <span className="original-price">${offer.original_price}</span>
                  <span className="discounted-price">${offer.discounted_price}</span>
                  <span className="discount-percent">{offer.discount_percent}% Off</span>
                </div>
                
                <div className="card-promo">
                  <span className="promo-price">${(offer.discounted_price * 0.9).toFixed(2)}</span>
                  <span className="promo-text">with promo, {getTimeLeft(offer.expires_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

// Simple icons for the badges
const GiftIcon = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>
);

const NavigationIcon = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
);
