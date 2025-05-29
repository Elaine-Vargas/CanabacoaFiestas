import { useEffect, useState, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../../styles/transportation.scss";
import "../../styles/services-subpages.scss";

// Tipos para los datos
interface Transporte {
  id_transporte?: number;
  id_evento: number;
  id_direccion: number;
  distancia_km: number;
  precioneto_transporte: number;
  itbis_transporte: number;
  total_transporte: number;
}

interface Evento {
  id_evento: number;
  fecha_evento: string;
  hora_evento: string;
  estado_evento: string;
  tipo_evento: string;
  nota_cliente: string;
}

interface RutaInfo {
  distancia: string;
  duracion: string;
}

interface SearchResult {
  display_name: string;
  lat: number;
  lon: number;
}

interface NominatimResponse {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    [key: string]: string;
  };
}

interface OSRMRoute {
  routes: Array<{
    distance: number;
    duration: number;
    geometry: {
      coordinates: Array<[number, number]>;
    };
  }>;
}

interface Direccion {
  id_direccion: number;
  id_provincia: number;
  id_sector: number;
  sector: string;
  calle: string;
  detalles: string;
}

interface Provincia {
  id_provincia: number;
  nombre: string;
}

interface Sector {
  id_sector: number;
  nombre: string;
  id_provincia: number;
}

// Ubicación fija de Canabacoa
const UBICACION_FIJA = {
  lat: 19.424778,
  lng: -70.655694,
  direccion: "Los Llanos de Canabacoa, Calle Proyecto Casa #3, Santiago de los Caballeros 51061"
};

// Configurar el ícono por defecto de Leaflet
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

export default function Transportation() {
  const [showModal, setShowModal] = useState(false);
  const [transportes, setTransportes] = useState<Transporte[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [formData, setFormData] = useState<Partial<Transporte>>({});
  const [editId, setEditId] = useState<number | null>(null);
  const [filtroEvento, setFiltroEvento] = useState("");
  const [filtroDireccion, setFiltroDireccion] = useState("");
  const [direccionDestino, setDireccionDestino] = useState("");
  const [rutaInfo, setRutaInfo] = useState<RutaInfo | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<SearchResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mapClickEnabled, setMapClickEnabled] = useState(false);
  const [municipio, setMunicipio] = useState("Santiago de los Caballeros");
  const [calle, setCalle] = useState("");
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [provincias, setProvincias] = useState<Provincia[]>([]);
  const [sectores, setSectores] = useState<Sector[]>([]);
  const [showDireccionModal, setShowDireccionModal] = useState(false);
  const [direccionForm, setDireccionForm] = useState<Partial<Direccion>>({});

  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const destinationMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // Función para buscar direcciones
  const buscarDireccion = async () => {
    if (!calle.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const searchQuery = `${calle}, ${municipio}, República Dominicana`;
      console.log("Buscando:", searchQuery);
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=do&limit=5&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error(`Error en la búsqueda: ${response.status}`);
      }
      
      const data = await response.json() as NominatimResponse[];
      console.log("Resultados de búsqueda:", data);
      
      if (data && data.length > 0) {
        const results = data.map(item => ({
          display_name: item.display_name,
          lat: Number(item.lat),
          lon: Number(item.lon)
        }));
        setSearchResults(results);
        
        if (results.length === 1) {
          seleccionarResultadoBusqueda(results[0]);
        }
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error al buscar direcciones:", error);
      setSearchResults([]);
    }
  };

  // Función para seleccionar un resultado de búsqueda
  const seleccionarResultadoBusqueda = (result: SearchResult) => {
    console.log("Seleccionando resultado de búsqueda:", result);
    setDireccionDestino(result.display_name);
    setSearchResults([]);
    
    // Asegurarse de que el mapa esté inicializado
    if (!mapRef.current) {
      console.error("El mapa no está inicializado");
      return;
    }

    // Actualizar el mapa y la ruta
    actualizarRuta(result.lat, result.lon);
  };

  // Calcular ruta
  const actualizarRuta = async (lat: number, lng: number) => {
    if (!mapRef.current) {
      console.error("El mapa no está inicializado");
      return;
    }

    try {
      console.log("Calculando ruta desde:", UBICACION_FIJA, "hasta:", { lat, lng });

      // Limpiar marcadores y ruta anteriores
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.remove();
      }
      if (routeLineRef.current) {
        routeLineRef.current.remove();
      }

      // Crear marcador de destino
      const destinationMarker = L.marker([lat, lng], {
        draggable: true,
        icon: defaultIcon
      }).addTo(mapRef.current);

      destinationMarker.on('dragend', (e: L.DragEndEvent) => {
        const newPos = e.target.getLatLng();
        actualizarRuta(newPos.lat, newPos.lng);
      });

      destinationMarkerRef.current = destinationMarker;

      // Calcular ruta usando OSRM
      const url = `https://router.project-osrm.org/route/v1/driving/${UBICACION_FIJA.lng},${UBICACION_FIJA.lat};${lng},${lat}?overview=full&geometries=geojson`;
      console.log("URL de la ruta:", url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al calcular la ruta: ${response.status}`);
      }

      const data = await response.json() as OSRMRoute;
      console.log("Datos de la ruta:", data);

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // Convertir las coordenadas al formato correcto para Leaflet
        const coordinates = route.geometry.coordinates.map((coord: [number, number]) => 
          L.latLng(coord[1], coord[0])
        );

        // Dibujar ruta con estilo mejorado
        const routeLine = L.polyline(coordinates, {
          color: "#FF6B6B",
          weight: 5,
          opacity: 0.8,
          lineJoin: 'round',
          dashArray: '5, 10'
        }).addTo(mapRef.current);
        routeLineRef.current = routeLine;

        // Actualizar información
        const distancia = (route.distance / 1000).toFixed(1);
        const duracion = Math.round(route.duration / 60);
        
        console.log("Distancia:", distancia, "km");
        console.log("Duración:", duracion, "minutos");

        setRutaInfo({
          distancia: `${distancia} km`,
          duracion: `${duracion} min`
        });

        // Actualizar el campo de distancia en el formulario
        setFormData(prev => ({
          ...prev,
          distancia_km: parseFloat(distancia)
        }));

        // Ajustar el mapa para mostrar toda la ruta con padding
        const bounds = routeLine.getBounds();
        mapRef.current.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 15
        });

        // Forzar actualización del mapa
        mapRef.current.invalidateSize();
      } else {
        console.error("No se encontró ninguna ruta");
      }
    } catch (error) {
      console.error("Error al calcular la ruta:", error);
    }
  };

  // Inicializar mapa
  useEffect(() => {
    if (!showModal) return;

    const initMap = () => {
      const mapElement = document.getElementById("map");
      if (!mapElement) {
        console.error("No se encontró el elemento del mapa");
        return;
      }

      try {
        // Limpiar mapa anterior
        if (mapRef.current) {
          mapRef.current.remove();
        }

        // Crear nuevo mapa
        const map = L.map(mapElement, {
          center: [UBICACION_FIJA.lat, UBICACION_FIJA.lng],
          zoom: 13,
          zoomControl: true
        });

        // Agregar capa base
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        // Marcar ubicación fija con popup
        const marker = L.marker([UBICACION_FIJA.lat, UBICACION_FIJA.lng])
          .addTo(map)
          .bindPopup("Canabacoa - Punto de Origen");
        markerRef.current = marker;

        mapRef.current = map;

        // Forzar actualización del tamaño
        setTimeout(() => {
          map.invalidateSize();
        }, 100);

        console.log("Mapa inicializado correctamente");
      } catch (error) {
        console.error("Error al inicializar el mapa:", error);
      }
    };

    // Esperar a que el modal esté completamente renderizado
    setTimeout(initMap, 100);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [showModal]);

  // Cargar transportes y eventos
  useEffect(() => {
    fetch("/api/transporte")
      .then(res => res.json())
      .then(setTransportes);
    fetch("/api/eventos")
      .then(res => res.json())
      .then(setEventos);
  }, []);

  // Cargar direcciones, provincias y sectores
  useEffect(() => {
    fetch("/api/direcciones")
      .then(res => res.json())
      .then(setDirecciones);
    fetch("/api/provincias")
      .then(res => res.json())
      .then(setProvincias);
    fetch("/api/sectores")
      .then(res => res.json())
      .then(setSectores);
  }, []);

  // Manejador para inputs
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ["id_evento", "id_direccion", "distancia_km", "precioneto_transporte", "itbis_transporte", "total_transporte"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  // Manejador para selects
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ["id_evento", "id_direccion", "distancia_km", "precioneto_transporte", "itbis_transporte", "total_transporte"].includes(name)
        ? Number(value)
        : value,
    }));

    // Si se selecciona una dirección, actualizar el mapa
    if (name === "id_direccion" && value) {
      const direccionSeleccionada = direcciones.find(d => d.id_direccion === Number(value));
      if (direccionSeleccionada) {
        seleccionarDireccionDB(direccionSeleccionada);
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (editId) {
      // Editar
      await fetch(`/api/transporte/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } else {
      // Crear
      await fetch("/api/transporte", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    }
    setShowModal(false);
    setFormData({});
    setEditId(null);
    // Refrescar datos
    fetch("/api/transporte").then(res => res.json()).then(setTransportes);
  };

  const handleEdit = (item: Transporte) => {
    setFormData(item);
    setEditId(item.id_transporte!);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Seguro que deseas eliminar este transporte?")) {
      await fetch(`/api/transporte/${id}`, { method: "DELETE" });
      fetch("/api/transporte").then(res => res.json()).then(setTransportes);
    }
  };

  // Manejar cambio de provincia
  const handleProvinciaChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const provinciaId = Number(e.target.value);
    setDireccionForm(prev => ({
      ...prev,
      id_provincia: provinciaId,
      id_sector: 0 // Reset sector when province changes
    }));
  };

  // Manejar envío del formulario de dirección
  const handleDireccionSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/direcciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(direccionForm),
      });
      
      if (response.ok) {
        const newDireccion = await response.json();
        setDirecciones(prev => [...prev, newDireccion]);
        setShowDireccionModal(false);
        setDireccionForm({});
      }
    } catch (error) {
      console.error("Error al guardar la dirección:", error);
    }
  };

  // Función para seleccionar una dirección de la base de datos
  const seleccionarDireccionDB = (direccion: Direccion) => {
    console.log("Seleccionando dirección de la base de datos:", direccion);
    const direccionCompleta = `${direccion.calle}, ${direccion.sector}`;
    setDireccionDestino(direccionCompleta);
    
    // Buscar las coordenadas usando Nominatim
    buscarCoordenadas(direccionCompleta);
  };

  // Buscar coordenadas
  const buscarCoordenadas = async (direccion: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&countrycodes=do&limit=1`
      );
      
      if (!response.ok) throw new Error("Error en la búsqueda");
      
      const data = await response.json() as NominatimResponse[];
      
      if (data && data.length > 0) {
        const result = data[0];
        actualizarRuta(Number(result.lat), Number(result.lon));
      }
    } catch (error) {
      console.error("Error al buscar coordenadas:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="content-area">
        <h1>Transporte</h1>
        <button onClick={() => { setFormData({}); setEditId(null); setShowModal(true); }} className="open-modal-btn">
          Agregar Transporte
        </button>
        <div className="table-section">
          <p>Transportes</p>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>ID Evento</th>
                <th>ID Dirección</th>
                <th>Distancia (km)</th>
                <th>Precio Neto</th>
                <th>ITBIS</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transportes.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", fontStyle: "italic" }}>
                    No hay datos de transporte.
                  </td>
                </tr>
              ) : (
                transportes.map(item => (
                  <tr key={item.id_transporte}>
                    <td>{item.id_transporte}</td>
                    <td>{item.id_evento}</td>
                    <td>{item.id_direccion}</td>
                    <td>{item.distancia_km}</td>
                    <td>{item.precioneto_transporte}</td>
                    <td>{item.itbis_transporte}</td>
                    <td>{item.total_transporte}</td>
                    <td>
                      <button onClick={() => handleEdit(item)} className="edit-btn">Editar</button>
                      <button onClick={() => handleDelete(item.id_transporte!)} className="delete-btn">Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-container transport">
              <button onClick={() => setShowModal(false)} className="close-btn">×</button>
              <div className="modal-content">
                <div className="modal-form">
                  <h3>{editId ? "Editar Transporte" : "Nuevo Transporte"}</h3>
                  <form onSubmit={handleSubmit}>
                    <div className="form-section">
                      <h4>Información Principal</h4>
                      <label>
                        ID Evento
                        <input
                          type="number"
                          name="id_evento"
                          value={formData.id_evento || ""}
                          onChange={handleInputChange}
                          required
                        />
                      </label>
                      <label>
                        Dirección
                        <select
                          name="id_direccion"
                          value={formData.id_direccion || ""}
                          onChange={handleSelectChange}
                          required
                          className="direccion-select"
                        >
                          <option value="">Seleccione una dirección</option>
                          {direcciones.map(dir => (
                            <option key={dir.id_direccion} value={dir.id_direccion}>
                              {`${dir.calle}, ${dir.sector} - ${provincias.find(p => p.id_provincia === dir.id_provincia)?.nombre}`}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Distancia (km)
                        <input
                          type="number"
                          name="distancia_km"
                          value={formData.distancia_km || ""}
                          onChange={handleInputChange}
                          required
                          readOnly
                        />
                      </label>
                    </div>

                    <div className="form-section">
                      <h4>Información de Costos</h4>
                      <label>
                        Precio Neto
                        <input
                          type="number"
                          name="precioneto_transporte"
                          value={formData.precioneto_transporte || ""}
                          onChange={handleInputChange}
                          required
                        />
                      </label>
                      <label>
                        ITBIS
                        <input
                          type="number"
                          name="itbis_transporte"
                          value={formData.itbis_transporte || ""}
                          onChange={handleInputChange}
                          required
                        />
                      </label>
                      <label>
                        Total
                        <input
                          type="number"
                          name="total_transporte"
                          value={formData.total_transporte || ""}
                          onChange={handleInputChange}
                          required
                        />
                      </label>
                    </div>

                    <div className="form-buttons">
                      <button type="submit" className="submit-btn">{editId ? "Actualizar" : "Registrar"}</button>
                      <button type="button" className="reset-btn" onClick={() => setFormData({})}>Limpiar</button>
                    </div>
                  </form>
                </div>

                <div className="tables-container">
                  <div className="table-section">
                    <div className="table-header">
                      <p>Eventos Disponibles</p>
                      <div className="search-section">
                        <input
                          type="text"
                          placeholder="Buscar por ID, estado, fecha..."
                          value={filtroEvento}
                          onChange={(e) => setFiltroEvento(e.target.value)}
                        />
                      </div>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Fecha</th>
                          <th>Hora</th>
                          <th>Estado</th>
                          <th>Tipo</th>
                          <th>Nota</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventos.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: "center", fontStyle: "italic" }}>
                              No hay eventos.
                            </td>
                          </tr>
                        ) : (
                          eventos
                            .filter(ev =>
                              Object.values(ev).join(" ").toLowerCase().includes(filtroEvento.toLowerCase())
                            )
                            .map(ev => (
                              <tr key={ev.id_evento}>
                                <td>{ev.id_evento}</td>
                                <td>{ev.fecha_evento}</td>
                                <td>{ev.hora_evento}</td>
                                <td>{ev.estado_evento}</td>
                                <td>{ev.tipo_evento}</td>
                                <td>{ev.nota_cliente}</td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-section">
                    <div className="table-header">
                      <p>Direcciones Registradas</p>
                      <div className="header-actions">
                        <div className="search-section">
                          <input
                            type="text"
                            placeholder="Buscar por provincia, sector, calle..."
                            value={filtroDireccion}
                            onChange={(e) => setFiltroDireccion(e.target.value)}
                          />
                        </div>
                        <button 
                          onClick={() => setShowDireccionModal(true)}
                          className="add-btn"
                        >
                          Agregar Dirección
                        </button>
                      </div>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Provincia</th>
                          <th>Sector</th>
                          <th>Calle</th>
                          <th>Detalles</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {direcciones.length === 0 ? (
                          <tr>
                            <td colSpan={6} style={{ textAlign: "center" }}>
                              No hay direcciones registradas
                            </td>
                          </tr>
                        ) : (
                          direcciones
                            .filter(dir =>
                              Object.values(dir).join(" ").toLowerCase().includes(filtroDireccion.toLowerCase())
                            )
                            .map(dir => (
                              <tr key={dir.id_direccion}>
                                <td>{dir.id_direccion}</td>
                                <td>{provincias.find(p => p.id_provincia === dir.id_provincia)?.nombre}</td>
                                <td>{dir.sector}</td>
                                <td>{dir.calle}</td>
                                <td>{dir.detalles}</td>
                                <td>
                                  <button 
                                    onClick={() => seleccionarDireccionDB(dir)}
                                    className="select-btn"
                                  >
                                    Seleccionar
                                  </button>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="map-section">
                    <div id="map" className="map-container"></div>
                    {rutaInfo && (
                      <div className="ruta-info">
                        <div className="info-item">
                          <span className="info-label">Distancia:</span>
                          <span className="info-value">{rutaInfo.distancia}</span>
                        </div>
                        <div className="info-item">
                          <span className="info-label">Tiempo estimado:</span>
                          <span className="info-value">{rutaInfo.duracion}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal para agregar dirección */}
        {showDireccionModal && (
          <div className="modal-overlay">
            <div className="modal-container">
              <button onClick={() => setShowDireccionModal(false)} className="close-btn">×</button>
              <h3>Agregar Nueva Dirección</h3>
              <form onSubmit={handleDireccionSubmit}>
                <div className="form-section">
                  <label>
                    Provincia
                    <select
                      value={direccionForm.id_provincia || ""}
                      onChange={handleProvinciaChange}
                      required
                    >
                      <option value="">Seleccione una provincia</option>
                      {provincias.map(prov => (
                        <option key={prov.id_provincia} value={prov.id_provincia}>
                          {prov.nombre}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Sector
                    <select
                      value={direccionForm.id_sector || ""}
                      onChange={(e) => setDireccionForm(prev => ({
                        ...prev,
                        id_sector: Number(e.target.value)
                      }))}
                      required
                    >
                      <option value="">Seleccione un sector</option>
                      {sectores
                        .filter(s => s.id_provincia === direccionForm.id_provincia)
                        .map(sector => (
                          <option key={sector.id_sector} value={sector.id_sector}>
                            {sector.nombre}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label>
                    Calle
                    <input
                      type="text"
                      value={direccionForm.calle || ""}
                      onChange={(e) => setDireccionForm(prev => ({
                        ...prev,
                        calle: e.target.value
                      }))}
                      required
                    />
                  </label>

                  <label>
                    Detalles
                    <textarea
                      value={direccionForm.detalles || ""}
                      onChange={(e) => setDireccionForm(prev => ({
                        ...prev,
                        detalles: e.target.value
                      }))}
                    />
                  </label>
                </div>

                <div className="form-buttons">
                  <button type="submit" className="submit-btn">Guardar</button>
                  <button 
                    type="button" 
                    className="reset-btn"
                    onClick={() => setShowDireccionModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}