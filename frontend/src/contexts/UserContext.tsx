import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'admin' | 'cliente' | 'empleado' | null;

interface UserContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isUserLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const apiUrl = `${import.meta.env.VITE_API_URL}/${import.meta.env.BACKEND_PORT}/${import.meta.env.VITE_API_BASE_URL}`;
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const updateUserRole = (storedUserData: any) => {
    let role: UserRole = null;
    // Cambiado de 'rol' a 'id_rol' para compatibilidad con la respuesta del backend
    const userRoleId = storedUserData?.id_rol ?? storedUserData?.rol;
    switch (userRoleId) {
      case 1:
        role = 'admin';
        break;
      case 2:
        role = 'cliente';
        break;
      case 3:
        role = 'empleado';
        break;
      default:
        role = null;
    }
    setUserRole(role);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUserRole(null);
          setIsUserLoading(false);
          return;
        }

        const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        updateUserRole(storedUserData);

        const response = await fetch(`${apiUrl}/auth/current`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          // Token inválido o expirado
          setUserRole(null);
          localStorage.removeItem('token');
          localStorage.removeItem('userData');
          setIsUserLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const data = await response.json();
        console.log('Respuesta de /auth/current:', data); // <-- Log para depuración
        updateUserRole(data);
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        // Solo limpiar localStorage si el error fue 401 (ya manejado arriba)
        setUserRole(null);
        // No limpiar localStorage aquí para evitar perder sesión por errores de red
      } finally {
        setIsUserLoading(false);
      }
    };

    fetchUserData();
  }, [apiUrl]);

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        updateUserRole(storedUserData);
      } catch (error) {
        console.error('Error al procesar datos del usuario:', error);
        setUserRole(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <UserContext.Provider value={{ userRole, setUserRole, isUserLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};
