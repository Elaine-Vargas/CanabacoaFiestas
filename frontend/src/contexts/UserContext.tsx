import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'admin' | 'cliente' | 'empleado' | 'conductor' | null;

interface UserContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [userRole, setUserRole] = useState<UserRole>('cliente');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
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

        const userData = await response.json();
        const role = userData.id_rol === 1 ? 'admin' : 
                     userData.id_rol === 2 ? 'cliente' : 
                     userData.id_rol === 3 ? 'empleado' : 'conductor';
        setUserRole(role);
        localStorage.setItem('userRole', role);
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        setUserRole(null);
      }
    };
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};