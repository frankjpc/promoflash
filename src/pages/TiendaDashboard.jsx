import React, { useState, useEffect } from 'react';
import { Package, Percent, LayoutList, TrendingUp, QrCode, CheckCircle2, Store as StoreIcon, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

export default function TiendaDashboard() {
  const { user, signOut } = useAuth();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('nueva-oferta'); // 'nueva-oferta' o 'estadisticas'

  // Form states for Store Creation
  const [storeName, setStoreName] = useState('');

  // Form states for Offer Creation
  const [product, setProduct] = useState('');
  const [discount, setDiscount] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [hoursValid, setHoursValid] = useState('2');
  const [published, setPublished] = useState(false);
  const [error, setError] = useState('');

  // Stats & History
  const [stats, setStats] = useState({ generated: 0, redeemed: 0 });
  const [offersHistory, setOffersHistory] = useState([]);

  useEffect(() => {
    fetchStoreAndStats();
  }, [user]);

  const fetchStoreAndStats = async () => {
    if (!user) return;
    try {
      // Fetch store
      const { data: storeData } = await supabase
        .from('stores')
        .select('*')
        .eq('manager_id', user.id)
        .single();
      
      if (storeData) {
        setStore(storeData);
        
        // Fetch stats if store exists
        const { count: generatedCount } = await supabase
          .from('coupons')
          .select('id', { count: 'exact' });
          
        const { count: redeemedCount } = await supabase
          .from('coupons')
          .select('id', { count: 'exact' })
          .eq('status', 'redeemed');
          
        setStats({ 
          generated: generatedCount || 0, 
          redeemed: redeemedCount || 0 
        });

        // Fetch offers history
        const { data: offersData } = await supabase
          .from('offers')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });

        setOffersHistory(offersData || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert([{ name: storeName, manager_id: user.id, location_lat: 10.162, location_lng: -67.997 }])
        .select()
        .single();
        
      if (error) throw error;
      setStore(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    setError('');
    setPublished(false);

    try {
      const discountVal = parseInt(discount);
      const originalPriceVal = parseFloat(originalPrice);
      const discountedPrice = originalPriceVal - (originalPriceVal * (discountVal / 100));
      
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(hoursValid));

      const { error } = await supabase
        .from('offers')
        .insert([{
          store_id: store.id,
          product_name: product,
          discount_percent: discountVal,
          original_price: originalPriceVal,
          discounted_price: discountedPrice,
          total_stock: parseInt(quantity),
          current_stock: parseInt(quantity),
          expires_at: expiresAt.toISOString()
        }]);

      if (error) throw error;

      setPublished(true);
      setProduct('');
      setDiscount('');
      setOriginalPrice('');
      setQuantity('');
      
      // Update history immediately after publishing
      fetchStoreAndStats();

      setTimeout(() => setPublished(false), 4000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="dashboard-layout"><div className="container">Cargando...</div></div>;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2 className="brand-title sidebar-brand">PromoFlash</h2>
        <div className="sidebar-store-info">
          <p className="text-secondary" style={{fontSize: '0.875rem'}}>Panel de Tienda</p>
          <p style={{fontWeight: 600}}>{store ? store.name : 'Sin tienda configurada'}</p>
        </div>
        <nav className="sidebar-nav" style={{flex: 1}}>
          <button 
            className={`nav-item ${activeView === 'nueva-oferta' ? 'active' : ''}`}
            onClick={() => setActiveView('nueva-oferta')}
            style={{width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'}}
          >
            <LayoutList size={18} /> Nueva Oferta
          </button>
          <button 
            className={`nav-item ${activeView === 'estadisticas' ? 'active' : ''}`}
            onClick={() => setActiveView('estadisticas')}
            style={{width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'}}
          >
            <TrendingUp size={18} /> Estadísticas
          </button>
        </nav>
        <div style={{padding: '1rem'}}>
          <button onClick={signOut} className="btn btn-outline w-full" style={{display: 'flex', gap: '0.5rem', justifyContent: 'center'}}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </aside>

      <main className="dashboard-content container">
        <header className="dashboard-header">
          <h1>{activeView === 'nueva-oferta' ? 'Gestión de Ofertas Relámpago' : 'Estadísticas e Historial'}</h1>
        </header>

        {!store ? (
          <section className="form-section card" style={{maxWidth: '500px'}}>
            <h3>Configura tu Tienda</h3>
            <p className="text-secondary mb-4">Antes de publicar ofertas, debes registrar el nombre de tu tienda física.</p>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleCreateStore} className="offer-form">
              <div className="form-group">
                <label>Nombre de la Tienda</label>
                <div className="input-with-icon">
                  <StoreIcon size={18} className="input-icon" />
                  <input type="text" placeholder="Ej. DAKA Valencia" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full mt-2">Crear Tienda</button>
            </form>
          </section>
        ) : (
          <div className="dashboard-grid" style={{ display: 'block' }}>
            {activeView === 'nueva-oferta' && (
              <section className="form-section card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h3>Publicar Oferta</h3>
                <p className="text-secondary mb-4">Crea una oferta en segundos para liquidar inventario.</p>
                
                {published && (
                  <div className="success-banner mb-4">
                    <CheckCircle2 size={18} />
                    <span>¡Oferta publicada exitosamente! Los usuarios ya pueden verla.</span>
                  </div>
                )}
                {error && <p style={{color: 'red', marginBottom: '1rem'}}>{error}</p>}

                <form onSubmit={handleSubmitOffer} className="offer-form">
                  <div className="form-group">
                    <label>Producto a Ofertar</label>
                    <div className="input-with-icon">
                      <Package size={18} className="input-icon" />
                      <input type="text" placeholder="Ej. Televisor Samsung 55''" value={product} onChange={(e) => setProduct(e.target.value)} required />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Precio Original ($)</label>
                      <div className="input-with-icon">
                        <span className="input-icon" style={{fontWeight:'bold', fontSize:'14px'}}>$</span>
                        <input type="number" placeholder="499" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Descuento (%)</label>
                      <div className="input-with-icon">
                        <Percent size={18} className="input-icon" />
                        <input type="number" placeholder="40" value={discount} onChange={(e) => setDiscount(e.target.value)} required />
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Cantidad Disponible</label>
                      <div className="input-with-icon">
                        <LayoutList size={18} className="input-icon" />
                        <input type="number" placeholder="Ej. 10" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                      </div>
                    </div>
                    
                    <div className="form-group">
                      <label>Horas Válida</label>
                      <select 
                        style={{padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none'}}
                        value={hoursValid} onChange={(e) => setHoursValid(e.target.value)}
                      >
                        <option value="1">1 Hora (Extremo)</option>
                        <option value="2">2 Horas (Recomendado)</option>
                        <option value="4">4 Horas</option>
                        <option value="12">12 Horas</option>
                        <option value="24">24 Horas</option>
                      </select>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary w-full mt-2">
                    Publicar Ahora
                  </button>
                </form>
              </section>
            )}

            {activeView === 'estadisticas' && (
              <>
                <section className="stats-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  <div className="stat-card card">
                    <div className="stat-icon qr-icon-bg">
                      <QrCode size={24} className="text-primary" />
                    </div>
                    <div className="stat-details">
                      <p className="stat-label">Códigos Generados</p>
                      <h3 className="stat-value">{stats.generated}</h3>
                    </div>
                  </div>

                  <div className="stat-card card">
                    <div className="stat-icon check-icon-bg">
                      <CheckCircle2 size={24} className="text-success" />
                    </div>
                    <div className="stat-details">
                      <p className="stat-label">Códigos Canjeados</p>
                      <h3 className="stat-value">{stats.redeemed}</h3>
                    </div>
                  </div>
                  
                  <div className="conversion-rate card" style={{ gridColumn: '1 / -1' }}>
                    <p className="stat-label">Tasa de Conversión</p>
                    <div className="conversion-bar-container">
                      <div className="conversion-bar" style={{width: `${stats.generated > 0 ? (stats.redeemed / stats.generated) * 100 : 0}%`}}></div>
                    </div>
                    <p className="conversion-text">
                      {stats.generated > 0 ? ((stats.redeemed / stats.generated) * 100).toFixed(1) : '0'}% de los códigos son redimidos en caja.
                    </p>
                  </div>
                </section>

                <section className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1rem' }}>Historial de Ofertas</h3>
                  {offersHistory.length === 0 ? (
                    <p className="text-secondary">No has publicado ninguna oferta aún.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                            <th style={{ padding: '0.75rem 0' }}>Producto</th>
                            <th style={{ padding: '0.75rem 0' }}>Descuento</th>
                            <th style={{ padding: '0.75rem 0' }}>Stock Inicial</th>
                            <th style={{ padding: '0.75rem 0' }}>Stock Actual</th>
                            <th style={{ padding: '0.75rem 0' }}>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {offersHistory.map(offer => {
                            const isExpired = new Date(offer.expires_at) < new Date();
                            const isSoldOut = offer.current_stock <= 0;
                            const isActive = !isExpired && !isSoldOut;
                            
                            return (
                              <tr key={offer.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem 0', fontWeight: 500 }}>{offer.product_name}</td>
                                <td style={{ padding: '1rem 0' }}>{offer.discount_percent}%</td>
                                <td style={{ padding: '1rem 0' }}>{offer.total_stock}</td>
                                <td style={{ padding: '1rem 0' }}>{offer.current_stock}</td>
                                <td style={{ padding: '1rem 0' }}>
                                  <span style={{ 
                                    color: isActive ? 'var(--success-color)' : 'var(--text-secondary)', 
                                    backgroundColor: isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)', 
                                    padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 
                                  }}>
                                    {isActive ? 'Activa' : (isSoldOut ? 'Agotada' : 'Expirada')}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
