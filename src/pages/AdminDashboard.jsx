import React, { useState, useEffect } from 'react';
import { Users, Store, Activity, QrCode, TrendingUp, Settings, LogOut, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const [activeView, setActiveView] = useState('vista-general');
  const [stats, setStats] = useState({
    users: 0,
    stores: 0,
    redeemed: 0,
    generated: 0
  });
  const [storesList, setStoresList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // States for notifications
  const [notification, setNotification] = useState(null);

  // States for Config
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('promoFlashConfig');
    return saved ? JSON.parse(saved) : { maintenanceMode: false, globalLimit: 50 };
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { count: usersCount } = await supabase.from('profiles').select('id', { count: 'exact' });
      const { data: stores, count: storesCount } = await supabase.from('stores').select('*', { count: 'exact' });
      const { count: generatedCount } = await supabase.from('coupons').select('id', { count: 'exact' });
      const { count: redeemedCount } = await supabase.from('coupons').select('id', { count: 'exact' }).eq('status', 'redeemed');
      
      setStats({
        users: usersCount || 0,
        stores: storesCount || 0,
        generated: generatedCount || 0,
        redeemed: redeemedCount || 0
      });

      // Fetch offers count per store
      if (stores) {
        const storesWithCounts = await Promise.all(stores.map(async (st) => {
          const { count: activeOffers } = await supabase
            .from('offers')
            .select('id', { count: 'exact' })
            .eq('store_id', st.id)
            .gt('expires_at', new Date().toISOString())
            .gt('current_stock', 0);
          return { ...st, activeOffers: activeOffers || 0 };
        }));
        setStoresList(storesWithCounts);
      }

      // Fetch users list
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      setUsersList(profiles || []);

    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
      
      setUsersList(usersList.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showNotification('Rol actualizado correctamente');
    } catch (err) {
      alert('Error al actualizar rol: ' + err.message);
    }
  };

  const handleStoreStatusToggle = async (storeId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('stores')
        .update({ status: newStatus })
        .eq('id', storeId);

      if (error) throw error;
      
      setStoresList(storesList.map(s => s.id === storeId ? { ...s, status: newStatus } : s));
      showNotification('Estado de tienda actualizado');
    } catch (err) {
      alert('Error al actualizar estado: ' + err.message);
    }
  };

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    localStorage.setItem('promoFlashConfig', JSON.stringify(newConfig));
    showNotification('Configuración guardada localmente');
  };

  const conversionRate = stats.generated > 0 ? ((stats.redeemed / stats.generated) * 100).toFixed(1) : 0;

  const renderContent = () => {
    if (loading) return <p>Cargando información del sistema...</p>;

    switch (activeView) {
      case 'vista-general':
        return (
          <div className="stats-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="stat-card card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
                <Users size={24} style={{ color: '#3b82f6' }} />
              </div>
              <div className="stat-details">
                <p className="stat-label">Usuarios Registrados</p>
                <h3 className="stat-value">{stats.users}</h3>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                <Store size={24} style={{ color: '#8b5cf6' }} />
              </div>
              <div className="stat-details">
                <p className="stat-label">Tiendas Físicas</p>
                <h3 className="stat-value">{stats.stores}</h3>
              </div>
            </div>

            <div className="stat-card card">
              <div className="stat-icon check-icon-bg">
                <QrCode size={24} className="text-success" />
              </div>
              <div className="stat-details">
                <p className="stat-label">Cupones Canjeados</p>
                <h3 className="stat-value">{stats.redeemed}</h3>
              </div>
            </div>
            
            <div className="stat-card card">
              <div className="stat-icon qr-icon-bg">
                <TrendingUp size={24} className="text-primary" />
              </div>
              <div className="stat-details">
                <p className="stat-label">Conversión Global</p>
                <h3 className="stat-value">{conversionRate}%</h3>
              </div>
            </div>
          </div>
        );

      case 'tiendas':
        return (
          <section className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Gestión de Tiendas Registradas</h3>
            {storesList.length === 0 ? (
              <p className="text-secondary">No hay tiendas registradas aún.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <th style={{ padding: '0.75rem 0' }}>Nombre de Tienda</th>
                      <th style={{ padding: '0.75rem 0' }}>Gerente (ID)</th>
                      <th style={{ padding: '0.75rem 0' }}>Ofertas Activas</th>
                      <th style={{ padding: '0.75rem 0' }}>Estado / Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storesList.map(st => (
                      <tr key={st.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem 0', fontWeight: 500 }}>{st.name}</td>
                        <td style={{ padding: '1rem 0', fontSize: '0.875rem' }} title={st.manager_id}>{st.manager_id.substring(0,8)}...</td>
                        <td style={{ padding: '1rem 0' }}>{st.activeOffers}</td>
                        <td style={{ padding: '1rem 0' }}>
                          <button 
                            onClick={() => handleStoreStatusToggle(st.id, st.status)}
                            style={{ 
                              color: st.status === 'active' ? 'var(--success-color)' : 'var(--text-secondary)', 
                              backgroundColor: st.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)', 
                              padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer' 
                            }}>
                            {st.status === 'active' ? '🟢 Activa (Desactivar)' : '⚪ Inactiva (Activar)'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );

      case 'usuarios':
        return (
          <section className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Asignación de Roles de Usuario</h3>
            <p className="text-secondary mb-4" style={{ fontSize: '0.875rem' }}>Selecciona el rol en el menú desplegable para actualizarlo inmediatamente.</p>
            {usersList.length === 0 ? (
              <p className="text-secondary">No se encontraron usuarios.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <th style={{ padding: '0.75rem 0' }}>Correo Electrónico</th>
                      <th style={{ padding: '0.75rem 0' }}>Rol en Plataforma</th>
                      <th style={{ padding: '0.75rem 0' }}>Fecha de Registro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem 0', fontWeight: 500 }}>{u.email}</td>
                        <td style={{ padding: '1rem 0' }}>
                          <select 
                            value={u.role || 'customer'} 
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            style={{
                              padding: '0.25rem 0.5rem', 
                              borderRadius: '4px', 
                              border: '1px solid var(--border-color)',
                              outline: 'none',
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              backgroundColor: u.role === 'super_admin' ? 'rgba(239, 68, 68, 0.1)' : u.role === 'store_manager' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                              color: u.role === 'super_admin' ? '#ef4444' : u.role === 'store_manager' ? '#3b82f6' : 'var(--success-color)'
                            }}
                          >
                            <option value="customer">Cliente</option>
                            <option value="store_manager">Gerente</option>
                            <option value="super_admin">Súper Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: '1rem 0', fontSize: '0.875rem' }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );

      case 'configuracion':
        return (
          <section className="card" style={{ padding: '1.5rem', maxWidth: '600px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Configuración del Sistema</h3>
            <p className="text-secondary mb-4">Ajustes globales de la plataforma PromoFlash.</p>
            
            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0 }}>Modo Mantenimiento</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Bloquea el acceso a clientes temporalmente.</p>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    style={{ transform: 'scale(1.5)', marginRight: '10px' }} 
                    checked={config.maintenanceMode}
                    onChange={(e) => handleConfigChange('maintenanceMode', e.target.checked)}
                  />
                  {config.maintenanceMode ? 'Activado' : 'Desactivado'}
                </label>
              </div>
            </div>

            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0 }}>Límite Global de Ofertas</h4>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Máximo de ofertas activas por tienda.</p>
                </div>
                <input 
                  type="number" 
                  value={config.globalLimit} 
                  onChange={(e) => handleConfigChange('globalLimit', parseInt(e.target.value))}
                  style={{ padding: '0.5rem', width: '80px', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none' }} 
                />
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch (activeView) {
      case 'vista-general': return 'Vista General de la Plataforma';
      case 'tiendas': return 'Gestión de Tiendas';
      case 'usuarios': return 'Directorio de Usuarios';
      case 'configuracion': return 'Configuración';
      default: return 'Panel de Control';
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 1000,
          backgroundColor: 'var(--success-color)', color: 'white',
          padding: '1rem 1.5rem', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <CheckCircle2 size={18} /> {notification}
        </div>
      )}

      <aside className="sidebar">
        <h2 className="brand-title sidebar-brand">PromoFlash</h2>
        <div className="sidebar-store-info">
          <p className="text-secondary" style={{fontSize: '0.875rem'}}>Súper Administrador</p>
          <p style={{fontWeight: 600}}>Panel de Control</p>
        </div>
        <nav className="sidebar-nav" style={{flex: 1}}>
          <button 
            className={`nav-item ${activeView === 'vista-general' ? 'active' : ''}`}
            onClick={() => setActiveView('vista-general')}
            style={{width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'}}
          >
            <Activity size={18} /> Vista General
          </button>
          <button 
            className={`nav-item ${activeView === 'tiendas' ? 'active' : ''}`}
            onClick={() => setActiveView('tiendas')}
            style={{width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'}}
          >
            <Store size={18} /> Tiendas
          </button>
          <button 
            className={`nav-item ${activeView === 'usuarios' ? 'active' : ''}`}
            onClick={() => setActiveView('usuarios')}
            style={{width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'}}
          >
            <Users size={18} /> Usuarios
          </button>
          <button 
            className={`nav-item ${activeView === 'configuracion' ? 'active' : ''}`}
            onClick={() => setActiveView('configuracion')}
            style={{width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center'}}
          >
            <Settings size={18} /> Configuración
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
          <h1>{getPageTitle()}</h1>
        </header>

        {renderContent()}
      </main>
    </div>
  );
}
