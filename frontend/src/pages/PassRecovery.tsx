import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/mainPages/Recovery.scss';

const PassRecovery = () => {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');
    setCargando(true);

    try {
      const res = await axios.post(`${apiUrl}/auth/mail-recovery`, 
        { correo_usuario: correo },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      setMensaje(res.data.message);
    } catch (err: any) {
      console.error('Error en recuperación:', err);
      if (err.response?.status === 404) {
        setError('No existe una cuenta activa con ese correo electrónico.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Ocurrió un error inesperado. Intenta más tarde.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="recovery-container">
      <div className="recoveryBx">
        <div className="formBx recovery-formBx">
          <h1 className="recovery-title">Recuperar Contraseña</h1>
          <form onSubmit={handleSubmit} className="recovery-form">
            <div className="input-group">
              <label className="recovery-label">Correo electrónico</label>
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="recovery-input"
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className="recovery-actions">
              <button
                type="submit"
                disabled={cargando}
                className="recovery-submit-btn"
              >
                {cargando ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </button>
            </div>
          </form>

          {mensaje && (
            <div className="recovery-message success">
              {mensaje}
            </div>
          )}
          {error && (
            <div className="recovery-message error">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassRecovery;