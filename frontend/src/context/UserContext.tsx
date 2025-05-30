import React, { createContext, useContext, useState, useEffect } from 'react';

type UserRole = 'admin' | 'client' | 'supervisor';

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
  const [userRole, setUserRole] = useState<UserRole>('client');
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        if (userData.rol) {
          const role = userData.rol === 1 ? 'admin' : userData.rol === 2 ? 'client' : 'supervisor';
          setUserRole(role);
          // Permisos por defecto para el administrador
          if (role === 'admin') {
            setUserPermissions([
              { id: 'view_transportation', name: 'Ver Transporte' },
              { id: 'view_supervision', name: 'Ver Supervisión' },
              { id: 'view_assembly', name: 'Ver Montaje y Desmontaje' },
              { id: 'manage_transportation', name: 'Gestionar Transporte' },
              { id: 'manage_supervision', name: 'Gestionar Supervisión' },
              { id: 'manage_assembly', name: 'Gestionar Montaje y Desmontaje' }
            ]);
          } else {
            // Obtener permisos basados en el rol distinto a admin
            try {
              const permissionsResponse = await fetch(`/api/permissions/${userData.rol}`);
              if (permissionsResponse.ok) {
                const permissionsData = await permissionsResponse.json();
                setUserPermissions(permissionsData);
              } else {
                setUserPermissions([]);
              }
            } catch {
              setUserPermissions([]);
            }
          }
          return;
        }
        // Si no hay userData válido, intentar obtener desde el backend
        const token = localStorage.getItem('token');
        if (!token) {
          setUserRole('client');
          setUserPermissions([]);
          return;
        }
        const response = await fetch('/api/auth/current', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          setUserRole('client');
          setUserPermissions([]);
          return;
        }
        const data = await response.json();
        if (data.id_rol) {
          const role = data.id_rol === 1 ? 'admin' : data.id_rol === 2 ? 'client' : 'supervisor';
          setUserRole(role);
          if (role === 'admin') {
            setUserPermissions([
              { id: 'view_transportation', name: 'Ver Transporte' },
              { id: 'view_supervision', name: 'Ver Supervisión' },
              { id: 'view_assembly', name: 'Ver Montaje y Desmontaje' },
              { id: 'manage_transportation', name: 'Gestionar Transporte' },
              { id: 'manage_supervision', name: 'Gestionar Supervisión' },
              { id: 'manage_assembly', name: 'Gestionar Montaje y Desmontaje' }
            ]);
          } else {
            try {
              const permissionsResponse = await fetch(`/api/permissions/${data.id_rol}`);
              if (permissionsResponse.ok) {
                const permissionsData = await permissionsResponse.json();
                setUserPermissions(permissionsData);
              } else {
                setUserPermissions([]);
              }
            } catch {
              setUserPermissions([]);
            }
          }
        } else {
          setUserRole('client');
          setUserPermissions([]);
        }
      } catch (error) {
        // No hay sesión activa o error inesperado
        setUserRole('client');
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