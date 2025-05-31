import React from 'react';
//import { useUser } from '../context/UserContext';
import '../styles/dashboard/ServicesSubpages.scss';

export type UserRole = 'admin' | 'coordinator' | 'inventory' | 'client';

interface ServiceBaseProps<T> {
  title: string;
  children: React.ReactNode;
  stats: T;
}

const ServiceBase = <T extends object>({ title, children }: ServiceBaseProps<T>) => {
 // const { userRole } = useUser();

  return (
    <div className="service-base">
      <h1 className="service-title">{title}</h1>
      {children}
    </div>
  );
};

export default ServiceBase; 