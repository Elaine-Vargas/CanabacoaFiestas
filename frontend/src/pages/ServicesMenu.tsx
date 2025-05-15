import { useState } from "react";
import { FaUser, FaBeer, FaCar, FaConciergeBell, FaTachometerAlt, FaBoxOpen } from 'react-icons/fa';
import Alquiler from './ServicesSubpages/Rent'; 
import Decoracion from './ServicesSubpages/Decor'; 
import Catering from './ServicesSubpages/Catering';  
import Transporte from './ServicesSubpages/Transportation'; 
import Supervision from './ServicesSubpages/Supervision'; 
import MonDesmon from './ServicesSubpages/AssemblyAndDisassembly'; 



export default function Dashboard() {
  const [selectedService, setSelectedService] = useState<string>('inicio');

  const renderService = () => {
    switch (selectedService) {
      case 'alquiler':
        return <Alquiler />;
      case 'decoracion':
        return <Decoracion />;
      case 'catering':
        return <Catering />;
      case 'transporte':
        return <Transporte />;
      case 'supervision':
        return <Supervision />;
      case 'mondesmon':
        return <MonDesmon />;
      case 'inicio':
        return <div><h2>Bienvenido al Dashboard</h2><p>Selecciona un servicio desde el menú de la izquierda.</p></div>;
      default:
        return <div><h2>Bienvenido al Dashboard</h2><p>Selecciona un servicio desde el menú de la izquierda.</p></div>;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="user-profile">
          <FaUser size={30} />
          <p>Editar cuenta</p>
        </div>
        <ul>
          <li onClick={() => setSelectedService('inicio')}><FaTachometerAlt /> Inicio</li>
          <li onClick={() => setSelectedService('alquiler')}><FaBoxOpen /> Alquiler</li>
          <li onClick={() => setSelectedService('decoracion')}><FaBeer /> Decoración</li>
          <li onClick={() => setSelectedService('catering')}><FaConciergeBell /> Catering</li>
          <li onClick={() => setSelectedService('transporte')}><FaCar /> Transporte</li>
          <li onClick={() => setSelectedService('supervision')}><FaTachometerAlt /> Supervisión</li>
          <li onClick={() => setSelectedService('mondesmon')}><FaTachometerAlt /> Montaje y Desmontaje</li>
        </ul>
      </div>

      <div className="content-area">
        {renderService()}
      </div>
    </div>
  );
}
