export default function AssemblyAndDisassembly() {
  return (
    <>
    <div className="principalContainer">
    <div className="form">
      <h1>Montaje y Desmontaje</h1>
    <form>
      <label className="formLabel">Montaje y Desmontaje</label>
      <input type="number" placeholder="Id evento" required />
      <label className="formLabel">Tarifa por hora</label>
      <input type="number" placeholder="Tarifa por hora" required />
      <label className="formLabel">Precio Neto</label>
      <input type="number" placeholder="Precio neto" required />
      <label className="formLabel">ITBIS</label>
      <input type="number" placeholder="ITBIS" required />
      <label className="formLabel">Total</label>
      <input type="number" placeholder="Precio total" required />
      <label className="formLabel">Horas de trabajo</label>
      <input type="number" placeholder="Horas de trabajo" required />
      <label className="formLabel">Cédula del usuario</label>
      <input type="text" placeholder="Cédula del usuario" required />
      <input type="submit" value="Registrar" />
      <input type="reset" value="Limpiar" />
    </form>
    </div>
    </div>
    </>
  )
}
