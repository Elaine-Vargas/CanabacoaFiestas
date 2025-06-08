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
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setUserRole(null);
          setIsUserLoading(false);
          return;
        }

        const response = await fetch(`${apiUrl}/auth/current`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const data = await response.json();
        const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        // Mapear el rol numérico al tipo UserRole
        let role: UserRole = null;
        switch (storedUserData.rol) {
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
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        setUserRole(null);
      } finally {
        setIsUserLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      let role: UserRole = null;
      switch (storedUserData.rol) {
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
