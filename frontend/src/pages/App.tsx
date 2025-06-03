import '../styles/basics/App.scss';
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ColorTheme from '../functions/ColorTheme';
import { UserProvider } from '../contexts/UserContext';

// Lazy loaded pages
const AboutUs = lazy(() => import('./AboutUs'));
const Services = lazy(() => import('./Services'));
const UserConfig = lazy(() => import('./ServicesSubpages/UserConfig'));
const UserLogin = lazy(() => import('./UserLogin'));
const DashboardLayout = lazy(() => import('../components/DashboardLayout'));
const WelcomeMenu = lazy(() => import('./ServicesSubpages/WelcomeMenu'));
const Rent = lazy(() => import('./ServicesSubpages/Rent'));
const Decor = lazy(() => import('./ServicesSubpages/Decor'));
const Catering = lazy(() => import('./ServicesSubpages/Catering'));
const Supervision = lazy(() => import('./ServicesSubpages/Supervision'));
const Transportation = lazy(() => import('./ServicesSubpages/Transportation'));
const AssemblyAndDisassembly = lazy(() => import('./ServicesSubpages/AssemblyAndDisassembly'));
const Catalogo = lazy(() => import('./Catalog'));
const Principal = lazy(() => import('./Principal')); // Ahora puede ser lazy-loaded
const PasswordRecovery = lazy(() => import ('./PassRecovery'));
const PasswordReset = lazy(() => import('./PasswordReset'));


import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
import PrincipalLayout from './PrincipalLayout'; // Importa el nuevo Layout
import { LoadingScreen } from '../components/LoadingScreen';

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
            {/* Nueva ruta para reset con token */}
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
              <Route path="Bienvenida" element={<WelcomeMenu eventsInProcess={38} averageRating={4.0} totalUsers={150} />} />
              <Route path="Ajustes-Usuario" element={<UserConfig />} />
              <Route path="Alquiler" element={<Rent />} />
              <Route path="Decoracion" element={<Decor />} />
              <Route path="Catering" element={<Catering />} />
              <Route path="Supervision" element={<Supervision />} />
              <Route path="Transporte" element={<Transportation />} />
              <Route path="Montaje-Desmontaje" element={<AssemblyAndDisassembly />} />
            </Route>
          </Routes>
        </BrowserRouter>
    </UserProvider>
  );
}

export default App;