import React from 'react';
import { QrCode, Trash2, Gift } from 'lucide-react';
import './CustomerTabs.css';

export default function MyCoupons() {
  return (
    <div className="tab-container bg-light">
      <h2 className="header-title">Mis Cupones</h2>

      <div className="cart-content">
        <div className="cart-item card">
          <div className="cart-item-flex">
            <div className="cart-img-placeholder"></div>
            <div className="cart-item-details">
              <h4>90-Minute Chicago Architecture Boat Tour & Cruise</h4>
              <p className="text-secondary">Valido para 1 persona</p>
              
              <div className="cart-actions">
                <select className="qty-select">
                  <option>1</option>
                </select>
                <button className="icon-btn"><Trash2 size={16}/></button>
                <div className="cart-price">
                  <span className="orig-price">$49</span>
                  <span className="disc-price">$29</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="gift-option">
            <input type="checkbox" />
            <div className="gift-text">
              <strong>Buy as a Gift <Gift size={14}/></strong>
              <span>Send or print gift voucher after purchase</span>
            </div>
          </div>
        </div>

        <div className="cart-summary card mt-4">
          <h3>Resumen</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>Ver en caja</span>
          </div>
          <div className="summary-row">
            <span>Impuestos</span>
            <span>Ver en caja</span>
          </div>
          <div className="summary-row total-row">
            <span>Total</span>
            <span>Ver en caja</span>
          </div>
          
          <button className="btn btn-primary w-full mt-4" style={{ backgroundColor: '#2e7d32' }}>
            Proceder al pago
          </button>
        </div>
      </div>
    </div>
  );
}
