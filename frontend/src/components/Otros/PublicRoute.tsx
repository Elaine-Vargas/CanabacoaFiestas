import { Navigate } from 'react-router-dom';

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
  const userData = localStorage.getItem('userData');
  const token = localStorage.getItem('token');

  if (userData && token) {
    try {
      // Verificar que userData sea un JSON válido
      JSON.parse(userData);
      // Si hay datos válidos, redirigir al menú de servicios
      return <Navigate to="/Menu-Servicios/Bienvenida" replace />;
    } catch {
      // Si los datos no son válidos, limpiar y permitir acceso
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
    }
  }

  return <>{children}</>;
};

export default PublicRoute; 