import { useState } from "react";
import "../../styles/transportation.scss";
import "../../styles/services-subpages.scss";

export default function Transportation() {
  const [showForm, setShowForm] = useState(false);
  const [showExtra, setShowExtra] = useState(false);

  return (
    <div className="dashboard-container">
      <div className="content-area">
        <h1>Transporte</h1>
        <button onClick={() => setShowForm(true)} className="open-modal-btn">
          Agregar Transporte
        </button>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-container transport">
              <button onClick={() => setShowForm(false)} className="close-btn">×</button>

              <form className="modal-form horizontal">
                <h3>¿A donde nos vamos y con qué?</h3>

                <div className="form-columns">
                  <div className="form-column">
                    <label>Evento relacionado <input type="text" id="idevento" /></label>
                    <label>Dirección <input type="text" id="iddireccion" /></label>
                    <label>Distancia a recorrer <input type="text" id="distanciakm" /></label>
                  </div>

                  <div className="form-column">
                    <label>Precio Neto <input type="text" id="precioneto" /></label>
                    <label>Itebis agregados <input type="text" id="sumaitebis" /></label>
                    <label>Precio total <input type="text" id="totalprecio" /></label>
                  </div>
                </div>

                <div className="center-toggle">
                  <div className="extra-info-toggle" onClick={() => setShowExtra(!showExtra)}>
                    <span>{showExtra ? "−" : "+"}</span> Más información
                  </div>
                </div>

                {showExtra && (
                  <div className="extra-info-section">
                    <label>Vehículo a utilizar <input type="text" id="idvehiculo" /></label>
                    <label>Conductor responsable <input type="text" id="idconductor" /></label>
                    <label>Cantidad de elementos <input type="text" id="cantidad" /></label>
                  </div>
                )}

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
