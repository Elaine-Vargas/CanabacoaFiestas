import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const userData = localStorage.getItem('userData');
  const token = localStorage.getItem('token');

  if (!userData || !token) {
    // Si no hay datos de usuario o token, redirigir al login
    return <Navigate to="/" replace />;
  }

  try {
    // Verificar que userData sea un JSON válido
    JSON.parse(userData);
    return <>{children}</>;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Si userData no es un JSON válido, limpiar y redirigir
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute; 