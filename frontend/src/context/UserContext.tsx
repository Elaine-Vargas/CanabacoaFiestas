import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { UserRole, Permission } from '../pages/ServicesSubpages/WelcomeMenu';

interface UserContextType {
  userRole: UserRole;
  hasPermission: (permissionId: string) => boolean;
  userPermissions: Permission[];
  setUserRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<UserRole>('client');
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    // Aquí iría la lógica para obtener el rol y permisos del usuario desde la API
    const fetchUserData = async () => {
      try {
        // Simulamos la obtención de datos del usuario
        // En producción, esto vendría de tu API
        const response = await fetch('/api/user/current');
        const data = await response.json();
        
        if (data.role) {
          setUserRole(data.role);
          // Obtener permisos basados en el rol
          const permissionsResponse = await fetch(`/api/permissions/${data.role}`);
          const permissionsData = await permissionsResponse.json();
          setUserPermissions(permissionsData);
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        // En caso de error, establecer rol por defecto
        setUserRole('client');
      }
    };

    fetchUserData();
  }, []);

  const hasPermission = (permissionId: string) => {
    return userPermissions.some((permission: Permission) => permission.id === permissionId);
  };

  return (
    <UserContext.Provider value={{ userRole, hasPermission, userPermissions, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
}; 