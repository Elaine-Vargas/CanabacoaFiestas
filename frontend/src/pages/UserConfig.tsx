import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import "../styles/UserConfig.scss";

export default function UserConfig() {
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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay sesión activa');
        }

        const response = await fetch('/api/auth/user-data', {
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

        // Actualizar también el localStorage manteniendo el rol
        localStorage.setItem('userData', JSON.stringify({
          ...data,
          rol: storedUserData.rol // Preservar el rol existente
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
    // Guardar los datos iniciales
    setInitialData({
      nombre_usuario: userData.nombre_usuario || "",
      apellido_usuario: userData.apellido_usuario || "",
      correo_usuario: userData.correo_usuario || "",
      tel_usuario: userData.tel_usuario || "",
      usuario_login: userData.usuario_login || "",
      cedula_usuario: userData.cedula_usuario || ""
    });
  }, []);

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

    setUserData(prev => ({
      ...prev,
      [fieldName]: id === 'config-email' ? value.toLowerCase() : value
    }));

    // Solo verificar cambios en campos que no sean contraseñas
    if (!id.includes('password')) {
      const relevantFields = ['usuario_login', 'correo_usuario', 'tel_usuario'];
      const hasFormChanges = relevantFields.some(field => {
        const newValue = field === fieldName ? value : userData[field as keyof typeof userData];
        return newValue !== initialData[field as keyof typeof initialData];
      });
      setHasChanges(hasFormChanges);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Verificar que se haya ingresado la contraseña actual solo si se están cambiando datos
    if (userData.contrasena_login || userData.usuario_login !== userData.usuario_login || 
        userData.correo_usuario !== userData.correo_usuario || userData.tel_usuario !== userData.tel_usuario) {
      if (!userData.contrasena_actual) {
        setError('Debe ingresar su contraseña actual para realizar cambios');
        return;
      }
    }

    // Validar que si se está cambiando la contraseña, coincidan
    if (userData.contrasena_login && userData.contrasena_login !== userData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Validar contraseña si se está cambiando
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
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const response = await fetch('/api/auth/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          correo_usuario: userData.correo_usuario,
          tel_usuario: userData.tel_usuario,
          usuario_login: userData.usuario_login,
          contrasena_login: userData.contrasena_login || undefined,
          contrasena_actual: userData.contrasena_actual
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar datos');
      }

      // Actualizar datos en localStorage
      const storedUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedUserData = {
        ...storedUserData,
        correo_usuario: userData.correo_usuario,
        tel_usuario: userData.tel_usuario,
        usuario_login: userData.usuario_login,
        rol: storedUserData.rol // Preservar el rol existente
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));

      setSuccess('Datos actualizados exitosamente');
      
      // Limpiar campos de contraseña
      setUserData(prev => ({
        ...prev,
        contrasena_login: "",
        confirmar_contrasena: "",
        contrasena_actual: ""
      }));

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al actualizar datos');
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
              onChange={handleInputChange}
              required
            />
          </div>
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
            <>
              

              <div className="form-group row">
                <div>
                  <label htmlFor="config-password">Nueva Contraseña</label>
                  <div className="password-input-container">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      id="config-password" 
                      value={userData.contrasena_login}
                      onChange={handleInputChange}
                      required
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
                      required
                    />
                    <span className="password-toggle" onClick={toggleConfirmPasswordVisibility}>
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="update-button" 
            disabled={!hasChanges}
            style={{ 
              opacity: hasChanges ? 1 : 0.6,
              cursor: hasChanges ? 'pointer' : 'not-allowed'
            }}
          >
            Actualizar Datos
          </button>
        </form>
      </div>
    </div>
  );
}
