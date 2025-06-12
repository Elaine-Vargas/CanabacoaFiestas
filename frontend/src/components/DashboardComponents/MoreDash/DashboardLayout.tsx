import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ServicesMenu from "./ServicesMenu";
import "../../../styles/dashboard/DashboardServices.scss";

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const pathSegments = location.pathname.split("/");
  const currentPath = pathSegments[pathSegments.length - 1] || "Bienvenida";
  
  // Map Alquileres-Compras back to Alquiler for menu highlighting
  const selectedService = currentPath === "Alquileres-Compras" ? "Alquiler" : currentPath;

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole');
      
      if (!token) {
        navigate('/Login');
        return;
      }

      // Verificar que el usuario tenga acceso a la ruta actual
      if (currentPath === 'Bienvenida') {
        if (userRole === 'cliente' && location.pathname.includes('/admin')) {
          navigate('/dashboard/client');
        } else if (userRole === 'admin' && location.pathname.includes('/client')) {
          navigate('/dashboard/admin');
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [location.pathname, navigate, currentPath]);

  if (isLoading) {
    return <div className="loading-container">Cargando...</div>;
  }

  return (
    <div className="dashboard-container">
      <ServicesMenu selectedService={selectedService} />
      <div className="content-area">
        <Outlet />
      </div>
    </div>
  );
}
