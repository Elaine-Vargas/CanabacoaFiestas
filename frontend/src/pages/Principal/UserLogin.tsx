import React, { useState } from "react";
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import "../../styles/mainPages/Login.scss";
import LogoBlanco from "../../assets/logoVariants/OVALO-CF(titulo blanco).svg";
import LogoDorado from "../../assets/logoVariants/OVALO-CF(titulo dorado osc).svg";
import LoginNav from "../../components/Otros/LoginNav";
import CustomModal from "../../components/Otros/CustomModal";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { 
  formatPhoneNumber, 
  formatCedula, 
  validateEmail, 
  validateCedula, 
  validateUsername, 
  validatePhoneNumber,
  validatePassword,
  validatePasswordMatch
} from "../../utils/validation";
import { useUser } from "../../contexts/UserContext";

const UserLogin = () => {

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

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [verificationStep, setVerificationStep] = useState<'register' | 'verify' | 'complete'>('register');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [modalConfig, setModalConfig] = useState({
    open: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info'
  });

  const { setUserRole } = useUser();

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
      
      // Validaciones específicas para cada campo
      if (id === 'signup-email') {
        const error = validateEmail(processedValue);
        setError(error || "");
      } else if (id === 'signup-username') {
        const error = validateUsername(processedValue);
        if (error) {
          setError(error);
          // Agregar clase de error al input
          const inputElement = document.getElementById(id);
          if (inputElement) {
            inputElement.classList.add('error-input');
          }
        } else {
          setError("");
          // Remover clase de error del input
          const inputElement = document.getElementById(id);
          if (inputElement) {
            inputElement.classList.remove('error-input');
          }
        }
      } else if (id === 'signup-phone') {
        const error = validatePhoneNumber(processedValue);
        setError(error || "");
      } else if (id === 'signup-id') {
        const error = validateCedula(processedValue);
        setError(error || "");
      } else if (id === 'signup-password') {
        const error = validatePassword(processedValue);
        setError(error || "");
      } else if (id === 'signup-password-confirm') {
        const error = validatePasswordMatch(signupData.contrasena_login, processedValue);
        setError(error || "");
      }
    }
  };  

  const showModal = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setModalConfig({
      open: true,
      title,
      message,
      type
    });
  };

  const handleCloseModal = () => {
    setModalConfig(prev => ({ ...prev, open: false }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (isLoggingIn) return;
    
    try {
      setIsLoggingIn(true);
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
      
      // Disparar un evento de storage para actualizar el contexto
      window.dispatchEvent(new Event('storage'));
      
      showModal('¡Bienvenido!', data.mensaje, 'success');
      setTimeout(() => {
        navigate('/Menu-Servicios/Bienvenida');
      }, 1500);
    } catch (error) {
      console.error('Error completo:', error);
      showModal('Error', error instanceof Error ? error.message : 'Error al iniciar sesión', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (isRegistering) return;
    
    // Validar que las contraseñas coincidan
    if (signupData.contrasena_login !== signupData.confirmar_contrasena) {
      showModal('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }

    // Validar que todos los campos requeridos estén llenos
    const requiredFields = ['nombre_usuario', 'apellido_usuario', 'cedula_usuario', 'correo_usuario', 'tel_usuario', 'contrasena_login', 'usuario_login'];
    const emptyFields = requiredFields.filter(field => !signupData[field as keyof typeof signupData]);
    
    if (emptyFields.length > 0) {
      showModal('Error', 'Por favor completa todos los campos requeridos', 'error');
      return;
    }
  
    try {
      setIsRegistering(true);
      const { confirmar_contrasena, ...userData } = signupData;
      
      // Primero validar si el usuario ya existe
      const validateResponse = await fetch(`${apiUrl}/auth/validate-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario_login: signupData.usuario_login,
          cedula_usuario: signupData.cedula_usuario,
          correo_usuario: signupData.correo_usuario
        }),
        credentials: 'include'
      });

      const validateData = await validateResponse.json();

      if (!validateResponse.ok) {
        throw new Error(validateData.error || 'Error al validar los datos de registro');
      }

      // Si la validación es exitosa, proceder con el envío del código de verificación
      const verifyResponse = await fetch(`${apiUrl}/auth/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo_usuario: signupData.correo_usuario,
          nombre_usuario: signupData.nombre_usuario,
          userData
        }),
        credentials: 'include'
      });
  
      const verifyData = await verifyResponse.json();
  
      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Error al enviar código de verificación');
      }
  
      if (verifyData.requiresVerification) {
        setVerificationStep('verify');
        showModal('Verificación Requerida', 'Se ha enviado un código de verificación a tu correo electrónico.', 'info');
      } else {
        await completeRegistration(verifyData);
      }
    } catch (error) {
      console.error('Error completo (registro):', error);
      showModal('Error', error instanceof Error ? error.message : 'Error al registrar usuario', 'error');
    } finally {
      setIsRegistering(false);
    }
  };
  
  const completeRegistration = async (data: any) => {
    try {
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
      
      // Establecer el rol de usuario como cliente
      setUserRole('cliente');
      
      // Disparar un evento de storage para actualizar el contexto
      window.dispatchEvent(new Event('storage'));

      try {
        await fetch(`${apiUrl}/auth/welcome-mail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            correo_usuario: signupData.correo_usuario
          })
        });
      } catch (welcomeError) {
        console.error('Error al enviar correo de bienvenida:', welcomeError);
      }

      showModal('¡Registro Exitoso!', '¡Tu cuenta ha sido creada exitosamente!', 'success');
      setTimeout(() => {
        navigate('/Menu-Servicios/Bienvenida');
      }, 1500);
    } catch (error) {
      console.error('Error al completar registro:', error);
      showModal('Error', 'Error al completar el registro. Por favor intenta nuevamente.', 'error');
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (isVerifying) return;
    
    try {
      setIsVerifying(true);
      
      const completeResponse = await fetch(`${apiUrl}/auth/complete-registration`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo_usuario: signupData.correo_usuario,
          codigo: verificationCode,
          nombre_usuario: signupData.nombre_usuario,
          apellido_usuario: signupData.apellido_usuario,
          cedula_usuario: signupData.cedula_usuario,
          tel_usuario: signupData.tel_usuario,
          contrasena_login: signupData.contrasena_login,
          usuario_login: signupData.usuario_login,
          id_rol: 2
        }),
        credentials: 'include'
      });

      const completeData = await completeResponse.json();

      if (!completeResponse.ok) {
        throw new Error(completeData.error || 'Error al completar el registro');
      }

      localStorage.setItem('token', completeData.token);
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
      
      // Establecer el rol de usuario como cliente
      setUserRole('cliente');
      
      // Disparar un evento de storage para actualizar el contexto
      window.dispatchEvent(new Event('storage'));

      try {
        const welcomeResponse = await fetch(`${apiUrl}/auth/welcome-mail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            correo_usuario: signupData.correo_usuario
          })
        });

        if (!welcomeResponse.ok) {
          console.error('Error al enviar correo de bienvenida');
        }
      } catch (welcomeError) {
        console.error('Error al enviar correo de bienvenida:', welcomeError);
      }

      showModal('¡Registro Exitoso!', '¡Tu cuenta ha sido creada exitosamente!', 'success');
      setTimeout(() => {
        navigate('/Menu-Servicios/Bienvenida');
      }, 1500);
    } catch (error) {
      console.error('Error en verificación:', error);
      showModal('Error', error instanceof Error ? error.message : 'Error en el proceso de verificación', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    try {
      const response = await fetch(`${apiUrl}/auth/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          correo_usuario: signupData.correo_usuario,
          nombre_usuario: signupData.nombre_usuario
        }),
        credentials: 'include'
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Error al parsear respuesta:', e);
        throw new Error('Error en la respuesta del servidor');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error al reenviar el código');
      }

      showModal('Código Reenviado', 'Se ha enviado un nuevo código de verificación a tu correo electrónico.', 'success');
      setVerificationCode('');
      setError('');
    } catch (error) {
      console.error('Error al reenviar código:', error);
      if (error instanceof SyntaxError) {
        showModal('Error', 'Error en el servidor. Por favor intenta nuevamente.', 'error');
      } else if (error instanceof TypeError) {
        showModal('Error', 'Error de conexión. Por favor verifica tu conexión a internet.', 'error');
      } else {
        showModal('Error', error instanceof Error ? error.message : 'Error al reenviar el código', 'error');
      }
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
                <input 
                  type="submit" 
                  value={isLoggingIn ? "Iniciando..." : "Iniciar sesión"} 
                  disabled={isLoggingIn}
                  style={{
                    opacity: isLoggingIn ? 0.7 : 1,
                    cursor: isLoggingIn ? 'not-allowed' : 'pointer'
                  }}
                />
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
              {verificationStep === 'register' ? (
                <form onSubmit={handleSignup}>
                  <h2>Registrar</h2>
                  <p className="signup">
                    ¿Ya tienes una cuenta?{" "}
                    <span onClick={toggleForm} className="link">
                      <strong>Inicia sesión.</strong>
                    </span>
                  </p>
                  {error && <div className="error-message">{error}</div>}
                  <div className="form-row">
                    <div className="input-group">
                      <label htmlFor="signup-name">Nombre</label>
                      <input 
                        type="text" 
                        id="signup-name" 
                        placeholder="Nombre" 
                        required 
                        value={signupData.nombre_usuario}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="signup-lastname">Apellido</label>
                      <input 
                        type="text" 
                        id="signup-lastname" 
                        placeholder="Apellido" 
                        required 
                        value={signupData.apellido_usuario}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="input-group">
                    <label htmlFor="signup-username">Nombre de usuario</label>
                    <input 
                      type="text" 
                      id="signup-username" 
                      placeholder="Nombre de usuario" 
                      required 
                      className="full-width"
                      value={signupData.usuario_login}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="signup-email">Correo electrónico</label>
                    <input 
                      type="email" 
                      id="signup-email" 
                      placeholder="Email" 
                      required 
                      className="full-width"
                      value={signupData.correo_usuario}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label htmlFor="signup-phone">Teléfono</label>
                      <input 
                        type="tel" 
                        id="signup-phone" 
                        placeholder="000-000-0000" 
                        required 
                        value={signupData.tel_usuario}
                        onChange={handleInputChange}
                        maxLength={12} 
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="signup-id">Cédula</label>
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
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label htmlFor="signup-password">Contraseña</label>
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
                            const hasSpecial = /^(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,\-./:;<=>?@\[\\\]^`{|}~])[A-Za-z\d!"#$%&'()*+,\-./:;<=>?@\[\\\]^`{|}~]{8,25}$/.test(password);
                            const isValidLength = password.length >= 8 && password.length <= 25;
                            
                            let errorMsg = [];
                            if (!hasUpperCase) errorMsg.push("una mayúscula");
                            if (!hasNumber) errorMsg.push("un número"); 
                            if (!hasSpecial) errorMsg.push("Debe contener al menos un carácter especial (! \" # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \\ ] ^ ` { | } ~)");
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
                    </div>
                    <div className="input-group">
                      <label htmlFor="signup-password-confirm">Confirmar contraseña</label>
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
                  </div>
                  <input 
                    type="submit" 
                    value={isRegistering ? "Registrando..." : "Registrar"} 
                    disabled={isRegistering}
                    style={{
                      opacity: isRegistering ? 0.7 : 1,
                      cursor: isRegistering ? 'not-allowed' : 'pointer'
                    }}
                  />
                  
                </form>
              ) : (
                <form onSubmit={handleVerification}>
                  <h2>Verificación de Correo</h2>
                  {error && <div className="error-message">{error}</div>}
                  <p className="verification-message">
                    Se ha enviado un código de verificación a {signupData.correo_usuario}
                  </p>
                  <div className="input-group">
                    <label htmlFor="verification-code">Código de verificación</label>
                    <input
                      type="text"
                      id="verification-code"
                      placeholder="Ingresa el código de verificación"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                    />
                  </div>
                  <input
                    type="submit"
                    value={isVerifying ? "Verificando..." : "Verificar"}
                    disabled={isVerifying}
                    style={{
                      opacity: isVerifying ? 0.7 : 1,
                      cursor: isVerifying ? 'not-allowed' : 'pointer'
                    }}
                  />
                  <p className="resend-code">
                    ¿No recibiste el código?{" "}
                    <span onClick={handleResendCode} className="link">
                      <strong>Reenviar código</strong>
                    </span>
                  </p>
                </form>
              )}
            </div>
            <div className="imgBx imgBx2 signupImg">
              <img src={LogoDorado} alt="" />
            </div>
          </div>
        </div>
      )}
      
      {/* Outlet para renderizar la subruta de recuperación de contraseña */}
      <Outlet />

      <CustomModal
        open={modalConfig.open}
        onClose={handleCloseModal}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </section>
  );
};

export default UserLogin;