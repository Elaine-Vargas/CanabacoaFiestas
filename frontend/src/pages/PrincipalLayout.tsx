// PrincipalLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "../components/NavBar";
import { Suspense } from "react";
import {MainLoadingScreen} from "../components/LoadingScreen";
const PrincipalLayout = () => {
  return (
    <>
      <Navbar /> 
      <Suspense fallback={<MainLoadingScreen />}>
        <Outlet /> 
      </Suspense>
    </>
  );
};

export default PrincipalLayout;