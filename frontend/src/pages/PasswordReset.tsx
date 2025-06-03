import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import CircularProgress from '@mui/material/CircularProgress';

interface ResetPasswordResponse {
  success: boolean;
  message: string;
  error?: string;
}

const PasswordReset: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
  
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
  
    if (!token) {
      setError("Token inválido o faltante");
      return;
    }
  
    console.log("Token:", token);
    console.log("Nueva contraseña:", password);
  
    setIsLoading(true);
  
    try {
      const response = await axios.post<ResetPasswordResponse>(
        `${apiUrl}/auth/reset-password`,
        {
          token,
          password,  // Cambia aquí el nombre del campo
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => navigate("/Login"), 3000);
      } else {
        setError(response.data.error || "Error al restablecer la contraseña");
      }
    } catch (err: any) {
      console.error("Error al restablecer contraseña:", err);
      if (err.response) {
        console.error("Respuesta del servidor:", err.response.data);
        setError(err.response.data.error || "Error en el servidor");
      } else {
        setError("Error de red o desconocido");
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
        <button onClick={() => navigate("/password-recovery")}>
          Solicitar nuevo enlace
        </button>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <h2>Restablecer Contraseña</h2>

      {error && <div className="error-message">{error}</div>}

      {success ? (
        <div className="success-message">
          <p>¡Contraseña restablecida con éxito!</p>
          <p>Redirigiendo al inicio de sesión...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Nueva Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button type="submit" disabled={isLoading}>
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
