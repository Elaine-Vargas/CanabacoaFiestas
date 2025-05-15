import { useState } from "react";

export default function Catering() {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <section className="p-4">
        <h1 className="text-2xl font-bold mb-4">Servicio de Catering</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Agregar Catering
        </button>

        {/* Modal Overlay */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl font-bold"
              >
                ×
              </button>

              <form className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold">Formulario de Catering</h2>
                <label>
                  Evento relacionado
                  <input type="text" id="idevento" className="input-style" />
                </label>
                <label>
                  Catering
                  <input type="text" id="idcatering" className="input-style" />
                </label>
                <label>
                  Descripción de la comida
                  <input type="text" id="desccomida" className="input-style" />
                </label>
                <label>
                  Precio Neto
                  <input type="text" id="precioneto" className="input-style" />
                </label>
                <label>
                  Itebis agregados
                  <input type="text" id="sumaitebis" className="input-style" />
                </label>
                <label>
                  Precio total
                  <input type="text" id="totalprecio" className="input-style" />
                </label>

                <button
                  type="submit"
                  className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  ENVIAR
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
