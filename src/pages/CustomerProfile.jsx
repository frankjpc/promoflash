import React from 'react';
import { Heart, Gift, Clock, Headphones, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './CustomerTabs.css';

export default function CustomerProfile() {
  const { user, signOut } = useAuth();

  return (
    <div className="tab-container">
      <h2 className="header-title" style={{ textAlign: 'center' }}>
        {user ? user.email : 'Log in or sign up'}
      </h2>

      {!user && (
        <div className="login-options mt-4">
          <div style={{display: 'flex', gap: '1rem'}}>
            <button className="btn btn-outline w-full" style={{borderRadius: '20px'}}>Google</button>
            <button className="btn btn-outline w-full" style={{borderRadius: '20px'}}>Facebook</button>
          </div>
          <p className="text-center mt-3 text-secondary" style={{fontSize: '0.875rem'}}>Or use an email</p>
          <input type="email" placeholder="Email" className="profile-input mt-2" />
          <button className="btn btn-primary w-full mt-3" style={{backgroundColor: '#2e7d32', borderRadius: '20px'}}>Continue</button>
        </div>
      )}

      <div className="profile-links mt-4">
        <a href="#" className="profile-link-item">
          <div className="pl-left"><Heart size={20} /> My Wishlist</div>
          <ChevronRight size={18} className="text-secondary" />
        </a>
        <a href="#" className="profile-link-item">
          <div className="pl-left"><Gift size={20} /> Give the Gift of PromoFlash</div>
          <ChevronRight size={18} className="text-secondary" />
        </a>
        <a href="#" className="profile-link-item">
          <div className="pl-left"><Clock size={20} /> Recently viewed</div>
          <ChevronRight size={18} className="text-secondary" />
        </a>
      </div>

      <div className="profile-links mt-4">
        <a href="#" className="profile-link-item">
          <div className="pl-left">Customer Support</div>
          <ChevronRight size={18} className="text-secondary" />
        </a>
        <a href="#" className="profile-link-item">
          <div className="pl-left">Sell on PromoFlash</div>
          <ChevronRight size={18} className="text-secondary" />
        </a>
        <a href="#" className="profile-link-item">
          <div className="pl-left">About PromoFlash</div>
          <ChevronRight size={18} className="text-secondary" />
        </a>
      </div>

      {user && (
        <div className="mt-4 mb-4">
          <button onClick={signOut} className="btn btn-outline w-full" style={{display: 'flex', gap: '0.5rem', justifyContent: 'center', borderColor: '#ef4444', color: '#ef4444'}}>
            <LogOut size={16} /> Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  );
}
