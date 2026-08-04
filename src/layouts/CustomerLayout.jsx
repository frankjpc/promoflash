import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Search, Grid, ShoppingBag, Bell, User } from 'lucide-react';
import './CustomerLayout.css';

export default function CustomerLayout() {
  return (
    <div className="customer-layout">
      {/* El contenido de la pestaña actual se renderiza aquí */}
      <main className="customer-content">
        <Outlet />
      </main>

      {/* Barra de Navegación Inferior */}
      <nav className="bottom-nav">
        <NavLink to="/explore" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Search size={22} />
          <span>Explore</span>
        </NavLink>
        
        <NavLink to="/categories" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Grid size={22} />
          <span>Categories</span>
        </NavLink>
        
        <NavLink to="/cart" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShoppingBag size={22} />
          <span>Mis Cupones</span>
        </NavLink>
        
        <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Bell size={22} />
          <span>Notifications</span>
        </NavLink>
        
        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={22} />
          <span>Profile</span>
        </NavLink>
      </nav>
    </div>
  );
}
