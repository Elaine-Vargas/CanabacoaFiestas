import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  Card, CardContent, Typography, Grid, Container, TextField, Select, 
  MenuItem, FormControl, InputLabel, Box, CircularProgress, IconButton, 
  Badge, Drawer, List, ListItem, ListItemText, Button, Snackbar, Alert, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper
} from '@mui/material';

const apiUrl = import.meta.env.VITE_API_BASE_URL;


import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

// Lazy-loaded components
const NavBar = lazy(() => import('../../Otros/NavBar'));

interface CategoriaElemento {
  id_categoria: number;
  nombre_categoria: string;
  subcategorias: SubcategoriaElemento[];
}

interface SubcategoriaElemento {
  id_subcategoria: number;
  nombre_subcategoria: string;
  categoria: CategoriaElemento;
}

interface Elemento {
  id_elemento: number;
  nombre_elemento: string;
  id_subcategoria: number;
  id_material: number;
  id_color: number;
  precio_elemento: number;
  cantidad_total: number;
  cantidad_disponible: number;
  estado_elemento: string;
  imagen_url?: string;
  subcategoria: {
    id_subcategoria: number;
    nombre_subcategoria: string;
    categoria: {
      id_categoria: number;
      nombre_categoria: string;
    };
  };
  color: {
    id_color: number;
    nombre_color: string;
  };
  material: {
    id_material: number;
    nombre_material: string;
  };
}

interface CarritoItem extends Elemento {
  cantidad: number;
}

interface ColorElemento {
  id_color: number;
  nombre_color: string;
}

interface MaterialElemento {
  id_material: number;
  nombre_material: string;
}

// Lazy-loaded OptimizedImage component
const OptimizedImage = lazy(() => {
  return new Promise<{ default: React.ComponentType<{ src: string; alt: string }> }>((resolve) => {
    const Component = ({ src, alt }: { src: string; alt: string }) => {
      const [isLoaded, setIsLoaded] = useState(false);
      const [error, setError] = useState(false);

      return (
        <Box sx={{ 
          position: 'relative', 
          width: '100%', 
          paddingTop: '100%',
          overflow: 'hidden',
          borderRadius: '8px'
        }}>
          {!isLoaded && !error && (
            <Skeleton 
              variant="rectangular" 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: 1
              }} 
            />
          )}
          <img
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            onError={() => setError(true)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: 'var(--white)',
              padding: '8px',
              borderRadius: '8px',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
          />
        </Box>
      );
    };
    resolve({ default: Component });
  });
});

interface CatalogProps {
  onAddToCart?: (item: Elemento) => void;
  onComprarCarrito?: (carrito: CarritoItem[]) => void;
}

const Catalog: React.FC<CatalogProps> = ({ onAddToCart = true, onComprarCarrito }) => {
  const navigate = useNavigate();
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [categorias, setCategorias] = useState<CategoriaElemento[]>([]);
  const [colores, setColores] = useState<ColorElemento[]>([]);
  const [materiales, setMateriales] = useState<MaterialElemento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    categoria: '',
    subcategoria: '',
    color: '',
    material: '',
    busqueda: ''
  });
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [notificacion, setNotificacion] = useState({
    abierta: false,
    mensaje: '',
    tipo: 'success' as 'success' | 'error'
  });
  const [cantidadesSeleccionadas, setCantidadesSeleccionadas] = useState<{[key: number]: number}>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showAlquilerModal, setShowAlquilerModal] = useState(false);
  const [showEventoModal, setShowEventoModal] = useState(false);
  const [eventos, setEventos] = useState([]);
  const [selectedEventoId, setSelectedEventoId] = useState('');
  const [showNuevoEventoModal, setShowNuevoEventoModal] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({
    nombre_evento: '',
    fecha_evento: '',
    hora_inicio: '',
    hora_fin: '',
    lugar_evento: '',
    descripcion: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [elementosRes, categoriasRes, coloresRes, materialesRes] = await Promise.all([
          axios.get(`${apiUrl}/elemento`),
          axios.get(`${apiUrl}/elemento/categorias/list`),
          axios.get(`${apiUrl}/elemento/colores/list`),
          axios.get(`${apiUrl}/elemento/materiales/list`)
        ]);

        // Establecer los datos
        setElementos(elementosRes.data || []);
        setCategorias(categoriasRes.data || []);
        setColores(coloresRes.data || []);
        setMateriales(materialesRes.data || []);

      } catch (error) {
        console.error('Error al cargar los datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      setIsAuthenticated(!!token);
      setUserRole(role);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await axios.get(`${apiUrl}/evento`);
        setEventos(response.data);
      } catch (error) {
        console.error('Error al cargar eventos:', error);
        setNotificacion({
          abierta: true,
          mensaje: 'Error al cargar los eventos',
          tipo: 'error'
        });
      }
    };

    if (showEventoModal) {
      fetchEventos();
    }
  }, [showEventoModal]);

  const handleAddToCart = (item: Elemento) => {
    if (!isAuthenticated) {
      setNotificacion({
        abierta: true,
        mensaje: 'Debe iniciar sesión o registrarse para agregar elementos al carrito',
        tipo: 'error'
      });
      return;
    }

    if (userRole !== 'cliente') {
      setNotificacion({
        abierta: true,
        mensaje: 'Solo los clientes pueden agregar elementos al carrito',
        tipo: 'error'
      });
      return;
    }

    const cantidad = cantidadesSeleccionadas[item.id_elemento] || 1;
    const itemConCantidad = { ...item, cantidad };
    setCarrito(prev => [...prev, itemConCantidad]);
    setNotificacion({
      abierta: true,
      mensaje: 'Producto agregado al carrito',
      tipo: 'success'
    });
  };

  const handleCantidadChange = (id: number, cantidad: number) => {
    const elemento = elementos.find(e => e.id_elemento === id);
    if (!elemento || cantidad > elemento.cantidad_disponible) {
      setNotificacion({
        abierta: true,
        mensaje: 'No hay suficiente stock disponible',
        tipo: 'error'
      });
      return;
    }
    if (cantidad < 1) return;
    setCantidadesSeleccionadas(prev => ({
      ...prev,
      [id]: cantidad
    }));
  };

  const handleOpenCart = () => {
    setCarritoAbierto(true);
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito(prev => prev.filter(item => item.id_elemento !== id));
    setNotificacion({
      abierta: true,
      mensaje: 'Producto eliminado del carrito',
      tipo: 'success'
    });
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio_elemento * item.cantidad), 0);
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    setNotificacion({
      abierta: true,
      mensaje: 'Carrito vaciado',
      tipo: 'success'
    });
  };

  const handleNuevoEvento = async () => {
    try {
      await axios.post(`${apiUrl}/evento`, nuevoEvento);
      setShowNuevoEventoModal(false);
      setNotificacion({
        abierta: true,
        mensaje: 'Evento creado exitosamente',
        tipo: 'success'
      });
      // Recargar eventos
      const response = await axios.get(`${apiUrl}/evento`);
      setEventos(response.data);
    } catch (error) {
      console.error('Error al crear evento:', error);
      setNotificacion({
        abierta: true,
        mensaje: 'Error al crear el evento',
        tipo: 'error'
      });
    }
  };

  const handleComprar = () => {
    setCarritoAbierto(false);
    setShowEventoModal(true);
  };

  // Filtrar y paginar los elementos
  const filteredElementos = useMemo(() => {
    return elementos.filter(elemento => {
      const matchesCategoria = !filtros.categoria || elemento.subcategoria.categoria.id_categoria === Number(filtros.categoria);
      const matchesSubcategoria = !filtros.subcategoria || elemento.subcategoria.id_subcategoria === Number(filtros.subcategoria);
      const matchesColor = !filtros.color || elemento.color.id_color === Number(filtros.color);
      const matchesMaterial = !filtros.material || elemento.material.id_material === Number(filtros.material);
      const matchesBusqueda = !filtros.busqueda || 
        elemento.nombre_elemento.toLowerCase().includes(filtros.busqueda.toLowerCase());

      return matchesCategoria && matchesSubcategoria && matchesColor && matchesMaterial && matchesBusqueda;
    });
  }, [elementos, filtros]);

  const paginatedElementos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredElementos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredElementos, currentPage, itemsPerPage]);

  // Mostrar solo el indicador de carga mientras se cargan los datos
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        background: 'var(--login-bg)',
        backgroundBlendMode: 'var(--login-blend)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <CircularProgress sx={{ color: 'var(--gold)' }} />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ 
        background: 'var(--login-bg)',
        backgroundBlendMode: 'var(--login-blend)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        margin: 0,
        padding: 0,
        overflow: 'hidden'
      }} />
      <Box sx={{ position: 'relative', zIndex: 1 }}>

        <Container maxWidth="lg" sx={{ 
          py: { xs: 2, sm: 4 }, 
          mt: { xs: 6, sm: 8 },
          px: { xs: 1, sm: 2 },
          pb: { xs: 4, sm: 6 }
        }}>
          <Box sx={{ 
            mb: { xs: 2, sm: 4 }, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 },
          }}>
            <Typography 
              variant="h4" 
              component="h1"
              sx={{ 
                fontFamily: '"Pinyon Script", sans-serif',
                fontWeight: 400,
                color: 'var(--gold)',
                fontSize: { xs: '2rem', sm: '2.8rem', md: '3.5rem', lg: '6rem' },
                letterSpacing: '1px',
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Catálogo de Elementos
            </Typography>
            
            {isAuthenticated && userRole === 'cliente' && (
              <IconButton 
                color="primary" 
                onClick={handleOpenCart}
                sx={{ 
                  position: 'relative',
                  backgroundColor: 'var(--gold)',
                  color: 'var(--white)',
                  width: { xs: '45px', sm: '50px' },
                  height: { xs: '45px', sm: '50px' },
                  boxShadow: '0 15px 50px var(--color-shadow)',
                  '&:hover': {
                    backgroundColor: 'var(--dark-gold)',
                    transform: 'scale(1.05)',
                    transition: 'all 0.2s ease-in-out'
                  },
                  '& .MuiBadge-badge': {
                    color: 'var(--white)',
                    fontWeight: '600',
                    fontSize: '0.6rem',
                    Width: '1rem',
                    height: '1rem',
                    borderRadius: '10px',
                    background: 'var(--dark-gold)',
                  }
                }}
              >
                <Badge badgeContent={carrito.length} color="error">
                  <ShoppingCartIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' } }} />
                </Badge>
              </IconButton>
            )}
          </Box>

          {loading ? (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '400px'
            }}>
              <CircularProgress sx={{ color: 'var(--gold)' }} />
            </Box>
          ) : (
            <Grid 
              container 
              spacing={{ xs: 1, sm: 2 }} 
              sx={{ 
                mb: { xs: 2, sm: 4 },
                justifyContent: { xs: 'center', sm: 'flex-start' }
              }}
            >
              <Grid 
              //@ts-ignore
                item 
                xs={12} 
                md={3} 
                component="div"
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  maxWidth: { xs: '100%', sm: 'none' }
                }}
              >
                <TextField
                  fullWidth
                  label="Buscar"
                  name="busqueda"
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                  placeholder="Buscar por nombre del elemento..."
                  sx={{
                    maxWidth: { xs: '100%', sm: 'none' },
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'var(--color-input-bg)',
                      '& fieldset': {
                        borderColor: 'var(--color-input-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--gold)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--gold)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--color-text)',
                      fontFamily: '"Nunito Sans", sans-serif',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      '&.Mui-focused': {
                        color: 'var(--gold)',
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontFamily: '"Nunito Sans", sans-serif',
                      color: 'var(--color-text)',
                      fontSize: { xs: '0.9rem', sm: '1rem' }
                    }
                  }}
                />
              </Grid>
              
              <Grid
              //@ts-ignore
                item 
                xs={12} 
                md={3} 
                component="div"
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  maxWidth: { xs: '100%', sm: 'none' }
                }}
              >
                <FormControl fullWidth sx={{ maxWidth: { xs: '100%', sm: 'none' } }}>
                  <InputLabel 
                    sx={{ 
                      fontFamily: '"Nunito Sans", sans-serif',
                      color: 'var(--color-text)',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      '&.Mui-focused': {
                        color: 'var(--gold)',
                      }
                    }}
                  >
                    Categoría
                  </InputLabel>
                  <Select
                    name="categoria"
                    value={filtros.categoria}
                    onChange={(e) => setFiltros(prev => ({
                      ...prev,
                      categoria: e.target.value,
                      ...(e.target.value === '' && { subcategoria: '' })
                    }))}
                    label="Categoría"
                    sx={{
                      backgroundColor: 'var(--color-input-bg)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--color-input-border)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--gold)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--gold)',
                      },
                      '& .MuiInputLabel-root': {
                        color: 'var(--color-text)',
                        fontFamily: '"Nunito Sans", sans-serif',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                      },
                      '& .MuiSelect-select': {
                        fontFamily: '"Nunito Sans", sans-serif',
                        color: 'var(--color-text)',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        minWidth: { xs: '100px', sm: '120px' }
                      },
                      '& .MuiSelect-icon': {
                        color: 'var(--gold)',
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ 
                      fontFamily: '"Nunito Sans", sans-serif',
                      color: 'var(--color-text)',
                      backgroundColor: 'var(--color-input-bg)',
                      '&:hover': {
                        backgroundColor: 'var(--color-background2)',
                      }
                    }}>
                      Todas las categorías
                    </MenuItem>
                    {categorias.map(categoria => (
                      <MenuItem 
                        key={categoria.id_categoria} 
                        value={categoria.id_categoria}
                        sx={{ 
                          fontFamily: '"Nunito Sans", sans-serif',
                          color: 'var(--color-text)',
                          backgroundColor: 'var(--color-input-bg)',
                          '&:hover': {
                            backgroundColor: 'var(--color-background2)',
                          }
                        }}
                      >
                        {categoria.nombre_categoria}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid 
              //@ts-ignore
                item 
                xs={12} 
                md={3} 
                component="div"
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  maxWidth: { xs: '100%', sm: 'none' }
                }}
              >
                <FormControl fullWidth sx={{ maxWidth: { xs: '100%', sm: 'none' } }}>
                  <InputLabel 
                    sx={{
                      fontFamily: '"Nunito Sans", sans-serif',
                      color: 'var(--color-text)',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      '&.Mui-focused': {
                        color: 'var(--gold)',
                      }
                    }}
                  >
                    Color
                  </InputLabel>
                  <Select
                    name="color"
                    value={filtros.color}
                    onChange={(e) => setFiltros(prev => ({
                      ...prev,
                      color: e.target.value,
                      ...(e.target.value === '' && { subcategoria: '' })
                    }))}
                    label="Color"
                    sx={{
                      backgroundColor: 'var(--color-input-bg)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--color-input-border)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--gold)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--gold)',
                      },
                      '& .MuiInputLabel-root': {
                        color: 'var(--color-text)',
                        fontFamily: '"Nunito Sans", sans-serif',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                      },
                      '& .MuiSelect-select': {
                        fontFamily: '"Nunito Sans", sans-serif',
                        color: 'var(--color-text)',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        minWidth: { xs: '100px', sm: '120px' }
                      },
                      '& .MuiSelect-icon': {
                        color: 'var(--gold)',
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ 
                      fontFamily: '"Nunito Sans", sans-serif',
                      color: 'var(--color-text)',
                      backgroundColor: 'var(--color-input-bg)',
                      '&:hover': {
                        backgroundColor: 'var(--color-background2)',
                      }
                    }}>
                      Todos los colores
                    </MenuItem>
                    {colores.map(color => (
                      <MenuItem 
                        key={color.id_color} 
                        value={color.id_color}
                        sx={{ 
                          fontFamily: '"Nunito Sans", sans-serif',
                          color: 'var(--color-text)',
                          backgroundColor: 'var(--color-input-bg)',
                          '&:hover': {
                            backgroundColor: 'var(--color-background2)',
                          }
                        }}
                      >
                        {color.nombre_color}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid 
              //@ts-ignore
                item 
                xs={12} 
                md={3} 
                component="div"
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'center', sm: 'flex-start' },
                  maxWidth: { xs: '100%', sm: 'none' }
                }}
              >
                <FormControl fullWidth sx={{ maxWidth: { xs: '100%', sm: 'none' } }}>
                  <InputLabel 
                    sx={{
                      fontFamily: '"Nunito Sans", sans-serif',
                      color: 'var(--color-text)',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      '&.Mui-focused': {
                        color: 'var(--gold)',
                      }
                    }}
                  >
                    Material
                  </InputLabel>
                  <Select
                    name="material"
                    value={filtros.material}
                    onChange={(e) => setFiltros(prev => ({
                      ...prev,
                      material: e.target.value,
                      ...(e.target.value === '' && { subcategoria: '' })
                    }))}
                    label="Material"
                    sx={{
                      backgroundColor: 'var(--color-input-bg)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--color-input-border)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--gold)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'var(--gold)',
                      },
                      '& .MuiInputLabel-root': {
                        color: 'var(--color-text)',
                        fontFamily: '"Nunito Sans", sans-serif',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                      },
                      '& .MuiSelect-select': {
                        fontFamily: '"Nunito Sans", sans-serif',
                        color: 'var(--color-text)',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        minWidth: { xs: '100px', sm: '120px' }
                      },
                      '& .MuiSelect-icon': {
                        color: 'var(--gold)',
                      }
                    }}
                  >
                    <MenuItem value="" sx={{ 
                      fontFamily: '"Nunito Sans", sans-serif',
                      color: 'var(--color-text)',
                      backgroundColor: 'var(--color-input-bg)',
                      '&:hover': {
                        backgroundColor: 'var(--color-background2)',
                      }
                    }}>
                      Todos los materiales
                    </MenuItem>
                    {materiales.map(material => (
                      <MenuItem 
                        key={material.id_material} 
                        value={material.id_material}
                        sx={{ 
                          fontFamily: '"Nunito Sans", sans-serif',
                          color: 'var(--color-text)',
                          backgroundColor: 'var(--color-input-bg)',
                          '&:hover': {
                            backgroundColor: 'var(--color-background2)',
                          }
                        }}
                      >
                        {material.nombre_material}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}

          <Suspense fallback={
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: 'var(--gold)' }} />
            </Box>
          }>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(3, 1fr)'
              },
              gap: { xs: 2, sm: 2, md: 3 },
              width: '100%',
              maxWidth: '100%',
              margin: '0 auto',
              padding: { xs: 1, sm: 2 }
            }}>
              {paginatedElementos.map((elemento: Elemento) => (
                <Box
                  key={`${elemento.id_elemento}-${elemento.color.id_color}`}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%'
                  }}
                >
                  <Card sx={{ 
                    height: '100%',
                    width: '100%',
                    maxWidth: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'var(--color-background)',
                    color: 'var(--color-text)',
                    borderRadius: 2,
                    boxShadow: '0 10px 20px var(--color-shadow)',
                    '&:hover': {
                      boxShadow: '0 15px 50px var(--color-shadow)',
                      transform: 'translateY(-2px)',
                      transition: 'all ease-in-out .2s'
                    }
                  }}>
                    <CardContent sx={{ 
                      p: { xs: 1.5, sm: 2 },
                      display: 'flex',
                      flexDirection: 'column',
                      gap: { xs: 1, sm: 1.5 },
                      height: '100%'
                    }}>
                      {elemento.imagen_url && (
                        <Box sx={{ mb: 2 }}>
                          <OptimizedImage 
                            src={elemento.imagen_url} 
                            alt={elemento.nombre_elemento} 
                          />
                        </Box>
                      )}
                      <Typography 
                        gutterBottom 
                        variant="h5" 
                        component="div"
                        sx={{ 
                          fontFamily: '"Montserrat Alternates", cursive',
                          fontWeight: 800,
                          color: 'var(--color-text)',
                          fontSize: { xs: '1.2rem', sm: '1.5rem' },
                          mb: { xs: 1, sm: 2 },
                          textAlign: 'center',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {elemento.nombre_elemento}
                      </Typography>
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: 1.5,
                        mb: 3,
                        px: 2
                      }}>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: 'var(--color-text2)',
                            fontFamily: '"Nunito Sans", sans-serif',
                            fontSize: '1rem',
                            fontWeight: 600
                          }}
                        >
                          Categoría: {elemento.subcategoria.categoria.nombre_categoria}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: 'var(--color-text2)',
                            fontFamily: '"Nunito Sans", sans-serif',
                            fontSize: '1rem',
                            fontWeight: 600
                          }}
                        >
                          Subcategoría: {elemento.subcategoria.nombre_subcategoria}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: 'var(--color-text2)',
                            fontFamily: '"Nunito Sans", sans-serif',
                            fontSize: '1rem',
                            fontWeight: 600
                          }}
                        >
                          Material: {elemento.material?.nombre_material || 'No especificado'}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: 'var(--color-text2)',
                            fontFamily: '"Nunito Sans", sans-serif',
                            fontSize: '1rem',
                            fontWeight: 600
                          }}
                        >
                          Color: {elemento.color.nombre_color}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        mb: 3,
                        px: 2
                      }}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: 'var(--gold)',
                            fontFamily: '"Montserrat Alternates", cursive',
                            fontWeight: 800,
                            fontSize: '1.8rem'
                          }}
                        >
                          ${elemento.precio_elemento}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: elemento.cantidad_disponible > 0 ? 'var(--success)' : 'var(--error)',
                            fontWeight: 700,
                            fontFamily: '"Nunito Sans", sans-serif',
                            fontSize: '1rem',
                            backgroundColor: elemento.cantidad_disponible > 0 ? 'var(--success-light)' : 'var(--error-light)',
                            px: 2,
                            py: 0.5,
                            borderRadius: 1
                          }}
                        >
                          Stock: {elemento.cantidad_disponible}
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        mt: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 2,
                        px: 2
                      }}>
                        {isAuthenticated && userRole === 'cliente' ? (
                          <>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              backgroundColor: 'var(--color-background2)',
                              borderRadius: 1,
                              p: 0.5
                            }}>
                              <IconButton
                                size="small"
                                onClick={() => handleCantidadChange(elemento.id_elemento, 
                                  (cantidadesSeleccionadas[elemento.id_elemento] || 1) - 1)}
                                sx={{ 
                                  color: 'var(--gold)',
                                  '&:hover': {
                                    backgroundColor: 'var(--gold-light)'
                                  }
                                }}
                              >
                                <RemoveIcon />
                              </IconButton>
                              <Typography sx={{ 
                                color: 'var(--color-text)',
                                fontFamily: '"Montserrat Alternates", cursive',
                                fontWeight: 700,
                                fontSize: '1.2rem',
                                minWidth: '2rem',
                                textAlign: 'center'
                              }}>
                                {cantidadesSeleccionadas[elemento.id_elemento] || 1}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleCantidadChange(elemento.id_elemento, 
                                  (cantidadesSeleccionadas[elemento.id_elemento] || 1) + 1)}
                                sx={{ 
                                  color: 'var(--gold)',
                                  '&:hover': {
                                    backgroundColor: 'var(--gold-light)'
                                  }
                                }}
                              >
                                <AddIcon />
                              </IconButton>
                            </Box>
                            <Button
                              variant="contained"
                              fullWidth
                              sx={{ 
                                backgroundColor: 'var(--gold)',
                                fontFamily: '"Montserrat Alternates", cursive',
                                fontWeight: 800,
                                color: 'var(--white)',
                                fontSize: {
                                  xs: '0.65rem',
                                  sm: '1rem'
                                },
                                py: {
                                  xs: 0.6,
                                  sm: 1.5
                                },
                                px: {
                                  xs: 0.5,
                                  sm: 2
                                },
                                '&:hover': {
                                  backgroundColor: 'var(--dark-gold)',
                                },
                                '&:disabled': {
                                  backgroundColor: 'var(--color-disabled)',
                                  color: 'var(--color-text-disabled)'
                                }
                              }}
                              disabled={elemento.cantidad_disponible === 0}
                              onClick={() => handleAddToCart(elemento)}
                            >
                              {elemento.cantidad_disponible === 0 ? 'No disponible' : 'Agregar al carrito'}
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => navigate('/login')}
                            sx={{ 
                              backgroundColor: 'var(--gold)',
                              fontFamily: '"Montserrat Alternates", cursive',
                              fontWeight: 800,
                              color: 'var(--white)',
                              fontSize: {
                                xs: '0.65rem',
                                sm: '1rem'
                              },
                              py: {
                                xs: 0.6,
                                sm: 1.5
                              },
                              px: {
                                xs: 0.5,
                                sm: 2
                              },
                              '&:hover': {
                                backgroundColor: 'var(--dark-gold)',
                              }
                            }}
                          >
                            Iniciar sesión para alquilar
                          </Button>
                        )}
                      </Box>
                      {carrito.find(item => item.id_elemento === elemento.id_elemento) && (
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            mt: 2,
                            color: 'var(--success)',
                            fontFamily: '"Nunito Sans", sans-serif',
                            fontWeight: 700,
                            textAlign: 'center',
                            backgroundColor: 'var(--success-light)',
                            py: 1,
                            borderRadius: 1,
                            mx: 2
                          }}
                        >
                          En carrito: {carrito.find(item => item.id_elemento === elemento.id_elemento)?.cantidad || 0}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Suspense>

          {/* Pagination Controls */}
          {filteredElementos.length > itemsPerPage && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              mt: 4,
              gap: 2
            }}>
              <Button
                variant="outlined"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                sx={{
                  borderColor: 'var(--gold)',
                  color: 'var(--gold)',
                  fontFamily: '"Montserrat Alternates", cursive',
                  fontWeight: 800,
                  '&:hover': {
                    backgroundColor: 'var(--gold-light)'
                  }
                }}
              >
                Anterior
              </Button>
              
              <Typography sx={{ 
                fontFamily: '"Nunito Sans", sans-serif',
                color: 'var(--color-text)'
              }}>
                Página {currentPage} de {Math.ceil(filteredElementos.length / itemsPerPage)}
              </Typography>
              
              <Button
                variant="outlined"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredElementos.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(filteredElementos.length / itemsPerPage)}
                sx={{
                  borderColor: 'var(--gold)',
                  color: 'var(--gold)',
                  fontFamily: '"Montserrat Alternates", cursive',
                  fontWeight: 800,
                  '&:hover': {
                    backgroundColor: 'var(--gold-light)'
                  }
                }}
              >
                Siguiente
              </Button>
            </Box>
          )}

          {/* Solo mostrar el carrito si el usuario está autenticado y es cliente */}
          {isAuthenticated && userRole === 'cliente' && (
            <Drawer
              anchor="right"
              open={carritoAbierto}
              onClose={() => setCarritoAbierto(false)}
              PaperProps={{
                sx: {
                  backgroundColor: 'var(--color-background)',
                  color: 'var(--color-text)',
                  width: {
                    xs: '100%',
                    sm: '350px'
                  },
                  p: {
                    xs: 1,
                    sm: 2
                  }
                }
              }}
            >
              <Box sx={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                gap: {
                  xs: 1,
                  sm: 2
                }
              }}>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  px: 1
                }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: '"Montserrat Alternates", cursive',
                      fontWeight: 800,
                      color: 'var(--color-text)',
                      fontSize: {
                        xs: '0.9rem',
                        sm: '1.5rem'
                      },
                      textAlign: 'center',
                      flex: 1
                    }}
                  >
                    Carrito de Compras
                  </Typography>
                  <IconButton
                    onClick={() => setCarritoAbierto(false)}
                    sx={{ 
                      color: 'var(--gold)',
                      p: 0.5,
                      '&:hover': {
                        color: 'var(--dark-gold)'
                      }
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                
                <List sx={{ 
                  flexGrow: 1, 
                  overflow: 'auto',
                  mb: {
                    xs: 1,
                    sm: 2
                  },
                  maxHeight: {
                    xs: 'calc(100vh - 200px)',
                    sm: 'calc(100vh - 300px)'
                  }
                }}>
                  {carrito.map(item => (
                    <ListItem 
                      key={item.id_elemento} 
                      divider
                      sx={{
                        flexDirection: {
                          xs: 'column',
                          sm: 'row'
                        },
                        alignItems: {
                          xs: 'flex-start',
                          sm: 'center'
                        },
                        gap: {
                          xs: 1,
                          sm: 0
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography sx={{ 
                            fontFamily: '"Montserrat Alternates", cursive',
                            fontWeight: 700,
                            color: 'var(--color-text)',
                            fontSize: {
                              xs: '1rem',
                              sm: '1.1rem'
                            }
                          }}>
                            {item.nombre_elemento}
                          </Typography>
                        }
                        secondary={
                          <Typography sx={{ 
                            color: 'var(--color-text-secondary)',
                            fontFamily: '"Nunito Sans", sans-serif',
                            fontSize: {
                              xs: '0.9rem',
                              sm: '1rem'
                            }
                          }}>
                            ${item.precio_elemento} x {item.cantidad}
                          </Typography>
                        }
                      />
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        width: {
                          xs: '100%',
                          sm: 'auto'
                        },
                        justifyContent: {
                          xs: 'space-between',
                          sm: 'flex-end'
                        }
                      }}>
                        <IconButton
                          size="small"
                          onClick={() => handleCantidadChange(item.id_elemento, item.cantidad - 1)}
                          sx={{ color: 'var(--gold)' }}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ 
                          mx: 1, 
                          color: 'var(--color-text)',
                          fontFamily: '"Nunito Sans", sans-serif',
                          fontSize: {
                            xs: '0.9rem',
                            sm: '1rem'
                          }
                        }}>
                          {item.cantidad}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleCantidadChange(item.id_elemento, item.cantidad + 1)}
                          sx={{ color: 'var(--gold)' }}
                        >
                          <AddIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => eliminarDelCarrito(item.id_elemento)}
                          sx={{ color: 'var(--error)' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ 
                  p: {
                    xs: 1,
                    sm: 2
                  }, 
                  bgcolor: 'var(--color-background2)',
                  borderRadius: 1,
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 1
                }}>
                  <Typography 
                    variant="h6"
                    sx={{ 
                      fontFamily: '"Montserrat Alternates", cursive',
                      fontWeight: 800,
                      color: 'var(--color-text)',
                      mb: {
                        xs: 1,
                        sm: 2
                      },
                      fontSize: {
                        xs: '1.1rem',
                        sm: '1.5rem'
                      }
                    }}
                  >
                    Total: ${calcularTotal().toFixed(2)}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: {
                      xs: 0.5,
                      sm: 1
                    }
                  }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={vaciarCarrito}
                      disabled={carrito.length === 0}
                      sx={{
                        borderColor: 'var(--error)',
                        color: 'var(--error)',
                        fontFamily: '"Montserrat Alternates", cursive',
                        fontWeight: 800,
                        fontSize: {
                          xs: '0.7rem',
                          sm: '1rem'
                        },
                        py: {
                          xs: 0.8,
                          sm: 1.5
                        },
                        '&:hover': {
                          borderColor: 'var(--error)',
                          backgroundColor: 'var(--error-light)'
                        }
                      }}
                    >
                      Vaciar Carrito
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleComprar}
                      disabled={carrito.length === 0}
                      sx={{
                        backgroundColor: 'var(--gold)',
                        fontFamily: '"Montserrat Alternates", cursive',
                        fontWeight: 800,
                        color: 'var(--white)',
                        fontSize: {
                          xs: '0.65rem',
                          sm: '1rem'
                        },
                        py: {
                          xs: 0.6,
                          sm: 1.5
                        },
                        px: {
                          xs: 0.5,
                          sm: 2
                        },
                        '&:hover': {
                          backgroundColor: 'var(--dark-gold)',
                        },
                        '&:disabled': {
                          backgroundColor: 'var(--color-disabled)',
                          color: 'var(--color-text-disabled)'
                        }
                      }}
                    >
                      Comprar
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Drawer>
          )}

          <Dialog
            open={showAlquilerModal}
            onClose={() => setShowAlquilerModal(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                borderRadius: 2,
                p: { xs: 2, sm: 3 }
              }
            }}
          >
            <DialogTitle sx={{ 
              fontFamily: '"Montserrat Alternates", cursive',
              fontWeight: 800,
              color: 'var(--gold)',
              fontSize: { xs: '1.2rem', sm: '1.5rem' }
            }}>
              Confirmar Alquiler
            </DialogTitle>
            <DialogContent>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontFamily: '"Montserrat Alternates", cursive', fontWeight: 600 }}>Elemento</TableCell>
                      <TableCell sx={{ fontFamily: '"Montserrat Alternates", cursive', fontWeight: 600 }}>Cantidad</TableCell>
                      <TableCell sx={{ fontFamily: '"Montserrat Alternates", cursive', fontWeight: 600 }}>Precio Unitario</TableCell>
                      <TableCell sx={{ fontFamily: '"Montserrat Alternates", cursive', fontWeight: 600 }}>Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {carrito.map((item) => (
                      <TableRow key={item.id_elemento}>
                        <TableCell>{item.nombre_elemento}</TableCell>
                        <TableCell>{item.cantidad}</TableCell>
                        <TableCell>${item.precio_elemento}</TableCell>
                        <TableCell>${(item.precio_elemento * item.cantidad).toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Typography 
                variant="h6" 
                sx={{ 
                  mt: 3,
                  fontFamily: '"Montserrat Alternates", cursive',
                  fontWeight: 800,
                  color: 'var(--gold)'
                }}
              >
                Total: ${calcularTotal().toFixed(2)}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => setShowAlquilerModal(false)}
                sx={{
                  color: 'var(--error)',
                  fontFamily: '"Montserrat Alternates", cursive',
                  fontWeight: 600
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (onComprarCarrito) {
                    onComprarCarrito(carrito);
                  }
                  setShowAlquilerModal(false);
                  setCarrito([]);
                  setNotificacion({
                    abierta: true,
                    mensaje: 'Alquiler confirmado',
                    tipo: 'success'
                  });
                }}
                variant="contained"
                sx={{
                  backgroundColor: 'var(--gold)',
                  fontFamily: '"Montserrat Alternates", cursive',
                  fontWeight: 800,
                  '&:hover': {
                    backgroundColor: 'var(--dark-gold)'
                  }
                }}
              >
                Confirmar Alquiler
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={showEventoModal}
            onClose={() => setShowEventoModal(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                borderRadius: 2,
                p: { xs: 2, sm: 3 }
              }
            }}
          >
            <DialogTitle sx={{ 
              fontFamily: '"Montserrat Alternates", cursive',
              fontWeight: 800,
              color: 'var(--gold)',
              fontSize: { xs: '1.2rem', sm: '1.5rem' }
            }}>
              Seleccionar Evento
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <TextField
                  label="ID del Evento"
                  type="number"
                  value={selectedEventoId}
                  onChange={(e) => setSelectedEventoId(e.target.value)}
                  sx={{
                    width: '200px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'var(--color-input-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--gold)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--gold)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--color-text)',
                      '&.Mui-focused': {
                        color: 'var(--gold)',
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => setShowNuevoEventoModal(true)}
                  sx={{
                    backgroundColor: 'var(--gold)',
                    fontFamily: '"Montserrat Alternates", cursive',
                    fontWeight: 800,
                    '&:hover': {
                      backgroundColor: 'var(--dark-gold)'
                    }
                  }}
                >
                  Agregar Nuevo Evento
                </Button>
              </Box>

              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontFamily: '"Montserrat Alternates", cursive', fontWeight: 600 }}>ID</TableCell>
                      <TableCell sx={{ fontFamily: '"Montserrat Alternates", cursive', fontWeight: 600 }}>Nombre</TableCell>
                      <TableCell sx={{ fontFamily: '"Montserrat Alternates", cursive', fontWeight: 600 }}>Fecha</TableCell>
                      <TableCell sx={{ fontFamily: '"Montserrat Alternates", cursive', fontWeight: 600 }}>Lugar</TableCell>
                      <TableCell sx={{ fontFamily: '"Montserrat Alternates", cursive', fontWeight: 600 }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {eventos.map((evento: any) => (
                      <TableRow key={evento.id_evento}>
                        <TableCell>{evento.id_evento}</TableCell>
                        <TableCell>{evento.nombre_evento}</TableCell>
                        <TableCell>{new Date(evento.fecha_evento).toLocaleDateString()}</TableCell>
                        <TableCell>{evento.lugar_evento}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              setSelectedEventoId(evento.id_evento.toString());
                              setShowEventoModal(false);
                              setShowAlquilerModal(true);
                            }}
                            sx={{
                              backgroundColor: 'var(--gold)',
                              fontFamily: '"Montserrat Alternates", cursive',
                              fontWeight: 600,
                              '&:hover': {
                                backgroundColor: 'var(--dark-gold)'
                              }
                            }}
                          >
                            Seleccionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Resumen de elementos seleccionados */}
              <Box sx={{ mt: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: '"Montserrat Alternates", cursive',
                    fontWeight: 800,
                    color: 'var(--gold)',
                    mb: 2
                  }}
                >
                  Resumen de Elementos Seleccionados
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontFamily: '"Montserrat Alternates", cursive', fontWeight: 600 }}>Elemento</TableCell>
                        <TableCell sx={{ fontFamily: '"Montserrat Alternates", cursive', fontWeight: 600 }}>Cantidad</TableCell>
                        <TableCell sx={{ fontFamily: '"Montserrat Alternates", cursive', fontWeight: 600 }}>Precio Unitario</TableCell>
                        <TableCell sx={{ fontFamily: '"Montserrat Alternates", cursive', fontWeight: 600 }}>Subtotal</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {carrito.map((item) => (
                        <TableRow key={item.id_elemento}>
                          <TableCell>{item.nombre_elemento}</TableCell>
                          <TableCell>{item.cantidad}</TableCell>
                          <TableCell>${item.precio_elemento}</TableCell>
                          <TableCell>${(item.precio_elemento * item.cantidad).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>Total:</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>${calcularTotal().toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button
                  onClick={() => setShowEventoModal(false)}
                  sx={{
                    color: 'var(--error)',
                    fontFamily: '"Montserrat Alternates", cursive',
                    fontWeight: 600
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    if (selectedEventoId) {
                      setShowEventoModal(false);
                      setShowAlquilerModal(true);
                    } else {
                      setNotificacion({
                        abierta: true,
                        mensaje: 'Por favor, seleccione o ingrese un ID de evento',
                        tipo: 'error'
                      });
                    }
                  }}
                  sx={{
                    backgroundColor: 'var(--gold)',
                    fontFamily: '"Montserrat Alternates", cursive',
                    fontWeight: 800,
                    '&:hover': {
                      backgroundColor: 'var(--dark-gold)'
                    }
                  }}
                >
                  Continuar con Alquiler
                </Button>
              </Box>
            </DialogContent>
          </Dialog>

          <Dialog
            open={showNuevoEventoModal}
            onClose={() => setShowNuevoEventoModal(false)}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                borderRadius: 2,
                p: { xs: 2, sm: 3 }
              }
            }}
          >
            <DialogTitle sx={{ 
              fontFamily: '"Montserrat Alternates", cursive',
              fontWeight: 800,
              color: 'var(--gold)',
              fontSize: { xs: '1.2rem', sm: '1.5rem' }
            }}>
              Nuevo Evento
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <TextField
                  label="Nombre del Evento"
                  value={nuevoEvento.nombre_evento}
                  onChange={(e) => setNuevoEvento(prev => ({ ...prev, nombre_evento: e.target.value }))}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'var(--color-input-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--gold)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--gold)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--color-text)',
                      '&.Mui-focused': {
                        color: 'var(--gold)',
                      },
                    },
                  }}
                />
                <TextField
                  label="Fecha del Evento"
                  type="date"
                  value={nuevoEvento.fecha_evento}
                  onChange={(e) => setNuevoEvento(prev => ({ ...prev, fecha_evento: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'var(--color-input-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--gold)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--gold)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--color-text)',
                      '&.Mui-focused': {
                        color: 'var(--gold)',
                      },
                    },
                  }}
                />
                <TextField
                  label="Hora de Inicio"
                  type="time"
                  value={nuevoEvento.hora_inicio}
                  onChange={(e) => setNuevoEvento(prev => ({ ...prev, hora_inicio: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'var(--color-input-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--gold)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--gold)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--color-text)',
                      '&.Mui-focused': {
                        color: 'var(--gold)',
                      },
                    },
                  }}
                />
                <TextField
                  label="Hora de Fin"
                  type="time"
                  value={nuevoEvento.hora_fin}
                  onChange={(e) => setNuevoEvento(prev => ({ ...prev, hora_fin: e.target.value }))}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'var(--color-input-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--gold)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--gold)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--color-text)',
                      '&.Mui-focused': {
                        color: 'var(--gold)',
                      },
                    },
                  }}
                />
                <TextField
                  label="Lugar del Evento"
                  value={nuevoEvento.lugar_evento}
                  onChange={(e) => setNuevoEvento(prev => ({ ...prev, lugar_evento: e.target.value }))}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'var(--color-input-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--gold)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--gold)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--color-text)',
                      '&.Mui-focused': {
                        color: 'var(--gold)',
                      },
                    },
                  }}
                />
                <TextField
                  label="Descripción"
                  value={nuevoEvento.descripcion}
                  onChange={(e) => setNuevoEvento(prev => ({ ...prev, descripcion: e.target.value }))}
                  fullWidth
                  multiline
                  rows={4}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'var(--color-input-border)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'var(--gold)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'var(--gold)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'var(--color-text)',
                      '&.Mui-focused': {
                        color: 'var(--gold)',
                      },
                    },
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={() => setShowNuevoEventoModal(false)}
                sx={{
                  color: 'var(--error)',
                  fontFamily: '"Montserrat Alternates", cursive',
                  fontWeight: 600
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleNuevoEvento}
                variant="contained"
                sx={{
                  backgroundColor: 'var(--gold)',
                  fontFamily: '"Montserrat Alternates", cursive',
                  fontWeight: 800,
                  '&:hover': {
                    backgroundColor: 'var(--dark-gold)'
                  }
                }}
              >
                Crear Evento
              </Button>
            </DialogActions>
          </Dialog>

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
                },
                '& .MuiAlert-standardSuccess': {
                  backgroundColor: '#2e7d32'
                },
                '& .MuiAlert-standardError': {
                  backgroundColor: '#d32f2f'
                }
              }}
            >
              {notificacion.mensaje}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </>
  );
};

export default Catalog;