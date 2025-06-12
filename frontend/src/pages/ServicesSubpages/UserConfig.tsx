import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import "../../styles/dashboard/UserConfig.scss";
import { validateEmail, validateUsername, validatePhoneNumber, formatPhoneNumber} from "../../utils/validation";

export default function UserConfig() {

  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  const [userData, setUserData] = useState({
    nombre_usuario: "",
    apellido_usuario: "",
    cedula_usuario: "",
    correo_usuario: "",
    tel_usuario: "",
    usuario_login: "",
    contrasena_login: "",
    confirmar_contrasena: "",
    contrasena_actual: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nombre_usuario: "",
    apellido_usuario: "",
    correo_usuario: "",
    tel_usuario: "",
    usuario_login: "",
    cedula_usuario: ""
  });
  const [initialData, setInitialData] = useState({
    nombre_usuario: "",
    apellido_usuario: "",
    correo_usuario: "",
    tel_usuario: "",
    usuario_login: "",
    cedula_usuario: ""
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay sesión activa');
        }

        const response = await fetch(`${apiUrl}/auth/user-data`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const data = await response.json();
        const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        setUserData(prev => ({
          ...prev,
          nombre_usuario: data.nombre_usuario,
          apellido_usuario: data.apellido_usuario,
          cedula_usuario: data.cedula_usuario,
          correo_usuario: data.correo_usuario,
          tel_usuario: data.tel_usuario,
          usuario_login: data.usuario_login
        }));

        localStorage.setItem('userData', JSON.stringify({
          ...data,
          rol: storedUserData.rol
        }));
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Error al cargar datos del usuario');
        if (error instanceof Error && error.message === 'No hay sesión activa') {
          navigate('/Login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    setFormData({
      nombre_usuario: userData.nombre_usuario || "",
      apellido_usuario: userData.apellido_usuario || "",
      correo_usuario: userData.correo_usuario || "",
      tel_usuario: userData.tel_usuario || "",
      usuario_login: userData.usuario_login || "",
      cedula_usuario: userData.cedula_usuario || ""
    });
    setInitialData({
      nombre_usuario: userData.nombre_usuario || "",
      apellido_usuario: userData.apellido_usuario || "",
      correo_usuario: userData.correo_usuario || "",
      tel_usuario: userData.tel_usuario || "",
      usuario_login: userData.usuario_login || "",
      cedula_usuario: userData.cedula_usuario || ""
    });
  }, []);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 10000); // 10 seconds

      return () => clearTimeout(timer);
    }
  }, [success]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const fieldMap: { [key: string]: string } = {
      'config-username': 'usuario_login',
      'config-email': 'correo_usuario',
      'config-phone': 'tel_usuario',
      'config-password': 'contrasena_login',
      'config-password-confirm': 'confirmar_contrasena',
      'config-current-password': 'contrasena_actual'
    };
    
    const fieldName = fieldMap[id];
    if (!fieldName) return;

    // Clear success message when any input changes
    setSuccess("");

    let processedValue = value;
    
    if (id === 'config-phone') {
      processedValue = formatPhoneNumber(value);
    } else if (id === 'config-email') {
      processedValue = value.toLowerCase();
    }
    
    setUserData(prev => ({
      ...prev,
      [fieldName]: processedValue
    }));
    
    if (id === 'config-email') {
      const error = validateEmail(processedValue);
      setError(error || "");
    } else if (id === 'config-username') {
      const error = validateUsername(processedValue);
      setError(error || "");
    } else if (id === 'config-phone') {
      const error = validatePhoneNumber(processedValue);
      setError(error || "");
    } else if (id === 'config-password') {
      const password = processedValue;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*]/.test(password);
      const isValidLength = password.length >= 8 && password.length <= 25;
      
      let errorMsg = [];
      if (!hasUpperCase) errorMsg.push("una mayúscula");
      if (!hasNumber) errorMsg.push("un número"); 
      if (!hasSpecial) errorMsg.push("un carácter especial (!@#$%^&*.?_-)");
      if (!isValidLength) errorMsg.push("entre 8-25 caracteres");
      
      if (errorMsg.length > 0) {
        setError(`La contraseña debe tener ${errorMsg.join(", ")}`);
      } else if (userData.confirmar_contrasena && password !== userData.confirmar_contrasena) {
        setError("Las contraseñas no coinciden");
      } else {
        setError("");
      }
    } else if (id === 'config-password-confirm') {
      if (processedValue && processedValue !== userData.contrasena_login) {
        setError("Las contraseñas no coinciden");
      } else {
        setError("");
      }
    }

    if (!id.includes('password')) {
      const relevantFields = ['usuario_login', 'correo_usuario', 'tel_usuario'];
      const hasFormChanges = relevantFields.some(field => {
        const newValue = field === fieldName ? processedValue : userData[field as keyof typeof userData];
        return newValue !== initialData[field as keyof typeof initialData];
      });
      setHasChanges(hasFormChanges);
    }
  };

  const handleEmailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const processedValue = value.toLowerCase();
    
    setUserData(prev => ({
      ...prev,
      correo_usuario: processedValue
    }));

    const error = validateEmail(processedValue);
    setError(error || "");

    if (!error && processedValue !== initialData.correo_usuario) {
      setHasChanges(true);
    } else {
      setHasChanges(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      setError("");
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`${apiUrl}/auth/send-update-email-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          correo_usuario: userData.correo_usuario
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar verificación');
      }

      if (data.requiresVerification) {
        setShowEmailVerification(true);
        setSuccess('Se ha enviado un código de verificación a tu nuevo correo electrónico');
      } else {
        setShowEmailVerification(false);
        setSuccess(data.mensaje || 'El correo electrónico no ha cambiado.');
        // Actualizar initialData para reflejar el nuevo correo (aunque no cambió, para evitar loops)
        setInitialData(prev => ({
          ...prev,
          correo_usuario: userData.correo_usuario
        }));
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al enviar verificación');
    }
  };

  const handleVerifyEmail = async () => {
    try {
      setIsVerifying(true);
      setError("");
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch(`${apiUrl}/auth/verify-update-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          correo_usuario: userData.correo_usuario,
          codigo: verificationCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al verificar correo');
      }

      setSuccess('Correo electrónico actualizado exitosamente');
      setShowEmailVerification(false);
      setVerificationCode("");
      
      // Actualizar initialData para reflejar el nuevo correo
      setInitialData(prev => ({
        ...prev,
        correo_usuario: userData.correo_usuario
      }));

      // Actualizar localStorage
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      localStorage.setItem('userData', JSON.stringify({
        ...storedUserData,
        correo_usuario: userData.correo_usuario
      }));

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al verificar correo');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isUpdating) return;

    // Si el correo ha cambiado, mostrar verificación
    if (userData.correo_usuario !== initialData.correo_usuario) {
      await handleSendVerification();
      return;
    }

    if (userData.contrasena_login || hasChanges) {
      if (!userData.contrasena_actual) {
        setError('Debe ingresar su contraseña actual para realizar cambios');
        return;
      }
    }

    if (userData.contrasena_login && userData.contrasena_login !== userData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (userData.contrasena_login) {
      const password = userData.contrasena_login;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSpecial = /[!@#$%^&*]/.test(password);
      const isValidLength = password.length >= 8 && password.length <= 25;
      
      let errorMsg = [];
      if (!hasUpperCase) errorMsg.push("una mayúscula");
      if (!hasNumber) errorMsg.push("un número"); 
      if (!hasSpecial) errorMsg.push("un carácter especial (!@#$%^&*.?_-)");
      if (!isValidLength) errorMsg.push("entre 8-25 caracteres");
      
      if (errorMsg.length > 0) {
        setError(`La contraseña debe tener ${errorMsg.join(", ")}`);
        return;
      }
    }

    try {
      setIsUpdating(true); // Set updating state to true before request
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      // Solo incluir correo_usuario si cambió
      const updateBody: any = {
        tel_usuario: userData.tel_usuario,
        usuario_login: userData.usuario_login,
        contrasena_login: userData.contrasena_login || undefined,
        contrasena_actual: userData.contrasena_actual
      };
      if (userData.correo_usuario !== initialData.correo_usuario) {
        updateBody.correo_usuario = userData.correo_usuario;
      }

      const response = await fetch('/api/auth/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar datos');
      }

      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedUserData = {
        ...storedUserData,
        correo_usuario: userData.correo_usuario,
        tel_usuario: userData.tel_usuario,
        usuario_login: userData.usuario_login,
        rol: storedUserData.rol
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));

      setSuccess('Datos actualizados exitosamente');
      
      setUserData(prev => ({
        ...prev,
        contrasena_login: "",
        confirmar_contrasena: "",
        contrasena_actual: ""
      }));

      // Actualizar initialData para reflejar los nuevos cambios
      setInitialData({
        ...initialData,
        correo_usuario: userData.correo_usuario,
        tel_usuario: userData.tel_usuario,
        usuario_login: userData.usuario_login
      });

      setHasChanges(false);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar datos');
    } finally {
      setIsUpdating(false); // Reset updating state after request completes
    }
  };

  if (loading) {
    return (
      <div className="config-container">
        <div className="loading-message">Cargando datos del usuario...</div>
      </div>
    );
  }

  return (
    <div className="config-container">
      <h1>Configuración de Usuario</h1>
      <div className="form-container">
        <form onSubmit={handleUpdate}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <div className="form-group row">
            <div>
              <label>Nombre</label>
              <input 
                type="text" 
                value={userData.nombre_usuario}
                disabled
                className="disabled-input"
              />
            </div>
            <div>
              <label>Apellido</label>
              <input 
                type="text" 
                value={userData.apellido_usuario}
                disabled
                className="disabled-input"
              />
            </div>
          </div>

          <div className="form-group row">
            <div>
              <label>Cédula</label>
              <input 
                type="text" 
                value={userData.cedula_usuario}
                disabled
                className="disabled-input"
              />
            </div>
            <div>
              <label htmlFor="config-phone">Teléfono</label>
              <input 
                type="tel" 
                id="config-phone" 
                value={userData.tel_usuario}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="config-username">Nombre de Usuario</label>
            <input 
              type="text" 
              id="config-username" 
              value={userData.usuario_login}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="config-email">Correo Electrónico</label>
            <input 
              type="email" 
              id="config-email" 
              value={userData.correo_usuario}
              onChange={handleEmailChange}
              required
            />
          </div>

          {showEmailVerification && (
            <div className="form-group">
              <label htmlFor="verification-code">Código de Verificación</label>
              <div className="verification-container">
                <input 
                  type="text" 
                  id="verification-code" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Ingrese el código de verificación"
                  required
                />
                <button 
                  type="button" 
                  onClick={handleVerifyEmail}
                  disabled={isVerifying}
                  className="verify-button"
                >
                  {isVerifying ? 'Verificando...' : 'Verificar'}
                </button>
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="config-current-password">Contraseña Actual</label>
            <div className="password-input-container">
              <input 
                type={showCurrentPassword ? "text" : "password"} 
                id="config-current-password" 
                value={userData.contrasena_actual}
                onChange={handleInputChange}
                required
              />
              <span className="password-toggle" onClick={toggleCurrentPasswordVisibility}>
                {showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </span>
            </div>
          </div>

          <div className="form-group">
            <div className="password-toggle-section">
              <label>¿Desea cambiar su contraseña?</label>
              <button 
                type="button" 
                className="toggle-password-button"
                onClick={() => setShowPasswordFields(!showPasswordFields)}
              >
                {showPasswordFields ? 'Cancelar' : 'Cambiar Contraseña'}
              </button>
            </div>
          </div>

          {showPasswordFields && (
            <div className="form-group row">
              <div>
                <label htmlFor="config-password">Nueva Contraseña</label>
                <div className="password-input-container">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="config-password" 
                    value={userData.contrasena_login}
                    onChange={handleInputChange}
                  />
                  <span className="password-toggle" onClick={togglePasswordVisibility}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="config-password-confirm">Confirmar Nueva Contraseña</label>
                <div className="password-input-container">
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    id="config-password-confirm" 
                    value={userData.confirmar_contrasena}
                    onChange={handleInputChange}
                  />
                  <span className="password-toggle" onClick={toggleConfirmPasswordVisibility}>
                    {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="update-button" 
            disabled={(!hasChanges && !userData.contrasena_login) || isUpdating}
            style={{ 
              opacity: ((hasChanges || userData.contrasena_login) && !isUpdating) ? 1 : 0.6,
              cursor: ((hasChanges || userData.contrasena_login) && !isUpdating) ? 'pointer' : 'not-allowed'
            }}
          >
            {isUpdating ? 'Actualizando...' : 'Actualizar Datos'}
          </button>
        </form>
      </div>
    </div>
  );
}