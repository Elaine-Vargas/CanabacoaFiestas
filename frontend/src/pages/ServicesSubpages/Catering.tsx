import { useState } from "react";
import "../../styles/catering.scss"

export default function Catering() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="dashboard-container">

      {/* Contenido de la pantalla */}
      <div className="content-area">
        <h1>Servicio de Catering</h1>
        <button onClick={() => setShowForm(true)} className="open-modal-btn">
          Agregar Catering
        </button>

        {/* Ventana Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button onClick={() => setShowForm(false)} className="close-btn">×</button>

              <form className="modal-form">
                <h3>Formulario de Catering</h3>

                <label>Evento relacionado <input type="text" id="idevento" /></label>
                <label>Catering <input type="text" id="idcatering" /></label>
                <label>Descripción de la comida <input type="text" id="desccomida" /></label>
                <label>Precio Neto <input type="text" id="precioneto" /></label>
                <label>Itebis agregados <input type="text" id="sumaitebis" /></label>
                <label>Precio total <input type="text" id="totalprecio" /></label>
<br />
<br />
<br />
<br />
<br />
<br />
<br />
                <button type="submit" className="submit-btn">ENVIAR</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
