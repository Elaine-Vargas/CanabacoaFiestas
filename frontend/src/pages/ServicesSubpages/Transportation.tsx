export default function Transportation() {
  return (
    <>
      <section>
        <div className="FormTrans">
          <div className="FormTransFondo">
            <div className="FormTransP1Container">
              
              <form action="">
              <h1>Transporte</h1>
              <h5>¿A dónde vamos y con qué nos vamos?</h5>
              <br />
              <p>Evento relacionado</p>
              <input type="text" id="idevento" /> <br />
              <br />
              <p>Dirección</p>
              <input type="text" id="iddireccion" /> <br />
              <br />
              <p>Distancia a recorrer</p>
              <input type="text" id="distanciakm" /> 

             <section>
              <div className="FormTransP2Container">
              <form action="">
                <h6>Otras informaciones</h6>
                <br />
                <p>Vehículo a utilizar</p>
                <input type="text" id="idvehiculo" /> <br />
                <br />
                <p>Conductor responsable</p>
                <input type="text" id="idevento" /> <br />
                <br />
                <p>Cantidad de elementos</p>
                <input type="text" id="iddireccion" /> 
                </form>
                </div>
             </section>

              <p>Precio Neto</p>
              <input type="text" id="precioneto" /> <br />
              <br />
              <p>Itebis agregados</p>
              <input type="text" id="sumaitebis" /> <br />
              <br />
              <p>Precio total</p>
              <input type="text" id="totalprecio" /> <br />
              <br />

              <button>ENVIAR</button>

              </form>

        </div>
        </div>
        </div>
      </section>
    </>
  )
}
