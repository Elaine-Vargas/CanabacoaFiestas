import React, { useEffect, useState } from "react";
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import "../styles/mainPages/Login.scss";
import LogoBlanco from "../assets/logoVariants/OVALO-CF(titulo blanco).svg";
import LogoDorado from "../assets/logoVariants/OVALO-CF(titulo dorado osc).svg";
import LoginNav from "../components/LoginNav";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatPhoneNumber, formatCedula, validateEmail, validateCedula, validateUsername, validatePhoneNumber } from "../utils/validation";

interface Usuario {
  nombre_usuario: string;
  apellido_usuario: string;
  cedula_usuario: string;
  correo_usuario: string;
  tel_usuario: string;
  usuario_login: string;
  id_rol: number;
  estado_usuario: string;
  rol_nombre?: string;
}

const RegistroUser = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const [isActive, setIsActive] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [signupData, setSignupData] = useState({
    nombre_usuario: "",
    apellido_usuario: "",
    cedula_usuario: "",
    correo_usuario: "",
    tel_usuario: "",
    id_rol: "",
    contrasena_login: "",
    usuario_login: "",
    confirmar_contrasena: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados para la tabla de usuarios
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rolFilter, setRolFilter] = useState('');

  const isRecoveryPage = location.pathname.includes('Recuperar-Contrasena');

  // Función para cargar usuarios
  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:3000/api/usuarios';
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (rolFilter) params.append('rol', rolFilter);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al obtener usuarios');
      }
      
      const data = await response.json();
      setUsuarios(data.usuarios);
      setTableError(null);
    } catch (err) {
      setTableError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [searchTerm, rolFilter]);

  const toggleForm = () => {
    setIsActive(!isActive);
    setError("");
  };

  const toggleLoginPasswordVisibility = () => {
    setShowLoginPassword(!showLoginPassword);
  };

  const toggleSignupPasswordVisibility = () => {
    setShowSignupPassword(!showSignupPassword);
  };

  const toggleSignupConfirmPasswordVisibility = () => {
    setShowSignupConfirmPassword(!showSignupConfirmPassword);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
   
    if (id.startsWith('signup-')) {
      const fieldMap: Record<string, string> = {
        'signup-name': 'nombre_usuario',
        'signup-lastname': 'apellido_usuario',
        'signup-username': 'usuario_login',
        'signup-email': 'correo_usuario',
        'signup-phone': 'tel_usuario',
        'signup-role': 'id_rol',
        'signup-id': 'cedula_usuario',
        'signup-password': 'contrasena_login',
        'signup-password-confirm': 'confirmar_contrasena'
      };
      
      let processedValue = value;
      
      if (id === 'signup-phone') {
        processedValue = formatPhoneNumber(value);
      } else if (id === 'signup-id') {
        processedValue = formatCedula(value);
      } else if (id === 'signup-email') {
        processedValue = value.toLowerCase();
      }
      
      setSignupData(prev => ({
        ...prev,
        [fieldMap[id]]: processedValue
      }));
      
      // Validaciones
      if (id === 'signup-email') {
        setError(validateEmail(processedValue) || "");
      } else if (id === 'signup-username') {
        setError(validateUsername(processedValue) || "");
      } else if (id === 'signup-phone') {
        setError(validatePhoneNumber(processedValue) || "");
      } else if (id === 'signup-id') {
        setError(validateCedula(processedValue) || "");
      }
    }
  };  
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (signupData.contrasena_login !== signupData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/auth/register-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
        credentials: 'include'
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = 'Error al registrar usuario';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Error al parsear la respuesta:', e);
        }
        throw new Error(errorMessage);
      }
  
      const data = JSON.parse(responseText);
      localStorage.setItem('token', data.token);
      const userData = {
        nombre_usuario: signupData.nombre_usuario,
        apellido_usuario: signupData.apellido_usuario,
        usuario_login: signupData.usuario_login,
        rol: signupData.id_rol,
        cedula_usuario: signupData.cedula_usuario,
        correo_usuario: signupData.correo_usuario,
        tel_usuario: signupData.tel_usuario
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      
      alert(data.mensaje);
      navigate('/Menu-Servicios/Bienvenida');
    } catch (error) {
      console.error('Error completo (registro):', error);
      setError(error instanceof Error ? error.message : 'Error al registrar usuario');
    }
  };

  return (
    <section className="loginPage">
      <div className="user signupBx">
        <div className="formBx">
          <form onSubmit={handleSignup}>
            <h2>Registrar</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="form-row">
              <input 
                type="text" 
                id="signup-name" 
                placeholder="Nombre" 
                required 
                value={signupData.nombre_usuario}
                onChange={handleInputChange}
              />
              <input 
                type="text" 
                id="signup-lastname" 
                placeholder="Apellido" 
                required 
                value={signupData.apellido_usuario}
                onChange={handleInputChange}
              />
            </div>
            <input 
              type="text" 
              id="signup-username" 
              placeholder="Nombre de usuario" 
              required 
              className="full-width"
              value={signupData.usuario_login}
              onChange={handleInputChange}
            />
            <input 
              type="email" 
              id="signup-email" 
              placeholder="Email" 
              required 
              className="full-width"
              value={signupData.correo_usuario}
              onChange={handleInputChange}
            />
            <div className="form-row">
              <input 
                type="tel" 
                id="signup-phone" 
                placeholder="000-000-0000" 
                required 
                value={signupData.tel_usuario}
                onChange={handleInputChange}
                maxLength={12} 
              />
              <input 
                type="text" 
                id="signup-id" 
                placeholder="000-0000000-0" 
                required 
                value={signupData.cedula_usuario}
                onChange={handleInputChange}
                maxLength={13} 
              />
            </div>
            <input 
              type="text" 
              id="signup-role" 
              placeholder="Rol" 
              required 
              value={signupData.id_rol}
              onChange={handleInputChange}
            />
            <div className="form-row">
              <div className="password-input-container">
                <input 
                  type={showSignupPassword ? "text" : "password"} 
                  id="signup-password" 
                  placeholder="Contraseña" 
                  required 
                  value={signupData.contrasena_login}
                  onChange={(e) => {
                    handleInputChange(e);
                    const password = e.target.value;
                    const hasUpperCase = /[A-Z]/.test(password);
                    const hasNumber = /[0-9]/.test(password);
                    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
                    const isValidLength = password.length >= 8 && password.length <= 25;
                    
                    let errorMsg = [];
                    if (!hasUpperCase) errorMsg.push("una mayúscula");
                    if (!hasNumber) errorMsg.push("un número");
                    if (!hasSpecial) errorMsg.push("un carácter especial");
                    if (!isValidLength) errorMsg.push("entre 8-25 caracteres");
                    
                    if (errorMsg.length > 0) {
                      setError(`La contraseña debe tener ${errorMsg.join(", ")}`);
                    } else if (signupData.confirmar_contrasena && password !== signupData.confirmar_contrasena) {
                      setError("Las contraseñas no coinciden");
                    } else {
                      setError("");
                    }
                  }}
                />
                <span className="password-toggle" onClick={toggleSignupPasswordVisibility}>
                  {showSignupPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </span>
              </div>
              <div className="password-input-container">
                <input 
                  type={showSignupConfirmPassword ? "text" : "password"} 
                  id="signup-password-confirm" 
                  placeholder="Confirmar contraseña" 
                  required 
                  value={signupData.confirmar_contrasena}
                  onChange={(e) => {
                    handleInputChange(e);
                    if (e.target.value && e.target.value !== signupData.contrasena_login) {
                      setError("Las contraseñas no coinciden");
                    } else {
                      setError("");
                    }
                  }}
                />
                <span className="password-toggle" onClick={toggleSignupConfirmPasswordVisibility}>
                  {showSignupConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </span>
              </div>
            </div>
            <input type="submit" value="Registrar" />
          </form>
        </div>

        <div className="user-table-container">
          <h2>Lista de Usuarios</h2>
          {loading ? (
            <div>Cargando usuarios...</div>
          ) : tableError ? (
            <div className="text-red-500">Error: {tableError}</div>
          ) : (
            <div className="table-responsive">
              <div className="filters">
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                  value={rolFilter}
                  onChange={(e) => setRolFilter(e.target.value)}
                >
                  <option value="">Todos los roles</option>
                  <option value="1">Administrador</option>
                  <option value="2">Cliente</option>
                  <option value="3">Organizador de eventos</option>
                  <option value="4">Encargado de Inventario</option>
                </select>
              </div>
              
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Cédula</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Correo</th>
                    <th>Teléfono</th>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.length === 0 ? (
                    <tr>
                      <td colSpan={9}>No se encontraron usuarios</td>
                    </tr>
                  ) : (
                    usuarios.map((usuario) => (
                      <tr key={usuario.cedula_usuario}>
                        <td>{usuario.cedula_usuario}</td>
                        <td>{usuario.nombre_usuario}</td>
                        <td>{usuario.apellido_usuario}</td>
                        <td>{usuario.correo_usuario}</td>
                        <td>{usuario.tel_usuario}</td>
                        <td>{usuario.usuario_login}</td>
                        <td>{usuario.rol_nombre}</td>
                        <td className={`status ${usuario.estado_usuario.toLowerCase()}`}>
                          {usuario.estado_usuario}
                        </td>
                        <td className="actions">
                          <button className="edit-btn">Editar</button>
                          <button className="delete-btn">Eliminar</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>      
      <Outlet />
    </section>
  );
};

export default RegistroUser;