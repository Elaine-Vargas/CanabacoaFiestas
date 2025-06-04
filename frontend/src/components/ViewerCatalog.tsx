import { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { Link } from "react-router-dom";

import axios from 'axios';
import {Card, CardContent, Typography, Grid, Container, TextField, Select, MenuItem, FormControl, InputLabel, Box, CircularProgress, IconButton, Drawer, List, ListItem, ListItemText, Button, Skeleton } from '@mui/material';

// Lazy-loaded components

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

const ViewerCatalog: React.FC<CatalogProps> = () => {

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [elementosRes, categoriasRes, coloresRes, materialesRes] = await Promise.all([
          axios.get(`${apiUrl}/elementos/filtrados`),
          axios.get(`${apiUrl}/elementos/categorias/list`),
          axios.get(`${apiUrl}/elementos/colores/list`),
          axios.get(`${apiUrl}/elementos/materiales/list`)
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
              <Typography sx={{
                fontFamily: '"Nunito Sans", sans-serif',
                color: 'var(--color-text)',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                textAlign: 'center',
                alignSelf: 'center',
                marginTop: 2,
                backgroundColor: 'var(--color-background)',
                padding: 2,
                borderRadius: 5
              }}>
                Si desea solitar el alquiler de algún elemento, <Link to="/Login" style={{ color: 'var(--gold)', fontWeight: 900 }}>INGRESE AQUÍ</Link>
              </Typography>
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
                lg: 'repeat(4, 1fr)'
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
                        mb: 0,
                        px: 2
                      }}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            color: 'var(--gold)',
                            fontFamily: '"Montserrat Alternates", cursive',
                            fontWeight: 800,
                            fontSize: '1.8rem',
                          }}
                        >
                          ${elemento.precio_elemento}
                        </Typography>
                        
                      </Box>
                      <Box>
                      <Typography 
                          variant="body1" 
                          sx={{ 
                            color: elemento.cantidad_disponible > 0 ? 'var(--success)' : 'var(--error)',
                            fontWeight: 700,
                            fontFamily: '"Nunito Sans", sans-serif',
                            fontSize: '1rem',
                            backgroundColor: elemento.cantidad_disponible > 0 ? 'var(--success-light)' : 'var(--error-light)',
                            px: 2,
                            py: 0,
                            borderRadius: 1,
                            margin: '0 auto'
                          }}
                        >
                          Stock: {elemento.cantidad_disponible}
                        </Typography>
                      </Box>
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
        </Container>
      </Box>
    </>
  );
};

export default ViewerCatalog;