import '../styles/basics/App.scss';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ColorTheme from '../functions/ColorTheme';
import { UserProvider } from '../contexts/UserContext';

// Lazy loaded pages
const AboutUs = lazy(() => import('./Principal/AboutUs'));
const Services = lazy(() => import('./Principal/Services'));
const UserConfig = lazy(() => import('./ServicesSubpages/UserConfig'));
const UserLogin = lazy(() => import('./Principal/UserLogin'));
const DashboardLayout = lazy(() => import('../components/DashboardComponents/MoreDash/DashboardLayout'));
const WelcomeMenu = lazy(() => import('./ServicesSubpages/WelcomeMenu'));
const Rent = lazy(() => import('./ServicesSubpages/Rent'));
const Catering = lazy(() => import('./ServicesSubpages/Catering'));
const Report = lazy(() => import('./ServicesSubpages/Report'));
const Catalogo = lazy(() => import('./Principal/Catalog'));
const Principal = lazy(() => import('./Principal/Principal'));
const PasswordRecovery = lazy(() => import ('./PassRecovery'));
const PasswordReset = lazy(() => import('./PasswordReset'));

import ProtectedRoute from '../components/Otros/ProtectedRoute';
import PublicRoute from '../components/Otros/PublicRoute';
import PrincipalLayout from './Principal/PrincipalLayout';
import { LoadingScreen } from '../components/Otros/LoadingScreen';

// Tipos para el mapeo de rutas
type RouteMapping = {
  [key: number]: string;
};

type RouteMappings = {
  [key: string]: RouteMapping;
};

// Componente para manejar redirecciones basadas en roles
const RoleBasedRedirect = () => {
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const rolId = Number(userData.rol);

  // Mapeo de rutas según el rol
  const routeMappings: RouteMappings = {
    'Alquiler': {
      1: 'Alquileres-Compras', // Admin
      2: 'Alquileres-Compras', // Cliente
      3: 'Alquileres-Compras', // Empleado
    },
    'Facturas': {
      1: 'Reportes-Facturas', // Admin
      2: 'Facturas', // Cliente
      3: 'Reportes-Facturas', // Empleado
    }
  };

  const path = location.pathname.split('/').pop() || '';
  const mapping = routeMappings[path];

  if (mapping && mapping[rolId]) {
    return <Navigate to={`/Menu-Servicios/${mapping[rolId]}`} replace />;
  }

  // Si no hay mapeo o el rol no está definido, redirigir a la página de bienvenida
  return <Navigate to="/Menu-Servicios/Bienvenida" replace />;
};

function App() {
  return (
    <UserProvider>
      <div id="ColorTheme">
        <ColorTheme colorLight="none" colorDark="none" />
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/Principal" replace />} />
          
          {/* Rutas bajo /Principal: Navbar persistente + Suspense interno */}
          <Route path="/Principal" element={<PrincipalLayout />}>
            <Route index element={<Principal />} />
            <Route path="Nosotros" element={<AboutUs />} />
            <Route path="Servicios" element={<Services />} />
            <Route path="Catalogo" element={<Catalogo />} />
          </Route>

          <Route path="/Login" element={
            <PublicRoute>
              <Suspense fallback={<LoadingScreen />}>
                <UserLogin />
              </Suspense>
            </PublicRoute>
          }>
            <Route path="Recuperar-Contrasena" element={
              <PublicRoute>
                <Suspense fallback={<LoadingScreen />}>
                  <PasswordRecovery />
                </Suspense>
              </PublicRoute>
            } />
            <Route path="Recuperar-Contrasena/Restablecer" element={
              <PublicRoute>
                <Suspense fallback={<LoadingScreen />}>
                  <PasswordReset />
                </Suspense>
              </PublicRoute>
            } />
          </Route>

          <Route path="/Menu-Servicios/*" element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingScreen />}>
                <DashboardLayout />
              </Suspense>
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="Bienvenida" replace />} />
            <Route path="Bienvenida" element={<WelcomeMenu/>} />
            <Route path="Ajustes-Usuario" element={<UserConfig />} />
            
            {/* Rutas con redirección basada en roles */}
            <Route path="Alquiler" element={<RoleBasedRedirect />} />
            <Route path="Alquileres-Compras" element={<Rent />} />
            <Route path="Catering" element={<Catering />} />
            <Route path="Facturas" element={<Report />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;