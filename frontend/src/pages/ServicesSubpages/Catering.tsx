import { useState } from "react";
import "../../styles/catering.scss"
import "../../styles/services-subpages.scss";

export default function Catering() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="dashboard-container">

      {/* Contenido de la pantalla */}
      <div className="content-area">
        <h1>Catering</h1>
        <button onClick={() => setShowForm(true)} className="open-modal-btn">
          Agregar Catering
        </button>

        {/* Ventana Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button onClick={() => setShowForm(false)} className="close-btn">×</button>

              <form className="modal-form">
                <h3>¿Cuál es el gusto del cliente?</h3>

                <label>Evento relacionado <input type="text" id="idevento" /></label>
                <label>Catering <input type="text" id="idcatering" /></label>
                <label>Descripción de la comida <input type="text" id="desccomida" /></label>
                <label>Precio Neto <input type="text" id="precioneto" /></label>
                <label>Itebis agregados <input type="text" id="sumaitebis" /></label>
                <label>Precio total <input type="text" id="totalprecio" /></label>

                <div className="form-buttons">
                  <button type="submit" className="submit-btn">REGISTRAR</button>
                  <button type="reset" className="reset-btn">LIMPIAR</button>
                </div>

              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
