import { useState } from "react";
import "../../styles/rent.scss";
import "../../styles/services-subpages.scss";

export default function Rent() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="dashboard-container">
      <div className="content-area">
        <h1>Alquiler</h1>
        <button onClick={() => setShowForm(true)} className="open-modal-btn">
          Agregar Alquiler
        </button>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-container rent">
              <button onClick={() => setShowForm(false)} className="close-btn">×</button>

              <form className="modal-form">
                <h3>Formulario de Alquiler</h3>

                <label>ID Evento
                  <input type="number" placeholder="Id evento" required />
                </label>

                <label>ID Elemento
                  <input type="number" placeholder="Id Elemento" required />
                </label>

                <label>Precio unitario
                  <input type="number" placeholder="Precio unitario" required />
                </label>

                <label>Cantidad
                  <input type="number" placeholder="Cantidad" required />
                </label>

                <label>Precio Neto
                  <input type="number" placeholder="Precio neto" required />
                </label>

                <label>ITBS
                  <input type="number" placeholder="ITBS" required />
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
