import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import CatalogoPage from './pages/CatalogoPage';
import Login from './pages/Login';
import AdminElementos from './components/AdminElementos';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<CatalogoPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/elementos" element={<AdminElementos />} />
      </Routes>
    </Router>
  );
}

export default App; 