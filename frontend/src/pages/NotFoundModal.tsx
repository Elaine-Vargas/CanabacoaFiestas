import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomModal from '../components/Otros/CustomModal';

const NotFoundModal: React.FC = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleGoHome = () => {
    setOpen(false);
    navigate('/');
  };

  return (
    <CustomModal
      open={open}
      onClose={handleGoHome}
      title="404 - Página no encontrada"
      message={
        <div>
          <div>La ruta que intentaste visitar no existe.</div>
        </div>
      }
      type="error"
    />
  );
};

export default NotFoundModal;
