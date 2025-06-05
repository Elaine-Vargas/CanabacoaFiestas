import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CircularProgress from '@mui/material/CircularProgress';

interface ResetPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: string;
}

const PasswordReset: React.FC = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Token inválido o faltante");
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const validatePassword = (password: string): string | null => {
    // Validación de longitud
    if (password.length < 8 || password.length > 25) {
      return "La contraseña debe tener entre 8 y 25 caracteres";
    }

    // Validación de mayúscula
    if (!/[A-Z]/.test(password)) {
      return "Debe contener al menos una mayúscula";
    }

    // Validación de número
    if (!/[0-9]/.test(password)) {
      return "Debe contener al menos un número";
    }

    // Validación de carácter especial
    if (!/[!@#$%^&*]/.test(password)) {
      return "Debe contener al menos un carácter especial (!@#$%^&*)";
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!token) {
      setError("Token inválido o faltante");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post<ResetPasswordResponse>(
        `${apiUrl}/auth/reset-password`,
        {
          token,
          nueva_contrasena: formData.password
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          validateStatus: (status) => status < 500
        }
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate("/Login", { replace: true }), 3000);
      } else {
        setError(response.data.error || "Error al restablecer la contraseña");
      }
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.error || 
                err.response.data.message || 
                "Error en el servidor");
      } else if (err.request) {
        setError("No se recibió respuesta del servidor");
      } else {
        setError("Error al realizar la petición");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="reset-password-container">
        <h2>Error</h2>
        <div className="error-message">
          El enlace de recuperación es inválido o ha expirado.
        </div>
        <button 
          onClick={() => navigate("/password-recovery")}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={20} /> : "Solicitar nuevo enlace"}
        </button>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <h2>Restablecer Contraseña</h2>

      {error && (
        <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {success ? (
        <div className="success-message" style={{ color: 'green' }}>
          <p>¡Contraseña restablecida con éxito!</p>
          <p>Redirigiendo al inicio de sesión...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="password">Nueva Contraseña</label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              maxLength={25}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              maxLength={25}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              padding: '0.5rem 1rem',
              background: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} color="inherit" />
                <span style={{ marginLeft: "8px" }}>Procesando...</span>
              </>
            ) : (
              "Restablecer Contraseña"
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default PasswordReset;