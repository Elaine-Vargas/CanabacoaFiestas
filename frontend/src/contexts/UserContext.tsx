import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'admin' | 'cliente' | 'empleado' | 'conductor' | null;

interface Permission {
  id: string;
  name: string;
}

interface UserContextType {
  userRole: UserRole;
  hasPermission: (permissionId: string) => boolean;
  userPermissions: Permission[];
  setUserRole: (role: UserRole) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {

  const apiUrl = import.meta.env.VITE_API_BASE_URL;


  const [userRole, setUserRole] = useState<UserRole>('cliente');
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const response = await fetch(`${apiUrl}/auth/register-client`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const userData = await response.json();
        const role = userData.id_rol === 1 ? 'admin' : userData.id_rol === 2 ? 'cliente' : userData.id_rol === 3 ? 'empleado' : 'conductor';
        setUserRole(role);
        localStorage.setItem('userRole', role);

        // Fetch permissions after getting user role
        if (userData.id_rol) {
          const permissionsResponse = await fetch(`/api/permissions/${userData.id_rol}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (!permissionsResponse.ok) {
            console.error('Error al obtener permisos:', await permissionsResponse.text());
            setUserPermissions([]);
          } else {
            const permissionsData = await permissionsResponse.json();
            setUserPermissions(permissionsData);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        setUserRole(null);
        setUserPermissions([]);
      }
    };
    fetchUserData();
  }, []);

  const hasPermission = (permissionId: string) => {
    if (userRole === 'admin') return true;
    return userPermissions.some((permission: Permission) => permission.id === permissionId);
  };

  return (
    <UserContext.Provider value={{ userRole, hasPermission, userPermissions, setUserRole }}>
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