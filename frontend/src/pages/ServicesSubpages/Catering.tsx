import { useState } from "react";
import "../../styles/catering.scss";
import "../../styles/services-subpages.scss";

type Proveedor = {
  nombre: string;
  direccion: string;
};

type Menu = {
  id: string;
  descripcion: string;
};

type CateringProps = {
  menuVarieties: number;
  activeProveedor: number;
  completedOrders: number;
  poveedores: Proveedor[];
  menus: Menu[];
};

const Catering: React.FC<CateringProps> = ({
  menuVarieties,
  activeProveedor,
  completedOrders,
  poveedores,
  menus,
}) => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Catering</h1>

      <div className="dashboard__stats">
        <div className="stat-card">
          <span className="stat-card__label">Variedades de menú</span>
          <strong className="stat-card__number">{menuVarieties}</strong> <br />
          <button className="stat-card__seeInfo">Ver datos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Proveedores activos</span>
          <strong className="stat-card__number">{activeProveedor}</strong> <br />
          <button className="stat-card__seeInfo">Ver datos</button>
        </div>

        <div className="stat-card">
          <span className="stat-card__label">Pedidos realizados</span>
          <strong className="stat-card__number">{completedOrders}</strong> <br />
          <button className="stat-card__seeInfo2" onClick={() => setShowForm(true)}>
            Agregar Catering
          </button>
        </div>
      </div>

      <div className="cateringSection">
        <h3 className="cateringTitle">Proveedores</h3>
        <div className="tableContainer">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Dirección</th>
              </tr>
            </thead>
            <tbody>
              {poveedores.length === 0 ? (
                <tr>
                  <td colSpan={2}>No hay datos disponibles</td>
                </tr>
              ) : (
                poveedores.map((p, index) => (
                  <tr key={index}>
                    <td>{p.nombre}</td>
                    <td>{p.direccion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
<br />
        <h3 className="cateringTitle">Menús Populares</h3>
        <div className="tableContainer">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {menus.length === 0 ? (
                <tr>
                  <td colSpan={2}>No hay datos disponibles</td>
                </tr>
              ) : (
                menus.map((m, index) => (
                  <tr key={index}>
                    <td>{m.id}</td>
                    <td>{m.descripcion}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modalOverlay">
          <div className="modalContainer">
            <button className="closeButton" onClick={() => setShowForm(false)}>
              ×
            </button>

            <form className="cateringForm">
              <h3>Agregar nuevo pedido</h3>
              <label>Evento relacionado <input type="text" /></label>
              <label>Catering <input type="text" /></label>
              <label>Descripción de la comida <input type="text" /></label>
              <label>Precio Neto <input type="number" /></label>
              <label>ITEBIS Agregados <input type="number" /></label>
              <label>Precio Total <input type="number" /></label>

              <button type="submit" className="submitBtn">Registrar</button>
              <button type="reset" className="resetBtn">Limpiar</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Catering;
