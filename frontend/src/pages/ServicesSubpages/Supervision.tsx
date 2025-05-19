import { useState } from "react";
import "../../styles/supervision.scss";
import "../../styles/services-subpages.scss";

export default function Supervision() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="dashboard-container">
      <div className="content-area">
        <h1>Supervisión</h1>
        <button onClick={() => setShowForm(true)} className="open-modal-btn">
          Agregar Supervisión
        </button>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-container supervision">
              <button onClick={() => setShowForm(false)} className="close-btn">×</button>

              <form className="modal-form">
                <h3>Formulario Supervisión</h3>

                <label>Supervisión
                  <input type="number" placeholder="Id evento" required />
                </label>

                <label>Tarifa por hora
                  <input type="number" placeholder="Tarifa por hora" required />
                </label>

                <label>Precio Neto
                  <input type="number" placeholder="Precio neto" required />
                </label>

                <label>ITBIS
                  <input type="number" placeholder="ITBIS" required />
                </label>

                <label>Total
                  <input type="number" placeholder="Precio total" required />
                </label>

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
