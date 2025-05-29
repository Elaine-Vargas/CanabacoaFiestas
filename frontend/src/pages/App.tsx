import '../styles/App.scss';
import Principal from './Principal'; // This stays as a regular import
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ColorTheme from '../functions/ColorTheme';
import { UserProvider } from '../context/UserContext';

// Lazy loaded pages
const AboutUs = lazy(() => import('./AboutUs'));
const Services = lazy(() => import('./Services'));
const UserConfig = lazy(() => import('./UserConfig'));
const UserLogin = lazy(() => import('./UserLogin'));
const DashboardLayout = lazy(() => import('../components/DashboardLayout'));
const WelcomeMenu = lazy(() => import('./ServicesSubpages/WelcomeMenu'));
const Rent = lazy(() => import('./ServicesSubpages/Rent'));
const Decor = lazy(() => import('./ServicesSubpages/Decor'));
const Catering = lazy(() => import('./ServicesSubpages/Catering'));
const Supervision = lazy(() => import('./ServicesSubpages/Supervision'));
const Transportation = lazy(() => import('./ServicesSubpages/Transportation'));
const AssemblyAndDisassembly = lazy(() => import('./ServicesSubpages/AssemblyAndDisassembly'));

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
            <Route path="/Login" element={<UserLogin />} />
            <Route path="/Ajustes-Usuario" element={<UserConfig />} />

            <Route path="/Menu-Servicios/*" element={<DashboardLayout />}>
              <Route path="Bienvenida" element={<WelcomeMenu />} />
              <Route path="Alquiler" element={<Rent />} />
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
