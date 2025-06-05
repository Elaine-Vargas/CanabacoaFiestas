import { Container } from '@mui/material';
import ViewerCatalog from '../../components/Otros/ViewerCatalog';
import CatalogAlquiler from '../../components/DashboardComponents/Rent/CatalogList';
import Footer from '../../components/principal/Footer';
import { useLocation } from 'react-router-dom';

const Catalog = () => {
  const location = useLocation();

  let content = null;

  if (location.pathname === '/Principal/Catalogo') {
    content = (
<>
    <Container>
      <ViewerCatalog />
    </Container>
    </>
    );
  } else if (location.pathname === '/Alquiler/Catalogo') {
    content = (
      <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <CatalogAlquiler />
      </Container>
      <Footer/>
      </>
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
