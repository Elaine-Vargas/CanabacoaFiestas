import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react';
import axios from 'axios';
import { 
  Card, CardContent, Typography, Grid, Container, TextField, Select, 
  MenuItem, FormControl, InputLabel, Box, CircularProgress, IconButton, 
  Badge, Drawer, List, ListItem, ListItemText, Button, Snackbar, Alert, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

// Lazy-loaded components
const apiUrl = import.meta.env.VITE_API_BASE_URL;


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
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('userRole');
      console.log('Token:', token ? 'Presente' : 'No presente');
      console.log('Rol:', role);
      setIsAuthenticated(!!token);
      setUserRole(role);
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Iniciando carga de datos...');
        console.log('URL de la API:', apiUrl);
        
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        console.log('Headers:', headers);
        
        const [elementosRes, categoriasRes, coloresRes, materialesRes] = await Promise.all([
          axios.get(`${apiUrl}/elemento`, { headers }),
          axios.get(`${apiUrl}/elemento/categorias/list`, { headers }),
          axios.get(`${apiUrl}/elemento/colores/list`, { headers }),
          axios.get(`${apiUrl}/elemento/materiales/list`, { headers })
        ]);

        console.log('Respuesta completa de elementos:', elementosRes);
        console.log('Datos de elementos:', elementosRes.data);
        console.log('Tipo de datos de elementos:', typeof elementosRes.data);
        console.log('¿Es array?', Array.isArray(elementosRes.data));

        if (elementosRes.data && Array.isArray(elementosRes.data)) {
          console.log('Número de elementos recibidos:', elementosRes.data.length);
          setElementos(elementosRes.data);
        } else {
          console.error('Los elementos recibidos no son un array:', elementosRes.data);
          setElementos([]);
        }

        if (categoriasRes.data && Array.isArray(categoriasRes.data)) {
          setCategorias(categoriasRes.data);
        } else {
          console.error('Las categorías recibidas no son un array:', categoriasRes.data);
          setCategorias([]);
        }

        if (coloresRes.data && Array.isArray(coloresRes.data)) {
          setColores(coloresRes.data);
        } else {
          console.error('Los colores recibidos no son un array:', coloresRes.data);
          setColores([]);
        }

        if (materialesRes.data && Array.isArray(materialesRes.data)) {
          setMateriales(materialesRes.data);
        } else {
          console.error('Los materiales recibidos no son un array:', materialesRes.data);
          setMateriales([]);
        }
      } catch (error) {
        console.error('Error detallado al cargar los datos:', error);
        setNotificacion({
          abierta: true,
          mensaje: 'Error al cargar el catálogo. Por favor, intente nuevamente.',
          tipo: 'error'
        });
        // Inicializar los estados con arrays vacíos en caso de error
        setElementos([]);
        setCategorias([]);
        setColores([]);
        setMateriales([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await axios.get(`${apiUrl}/eventos`);
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

  const handleCantidadChange = (id: number, cantidad: number) => {
    const elemento = elementos.find(e => e.id_elemento === id);
    if (!elemento) return;

    // Asegurarse de que la cantidad no sea negativa
    if (cantidad < 1) {
      setCantidadesSeleccionadas(prev => ({
        ...prev,
        [id]: 1
      }));
      return;
    }

    // Verificar si la cantidad excede el stock disponible
    if (cantidad > elemento.cantidad_disponible) {
      setNotificacion({
        abierta: true,
        mensaje: 'No hay suficiente stock disponible',
        tipo: 'error'
      });
      return;
    }

    // Actualizar la cantidad seleccionada
    setCantidadesSeleccionadas(prev => ({
      ...prev,
      [id]: cantidad
    }));

    // Si el elemento está en el carrito, actualizar también su cantidad
    setCarrito(prev => 
      prev.map(item => 
        item.id_elemento === id 
          ? { ...item, cantidad: cantidad }
          : item
      )
    );
  };

  const handleCantidadInputChange = (id: number, value: string) => {
    const cantidad = parseInt(value) || 0;
    
    const elemento = elementos.find(e => e.id_elemento === id);
    if (cantidad > 0 && (!elemento || cantidad > elemento.cantidad_disponible)) {
      setNotificacion({
        abierta: true,
        mensaje: 'No hay suficiente stock disponible',
        tipo: 'error'
      });
      return;
    }

    setCarrito(prev => 
      prev.map(item => 
        item.id_elemento === id 
          ? { ...item, cantidad: cantidad }
          : item
      )
    );

    setCantidadesSeleccionadas(prev => ({
      ...prev,
      [id]: cantidad
    }));
  };

  const handleAddToCart = (item: Elemento) => {
    const cantidad = cantidadesSeleccionadas[item.id_elemento] || 1;
    const itemConCantidad = { ...item, cantidad };
    
    setCarrito(prev => {
      const itemExistente = prev.find(i => i.id_elemento === item.id_elemento);
      if (itemExistente) {
        return prev.map(i => 
          i.id_elemento === item.id_elemento 
            ? { ...i, cantidad: cantidad }
            : i
        );
      }
      return [...prev, itemConCantidad];
    });
    
    setNotificacion({
      abierta: true,
      mensaje: 'Producto agregado al carrito',
      tipo: 'success'
    });
  };

  const actualizarCantidadCarrito = (id: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    
    const elemento = elementos.find(e => e.id_elemento === id);
    if (!elemento || nuevaCantidad > elemento.cantidad_disponible) {
      setNotificacion({
        abierta: true,
        mensaje: 'No hay suficiente stock disponible',
        tipo: 'error'
      });
      return;
    }

    setCarrito(prev => 
      prev.map(item => 
        item.id_elemento === id 
          ? { ...item, cantidad: nuevaCantidad }
          : item
      )
    );
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
      await axios.post(`${apiUrl}/eventos`, nuevoEvento);
      setShowNuevoEventoModal(false);
      setNotificacion({
        abierta: true,
        mensaje: 'Evento creado exitosamente',
        tipo: 'success'
      });
      // Recargar eventos
      const response = await axios.get(`${apiUrl}/eventos`);
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
    if (carrito.length === 0) {
      setNotificacion({
        abierta: true,
        mensaje: 'El carrito está vacío',
        tipo: 'error'
      });
      return;
    }
    setShowEventoModal(true);
  };

  const handleCrearEvento = () => {
    setShowEventoModal(false);
    navigate('/dashboard/bienvenida');
  };

  // Filtrar y paginar los elementos
  const filteredElementos = useMemo(() => {
    return elementos.filter(elemento => {
      const matchesCategoria = !filtros.categoria || elemento.subcategoria.categoria.id_categoria === Number(filtros.categoria);
      const matchesSubcategoria = !filtros.subcategoria || elemento.subcategoria.id_subcategoria === Number(filtros.subcategoria);
      const matchesColor = !filtros.color || elemento.color.id_color === Number(filtros.color);
      const matchesMaterial = !filtros.material || elemento.material.id_material === Number(filtros.material);
      const matchesBusqueda = !filtros.busqueda || 
        elemento.nombre_elemento.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        elemento.subcategoria.nombre_subcategoria.toLowerCase().includes(filtros.busqueda.toLowerCase());

      return matchesCategoria && matchesSubcategoria && matchesColor && matchesMaterial && matchesBusqueda;
    });
  }, [elementos, filtros]);

  const paginatedElementos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = filteredElementos.slice(startIndex, startIndex + itemsPerPage);
    console.log('Elementos paginados:', paginated.length);
    return paginated;
  }, [filteredElementos, currentPage, itemsPerPage]);

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
                          <TextField
                            type="number"
                            value={cantidadesSeleccionadas[elemento.id_elemento] || 1}
                            onChange={(e) => handleCantidadInputChange(elemento.id_elemento, e.target.value)}
                            inputProps={{
                              min: 1,
                              style: {
                                textAlign: 'center',
                                padding: '4px',
                                width: '60px',
                                fontFamily: '"Montserrat Alternates", cursive',
                                fontWeight: 700,
                                fontSize: '1.2rem',
                                color: 'var(--color-text)',
                                WebkitAppearance: 'none',
                                MozAppearance: 'textfield'
                              }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  border: 'none'
                                },
                                '&:hover fieldset': {
                                  border: 'none'
                                },
                                '&.Mui-focused fieldset': {
                                  border: 'none'
                                },
                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                  WebkitAppearance: 'none',
                                  margin: 0
                                }
                              }
                            }}
                          />
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

          <Drawer
            anchor="right"
            open={carritoAbierto}
            onClose={() => setCarritoAbierto(false)}
            PaperProps={{
              sx: {
                width: { xs: '100%', sm: 400 },
                p: 3,
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)'
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ 
                color: 'var(--gold)',
                fontWeight: 700,
                fontFamily: '"Montserrat Alternates", cursive'
              }}>
                Cotización de Alquiler
              </Typography>
              <IconButton onClick={() => setCarritoAbierto(false)}>
                <CloseIcon />
              </IconButton>
            </Box>

            {carrito.length === 0 ? (
              <Typography sx={{ textAlign: 'center', color: 'var(--color-text)' }}>
                No hay elementos en el carrito
              </Typography>
            ) : (
              <>
                <List>
                  {carrito.map((item) => (
                    <ListItem
                      key={item.id_elemento}
                      sx={{
                        mb: 2,
                        p: 2,
                        backgroundColor: 'var(--color-background2)',
                        borderRadius: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        opacity: item.cantidad === 0 ? 0.5 : 1,
                        transition: 'opacity 0.3s ease'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography variant="h6" sx={{ color: 'var(--gold)' }}>
                          {item.nombre_elemento}
                        </Typography>
                        <IconButton 
                          size="small" 
                          onClick={() => eliminarDelCarrito(item.id_elemento)}
                          sx={{ color: 'var(--error)' }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          backgroundColor: 'var(--color-background)',
                          borderRadius: 1,
                          p: 0.5
                        }}>
                          <IconButton
                            size="small"
                            onClick={() => handleCantidadChange(item.id_elemento, item.cantidad - 1)}
                            sx={{ 
                              color: 'var(--gold)',
                              '&:hover': {
                                backgroundColor: 'var(--gold-light)'
                              }
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <TextField
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => handleCantidadInputChange(item.id_elemento, e.target.value)}
                            inputProps={{
                              min: 1,
                              style: {
                                textAlign: 'center',
                                padding: '4px',
                                width: '60px',
                                fontFamily: '"Montserrat Alternates", cursive',
                                fontWeight: 700,
                                fontSize: '1rem',
                                color: 'var(--color-text)',
                                WebkitAppearance: 'none',
                                MozAppearance: 'textfield'
                              }
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  border: 'none'
                                },
                                '&:hover fieldset': {
                                  border: 'none'
                                },
                                '&.Mui-focused fieldset': {
                                  border: 'none'
                                },
                                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                                  WebkitAppearance: 'none',
                                  margin: 0
                                }
                              }
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleCantidadChange(item.id_elemento, item.cantidad + 1)}
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
                        <Typography>Precio por Unidad: ${item.precio_elemento}</Typography>
                      </Box>
                      <Typography sx={{ 
                        textAlign: 'right',
                        color: 'var(--gold)',
                        fontWeight: 700
                      }}>
                        Subtotal: ${item.precio_elemento * item.cantidad}
                      </Typography>
                    </ListItem>
                  ))}
                </List>

                <Box sx={{ 
                  mt: 3,
                  p: 2,
                  backgroundColor: 'var(--color-background2)',
                  borderRadius: '1rem'
                }}>
                  <Typography variant="h6" sx={{ 
                    textAlign: 'right',
                    color: 'var(--gold)',
                    fontWeight: 700,
                    mb: 1
                  }}>
                    Subtotal: ${calcularTotal()}
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    textAlign: 'right',
                    color: 'var(--gold)',
                    fontWeight: 700,
                    mb: 1
                  }}>
                    ITBIS (18%): ${(calcularTotal() * 0.18).toFixed(2)}
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    textAlign: 'right',
                    color: 'var(--gold)',
                    fontWeight: 800,
                    borderTop: '2px solid var(--gold)',
                    pt: 1,
                    mt: 1
                  }}>
                    Total: ${(calcularTotal() * 1.18).toFixed(2)}
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleComprar}
                  sx={{
                    mt: 3,
                    mb: 4,
                    backgroundColor: 'var(--gold)',
                    '&:hover': {
                      backgroundColor: 'var(--dark-gold)',
                    }
                  }}
                >
                  Enviar Cotización
                </Button>
              </>
            )}
          </Drawer>

          <Dialog
            open={showEventoModal}
            onClose={() => setShowEventoModal(false)}
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
              color: 'var(--gold)',
              textAlign: 'center',
              borderBottom: '2px solid var(--gold)',
              pb: 2
            }}>
              Seleccionar Evento
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  fullWidth
                  onClick={() => {
                    setShowEventoModal(false);
                    navigate('/Menu-Servicios/Bienvenida');
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

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Seleccionar Evento Existente</InputLabel>
                  <Select
                    value={selectedEventoId}
                    onChange={(e) => setSelectedEventoId(e.target.value)}
                    label="Seleccionar Evento Existente"
                  >
                    {eventos.map((evento: any) => (
                      <MenuItem key={evento.id_evento} value={evento.id_evento}>
                        {evento.tipo_evento} - {evento.fecha_evento}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button 
                onClick={() => setShowEventoModal(false)}
                sx={{ color: 'var(--error)' }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  if (selectedEventoId) {
                    onComprarCarrito?.(carrito);
                    setShowEventoModal(false);
                    setCarrito([]);
                    setCarritoAbierto(false);
                  } else {
                    setNotificacion({
                      abierta: true,
                      mensaje: 'Por favor, seleccione o cree un evento',
                      tipo: 'error'
                    });
                  }
                }}
                variant="contained"
                disabled={!selectedEventoId}
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