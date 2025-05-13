import '../styles/App.scss'
import Principal from './Principal'
import AboutUs from './AboutUs';
import Services from './Services';
import ServicesMenu from './ServicesMenu';
import UserConfig from './UserConfig';
import UserLogin from './UserLogin';
import UserSignIn from './UserSignIn';
import AssemblyAndDisassembly from './ServicesSubpages/AssemblyAndDisassembly';
import Rent from './ServicesSubpages/Rent'; 
import Decor from './ServicesSubpages/Decor';
import Transportation from './ServicesSubpages/Transportation';
import Supervision from './ServicesSubpages/Supervision';
import Catering from './ServicesSubpages/Catering';
import '../styles/theme.scss';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {

  return (
    <>
  <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Principal" replace />} />
        <Route path="/Principal" element={<Principal />} />
        <Route path="/SobreNosotros" element={<AboutUs />} />
        <Route path="/Servicios" element={<Services />} />
        <Route path="/Login" element={<UserLogin />} />
        <Route path="/Registro" element={<UserSignIn />} />
        <Route path="/Ajustes-Usuario" element={<UserConfig />} />


  {/* Rutas anidadas dentro de Usuarios */}
  <Route path="/Menu-Servicios" element={<ServicesMenu />} />

        <Route path="/Menu/Montaje-Desmontaje" element={<AssemblyAndDisassembly />} />
        <Route path="/Menu/Alquiler" element={<Rent />} />
        <Route path="/Menu/Decoracion" element={<Decor />} />
        <Route path="/Menu/Transporte" element={<Transportation />} />
        <Route path="/Menu/Supervision" element={<Supervision />} />
        <Route path="/Menu/Catering" element={<Catering />} />
  
      </Routes>
   
    </BrowserRouter>
    </>
  )
}

export default App
