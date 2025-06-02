import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, Grid } from '@mui/material';
import ServiceBase from '../../components/ServiceBase';
import { useUser } from '../../contexts/UserContext';

interface Evento {
  id_evento?: number;
  cedula_cliente: string;
  cedula_asesor?: string;
  fecha_evento: string;
  hora_evento: string;
  id_espacio: number;
  estado_evento: 'Pendiente' | 'Confirmado' | 'Cancelado' | 'Completado';
  id_tipo_evento: number;
  desea_supervision: boolean;
  nota_cliente?: string;
  estado_cotizacion: 'Pendiente' | 'Completada' | 'Aceptada' | 'Rechazada' | 'Cancelada' | 'Eliminada';
}

interface Espacio {
  id_espacio: number;
  nombre_espacio: string;
  capacidad: number;
}

interface TipoEvento {
  id_tipo_evento: number;
  nombre_tipo: string;
}

export default function Eventos() {
  const navigate = useNavigate();
  const { userRole } = useUser();
  const userData = JSON.parse(localStorage.getItem('userData') || '{}');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [espacios, setEspacios] = useState<Espacio[]>([]);
  const [tiposEvento, setTiposEvento] = useState<TipoEvento[]>([]);
  const [formData, setFormData] = useState<Partial<Evento>>({
    cedula_cliente: userData.cedula || '',
    fecha_evento: '',
    hora_evento: '',
    id_espacio: 0,
    estado_evento: 'Pendiente',
    id_tipo_evento: 0,
    desea_supervision: false,
    estado_cotizacion: 'Pendiente'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventosRes, espaciosRes, tiposEventoRes] = await Promise.all([
          fetch('/api/eventos'),
          fetch('/api/espacios'),
          fetch('/api/tipos-evento')
        ]);

        const [eventosData, espaciosData, tiposEventoData] = await Promise.all([
          eventosRes.json(),
          espaciosRes.json(),
          tiposEventoRes.json()
        ]);

        setEventos(eventosData);
        setEspacios(espaciosData);
        setTiposEvento(tiposEventoData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/eventos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newEvento = await response.json();
        setEventos(prev => [...prev, newEvento]);
        navigate('/Menu-Servicios/Alquiler');
      }
    } catch (error) {
      console.error('Error al crear evento:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <ServiceBase title="Crear Evento">
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, color: 'var(--color-text)' }}>
          Crear Nuevo Evento
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Fecha del Evento"
              type="date"
              name="fecha_evento"
              value={formData.fecha_evento}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              label="Hora del Evento"
              type="time"
              name="hora_evento"
              value={formData.hora_evento}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              select
              label="Espacio"
              name="id_espacio"
              value={formData.id_espacio || ''}
              onChange={handleInputChange}
            >
              {espacios.map((espacio) => (
                <MenuItem key={espacio.id_espacio} value={espacio.id_espacio}>
                  {espacio.nombre_espacio} (Capacidad: {espacio.capacidad})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              required
              fullWidth
              select
              label="Tipo de Evento"
              name="id_tipo_evento"
              value={formData.id_tipo_evento || ''}
              onChange={handleInputChange}
            >
              {tiposEvento.map((tipo) => (
                <MenuItem key={tipo.id_tipo_evento} value={tipo.id_tipo_evento}>
                  {tipo.nombre_tipo}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Notas Adicionales"
              name="nota_cliente"
              value={formData.nota_cliente || ''}
              onChange={handleInputChange}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/Menu-Servicios/Alquiler')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: 'var(--gold)',
              color: 'var(--color-text)',
              '&:hover': {
                backgroundColor: 'var(--gold-dark)'
              }
            }}
          >
            Crear Evento
          </Button>
        </Box>
      </Box>
    </ServiceBase>
  );
} 