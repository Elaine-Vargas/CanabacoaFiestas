
export default function Decor() {
  return (
    <>
     <section>
      <form>
      <h2>Formulario Decoración</h2>
      <label>ID Evento</label>
      <input type="number" placeholder="Id evento" required />
      <label>Tema de decoración</label>
      <input type="text" placeholder="Tema decoración" required />
      <label>ID Espacio</label>
      <input type="number" placeholder="Id espacio" required />
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
