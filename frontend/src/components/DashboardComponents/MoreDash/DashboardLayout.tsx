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
      
      if (!token) {
        navigate('/Login');
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

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
