import { useState, useEffect } from "react";
import { Typography, Button, CircularProgress } from "@mui/material";
import axios from "axios";

interface UsuarioComentario {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
}

interface Comentario {
  id_comentario: number;
  calificacion: number;
  comentario: string;
  estado_comentario: 'Activo' | 'Editado' | 'Eliminado';
  id_evento: number;
  evento?: {
    cliente?: UsuarioComentario;
  };
  fecha_creacion?: Date;
}

const Comments = () => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarComentarios = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('http://localhost:3000/api/comentarios', {
        params: { includeEvent: true }
      });

      console.log('Respuesta completa:', response);

      let datos = [];
      if (Array.isArray(response.data)) {
        datos = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        datos = response.data.data;
      } else if (response.data?.comentarios && Array.isArray(response.data.comentarios)) {
        datos = response.data.comentarios;
      }

      console.log('Datos extraídos:', datos);

      // Validación adicional de estructura
      const datosValidados = datos.filter(
        //@ts-ignore
        item => 
        item?.id_comentario &&
        typeof item?.calificacion === 'number' &&
        item?.comentario
      );

      console.log('Datos validados:', datosValidados);
      
      setComentarios(datosValidados);
    } catch (err) {
      console.error('Error completo:', err);
      setError('No se pudieron cargar los comentarios');
      setComentarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      await cargarComentarios();
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <CircularProgress sx={{ color: 'var(--white)' }} />
        <Typography style={{ marginLeft: '10px', fontFamily: '"Nunito Sans", sans-serif' }}>Cargando comentarios...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          onClick={cargarComentarios}
          style={{ marginTop: '10px', backgroundColor: 'var(--dark-gold)', color: 'var(--white)', fontFamily: '"Nunito Sans", sans-serif', fontWeight: '800'}}
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="footerComments footerBox">
      <Typography variant="h5" className="comments-title">
        Comentarios de Clientes
      </Typography>

      {comentarios.length === 0 ? (
        <Typography className="empty-message">
          No hay comentarios disponibles
        </Typography>
      ) : (
        <div className="comments-vertical-slider">
          {comentarios.map((comentario) => (
            <div key={comentario.id_comentario} className="comment-item">
              <div className="user-info">
                <span className="user-name">
                  {comentario.evento?.cliente?.nombre_usuario || 'Anónimo'}
                  {comentario.evento?.cliente?.apellido_usuario
                    ? ' ' + comentario.evento.cliente.apellido_usuario
                    : ''}
                </span>
                {comentario.estado_comentario === 'Editado' && (
                  <span className="edited-status">(editado)</span>
                )}
              </div>

              <div className="rating">
                {typeof comentario.calificacion === 'number' &&
                comentario.calificacion >= 0 &&
                comentario.calificacion <= 5 ? (
                  <>
                    {'★'.repeat(comentario.calificacion)}
                    {'☆'.repeat(5 - comentario.calificacion)}
                  </>
                ) : (
                  <Typography className="error-message">
                    Calificación no disponible
                  </Typography>
                )}
              </div>

              <Typography className="comment-text">
                {comentario.comentario}
              </Typography>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Comments;