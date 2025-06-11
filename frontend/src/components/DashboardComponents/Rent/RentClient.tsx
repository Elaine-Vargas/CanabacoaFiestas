import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  MenuItem, 
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Drawer,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { es } from 'date-fns/locale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import '../../../styles/dashboard/ServicesSubpages.scss';
import DashboardCatalog from '../MoreDash/DashboardCatalog';

interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Evento {
  id_evento: number;
  id_usuario: number;
  tipo_evento: string;
  fecha_evento: string;
  hora_inicio: string;
  hora_fin: string;
  lugar_evento: string;
  descripcion: string;
  estado_evento: string;
}

export default function RentClient() { 
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [showEventoModal, setShowEventoModal] = useState(false);
  const [showNuevoEventoModal, setShowNuevoEventoModal] = useState(false);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [carritoItems, setCarritoItems] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [notificacion, setNotificacion] = useState({
    abierta: false,
    mensaje: '',
    tipo: 'success' as 'success' | 'error'
  });
  const [nuevoEvento, setNuevoEvento] = useState({
    tipo_evento: '',
    fecha_evento: new Date(),
    hora_inicio: new Date(),
    hora_fin: new Date(),
    lugar_evento: '',
    descripcion: '',
    estado_evento: 'Pendiente'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = Number(userData.rol);

    if (!token || userRole !== 2) {
      setError('No tienes permisos para acceder a esta sección');
      navigate('/auth/login');
      return;
    }

    const fetchInitialData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [eventosRes, itemsRes] = await Promise.all([
          axios.get(`${apiUrl}/eventos/usuario/${userData.id_usuario}`, { headers }),
          axios.get(`${apiUrl}/elemento`, { headers })
        ]);

        setEventos(eventosRes.data);
        setItems(itemsRes.data);
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        setNotificacion({
          abierta: true,
          mensaje: 'Error al cargar los datos. Por favor, intente nuevamente.',
          tipo: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleCrearEvento = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No tienes permisos para realizar esta acción');
        navigate('/auth/login');
        return;
      }

      const eventoData = {
        ...nuevoEvento,
        id_usuario: userData.id_usuario,
        fecha_evento: nuevoEvento.fecha_evento.toISOString().split('T')[0],
        hora_inicio: nuevoEvento.hora_inicio.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        hora_fin: nuevoEvento.hora_fin.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };

      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(`${apiUrl}/eventos`, eventoData, { headers });

      if (response.status === 200 || response.status === 201) {
        const eventoCreado = response.data;
        setEventos(prev => [...prev, eventoCreado]);
        setShowNuevoEventoModal(false);
        setNuevoEvento({
          tipo_evento: '',
          fecha_evento: new Date(),
          hora_inicio: new Date(),
          hora_fin: new Date(),
          lugar_evento: '',
          descripcion: '',
          estado_evento: 'Pendiente'
        });
        
        setNotificacion({
          abierta: true,
          mensaje: 'Evento creado exitosamente',
          tipo: 'success'
        });
      }
    } catch (error) {
      console.error('Error al crear evento:', error);
      setNotificacion({
        abierta: true,
        mensaje: 'Error al crear el evento. Por favor, intente nuevamente.',
        tipo: 'error'
      });
    }
  };

  const handleAddToCart = (item: any) => {
    const existingItem = carritoItems.find(cartItem => cartItem.id === item.id_elemento);
    
    if (existingItem) {
      setCarritoItems(prev => prev.map(cartItem => 
        cartItem.id === item.id_elemento 
          ? { ...cartItem, cantidad: cartItem.cantidad + 1 }
          : cartItem
      ));
    } else {
      setCarritoItems(prev => [...prev, {
        id: item.id_elemento,
        nombre: item.nombre_elemento,
        precio: item.precio_elemento,
        cantidad: 1
      }]);
    }
  };

  const handleRemoveFromCart = (itemId: number) => {
    setCarritoItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCarritoItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, cantidad: newQuantity } : item
    ));
  };

  const calculateTotal = () => {
    const subtotal = carritoItems.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    const itbis = subtotal * 0.18;
    return {
      subtotal,
      itbis,
      total: subtotal + itbis
    };
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/auth/login')}
        >
          Ir al login
        </Button>
      </Box>
    );
  }

  return (
    <div className="rent-page">
      <div className="welcome-header">
        <h1>Alquiler de Equipos y Mobiliario</h1>
        <IconButton 
          onClick={() => setShowCart(true)}
          sx={{ 
            backgroundColor: 'var(--gold)',
            color: 'var(--white)',
            width: '50px',
            height: '50px',
            boxShadow: '0 15px 50px var(--color-shadow)',
            '&:hover': {
              backgroundColor: 'var(--dark-gold)',
              transform: 'scale(1.05)',
              transition: 'all 0.2s ease-in-out'
            }
          }}
        >
          <Badge 
            badgeContent={carritoItems.length} 
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: 'var(--dark-gold)',
                color: 'var(--white)'
              }
            }}
          >
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </div>

      {/* Notificaciones */}
      <Snackbar
        open={notificacion.abierta}
        autoHideDuration={3000}
        onClose={() => setNotificacion({ ...notificacion, abierta: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNotificacion({ ...notificacion, abierta: false })} 
          severity={notificacion.tipo}
          sx={{ width: '100%' }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>

      <div className="catalog-section">
        <DashboardCatalog onAddToCart={handleAddToCart} />
      </div>

      <Drawer
        anchor="right"
        open={showCart}
        onClose={() => setShowCart(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            padding: 2,
            backgroundColor: 'var(--color-background2)',
            color: 'var(--color-text)'
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 2
        }}>
          <Typography variant="h6">Carrito de Compras</Typography>
          <IconButton 
            onClick={() => setShowCart(false)}
            sx={{ color: 'var(--color-text)' }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>

        {carritoItems.length === 0 ? (
          <Typography sx={{ textAlign: 'center', mt: 2 }}>
            El carrito está vacío
          </Typography>
        ) : (
          <List>
            {carritoItems.map((item) => (
              <ListItem 
                key={item.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1
                }}
              >
                <ListItemText
                  primary={item.nombre}
                  secondary={`$${item.precio} x ${item.cantidad}`}
                />
                <ListItemSecondaryAction>
                  <IconButton 
                    edge="end" 
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            <ListItem sx={{ mt: 2 }}>
              <ListItemText
                primary="Total"
                secondary={`$${calculateTotal().total.toFixed(2)}`}
              />
            </ListItem>
          </List>
        )}
      </Drawer>

      {/* Modal de Eventos */}
      <Dialog 
        open={showEventoModal} 
        onClose={() => setShowEventoModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Seleccionar Evento</DialogTitle>
        <DialogContent>
          {eventos.length === 0 ? (
            <Typography sx={{ textAlign: 'center', my: 2 }}>
              No tienes eventos creados
            </Typography>
          ) : (
            <List>
              {eventos.map((evento) => (
                <ListItem 
                  button 
                  key={evento.id_evento}
                  onClick={() => {
                    // Aquí iría la lógica para asociar el carrito al evento
                    setShowEventoModal(false);
                  }}
                >
                  <ListItemText
                    primary={evento.tipo_evento}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          Fecha: {new Date(evento.fecha_evento).toLocaleDateString()}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Hora: {evento.hora_inicio} - {evento.hora_fin}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Lugar: {evento.lugar_evento}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setShowEventoModal(false);
              setShowNuevoEventoModal(true);
            }}
            sx={{
              mt: 2,
              backgroundColor: 'var(--gold)',
              '&:hover': {
                backgroundColor: 'var(--dark-gold)'
              }
            }}
          >
            Crear Nuevo Evento
          </Button>
        </DialogContent>
      </Dialog>

      {/* Modal de Nuevo Evento */}
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Dialog 
          open={showNuevoEventoModal} 
          onClose={() => setShowNuevoEventoModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Crear Nuevo Evento</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Tipo de Evento"
                value={nuevoEvento.tipo_evento}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, tipo_evento: e.target.value })}
              />
              
              <DatePicker
                label="Fecha del Evento"
                value={nuevoEvento.fecha_evento}
                onChange={(newValue) => {
                  if (newValue) {
                    setNuevoEvento({ ...nuevoEvento, fecha_evento: newValue });
                  }
                }}
                sx={{ width: '100%' }}
              />
              
              <TimePicker
                label="Hora de Inicio"
                value={nuevoEvento.hora_inicio}
                onChange={(newValue) => {
                  if (newValue) {
                    setNuevoEvento({ ...nuevoEvento, hora_inicio: newValue });
                  }
                }}
                sx={{ width: '100%' }}
              />
              
              <TimePicker
                label="Hora de Fin"
                value={nuevoEvento.hora_fin}
                onChange={(newValue) => {
                  if (newValue) {
                    setNuevoEvento({ ...nuevoEvento, hora_fin: newValue });
                  }
                }}
                sx={{ width: '100%' }}
              />
              
              <TextField
                fullWidth
                label="Lugar del Evento"
                value={nuevoEvento.lugar_evento}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, lugar_evento: e.target.value })}
              />
              
              <TextField
                fullWidth
                label="Descripción"
                value={nuevoEvento.descripcion}
                onChange={(e) => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value })}
                multiline
                rows={4}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowNuevoEventoModal(false)}>Cancelar</Button>
            <Button 
              onClick={handleCrearEvento} 
              variant="contained"
              sx={{
                backgroundColor: 'var(--gold)',
                '&:hover': {
                  backgroundColor: 'var(--dark-gold)'
                }
              }}
            >
              Crear Evento
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    </div>
  );
} 