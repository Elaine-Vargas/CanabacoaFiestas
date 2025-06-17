import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/mainPages/Recovery.scss';
import { apiUrl } from '../config';
import { validateEmail } from '../utils/validation';

const PassRecovery = () => {
  const [correo, setCorreo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setCorreo(value);
    
    if (value) {
      const error = validateEmail(value);
      setEmailError(error || '');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setError('');

    if (!validateEmail(correo)) {
      setEmailError('Por favor, ingrese un correo electrónico válido');
      return;
    }

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
                onChange={handleEmailChange}
                className={`recovery-input ${emailError ? 'error' : ''}`}
                placeholder="ejemplo@correo.com"
              />
              {emailError && (
                <div className="recovery-message error">
                  {emailError}
                </div>
              )}
            </div>

            <div className="recovery-actions">
              <button
                type="submit"
                disabled={cargando || !!emailError}
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