import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Container, 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Box, 
  CircularProgress,
  IconButton,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  Snackbar,
  Alert,
  Divider,
  Skeleton
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import '../styles/fonts.scss';
import '../styles/theme.scss';

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

// Componente para la imagen optimizada
const OptimizedImage = ({ src, alt }: { src: string; alt: string }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <Box sx={{ 
      position: 'relative', 
      width: '100%', 
      paddingTop: '100%', // Cambiado de 75% a 100% para un cuadrado perfecto
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
          objectFit: 'contain', // Cambiado de 'cover' a 'contain'
          backgroundColor: '#f5f5f5', // Fondo gris claro para imágenes con transparencia
          padding: '8px', // Espacio alrededor de la imagen
          borderRadius: '8px',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease-in-out'
        }}
      />
    </Box>
  );
};

const Catalog = () => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Iniciando carga de datos...');
        setLoading(true);

        const [elementosRes, categoriasRes, coloresRes, materialesRes] = await Promise.all([
          axios.get('http://localhost:3000/api/elementos'),
          axios.get('http://localhost:3000/api/elementos/categorias/list'),
          axios.get('http://localhost:3000/api/elementos/colores/list'),
          axios.get('http://localhost:3000/api/elementos/materiales/list')
        ]);

        console.log('Respuesta de elementos:', elementosRes.data);
        console.log('Respuesta de categorías:', categoriasRes.data);
        console.log('Respuesta de colores:', coloresRes.data);
        console.log('Respuesta de materiales:', materialesRes.data);

        if (!elementosRes.data || elementosRes.data.length === 0) {
          console.error('No se recibieron elementos del backend');
          setNotificacion({
            abierta: true,
            mensaje: 'No se pudieron cargar los elementos. Por favor, intente más tarde.',
            tipo: 'error'
          });
          return;
        }

        setElementos(elementosRes.data);
        setCategorias(categoriasRes.data);
        setColores(coloresRes.data);
        setMateriales(materialesRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error detallado al cargar datos:', error);
        setNotificacion({
          abierta: true,
          mensaje: 'Error al cargar los datos. Por favor, verifique que el servidor esté funcionando.',
          tipo: 'error'
        });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtrarElementos = () => {
    return elementos.filter(elemento => {
      const cumpleCategoria = !filtros.categoria || 
        elemento.subcategoria.categoria.id_categoria === Number(filtros.categoria);
      
      const cumpleSubcategoria = !filtros.subcategoria || 
        elemento.id_subcategoria === Number(filtros.subcategoria);
      
      const cumpleColor = !filtros.color || 
        elemento.color?.id_color === Number(filtros.color);

      const cumpleMaterial = !filtros.material ||
        elemento.material?.id_material === Number(filtros.material);
      
      const busqueda = filtros.busqueda.toLowerCase().trim();
      const cumpleBusqueda = !busqueda || 
        elemento.nombre_elemento.toLowerCase().includes(busqueda);

      return cumpleCategoria && cumpleSubcategoria && cumpleColor && cumpleMaterial && cumpleBusqueda;
    });
  };

  const handleFiltroChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFiltros(prev => ({
      ...prev,
      [name as string]: value,
      ...(name === 'categoria' && { subcategoria: '' })
    }));
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

  const agregarAlCarrito = (elemento: Elemento) => {
    const cantidad = cantidadesSeleccionadas[elemento.id_elemento] || 1;
    
    if (elemento.cantidad_disponible <= 0) {
      setNotificacion({
        abierta: true,
        mensaje: `No hay stock disponible de ${elemento.nombre_elemento}`,
        tipo: 'error'
      });
      return;
    }

    if (cantidad > elemento.cantidad_disponible) {
      setNotificacion({
        abierta: true,
        mensaje: `No hay suficiente stock disponible de ${elemento.nombre_elemento}`,
        tipo: 'error'
      });
      return;
    }

    const itemExistente = carrito.find(item => item.id_elemento === elemento.id_elemento);
    
    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      if (nuevaCantidad > elemento.cantidad_disponible) {
        setNotificacion({
          abierta: true,
          mensaje: `No hay suficiente stock disponible de ${elemento.nombre_elemento}`,
          tipo: 'error'
        });
        return;
      }
      setCarrito(carrito.map(item =>
        item.id_elemento === elemento.id_elemento
          ? { ...item, cantidad: nuevaCantidad }
          : item
      ));
    } else {
      setCarrito([...carrito, { ...elemento, cantidad }]);
    }

    setNotificacion({
      abierta: true,
      mensaje: `${elemento.nombre_elemento} agregado al carrito`,
      tipo: 'success'
    });

    // Limpiar la cantidad seleccionada
    setCantidadesSeleccionadas(prev => {
      const newState = { ...prev };
      delete newState[elemento.id_elemento];
      return newState;
    });
  };

  const actualizarCantidad = (id: number, nuevaCantidad: number) => {
    const elemento = elementos.find(e => e.id_elemento === id);
    if (!elemento || nuevaCantidad > elemento.cantidad_disponible) {
      setNotificacion({
        abierta: true,
        mensaje: `No hay suficiente stock disponible de ${elemento?.nombre_elemento}`,
        tipo: 'error'
      });
      return;
    }

    if (nuevaCantidad < 1) return;
    
    setCarrito(carrito.map(item =>
      item.id_elemento === id
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  const eliminarDelCarrito = (id: number) => {
    const elemento = elementos.find(e => e.id_elemento === id);
    setCarrito(carrito.filter(item => item.id_elemento !== id));
    setNotificacion({
      abierta: true,
      mensaje: `${elemento?.nombre_elemento} eliminado del carrito`,
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

  const procederAlPago = () => {
    if (carrito.length === 0) return;
    navigate('/login');
  };

  if (loading) {
    return (
      <>
        <Box sx={{ 
          background: 'var(--login-bg)',
          backgroundBlendMode: 'var(--login-blend)',
          minHeight: '100vh',
          width: '100%',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1
        }} />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
        <NavBar />
          <Container maxWidth="lg" sx={{ 
            py: { xs: 2, sm: 4 }, 
            mt: { xs: 6, sm: 8 },
            px: { xs: 1, sm: 2 },
            pb: { xs: 4, sm: 6 }
          }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" sx={{ mt: 8 }}>
          <CircularProgress sx={{ color: 'var(--gold)' }} />
            </Box>
          </Container>
        </Box>
      </>
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
      <NavBar />
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
            gap: { xs: 2, sm: 0 }
          }}>
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
                fontFamily: '"Nunito Sans", sans-serif',
              fontWeight: 800,
                color: 'var(--gold)',
                fontSize: { xs: '1.8rem', sm: '2.5rem' },
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textAlign: { xs: 'center', sm: 'left' }
            }}
          >
            Catálogo de Elementos
          </Typography>
          
          <IconButton 
            color="primary" 
            onClick={() => setCarritoAbierto(true)}
            sx={{ 
              position: 'relative',
                backgroundColor: 'var(--gold)',
                color: 'var(--white)',
                width: { xs: '45px', sm: '50px' },
                height: { xs: '45px', sm: '50px' },
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              '&:hover': {
                  backgroundColor: 'var(--dark-gold)',
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease-in-out'
                },
                '& .MuiBadge-badge': {
                  backgroundColor: 'var(--error)',
                  color: 'var(--white)',
                  fontWeight: 'bold',
                  fontSize: '0.8rem',
                  minWidth: '20px',
                  height: '20px',
                  borderRadius: '10px'
              }
            }}
          >
            <Badge badgeContent={carrito.length} color="error">
                <ShoppingCartIcon sx={{ fontSize: { xs: '1.5rem', sm: '1.8rem' } }} />
            </Badge>
          </IconButton>
        </Box>
        
          <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 2, sm: 4 } }}>
            <Grid item xs={12} md={3} component="div">
              <TextField
                fullWidth
                label="Buscar"
                name="busqueda"
                value={filtros.busqueda}
                onChange={(e) => setFiltros(prev => ({ ...prev, busqueda: e.target.value }))}
                placeholder="Buscar por nombre del elemento..."
                sx={{
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
            <Grid item xs={12} md={3} component="div">
              <FormControl fullWidth>
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
                  onChange={handleFiltroChange}
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
                      backgroundColor: 'var(--color-background-secondary)',
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
                          backgroundColor: 'var(--color-background-secondary)',
                        }
                      }}
                    >
                      {categoria.nombre_categoria}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3} component="div">
              <FormControl fullWidth>
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
                  onChange={handleFiltroChange}
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
                      backgroundColor: 'var(--color-background-secondary)',
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
                          backgroundColor: 'var(--color-background-secondary)',
                        }
                      }}
                    >
                      {color.nombre_color}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3} component="div">
              <FormControl fullWidth>
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
                  onChange={handleFiltroChange}
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
                      backgroundColor: 'var(--color-background-secondary)',
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
                          backgroundColor: 'var(--color-background-secondary)',
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

          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {filtrarElementos().map((elemento: Elemento) => (
              <Grid 
                key={`${elemento.id_elemento}-${elemento.color.id_color}`} 
                item
                xs={12} 
                md={6} 
                lg={4}
                component="div"
                sx={{
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
              <Card sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
                borderRadius: 2,
                '&:hover': {
                  boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                  transform: 'translateY(-2px)',
                  transition: 'all ease-in-out .2s'
                }
              }}>
                  <CardContent sx={{ 
                    p: { xs: 1.5, sm: 3 },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: { xs: 1, sm: 1.5 }
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
                      color: 'var(--color-text-secondary)',
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
                      color: 'var(--color-text-secondary)',
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
                          color: 'var(--color-text-secondary)',
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
                      color: 'var(--color-text-secondary)',
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
                        backgroundColor: 'var(--color-background-secondary)',
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
                            xs: '0.65rem',  // Tamaño más pequeño para 320x480
                            sm: '1rem'     // Tamaño normal en tablets y desktop
                          },
                          py: {
                            xs: 0.6,       // Padding vertical más pequeño para 320x480
                            sm: 1.5        // Padding vertical normal en tablets y desktop
                          },
                          px: {
                            xs: 0.5,       // Padding horizontal más pequeño para 320x480
                            sm: 2          // Padding horizontal normal en tablets y desktop
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
                    onClick={() => agregarAlCarrito(elemento)}
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
            </Grid>
          ))}
        </Grid>

        <Drawer
          anchor="right"
          open={carritoAbierto}
          onClose={() => setCarritoAbierto(false)}
          PaperProps={{
            sx: {
              backgroundColor: 'var(--color-background)',
              color: 'var(--color-text)',
                width: {
                  xs: '100%',    // En móviles ocupa todo el ancho
                  sm: '350px'    // En tablets y desktop mantiene el ancho fijo
                },
                p: {
                  xs: 1,        // Padding más pequeño en móviles
                  sm: 2         // Padding normal en tablets y desktop
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
                xs: 1,         // Espacio más pequeño en móviles
                sm: 2          // Espacio normal en tablets y desktop
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
                      xs: '0.9rem',  // Tamaño más pequeño para 320x480
                      sm: '1.5rem'   // Tamaño normal en tablets y desktop
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
                  xs: 1,      // Margen más pequeño en móviles
                  sm: 2       // Margen normal en tablets y desktop
                },
                maxHeight: {
                  xs: 'calc(100vh - 200px)',  // Altura ajustada para iPhone 4
                  sm: 'calc(100vh - 300px)'   // Altura normal para tablets y desktop
                }
              }}>
              {carrito.map(item => (
                  <ListItem 
                    key={item.id_elemento} 
                    divider
                    sx={{
                      flexDirection: {
                        xs: 'column',  // En móviles, elementos en columna
                        sm: 'row'      // En tablets y desktop, elementos en fila
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
                        xs: '100%',    // Ancho completo en móviles
                        sm: 'auto'     // Ancho automático en tablets y desktop
                      },
                      justifyContent: {
                        xs: 'space-between',
                        sm: 'flex-end'
                      }
                    }}>
                    <IconButton
                      size="small"
                      onClick={() => actualizarCantidad(item.id_elemento, item.cantidad - 1)}
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
                      onClick={() => actualizarCantidad(item.id_elemento, item.cantidad + 1)}
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
                  xs: 1,      // Padding más pequeño en móviles
                  sm: 2       // Padding normal en tablets y desktop
                }, 
                bgcolor: 'var(--color-background-secondary)',
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
                      xs: 1,     // Margen más pequeño en móviles
                      sm: 2      // Margen normal en tablets y desktop
                    },
                    fontSize: {
                      xs: '1.1rem',  // Tamaño más pequeño para iPhone 4
                      sm: '1.5rem'   // Tamaño normal en tablets y desktop
                    }
                }}
              >
                Total: ${calcularTotal().toFixed(2)}
              </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: {
                    xs: 0.5,    // Espacio más pequeño en móviles
                    sm: 1       // Espacio normal en tablets y desktop
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
                        xs: '0.7rem',  // Tamaño más pequeño para iPhone 4
                        sm: '1rem'     // Tamaño normal en tablets y desktop
                      },
                      py: {
                        xs: 0.8,       // Padding vertical más pequeño para iPhone 4
                        sm: 1.5        // Padding vertical normal en tablets y desktop
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
                  onClick={procederAlPago}
                  disabled={carrito.length === 0}
                  sx={{
                    backgroundColor: 'var(--gold)',
                    fontFamily: '"Montserrat Alternates", cursive',
                    fontWeight: 800,
                    color: 'var(--white)',
                      fontSize: {
                        xs: '0.65rem',  // Tamaño más pequeño para 320x480
                        sm: '1rem'     // Tamaño normal en tablets y desktop
                      },
                      py: {
                        xs: 0.6,       // Padding vertical más pequeño para 320x480
                        sm: 1.5        // Padding vertical normal en tablets y desktop
                      },
                      px: {
                        xs: 0.5,       // Padding horizontal más pequeño para 320x480
                        sm: 2          // Padding horizontal normal en tablets y desktop
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
                backgroundColor: notificacion.tipo === 'success' ? '#2e7d32' : '#d32f2f', // Colores sólidos
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