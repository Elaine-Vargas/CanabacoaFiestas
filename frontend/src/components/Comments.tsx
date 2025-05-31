import { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import axios from "axios";

interface UsuarioComentario {
  cedula_usuario: string;
  nombre_usuario: string;
  apellido_usuario: string;
}

interface Comentario {
  id_comentario: number;
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
      
      const datos = Array.isArray(response.data) ? response.data : 
                   (response.data.data && Array.isArray(response.data.data)) ? response.data.data : [];
      
      setComentarios(datos);
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
      setError('Error al cargar los comentarios');
      setComentarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarComentarios();
  }, []);

  if (!Array.isArray(comentarios)) {
    return <Typography color="error">Error: Formato de datos incorrecto</Typography>;
  }

  if (loading) {
    return (
      <div className="loading-message">
        <Typography>Cargando comentarios...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <Typography className="error-message">
        {error}
      </Typography>
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
                  {comentario.evento?.cliente?.apellido_usuario ? ' ' + comentario.evento.cliente.apellido_usuario : ''}
                </span>
                {comentario.estado_comentario === 'Editado' && (
                  <span className="edited-status">(editado)</span>
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