import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

interface DecodedToken {
  exp: number; // Tiempo de expiración (en segundos)
}

const SessionTimer = () => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const updateTimeLeft = () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const decoded: DecodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        const timeRemaining = decoded.exp - currentTime;

        if (timeRemaining <= 0) {
          setTimeLeft('Sesión expirada');
          return;
        }

        const minutes = Math.floor(timeRemaining / 60);
        const seconds = Math.floor(timeRemaining % 60);
        setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } catch (err) {
        setTimeLeft('Error al calcular tiempo');
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
   
    {/*Tiempo restante*/}
    {/*
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      padding: '5px 10px',
      borderRadius: '5px',
      fontSize: '0.6em',
      fontFamily: "Nunito Sans",
      fontWeight: "700",
      color: 'var(--color-text)',
      zIndex: 1000
    }}>
      Tiempo restante: {timeLeft}
    </div>
    */}
    </>
  );
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isTokenValid, setIsTokenValid] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsTokenValid(false);
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const checkTokenExpiration = () => {
        const currentTime = Date.now() / 1000; // en segundos
        if (decoded.exp < currentTime) {
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          setIsTokenValid(false);
        }
      };

      checkTokenExpiration(); // Verificación inmediata
      const interval = setInterval(checkTokenExpiration, 1000); // Verifica cada segundo

      return () => clearInterval(interval); // Limpiar intervalo
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('userData');
      setIsTokenValid(false);
    }
  }, []);

  if (!localStorage.getItem('userData') || !isTokenValid) {
    return <Navigate to="/Login" replace />;
  }

  return (
    <>
      <SessionTimer />
      {children}
    </>
  );
};

export default ProtectedRoute;
