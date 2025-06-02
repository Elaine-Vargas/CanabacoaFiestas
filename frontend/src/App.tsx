import '../styles/App.scss';
import Principal from './pages/Principal'; 
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ColorTheme from './functions/ColorTheme';
import { UserProvider } from './contexts/UserContext';

// Lazy loaded pages
const AboutUs = lazy(() => import('./pages/AboutUs'));
const Services = lazy(() => import('./pages/Services'));
const UserConfig = lazy(() => import('./pages/ServicesSubpages/UserConfig'));
const UserLogin = lazy(() => import('./pages/UserLogin'));
const DashboardLayout = lazy(() => import('./components/DashboardLayout'));
const WelcomeMenu = lazy(() => import('./pages/ServicesSubpages/WelcomeMenu'));
const Rent = lazy(() => import('./pages/ServicesSubpages/Rent'));
const Decor = lazy(() => import('./pages/ServicesSubpages/Decor'));
const Catering = lazy(() => import('./pages/ServicesSubpages/Catering'));
const Supervision = lazy(() => import('./pages/ServicesSubpages/Supervision'));
const Transportation = lazy(() => import('./pages/ServicesSubpages/Transportation'));
const AssemblyAndDisassembly = lazy(() => import('./pages/ServicesSubpages/AssemblyAndDisassembly'));
const Catalogo = lazy(() => import('./pages/Catalog'));
const Eventos = lazy(() => import('./pages/ServicesSubpages/Eventos'));

import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <UserProvider>
      <div id="ColorTheme">
        <ColorTheme colorLight="none" colorDark="none" />
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/Principal" replace />} />
            <Route path="/Principal" element={<Principal />} />
            <Route path="/Nosotros" element={<AboutUs />} />
            <Route path="/Servicios" element={<Services />} />
            <Route path="/Catalogo" element={<Catalogo />} />
            <Route path="/Login" element={
              <PublicRoute>
                <UserLogin />
              </PublicRoute>
            } />
        
            <Route path="/Menu-Servicios/*" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="Bienvenida" replace />} />
              <Route path="Bienvenida" element={<WelcomeMenu eventsInProcess={38} averageRating={4.0} totalUsers={150} quotations={[]}/>} />
              <Route path="Ajustes-Usuario" element={<UserConfig />} />
              <Route path="Alquiler" element={<Rent />} />
              <Route path="Eventos" element={<Eventos />} />
              <Route path="Decoracion" element={<Decor />} />
              <Route path="Catering" element={<Catering />} />
              <Route path="Supervision" element={<Supervision />} />
              <Route path="Transporte" element={<Transportation />} />
              <Route path="Montaje-Desmontaje" element={<AssemblyAndDisassembly />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </Suspense>
    </UserProvider>
  );
}

export default App;