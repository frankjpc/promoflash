import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck } from 'lucide-react';
import './QRView.css';

export default function QRView() {
  const location = useLocation();
  const navigate = useNavigate();
  const offer = location.state?.offer;
  const coupon = location.state?.coupon;
  
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!offer || !coupon) {
    return (
      <div className="mobile-container qr-container center-content">
        <p>No se encontró la oferta o el cupón.</p>
        <button className="btn btn-outline" onClick={() => navigate('/feed')}>Volver</button>
      </div>
    );
  }

  // Use the real alpha_code generated in the DB
  const alphaCode = coupon.alpha_code;

  return (
    <div className="mobile-container qr-container">
      <header className="qr-header">
        <button className="icon-btn back-btn" onClick={() => navigate('/feed')}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="header-title">Tu Código</h2>
        <div style={{ width: 40 }}></div>
      </header>

      <main className="qr-content">
        <div className="qr-card">
          <div className="qr-offer-info">
            <span className="qr-store">{offer.store?.name}</span>
            <h3 className="qr-product">{offer.product_name}</h3>
          </div>

          <div className="qr-code-wrapper">
            {/* Anti-fraud pulse animation container */}
            <div className="anti-fraud-pulse"></div>
            
            {/* Real QR Code linking to redemption URL (can be internal tool) */}
            <div className="qr-box">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${alphaCode}`} 
                alt="QR Code" 
                className="qr-image"
              />
            </div>
          </div>

          <div className="alpha-code-section">
            <p className="alpha-code-label">Código para Cajero</p>
            <div className="alpha-code-box">
              {alphaCode}
            </div>
          </div>

          <div className="live-clock">
            <Clock size={16} className="clock-icon" />
            <span>
              {time.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
            </span>
          </div>
          
          <div className="security-badge">
            <ShieldCheck size={14} className="text-success" />
            <span>Código verificado y activo</span>
          </div>
        </div>

        <div className="instructions">
          <h4>¿Cómo canjear?</h4>
          <ol>
            <li>Ve a la caja de la tienda física.</li>
            <li>Muestra este código QR al cajero.</li>
            <li>Si el escáner falla, dicta el código alfanumérico.</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
