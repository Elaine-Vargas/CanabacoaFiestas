import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/dashboard/ServicesSubpages.scss';
import { useUser } from '../../contexts/UserContext';
import '../../components/ServiceBase';
import DashboardCatalog from '../../components/DashboardCatalog';
import { Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar, Alert } from '@mui/material';
import ViewModuleIcon from '@mui/icons-material/ViewModule';

export type UserRole = 'admin' | 'client' | 'supervisor' | 'inventory';

export type Permission = {
  id: string;
  name: string;
  description: string;
};

export type RolePermissions = {
  [key in UserRole]: Permission[];
};

interface Rent {
  id_rent?: number;
  id_evento: number;
  tipo_elemento: string;
  cantidad: number;
  precio_unitario: number;
  estado: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  notas?: string;
}

interface Evento {
  id_evento: number;
  tipo_evento: string;
  fecha_evento: string;
  hora_evento: string;
  estado_evento: string;
}

interface RentStats {
  totalPedidos: number;
  pedidosPendientes: number;
  totalElementos: number;
}

export default function Rent() {
  const navigate = useNavigate();
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showModal, setShowModal] = useState(false);
  const [showEventoModal, setShowEventoModal] = useState(false);
  const [showNuevoEventoModal, setShowNuevoEventoModal] = useState(false);
  const [rents, setRents] = useState<Rent[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
  const [stats, setStats] = useState<RentStats>({
    totalPedidos: 0,
    pedidosPendientes: 0,
    totalElementos: 0
  });
  const [formData, setFormData] = useState<Partial<Rent>>({
    id_evento: 0,
    tipo_elemento: '',
    cantidad: 0,
    precio_unitario: 0,
    estado: 'Pendiente',
    notas: ''
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [filtroEvento, setFiltroEvento] = useState<string>('');
  const [carritoItems, setCarritoItems] = useState<any[]>([]);
  const [notificacion, setNotificacion] = useState<{
    abierta: boolean;
    mensaje: string;
    tipo: 'success' | 'error' | 'info' | 'warning';
  }>({
    abierta: false,
    mensaje: '',
    tipo: 'success'
  });
  const [nuevoEvento, setNuevoEvento] = useState({
    tipo_evento: '',
    fecha_evento: '',
    hora_evento: '',
    estado_evento: 'Pendiente'
  });
  const [showTotalPedidosModal, setShowTotalPedidosModal] = useState(false);
  const [showPedidosPendientesModal, setShowPedidosPendientesModal] = useState(false);
  const [showTotalItemsModal, setShowTotalItemsModal] = useState(false);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [pedidosPendientes, setPedidosPendientes] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rentsRes, eventosRes] = await Promise.all([
          fetch('/api/rent'),
          fetch('/api/eventos')
        ]);

        const [rentsData, eventosData] = await Promise.all([
          rentsRes.json(),
          eventosRes.json()
        ]);

        setRents(rentsData);
        setEventos(eventosData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/rent/stats');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };

    if (userRole !== 'client') {
      fetchStats();
    }
  }, [userRole]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch('/api/alquiler/pedidos');
        const data = await response.json();
        setPedidos(data);
      } catch (error) {
        console.error('Error al cargar pedidos:', error);
      }
    };

    const fetchPedidosPendientes = async () => {
      try {
        const response = await fetch('/api/alquiler/pendientes');
        const data = await response.json();
        setPedidosPendientes(data);
      } catch (error) {
        console.error('Error al cargar pedidos pendientes:', error);
      }
    };

    const fetchItems = async () => {
      try {
        const response = await fetch('/api/alquiler/items');
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error('Error al cargar items:', error);
      }
    };

    if (showTotalPedidosModal) {
      fetchPedidos();
    }
    if (showPedidosPendientesModal) {
      fetchPedidosPendientes();
    }
    if (showTotalItemsModal) {
      fetchItems();
    }
  }, [showTotalPedidosModal, showPedidosPendientesModal, showTotalItemsModal]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `/api/rent/${editId}` : '/api/rent';
      const method = editId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedRent = await response.json();
        if (editId) {
          setRents(prev => prev.map(r => r.id_rent === editId ? updatedRent : r));
        } else {
          setRents(prev => [...prev, updatedRent]);
        }
        setShowModal(false);
        setFormData({});
        setEditId(null);
      }
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleAddToCart = (item: any) => {
    setCarritoItems(prev => [...prev, item]);
    setShowEventoModal(true);
  };

  const handleCrearEvento = async () => {
    try {
      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoEvento),
      });

      if (response.ok) {
        const eventoCreado = await response.json();
        setEventos(prev => [...prev, eventoCreado]);
        setFormData(prev => ({ ...prev, id_evento: eventoCreado.id_evento }));
        setShowNuevoEventoModal(false);
        setNuevoEvento({
          tipo_evento: '',
          fecha_evento: '',
          hora_evento: '',
          estado_evento: 'Pendiente'
        });
        
        setNotificacion({
          abierta: true,
          mensaje: 'Evento creado con éxito',
          tipo: 'success'
        });
      }
    } catch (error) {
      console.error('Error al crear evento:', error);
      setNotificacion({
        abierta: true,
        mensaje: 'Error al crear el evento',
        tipo: 'error'
      });
    }
  };

  const renderClientView = () => (
    <div className="service-content" style={{ position: 'relative' }}>
      <Box sx={{ 
        position: 'absolute', 
        top: { xs: 8, sm: 16 }, 
        right: { xs: 8, sm: 16 }, 
        zIndex: 2,
        width: { xs: 'calc(100% - 16px)', sm: 'auto' }
      }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setMostrarCatalogo(!mostrarCatalogo)}
          startIcon={<ViewModuleIcon sx={{ 
            fontSize: { xs: 20, sm: 24, md: 28 } 
          }} />}
          sx={{
            background: mostrarCatalogo
              ? 'linear-gradient(90deg, #fff 0%, #f7e9c6 100%)'
              : 'linear-gradient(90deg, var(--gold) 0%, var(--dark-gold) 100%)',
            color: mostrarCatalogo ? 'var(--gold)' : 'var(--white)',
            border: mostrarCatalogo ? '2px solid #fff' : 'none',
            borderRadius: { xs: '1rem', sm: '2rem' },
            boxShadow: mostrarCatalogo ? '0 4px 24px rgba(0,0,0,0.10)' : '0 2px 8px rgba(0,0,0,0.10)',
            fontWeight: 700,
            fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
            px: { xs: 2, sm: 3 },
            py: { xs: 1, sm: 1.2 },
            width: { xs: '100%', sm: 'auto' },
            transition: 'all 0.3s',
            '&:hover': {
              background: 'linear-gradient(90deg, #fff 0%, #f7e9c6 100%)',
              color: 'var(--gold)',
              border: '2px solid #fff',
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
            },
          }}
        >
          {mostrarCatalogo ? 'Ocultar Catálogo' : 'Mostrar Catálogo'}
        </Button>
      </Box>

      {mostrarCatalogo && (
        <Box sx={{
          mb: { xs: 2, sm: 4 },
          mt: { xs: 8, sm: 10, md: 12 },
          mx: { xs: 1, sm: 2, md: 'auto' },
          maxWidth: { xs: '100%', sm: 800, md: 1200 },
          background: '#fff',
          borderRadius: { xs: '1rem', sm: '2rem' },
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          p: { xs: 1, sm: 2, md: 4 },
          minHeight: { xs: 200, sm: 300 },
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden'
        }}>
          <DashboardCatalog 
            onAddToCart={handleAddToCart}
          />
        </Box>
      )}

      <Dialog 
        open={showEventoModal} 
        onClose={() => {
          setShowEventoModal(false);
          setCarritoItems([]);
        }} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '1rem',
            background: 'var(--color-background)',
            color: 'var(--color-text)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: '"Montserrat Alternates", cursive',
          fontWeight: 800,
          color: 'var(--gold)',
          fontSize: { xs: '1.2rem', sm: '1.5rem' },
          textAlign: 'center',
          borderBottom: '2px solid var(--gold)',
          pb: 2
        }}>
          Cotización de Alquiler
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => {
                setShowEventoModal(false);
                navigate('/dashboard/bienvenida');
              }}
              sx={{ 
                mb: 2,
                borderColor: 'var(--gold)',
                color: 'var(--gold)',
                '&:hover': {
                  borderColor: 'var(--dark-gold)',
                  backgroundColor: 'var(--gold-light)'
                }
              }}
            >
              + Crear Nuevo Evento
            </Button>

            <TextField
              select
              fullWidth
              label="Seleccionar Evento"
              value={formData.id_evento || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, id_evento: Number(e.target.value) }))}
              sx={{ mb: 3 }}
            >
              {eventos.map((evento) => (
                <MenuItem key={evento.id_evento} value={evento.id_evento}>
                  {evento.tipo_evento} - {evento.fecha_evento}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ 
              p: 3,
              backgroundColor: 'var(--color-background2)',
              borderRadius: '1rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <Typography variant="h6" sx={{ 
                mb: 2, 
                color: 'var(--gold)',
                textAlign: 'center',
                fontWeight: 700
              }}>
                Detalles de la Cotización
              </Typography>

              <Box sx={{ 
                maxHeight: '300px', 
                overflow: 'auto',
                mb: 2,
                p: 2,
                backgroundColor: 'var(--color-background)',
                borderRadius: '1rem'
              }}>
                {carritoItems.map((item, index) => (
                  <Box key={index} sx={{ 
                    mb: 2, 
                    p: 2, 
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.5rem',
                    backgroundColor: 'var(--color-background)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: 'var(--gold)' }}>
                        {item.nombre_elemento}
                      </Typography>
                      <Typography>Cantidad: {item.cantidad}</Typography>
                      <Typography>Precio por día: ${item.precio_elemento}</Typography>
                    </Box>
                    <Typography sx={{ 
                      fontWeight: 700,
                      color: 'var(--gold)',
                      fontSize: '1.1rem'
                    }}>
                      ${item.precio_elemento * item.cantidad}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ 
                borderTop: '2px solid var(--gold)',
                pt: 2,
                mt: 2
              }}>
                <Typography variant="h6" sx={{ 
                  textAlign: 'right',
                  color: 'var(--gold)',
                  fontWeight: 800,
                  fontSize: '1.2rem'
                }}>
                  Subtotal: ${carritoItems.reduce((sum, item) => sum + (item.precio_elemento * item.cantidad), 0)}
                </Typography>
                <Typography variant="h6" sx={{ 
                  textAlign: 'right',
                  color: 'var(--gold)',
                  fontWeight: 800,
                  fontSize: '1.2rem'
                }}>
                  ITBIS (18%): ${(carritoItems.reduce((sum, item) => sum + (item.precio_elemento * item.cantidad), 0) * 0.18).toFixed(2)}
                </Typography>
                <Typography variant="h5" sx={{ 
                  textAlign: 'right',
                  color: 'var(--gold)',
                  fontWeight: 800,
                  fontSize: '1.4rem',
                  mt: 1
                }}>
                  Total: ${(carritoItems.reduce((sum, item) => sum + (item.precio_elemento * item.cantidad), 0) * 1.18).toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => {
              setShowEventoModal(false);
              setCarritoItems([]);
            }}
            sx={{ 
              color: 'var(--error)',
              '&:hover': {
                backgroundColor: 'var(--error-light)'
              }
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={async () => {
              try {
                const alquilerPromises = carritoItems.map(item => 
                  fetch('/api/alquiler-servicio', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      id_evento: formData.id_evento,
                      id_elemento: item.id_elemento,
                      precio_unitario: item.precio_elemento,
                      cantidad_alquiler: item.cantidad,
                      precioneto_alquiler: item.precio_elemento * item.cantidad,
                      itbis_alquiler: (item.precio_elemento * item.cantidad) * 0.18,
                      total_alquiler: (item.precio_elemento * item.cantidad) * 1.18
                    }),
                  })
                );

                await Promise.all(alquilerPromises);
                setShowEventoModal(false);
                setCarritoItems([]);
                
                const response = await fetch('/api/rent');
                const data = await response.json();
                setRents(data);
                
                setNotificacion({
                  abierta: true,
                  mensaje: 'Cotización enviada con éxito',
                  tipo: 'success'
                });
              } catch (error) {
                console.error('Error al procesar la cotización:', error);
                setNotificacion({
                  abierta: true,
                  mensaje: 'Error al procesar la cotización',
                  tipo: 'error'
                });
              }
            }}
            variant="contained"
            disabled={!formData.id_evento}
            sx={{
              backgroundColor: 'var(--gold)',
              '&:hover': {
                backgroundColor: 'var(--dark-gold)',
              },
              '&:disabled': {
                backgroundColor: 'var(--color-disabled)',
                color: 'var(--color-text-disabled)'
              }
            }}
          >
            Enviar Cotización
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showNuevoEventoModal}
        onClose={() => setShowNuevoEventoModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '1rem',
            background: 'var(--color-background)',
            color: 'var(--color-text)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: '"Montserrat Alternates", cursive',
          fontWeight: 800,
          color: 'var(--gold)'
        }}>
          Crear Nuevo Evento
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Tipo de Evento"
              value={nuevoEvento.tipo_evento}
              onChange={(e) => setNuevoEvento(prev => ({ ...prev, tipo_evento: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Fecha del Evento"
              type="date"
              value={nuevoEvento.fecha_evento}
              onChange={(e) => setNuevoEvento(prev => ({ ...prev, fecha_evento: e.target.value }))}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Hora del Evento"
              type="time"
              value={nuevoEvento.hora_evento}
              onChange={(e) => setNuevoEvento(prev => ({ ...prev, hora_evento: e.target.value }))}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setShowNuevoEventoModal(false)}
            sx={{ color: 'var(--error)' }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCrearEvento}
            variant="contained"
            disabled={!nuevoEvento.tipo_evento || !nuevoEvento.fecha_evento || !nuevoEvento.hora_evento}
            sx={{
              backgroundColor: 'var(--gold)',
              '&:hover': {
                backgroundColor: 'var(--dark-gold)',
              },
              '&:disabled': {
                backgroundColor: 'var(--color-disabled)',
                color: 'var(--color-text-disabled)'
              }
            }}
          >
            Crear Evento
          </Button>
        </DialogActions>
      </Dialog>

      <div className="table-section">
        <h4>Mis Alquileres</h4>
        <div className="search-container">
          <select
            className="escri"
            value={filtroEvento}
            onChange={(e) => setFiltroEvento(e.target.value)}
          >
            <option value="">Todos los eventos</option>
            <option value="recientes">Eventos recientes</option>
            <option value="pendientes">Eventos pendientes</option>
            <option value="completados">Eventos completados</option>
            <option value="cancelados">Eventos cancelados</option>
          </select>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Evento</th>
              <th>Item</th>
              <th>Cantidad</th>
              <th>Precio Unitario</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {rents
              .filter(r => 
                eventos.find(e => e.id_evento === r.id_evento)?.tipo_evento
                  .toLowerCase()
                  .includes(filtroEvento.toLowerCase())
              )
              .map((rent) => (
                <tr key={rent.id_rent}>
                  <td>{rent.id_rent}</td>
                  <td>
                    {eventos.find(e => e.id_evento === rent.id_evento)?.tipo_evento}
                  </td>
                  <td>{rent.tipo_elemento}</td>
                  <td>{rent.cantidad}</td>
                  <td>${rent.precio_unitario}</td>
                  <td>{rent.fecha_inicio}</td>
                  <td>{rent.fecha_fin}</td>
                  <td>{rent.estado}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTotalPedidosModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowTotalPedidosModal(false)}>×</button>
        <div className="modal-content">
          <h3>Total de Pedidos de Alquiler</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Cliente</th>
                  <th>Cantidad</th>
                  <th>Precio Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidos.map((pedido) => (
                  <tr key={pedido.id_alquiler}>
                    <td>{pedido.nombre_evento}</td>
                    <td>{pedido.nombre_cliente}</td>
                    <td>{pedido.cantidad}</td>
                    <td>${pedido.precio_total}</td>
                    <td>{pedido.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPedidosPendientesModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowPedidosPendientesModal(false)}>×</button>
        <div className="modal-content">
          <h3>Pedidos Pendientes</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Cliente</th>
                  <th>Cantidad</th>
                  <th>Precio Total</th>
                </tr>
              </thead>
              <tbody>
                {pedidosPendientes.map((pedido) => (
                  <tr key={pedido.id_alquiler}>
                    <td>{pedido.nombre_evento}</td>
                    <td>{pedido.nombre_cliente}</td>
                    <td>{pedido.cantidad}</td>
                    <td>${pedido.precio_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTotalItemsModal = () => (
    <div className="modal-overlay">
      <div className="modal-container">
        <button className="close-btn" onClick={() => setShowTotalItemsModal(false)}>×</button>
        <div className="modal-content">
          <h3>Catálogo de Items</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Cantidad Disponible</th>
                  <th>Veces Alquilado</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id_item}>
                    <td>{item.nombre}</td>
                    <td>{item.cantidad_disponible}</td>
                    <td>{item.veces_alquilado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminView = () => {
    return (
      <div className="rent-content">
        <div className="dashboard__stats">
          <div className="stat-card">
            <span className="stat-card__label">Total de Pedidos</span>
            <strong className="stat-card__number">{stats.totalPedidos}</strong>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowTotalPedidosModal(true)}
            >
              Ver pedidos
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Pedidos Pendientes</span>
            <strong className="stat-card__number">{stats.pedidosPendientes}</strong>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowPedidosPendientesModal(true)}
            >
              Ver pendientes
            </button>
          </div>

          <div className="stat-card">
            <span className="stat-card__label">Items en Catálogo</span>
            <strong className="stat-card__number">{stats.totalElementos}</strong>
            <button 
              className="stat-card__seeInfo"
              onClick={() => setShowTotalItemsModal(true)}
            >
              Ver catálogo
            </button>
          </div>
        </div>

        {showTotalPedidosModal && renderTotalPedidosModal()}
        {showPedidosPendientesModal && renderPedidosPendientesModal()}
        {showTotalItemsModal && renderTotalItemsModal()}

        <button className="new-form-btn" onClick={() => setShowModal(true)}>
          + Agregar Servicio de Alquiler
        </button>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
              <form className="modal-form" onSubmit={handleSubmit}>
                <h2>{editId ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
                
                <label>
                  Evento:
                  <select
                    name="id_evento"
                    value={formData.id_evento || ''}
                    onChange={handleSelectChange}
                    required
                  >
                    <option value="">Seleccionar evento</option>
                    {eventos.map((evento) => (
                      <option key={evento.id_evento} value={evento.id_evento}>
                        {evento.fecha_evento} - {evento.tipo_evento}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Tipo de Item:
                  <select
                    name="tipo_elemento"
                    value={formData.tipo_elemento || ''}
                    onChange={handleSelectChange}
                    required
                  >
                    <option value="">Seleccionar tipo</option>
                    <option value="Mesa">Mesa</option>
                    <option value="Silla">Silla</option>
                    <option value="Mantel">Mantel</option>
                    <option value="Cubiertos">Cubiertos</option>
                    <option value="Otros">Otros</option>
                  </select>
                </label>

                <label>
                  Cantidad:
                  <input
                    type="number"
                    name="cantidad"
                    value={formData.cantidad || ''}
                    onChange={handleInputChange}
                    required
                    min="1"
                  />
                </label>

                <label>
                  Precio:
                  <input
                    type="number"
                    name="precio_unitario"
                    value={formData.precio_unitario || ''}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                  />
                </label>

                <label>
                  Estado:
                  <select
                    name="estado"
                    value={formData.estado || ''}
                    onChange={handleSelectChange}
                    required
                  >
                    <option value="">Seleccionar estado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Progreso">En Progreso</option>
                    <option value="Completado">Completado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </label>

                <label>
                  Notas:
                  <textarea
                    name="notas"
                    value={formData.notas || ''}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </label>

                <div className="form-buttons">
                  <button type="submit" className="submit-btn">
                    {editId ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    className="reset-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOrganizerView = () => (
    <div className="rent-content">
      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Total de Pedidos</span>
          <strong className="stat-card__number">{stats.totalPedidos}</strong>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowTotalPedidosModal(true)}
          >
            Ver pedidos
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Pedidos Pendientes</span>
          <strong className="stat-card__number">{stats.pedidosPendientes}</strong>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowPedidosPendientesModal(true)}
          >
            Ver pendientes
          </button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Items en Catálogo</span>
          <strong className="stat-card__number">{stats.totalElementos}</strong>
          <button 
            className="stat-card__seeInfo"
            onClick={() => setShowTotalItemsModal(true)}
          >
            Ver catálogo
          </button>
        </div>
      </div>

      {showTotalPedidosModal && renderTotalPedidosModal()}
      {showPedidosPendientesModal && renderPedidosPendientesModal()}
      {showTotalItemsModal && renderTotalItemsModal()}

      <button className="new-form-btn" onClick={() => setShowModal(true)}>
        + Agregar Servicio de Alquiler
      </button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            <form className="modal-form" onSubmit={handleSubmit}>
              <h2>{editId ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
              
              <label>
                Evento:
                <select
                  name="id_evento"
                  value={formData.id_evento || ''}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="">Seleccionar evento</option>
                  {eventos.map((evento) => (
                    <option key={evento.id_evento} value={evento.id_evento}>
                      {evento.fecha_evento} - {evento.tipo_evento}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Tipo de Item:
                <select
                  name="tipo_elemento"
                  value={formData.tipo_elemento || ''}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Mesa">Mesa</option>
                  <option value="Silla">Silla</option>
                  <option value="Mantel">Mantel</option>
                  <option value="Cubiertos">Cubiertos</option>
                  <option value="Otros">Otros</option>
                </select>
              </label>

              <label>
                Cantidad:
                <input
                  type="number"
                  name="cantidad"
                  value={formData.cantidad || ''}
                  onChange={handleInputChange}
                  required
                  min="1"
                />
              </label>

              <label>
                Precio:
                <input
                  type="number"
                  name="precio_unitario"
                  value={formData.precio_unitario || ''}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                />
              </label>

              <label>
                Estado:
                <select
                  name="estado"
                  value={formData.estado || ''}
                  onChange={handleSelectChange}
                  required
                >
                  <option value="">Seleccionar estado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Completado">Completado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </label>

              <label>
                Notas:
                <textarea
                  name="notas"
                  value={formData.notas || ''}
                  onChange={handleInputChange}
                  rows={4}
                />
              </label>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  {editId ? 'Actualizar' : 'Guardar'}
                </button>
                <button
                  type="button"
                  className="reset-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="rent-page">
      <div className="welcome-header">
        <h1>Gestión de Alquiler</h1>
        <p>Gestiona los servicios de alquiler para eventos</p>
      </div>

      <div className="service-content">
        {(() => {
          const rolId = Number(userData.rol);
          const isAdmin = rolId === 1;
          const isOrganizer = rolId === 3;
          const isClient = rolId === 2;

          if (isAdmin) {
            return renderAdminView();
          }

          if (isOrganizer) {
            return renderOrganizerView();
          }

          if (isClient) {
            return renderClientView();
          }

          return null;
        })()}
      </div>

      <Snackbar
        open={notificacion.abierta}
        autoHideDuration={3000}
        onClose={() => setNotificacion(prev => ({ ...prev, abierta: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotificacion(prev => ({ ...prev, abierta: false }))} 
          severity={notificacion.tipo}
          sx={{
            backgroundColor: notificacion.tipo === 'success' ? '#2e7d32' : '#d32f2f',
            color: 'var(--white)',
            '& .MuiAlert-icon': {
              color: 'var(--white)'
            },
            fontFamily: '"Nunito Sans", sans-serif',
            fontSize: { xs: '0.75rem', sm: '1rem' },
            width: { xs: '98%', sm: 'auto' },
            maxWidth: '600px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
            '& .MuiAlert-message': {
              fontWeight: 600
            },
            '& .MuiAlert-action': {
              color: 'var(--white)'
            }
          }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </div>
  );
}