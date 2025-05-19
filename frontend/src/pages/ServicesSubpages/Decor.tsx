import { useState } from "react";
import "../../styles/decor.scss";
import "../../styles/services-subpages.scss";

export default function Decor() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="dashboard-container">
      <div className="content-area">
        <h1>Decoración</h1>
        <button onClick={() => setShowForm(true)} className="open-modal-btn">
          Agregar Decoración
        </button>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-container decor">
              <button onClick={() => setShowForm(false)} className="close-btn">×</button>

              <form className="modal-form">
                <h3>¿Qué estilo tenemos?</h3>

                <label>ID Evento
                  <input type="number" placeholder="Id evento" required />
                </label>

                <label>Tema de decoración
                  <input type="text" placeholder="Tema decoración" required />
                </label>

                <label>ID Espacio
                  <input type="number" placeholder="Id espacio" required />
                </label>

                <label>Precio Neto
                  <input type="number" placeholder="Precio neto" required />
                </label>

                <label>ITBIS
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
