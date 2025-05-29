import React from 'react';

const MapComponent: React.FC = () => {
  return (
    <iframe 
      className="mapFrame" 
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1881.356618938069!2d-70.65674901857724!3d19.424792297090555!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eb1cfc60f45d467%3A0x583a1623ba2e90cd!2sCanabacoa%20Fiestas!5e0!3m2!1ses-419!2sdo!4v1748475199033!5m2!1ses-419!2sdo" 
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Ubicación de Canabacoa Fiestas"
    />
  );
};

export default MapComponent; 