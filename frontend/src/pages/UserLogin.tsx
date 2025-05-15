import React, { useState } from "react";
import "../styles/Login.scss";
import Logo from "../assets/logoVariants/OVALO-CF(titulo).svg"
import { Link } from "react-router-dom"; 

const UserLogin: React.FC = () => {  // Define el componente UserLogin
  const [isActive, setIsActive] = useState(false);  // Estado para controlar el formulario activo

  const toggleForm = () => { // Función para alternar entre los formularios de login y signup
    setIsActive(!isActive);
  };

  const handleLogin = (e: React.FormEvent) => { // Maneja el evento de login
    e.preventDefault(); 
    alert("Login submitted");
  };

  const handleSignup = (e: React.FormEvent) => { // Maneja el evento de signup
    e.preventDefault();
    alert("Signup submitted");
  };

  return (
    <section>  {/*Sección principal del formulario*/} 
     {/* Flecha de regreso */}
    <Link to="/principal" className="back-arrow" title="Volver al inicio">
      Inicio
    </Link>
      <div className={`container ${isActive ? "active" : ""}`}>
        <div className="user signinBx">
          <div className="imgBx">
            <img src={Logo} alt="" />
          </div>
          <div className="formBx">
             <form onSubmit={handleLogin}>  {/*Maneja el evento de login*/}
              <h2>Inicio de sesión</h2>
              <input type="text" placeholder="Usuario / cédula" required />
              <input type="password" placeholder="Contraseña" required />
              <input type="submit" value="Iniciar sesión" />
              <p className="signup">
                No tienes cuenta?{" "}
                <span onClick={toggleForm} className="link">
                 <strong>Registrate. </strong> 
                </span>
              </p>
            </form>
          </div>
        </div>

        <div className="user signupBx">
          <div className="formBx">
            <form onSubmit={handleSignup}> {/*Maneja el evento de signup*/}
              <h2>Registrar</h2>
              <input type="text" placeholder="Nombre" required />
              <input type="text" placeholder="Cédula" required />
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Crear contraseña" required />
              <input type="password" placeholder="Confirmar contraseña" required />
              <input type="submit" value="Registrar" />
              <p className="signup">
                Ya cuentas con una cuenta?{" "}
                <span onClick={toggleForm} className="link">
                  <strong>Inicia sesión.</strong> 
                </span>
              </p>
            </form>
          </div>
          <div className="imgBx">
            <img src={Logo} alt="" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserLogin;

