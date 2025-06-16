import { message } from 'antd';

import { apiUrl } from '../../../config';

// Función para actualizar el estado de un evento
export const updateEventoEstado = async (id_evento: number): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/evento/${id_evento}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ estado: 'Cancelada' })
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el estado del evento');
    }

    message.success('Evento cancelado exitosamente');
    return true;
  } catch (error) {
    console.error('Error al actualizar estado de evento:', error);
    message.error('Error al cancelar el evento');
    return false;
  }
};

// Función para actualizar el estado de un usuario
export const updateUsuarioEstado = async (cedula: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${apiUrl}/usuario/${cedula}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ estado: 'Eliminado' })
    });

    if (!response.ok) {
      throw new Error('Error al actualizar el estado del usuario');
    }

    message.success('Usuario eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('Error al actualizar estado de usuario:', error);
    message.error('Error al eliminar el usuario');
    return false;
  }
};

// Función para actualizar el estado de un proveedor
export const updateProveedorEstado = async (id_proveedor: number) => {
  try {
    const token = localStorage.getItem('token');
    const url = `${apiUrl}/proveedor/${id_proveedor}/estado`;
    console.log('Actualizando estado de proveedor:', url);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ estado_proveedor: 'Eliminado' })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error response:', errorData);
      throw new Error('Error al actualizar el estado del proveedor');
    }

    message.success('Proveedor eliminado exitosamente');
    return true;
  } catch (error) {
    console.error('Error completo:', error);
    message.error('Error al eliminar el proveedor');
    return false;
  }
};

// Función para actualizar el estado de una decoración
export const updateDecoracionEstado = async (id_decoracion: number) => {
  try {
    const token = localStorage.getItem('token');
    const url = `${apiUrl}/decoracion/${id_decoracion}`;
    console.log('Actualizando estado de decoración:', url);
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ estado_decoracion: 'Eliminado' })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error response:', errorData);
      throw new Error('Error al actualizar el estado de la decoración');
    }

    message.success('Decoración eliminada exitosamente');
    return true;
  } catch (error) {
    console.error('Error completo:', error);
    message.error('Error al eliminar la decoración');
    return false;
  }
}; 