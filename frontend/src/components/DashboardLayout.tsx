import { Outlet, useLocation } from "react-router-dom";
import ServicesMenu from "./ServicesMenu";
import "../styles/DashboardServices.scss";

export default function DashboardLayout() {
  const location = useLocation();
  const currentPath = location.pathname.split("/").pop() || "Bienvenida";

  return (
    <div className="dashboard-container">
      <ServicesMenu selectedService={currentPath} />
      <div className="content-area">
        <Outlet />
      </div>
    </div>
  );
}
