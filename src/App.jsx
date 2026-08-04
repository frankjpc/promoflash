import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Feed from './pages/Feed';
import Categories from './pages/Categories';
import MyCoupons from './pages/MyCoupons';
import Notifications from './pages/Notifications';
import CustomerProfile from './pages/CustomerProfile';
import CustomerLayout from './layouts/CustomerLayout';
import QRView from './pages/QRView';
import TiendaDashboard from './pages/TiendaDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';

// Componente para proteger las rutas
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Esperar a que el perfil se cargue si necesitamos validar roles específicos
  if (allowedRoles && !profile) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando permisos...</div>;
  }

  // Si se exige un rol específico, validamos
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    // Redirigir según el rol real
    if (profile.role === 'store_manager') return <Navigate to="/tienda" replace />;
    if (profile.role === 'super_admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/feed" replace />;
  }

  return children;
};

// Componente para la redirección de la raíz /
const RootRedirect = () => {
  const { user, profile, loading } = useAuth();

  if (loading) return null;
  
  if (!user) return <Navigate to="/login" replace />;
  
  // Esperar a que el perfil se cargue antes de decidir la ruta
  if (!profile) return null;
  
  if (profile.role === 'store_manager') return <Navigate to="/tienda" replace />;
  if (profile.role === 'super_admin') return <Navigate to="/admin" replace />;
  
  return <Navigate to="/feed" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={
            <ProtectedRoute allowedRoles={['customer', 'store_manager', 'super_admin']}>
              <CustomerLayout />
            </ProtectedRoute>
          }>
            <Route path="/feed" element={<Navigate to="/explore" replace />} />
            <Route path="explore" element={<Feed />} />
            <Route path="categories" element={<Categories />} />
            <Route path="cart" element={<MyCoupons />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>
          
          <Route path="/qr" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <QRView />
            </ProtectedRoute>
          } />
          
          <Route path="/tienda" element={
            <ProtectedRoute allowedRoles={['store_manager', 'super_admin']}>
              <TiendaDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
