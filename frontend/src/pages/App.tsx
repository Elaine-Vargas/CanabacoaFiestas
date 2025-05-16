import '../styles/App.scss'
//pages
import Principal from './Principal';
import AboutUs from './AboutUs';
import Services from './Services';
import UserConfig from './UserConfig';
import UserLogin from './UserLogin';
import DashboardLayout from "../components/DashboardLayout";
import WelcomeMenu from "./ServicesSubpages/WelcomeMenu";
import Rent from "./ServicesSubpages/Rent";
import Decor from "./ServicesSubpages/Decor";
import Catering from "./ServicesSubpages/Catering";
import Supervision from "./ServicesSubpages/Supervision";
import Transportation from "./ServicesSubpages/Transportation";
import AssemblyAndDisassembly from "./ServicesSubpages/AssemblyAndDisassembly";

//css
import '../styles/theme.scss';
//router 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from '../components/LoadingScreen';
import ColorTheme from '../functions/ColorTheme';

function App() {
  
  return (
    <>
  <div id="ColorTheme">
      <ColorTheme colorLight="none" colorDark="none" />
    </div>
  <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Principal" replace />} />
        <Route path="/Principal" element={<Principal />} />
        <Route path="/Nosotros" element={<AboutUs />} />
        <Route path="/Servicios" element={<Services />} />
        <Route path="/Login" element={<UserLogin />} />
        <Route path="/Ajustes-Usuario" element={<UserConfig />} />
          <Route path="/Loading" element={<LoadingScreen />} />
        
        
        <Route path="/" element={<Navigate to="/Menu-Servicios/Bienvenida" />} />

        <Route path="/Menu-Servicios/*" element={<DashboardLayout />}>
        <Route path="Bienvenida" element={<WelcomeMenu />} />
        <Route path="Alquiler" element={<Rent />} />
        <Route path="Decoración" element={<Decor />} />
        <Route path="Catering" element={<Catering />} />
        <Route path="Supervisión" element={<Supervision />} />
        <Route path="Transporte" element={<Transportation />} />
        <Route path="Montaje-Desmontaje" element={<AssemblyAndDisassembly />} />
      </Route>

  
      </Routes>
   
    </BrowserRouter>
    </>
  )
}

export default App