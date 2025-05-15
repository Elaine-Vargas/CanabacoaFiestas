export default function Rent() {
  return (
     <>
     <section>
      <form>
      <h2>Formulario Alquiler</h2>
      <label>ID Evento</label>
      <input type="number" placeholder="Id evento" required />
      <label>ID Elemento</label>
      <input type="number" placeholder="Id Elemento" required />
      <label>Precio unitario</label>
      <input type="number" placeholder="Precio Unitario" required />
      <label>Cantidad</label>
      <input type="number" placeholder="Cantidad" required />
      <label>Precio Neto</label>
      <input type="number" placeholder="Precio neto" required />
      <label>ITBS</label>
      <input type="number" placeholder="ITBS" required />
      <label>Total</label>
      <input type="number" placeholder="Precio total" required />
      <input type="submit" value="Registrar" />
      </form>
      </section> 
    </>
  )
}
