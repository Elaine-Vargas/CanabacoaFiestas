import { Container } from '@mui/material';
import Catalogo from '../components/CatalogList';
import Footer from '../components/Footer';
const CatalogoPage = () => {
  return (
    <>
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Catalogo />
    </Container>
    <Footer/>
    </>
  );
};

export default CatalogoPage; 