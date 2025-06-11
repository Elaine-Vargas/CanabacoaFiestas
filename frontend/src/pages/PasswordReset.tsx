import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CircularProgress from '@mui/material/CircularProgress';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../styles/mainPages/PasswordReset.scss';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  if (tokenValid === false) {
    return (
      <div className="reset-password-container">
        <div className="resetBx">
          <div className="reset-formBx">
            <h2 className="reset-title">Error</h2>
            <div className="reset-message error">
              El enlace de recuperación es inválido o ha expirado.
            </div>
            <button 
              onClick={() => navigate("/password-recovery")}
              disabled={isLoading}
              className="reset-submit-btn"
            >
              {isLoading ? <CircularProgress size={20} /> : "Solicitar nuevo enlace"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="resetBx">
        <div className="reset-formBx">
          <h2 className="reset-title">Restablecer Contraseña</h2>

          {error && (
            <div className="reset-message error">
              {error}
            </div>
          )}

          {success ? (
            <div className="reset-message success">
              <p>¡Contraseña restablecida con éxito!</p>
              <p>Redirigiendo al inicio de sesión...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="reset-form">
              <div className="form-group">
                <label htmlFor="password" className="reset-label">Nueva Contraseña</label>
                <div className="password-input-container">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    maxLength={25}
                    className="reset-input"
                  />
                  <span className="password-toggle" onClick={togglePasswordVisibility}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword" className="reset-label">Confirmar Contraseña</label>
                <div className="password-input-container">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    minLength={8}
                    maxLength={25}
                    className="reset-input"
                  />
                  <span className="password-toggle" onClick={toggleConfirmPasswordVisibility}>
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </span>
                </div>
              </div>

              <div className="reset-actions">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="reset-submit-btn"
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
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;