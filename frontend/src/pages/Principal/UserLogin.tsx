import React, { useState } from "react";
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import "../../styles/mainPages/Login.scss";
import LogoBlanco from "../../assets/logoVariants/OVALO-CF(titulo blanco).svg";
import LogoDorado from "../../assets/logoVariants/OVALO-CF(titulo dorado osc).svg";
import LoginNav from "../../components/Otros/LoginNav";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { formatPhoneNumber, formatCedula, validateEmail, validateCedula, validateUsername, validatePhoneNumber } from "../../utils/validation";

const UserLogin: React.FC = () => {

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const [isActive, setIsActive] = useState(false);
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
  const location = useLocation();
  
  // Verificar si estamos en la página de recuperación
  const isRecoveryPage = location.pathname.includes('Recuperar-Contrasena');

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
      
      if (id === 'signup-email') {
        const error = validateEmail(processedValue);
        setError(error || "");
      } else if (id === 'signup-username') {
        const error = validateUsername(processedValue);
        setError(error || "");
      } else if (id === 'signup-phone') {
        const error = validatePhoneNumber(processedValue);
        setError(error || "");
      } else if (id === 'signup-id') {
        const error = validateCedula(processedValue);
        setError(error || "");
      }
    }
  };  

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
  
    try {

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
        credentials: 'include'
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = 'Error al iniciar sesión';
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
        nombre_usuario: data.nombre_usuario,
        apellido_usuario: data.apellido_usuario,
        usuario_login: data.usuario_login,
        rol: data.rol,
        cedula_usuario: data.cedula_usuario
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      
      alert(data.mensaje);
      navigate('/Menu-Servicios/Bienvenida');
    } catch (error) {
      console.error('Error completo:', error);
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión');
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
      const { confirmar_contrasena, ...userData } = signupData;
      
      const response = await fetch(`${apiUrl}/auth/register-client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
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
      const userInfo = {
        nombre_usuario: signupData.nombre_usuario,
        apellido_usuario: signupData.apellido_usuario,
        usuario_login: signupData.usuario_login,
        rol: 2,
        cedula_usuario: signupData.cedula_usuario,
        correo_usuario: signupData.correo_usuario,
        tel_usuario: signupData.tel_usuario
      };
      localStorage.setItem('userData', JSON.stringify(userInfo));

      // Enviar correo de bienvenida
      try {
        console.log('Enviando correo de bienvenida a:', signupData.correo_usuario);
        const welcomeResponse = await fetch(`${apiUrl}/auth/welcome-mail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            correo_usuario: signupData.correo_usuario
          })
        });

        const welcomeData = await welcomeResponse.json();
        if (!welcomeResponse.ok) {
          console.error('Error al enviar correo de bienvenida:', welcomeData.error || welcomeData);
        } else {
          console.log('Correo de bienvenida enviado exitosamente:', welcomeData.message);
        }
      } catch (welcomeError) {
        console.error('Error al enviar correo de bienvenida:', welcomeError);
      }
      
      alert(data.mensaje);
      navigate('/Menu-Servicios/Bienvenida');
    } catch (error) {
      console.error('Error completo (registro):', error);
      setError(error instanceof Error ? error.message : 'Error al registrar usuario');
    }
  };

  return (
    <section className="loginPage">
      <LoginNav />
      
      {/* Mostrar el formulario de login/registro solo si no estamos en la página de recuperación */}
      {!isRecoveryPage && (
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
                
                </div>  <p className="signup">
                    <Link to="/Login/Recuperar-Contrasena">¿Olvidaste tu contraseña?</Link>
                  </p>
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
                        const hasSpecial = /^(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@\[\\\]^`{|}~])[A-Za-z\d!"#$%&'()*+,\-./:;<=>?@\[\\\]^`{|}~]{8,25}$/.test(password);                        const isValidLength = password.length >= 8 && password.length <= 25;
                        
                        let errorMsg = [];
                        if (!hasUpperCase) errorMsg.push("una mayúscula");
                        if (!hasNumber) errorMsg.push("un número"); 
                        if (!hasSpecial) errorMsg.push(  "Debe contener al menos un carácter especial (! \" # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ ` { | } ~)"
                        );
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
      )}
      
      {/* Outlet para renderizar la subruta de recuperación de contraseña */}
      <Outlet />
    </section>
  );
};

export default UserLogin;