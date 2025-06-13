import React, { Suspense, lazy } from 'react';
// Lazy load de los componentes principales
const PrincipalCard = lazy(() => import('../../components/principal/PrincipalCard'));
const PrincipalInfo = lazy(() => import('../../components/principal/PrincipalInfo'));
const PrincipalMenu = lazy(() => import('../../components/principal/PrincipalMenu'));
import "../../styles/mainPages/Principal.scss";

export default function Principal() {
  return (
    <div className="principalContainer">
      <Suspense fallback={<div>Cargando menú...</div>}>
        <PrincipalMenu />
      </Suspense>
      <Suspense fallback={<div>Cargando tarjeta...</div>}>
        <PrincipalCard />
      </Suspense>
      <Suspense fallback={<div>Cargando información...</div>}>
        <PrincipalInfo />
      </Suspense>
    </div>
  );
}
