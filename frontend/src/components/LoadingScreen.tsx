import '../styles/mainPages/Loading.scss'; 
import Navbar from './NavBar';


export const MainLoadingScreen = () => {
  return (
    <>
    <div className="loading-spinner-container">
          <Navbar />
<div className="spinner"></div>
      <p className="loading-text">Cargando...</p>
    </div>
    </>
  );
};

export const LoadingScreen = () => {
  return (
    <>
    <div className="loading-spinner-container">
<div className="spinner"></div>
      <p className="loading-text">Cargando...</p>
    </div>
    </>
  );
};