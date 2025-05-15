export default function Supervision() {
  return (
      <>
      <div className="principalContainer">
      <div className="form">
      <h1>Supervisión</h1>
        <form>
        <label className="formLabel">Supervisión</label>
        <input type="number" placeholder="Id evento" required />
        <label className="formLabel">Tarifa por hora</label>  
        <input type="number" placeholder="Tarifa por hora" required />
        <label className="formLabel">Precio Neto</label>  
        <input type="number" placeholder="Precio neto" required />
        <label className="formLabel">ITBIS</label>
        <input type="number" placeholder="ITBIS" required />
        <label className="formLabel">Total</label>
        <input type="number" placeholder="Precio total" required />
        <input type="submit" value="Registrar" />
        <input type="reset" value="Limpiar" />
      </form>
      </div>

      </div>
      </>
  )
}
