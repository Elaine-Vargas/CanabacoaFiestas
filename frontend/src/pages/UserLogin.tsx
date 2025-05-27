import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.scss";
import LogoBlanco from "../assets/logoVariants/OVALO-CF(titulo blanco).svg"
import LogoDorado from "../assets/logoVariants/OVALO-CF(titulo dorado osc).svg"
import LoginNav from "../components/LoginNav";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
//Se necesita adaptar el formulario de registro para que sea responsive y tenga un scroll vertical si es necesario

const UserLogin: React.FC = () => {
  const [isActive, setIsActive] = useState(false);  // Estado para controlar el formulario activo
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [loginData, setLoginData] = useState({
    usuario_login: "",
    contrasena: ""
  });
  const [signupData, setSignupData] = useState({
    nombre_usuario: "",
    apellido_usuario: "",
    cedula_usuario: "",
    correo_usuario: "",
    tel_usuario: "",
    contrasena_login: "",
    usuario_login: "",
    confirmar_contrasena: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleForm = () => { // Función para alternar entre los formularios de login y signup
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
    if (id.startsWith('login-')) {
      setLoginData(prev => ({
        ...prev,
        [id === 'login-username' ? 'usuario_login' : 'contrasena']: value
      }));
    } else if (id.startsWith('signup-')) {
      const fieldMap: { [key: string]: string } = {
        'signup-name': 'nombre_usuario',
        'signup-lastname': 'apellido_usuario',
        'signup-username': 'usuario_login',
        'signup-email': 'correo_usuario',
        'signup-phone': 'tel_usuario',
        'signup-id': 'cedula_usuario',
        'signup-password': 'contrasena_login',
        'signup-password-confirm': 'confirmar_contrasena'
      };
      
      setSignupData(prev => ({
        ...prev,
        [fieldMap[id]]: value
      }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al iniciar sesión');
      }

      // Guardar el token en localStorage
      localStorage.setItem('token', data.token);
      
      // Mostrar mensaje de bienvenida
      alert(data.mensaje);
      
      // Redirigir a la página de servicios
      navigate('/Menu-Servicios/Bienvenida');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar que las contraseñas coincidan
    if (signupData.contrasena_login !== signupData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }

      localStorage.setItem('token', data.token);
      alert(data.mensaje);
      navigate('/Menu-Servicios/Bienvenida');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al registrar usuario');
    }
  };

  return (
    <section className="loginPage">  {/*Sección principal del formulario*/} 
     {/* Flecha de regreso */}
      <LoginNav /> {/* Componente de navegación */}
      <div className={`container ${isActive ? "active" : ""}`}>
        <div className="user signinBx">
          <div className="imgBx imgBx1 LoginImg">
            <img src={LogoBlanco} alt="" />
          </div>
          <div className="formBx">
            <form onSubmit={handleLogin}>
              <h2>Inicio de sesión</h2>
              {error && <div className="error-message">{error}</div>}
              <input 
                type="text" 
                id="login-username" 
                placeholder="Usuario / Cédula" 
                required 
                value={loginData.usuario_login}
                onChange={handleInputChange}
              />
              <div className="password-input-container">
                <input 
                  type={showLoginPassword ? "text" : "password"} 
                  id="login-password" 
                  placeholder="Contraseña" 
                  required 
                  value={loginData.contrasena}
                  onChange={handleInputChange}
                />
                <span className="password-toggle" onClick={toggleLoginPasswordVisibility}>
                  {showLoginPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </span>
              </div>
              <input type="submit" value="Iniciar sesión" />
              <p className="signup">
                ¿No tienes una cuenta?{" "}
                <span onClick={toggleForm} className="link">
                  <strong>Regístrate. </strong>
                </span>
              </p>
            </form>
          </div>
        </div>

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
                  placeholder="Número de Teléfono" 
                  required 
                  value={signupData.tel_usuario}
                  onChange={handleInputChange}
                />
                <input 
                  type="text" 
                  id="signup-id" 
                  placeholder="Cédula" 
                  required 
                  value={signupData.cedula_usuario}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-row">
                <div className="password-input-container">
                  <input 
                    type={showSignupPassword ? "text" : "password"} 
                    id="signup-password" 
                    placeholder="Contraseña" 
                    required 
                    value={signupData.contrasena_login}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                  />
                  <span className="password-toggle" onClick={toggleSignupConfirmPasswordVisibility}>
                    {showSignupConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </span>
                </div>
              </div>
              <input type="submit" value="Registrar" />
              <p className="signup">
                ¿Ya tienes una cuenta?{" "}
                <span onClick={toggleForm} className="link">
                  <strong>Inicia sesión.</strong>
                </span>
              </p>
            </form>
          </div>
          <div className="imgBx imgBx2 signupImg">
            <img src={LogoDorado} alt="" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserLogin;

