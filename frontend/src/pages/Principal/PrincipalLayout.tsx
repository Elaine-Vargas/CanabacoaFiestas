// PrincipalLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "../../components/Otros/NavBar";
import { Suspense } from "react";
import {MainLoadingScreen} from "../../components/Otros/LoadingScreen";
import Footer from "../../components/principal/Footer";

const PrincipalLayout = () => {
  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflowX: 'hidden'
    }}>
      <Navbar /> 
      <main style={{ flex: 1 }}>
        <Suspense fallback={<MainLoadingScreen />}>
          <Outlet /> 
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default PrincipalLayout;