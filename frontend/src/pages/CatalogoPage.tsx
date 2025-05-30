import { Container } from '@mui/material';
import Catalogo from '../components/Catalog';

const CatalogoPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Catalogo />
    </Container>
  );
};

export default CatalogoPage; 