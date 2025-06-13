import { Suspense, lazy } from 'react';
import { Container } from '@mui/material';
const ViewerCatalog = lazy(() => import('../../components/Otros/ViewerCatalog'));
const CatalogAlquiler = lazy(() => import('../../components/DashboardComponents/Rent/CatalogList'));
const Footer = lazy(() => import('../../components/principal/Footer'));
import { useLocation } from 'react-router-dom';

const Catalog = () => {
  const location = useLocation();

  let content = null;

  if (location.pathname === '/Principal/Catalogo') {
    content = (
      <Suspense fallback={<div>Cargando catálogo...</div>}>
        <Container>
          <ViewerCatalog />
        </Container>
      </Suspense>
    );
  } else if (location.pathname === '/Alquiler/Catalogo') {
    content = (
      <Suspense fallback={<div>Cargando catálogo de alquiler...</div>}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <CatalogAlquiler />
        </Container>
        <Footer/>
      </Suspense>
    );
  } else {
    content = (
      <p>Ruta no reconocida</p>
    );
  }

  return (
    <div>
      {content}
    </div>
  );
};
export default Catalog;
