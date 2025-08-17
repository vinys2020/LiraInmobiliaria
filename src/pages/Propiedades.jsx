import React, { useState, useEffect } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase"; // tu configuración de Firebase
import AgregarPropiedadModal from "../components/AgregarPropiedadModal";
import {
  FaBath,
  FaBed,
  FaRulerCombined,
  FaCar,
  FaWifi,
  FaSwimmingPool,
  FaLeaf,
  FaBurn,
  FaMapMarkerAlt,
} from "react-icons/fa";

import "./Propiedades.css";

export default function Propiedades() {
  const [filtro, setFiltro] = useState("todos");
  const [propiedades, setPropiedades] = useState([]);
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState(null);
  const [fullscreenIndex, setFullscreenIndex] = useState(null);
  const [modalNuevaPropiedad, setModalNuevaPropiedad] = useState(false);
  const [subfiltro, setSubfiltro] = useState(null);



  // Traer propiedades desde Firebase
  // Traer propiedades desde Firebase en tiempo real
  useEffect(() => {
    const propiedadesRef = collection(db, "Propiedades");

    // Listener en tiempo real
    const unsubscribe = onSnapshot(propiedadesRef, (snapshot) => {
      const props = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPropiedades(props);
    }, (error) => {
      console.error("Error al obtener propiedades:", error);
    });

    // Limpieza cuando el componente se desmonte
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    document.body.classList.add("propiedades-body");
    return () => {
      document.body.classList.remove("propiedades-body");
    };
  }, []);

  const normalize = (str) =>
    str
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // Filtrar propiedades según filtro seleccionado y subfiltro
  const propiedadesFiltradas = propiedades.filter((p) => {
    // "todos" muestra todo
    if (filtro === "todos") return true;

    // Filtrado con subfiltro
    if (subfiltro) {
      return (
        normalize(p.propiedadEn) === normalize(filtro) &&
        normalize(p.tipoDePropiedad) === normalize(subfiltro)
      );
    }

    // Solo filtro principal
    return normalize(p.propiedadEn) === normalize(filtro);
  });


    
  return (
    <div className="container-fluid min-vh-100 p-4 bg-light ">
      <div className="row">
        {/* Sidebar */}
        <aside className="col-12 col-md-4 col-lg-3 mb-4">
          <div className="list-group sticky-top" style={{ top: "1rem", zIndex: 100 }}>
            {[
              { key: "todos", label: "Todos" },
              {
                key: "venta",
                label: "En Venta",
                subtipos: ["Casa", "Departamento", "Dúplex", "Galpón", "Local", "Lote", "Oficinas"]
              },
              {
                key: "alquiler",
                label: "En Alquiler",
                subtipos: ["Casa", "Departamento", "Dúplex", "Galpón", "Local", "Lote", "Oficinas"]
              },
              {
                key: "alquilada", label: "Alquiladas", subtipos: ["Casa", "Departamento", "Dúplex", "Galpón", "Local", "Lote", "Oficinas"]

              },
              {
                key: "vendida", label: "Vendidas", subtipos: ["Casa", "Departamento", "Dúplex", "Galpón", "Local", "Lote", "Oficinas"]
              },
            ].map(({ key, label, subtipos }) => (
              <div key={key}>
                <button
                  onClick={() => {
                    setFiltro(key);
                    setSubfiltro(null); // reinicia subfiltro al cambiar tipo principal
                  }}
                  className={`list-group-item list-group-item-action ${filtro === key ? "active" : ""}`}
                >
                  {label}
                </button>

                {/* Subfiltros */}
                {filtro === key && subtipos && (
                  <div className="ms-3 mt-1">
                    {subtipos.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => setSubfiltro(sub)}
                        className={`list-group-item list-group-item-action ${subfiltro === sub ? "active" : ""}`}
                        style={{ fontSize: "0.9rem" }}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Botón para abrir modal de nueva propiedad */}
            <button
              className="btn btn-success mt-3 w-100"
              onClick={() => setModalNuevaPropiedad(true)}
            >
              + Agregar Propiedad
            </button>
          </div>
        </aside>


{/* Contenido principal */}
<main className="col-12 col-md-8 col-lg-9">
  <h2 className="mb-4">
    Propiedades {filtro !== "todos" && `- ${filtro.charAt(0).toUpperCase() + filtro.slice(1)}`}
  </h2>

  <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
    {propiedadesFiltradas.map((prop) => {
      const baths = prop["baños"] ?? prop.banos ?? prop.bathrooms ?? prop.bath ?? undefined;
      const beds = prop.habitaciones ?? prop.rooms ?? undefined;
      const metros = prop.m2 ?? prop.superficieCubierta ?? prop.superficie ?? undefined;
      const cocheraCount = typeof prop.cochera === "number" ? prop.cochera : prop.cochera ? 1 : 0;

      const estado = (prop.propiedadEn || "").toLowerCase();
      const estadoLabel =
        estado === "venta"
          ? "En Venta"
          : estado === "alquiler"
            ? "En Alquiler"
            : estado === "vendida"
              ? "Vendida"
              : estado === "alquilada"
                ? "Alquilada"
                : "";

      const badgeColor =
        estado === "venta"
          ? "#0d6efd"
          : estado === "alquiler"
            ? "#198754"
            : estado === "vendida"
              ? "#dc3545"
              : estado === "alquilada"
                ? "#6c757d"
                : "#6c757d";

      const moneda = (prop.moneda || "").toUpperCase();
      const symbol = moneda === "USD" ? "US$" : "$";
      const precioFmt =
        prop.precio != null && prop.precio !== ""
          ? `${symbol}${Number(prop.precio).toLocaleString("es-AR")}${moneda && moneda !== "ARS" ? ` / ${moneda}` : ""}`
          : "";

      const ubicacion = [
        prop?.direccion?.calle,
        prop?.direccion?.localidad,
        prop?.direccion?.provincia
      ]
        .filter(Boolean)
        .join(", ") || prop.ubicacion || "";

      return (
        <div key={prop.id} className="col" id={prop.id}>
          <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden hover-shadow">
            {/* Imagen + etiqueta */}
            <div className="position-relative">
              {prop.imagenes && prop.imagenes[0] && (
                <img
                  src={prop.imagenes[0]}
                  alt={prop.titulo}
                  className="card-img-top"
                  style={{ objectFit: "cover", height: "200px" }}
                />
              )}

              {estadoLabel && (
                <span
                  className="badge position-absolute top-0 end-0 m-2 px-3 py-2"
                  style={{ backgroundColor: badgeColor }}
                >
                  {estadoLabel}
                </span>
              )}
            </div>

            {/* Cuerpo */}
            <div className="card-body d-flex flex-column">
              <h5 className="card-title text-truncate mb-2 ">{prop.titulo}</h5>


              {precioFmt && (
                <h6 className="fw-bold text-success mb-2">{moneda} {precioFmt}</h6>
              )}

              <p className="card-text text-muted small mb-1" style={{ minHeight: "2em" }}>
                {prop.descripcion?.length > 120 ? prop.descripcion.slice(0, 120) + "…" : prop.descripcion}
              </p>

              {/* Métricas principales */}
              <div className="d-flex flex-wrap gap-2 text-muted small mb-1">
                {Number(beds) > 0 && (
                  <span className="d-inline-flex align-items-center">
                    <FaBed className="me-1" /> {beds} Hab.
                  </span>
                )}
                {Number(baths) > 0 && (
                  <span className="d-inline-flex align-items-center">
                    <FaBath className="me-1" /> {baths} Baño{Number(baths) === 1 ? "" : "s"}
                  </span>
                )}
                {Number(metros) > 0 && (
                  <span className="d-inline-flex align-items-center">
                    <FaRulerCombined className="me-1" /> {metros} m²
                  </span>
                )}
                {Number(cocheraCount) > 0 && (
                  <span className="d-inline-flex align-items-center">
                    <FaCar className="me-1" /> {cocheraCount} Coch.
                  </span>
                )}
              </div>

              {/* Extras */}
              <div className="d-flex flex-wrap gap-2 mb-3">
                {prop.internet && (
                  <span className="badge rounded-pill bg-light text-dark border">
                    <FaWifi className="me-1" /> Internet
                  </span>
                )}
                {prop.pileta && (
                  <span className="badge rounded-pill bg-light text-dark border">
                    <FaSwimmingPool className="me-1" /> Pileta
                  </span>
                )}
                {prop.gasNatural && (
                  <span className="badge rounded-pill bg-light text-dark border">
                    <FaBurn className="me-1" /> Gas natural
                  </span>
                )}
                {prop.patio && (
                  <span className="badge rounded-pill bg-light text-dark border">
                    <FaLeaf className="me-1" /> Patio
                  </span>
                )}
              </div>

{/* Ubicación */}
{ubicacion && (
  <div className="mb-3">
{/* Primera línea: calle */}
<div
  className="text-muted small d-flex align-items-start"
  style={{
    display: "-webkit-box",
    WebkitLineClamp: 2,       // máximo 2 líneas
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    textOverflow: "ellipsis",
    minHeight: "3em",       // espacio para 2 líneas (aprox.)
  }}
>
  <FaMapMarkerAlt className="me-1 mt-1" />
  {prop.direccion?.calle || ""}
</div>


    {/* Segunda línea: localidad, provincia y país + botón */}
    <div
      className="d-flex align-items-center justify-content-between"
      style={{
        display: "flex",
        overflow: "hidden",
        marginTop: "2px",
      }}
    >
      {/* Texto de localidad, provincia y país */}
      <div
        className="text-muted small text-truncate"
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          marginRight: "8px",
        }}
        title={`${prop.direccion?.localidad || ""}${prop.direccion?.provincia ? `, ${prop.direccion.provincia}` : ""}${prop.direccion?.pais ? `, ${prop.direccion.pais}` : ""}`}
      >
        {prop.direccion?.localidad || ""}
        {prop.direccion?.provincia ? `, ${prop.direccion.provincia}` : ""}
        {prop.direccion?.pais ? `, ${prop.direccion.pais}` : ""}
      </div>

      {/* Botón de Google Maps */}
      <a
  className="btn btn-danger btn-sm d-flex align-items-center justify-content-center"
  href={
    prop.ubicacionGeo?.lat && prop.ubicacionGeo?.lng
      ? `https://www.google.com/maps?q=${prop.ubicacionGeo.lat},${prop.ubicacionGeo.lng}`
      : `https://www.google.com/maps?q=${encodeURIComponent(
          `${prop.direccion?.calle || ""} ${prop.direccion?.localidad || ""} ${prop.direccion?.provincia || ""} ${prop.direccion?.pais || ""}`
        )}`
  }
  target="_blank"
  rel="noopener noreferrer"
  title="Ver en Google Maps"
  style={{
    minWidth: "100px",
    padding: "4px 8px",
    gap: "6px",
    whiteSpace: "nowrap",
  }}
>
  <img
    src="https://res.cloudinary.com/dcggcw8df/image/upload/v1755458272/r3kx7npz5muhzio5agq8.png"
    alt="Google Maps"
    style={{ width: "20px", height: "20px" }}
  />
  <span>Ver en Maps</span>
</a>
    </div>
  </div>
)}






              <button
                className="btn btn-primary mt-auto"
                onClick={() => setPropiedadSeleccionada(prop)}
              >
                Modificar Propiedad
              </button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
</main>

      </div>

      {propiedadSeleccionada && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => {
            if (window.confirm("¿Desea cerrar el modal? Se perderán los cambios no guardados.")) {
              setPropiedadSeleccionada(null);
            }
          }}
        >
          <div
            className="modal-dialog modal-xl modal-dialog-centered"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content border-0 shadow-lg">
              {/* Header */}
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">{propiedadSeleccionada.titulo}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    if (window.confirm("¿Desea cerrar el modal? Se perderán los cambios no guardados.")) {
                      setPropiedadSeleccionada(null);
                    }
                  }}
                  aria-label="Cerrar"
                ></button>
              </div>

              {/* Body con formulario completo */}
              <div className="modal-body" style={{ maxHeight: "80vh", overflowY: "auto" }}>
                {/* Carrusel de imágenes */}
                {propiedadSeleccionada.imagenes?.length > 0 && (
                  <>
                    <div
                      id={`carouselModal-${propiedadSeleccionada.id}`}
                      className="carousel slide mb-3 shadow-lg"
                      data-bs-ride="carousel"
                      style={{ borderRadius: "12px", overflow: "hidden", position: "relative" }}
                    >
                      <div className="carousel-inner">
                        {propiedadSeleccionada.imagenes.map((img, idx) => (
                          <div key={idx} className={`carousel-item ${idx === 0 ? "active" : ""}`}>
                            <img
                              src={img}
                              alt={`${propiedadSeleccionada.titulo} ${idx + 1}`}
                              className="d-block w-100"
                              style={{ maxHeight: "320px", objectFit: "cover", cursor: "zoom-in" }}
                              onClick={() => setFullscreenIndex(idx)}
                            />
                          </div>
                        ))}
                      </div>
                      {propiedadSeleccionada.imagenes.length > 1 && (
                        <>
                          <button
                            className="carousel-control-prev"
                            type="button"
                            data-bs-target={`#carouselModal-${propiedadSeleccionada.id}`}
                            data-bs-slide="prev"
                          >
                            <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Anterior</span>
                          </button>
                          <button
                            className="carousel-control-next"
                            type="button"
                            data-bs-target={`#carouselModal-${propiedadSeleccionada.id}`}
                            data-bs-slide="next"
                          >
                            <span className="carousel-control-next-icon" aria-hidden="true"></span>
                            <span className="visually-hidden">Siguiente</span>
                          </button>
                        </>
                      )}
                    </div>

                    {/* Fullscreen */}
                    {fullscreenIndex !== null && (
                      <div
                        className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-90 d-flex justify-content-center align-items-center"
                        style={{ zIndex: 9999 }}
                      >
                        <button
                          className="btn btn-light position-absolute top-0 end-0 m-3"
                          onClick={() => setFullscreenIndex(null)}
                        >
                          ✕
                        </button>

                        {propiedadSeleccionada.imagenes.length > 1 && (
                          <button
                            className="btn btn-dark position-absolute start-0 m-3"
                            style={{ fontSize: "2rem" }}
                            onClick={() =>
                              setFullscreenIndex(
                                (fullscreenIndex - 1 + propiedadSeleccionada.imagenes.length) %
                                propiedadSeleccionada.imagenes.length
                              )
                            }
                          >
                            ‹
                          </button>
                        )}

                        <img
                          src={propiedadSeleccionada.imagenes[fullscreenIndex]}
                          alt="Vista completa"
                          style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain", borderRadius: "8px" }}
                        />

                        {propiedadSeleccionada.imagenes.length > 1 && (
                          <button
                            className="btn btn-dark position-absolute end-0 m-3"
                            style={{ fontSize: "2rem" }}
                            onClick={() =>
                              setFullscreenIndex((fullscreenIndex + 1) % propiedadSeleccionada.imagenes.length)
                            }
                          >
                            ›
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Formulario completo */}
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      const { doc, updateDoc } = await import("firebase/firestore");
                      await updateDoc(doc(db, "Propiedades", propiedadSeleccionada.id), propiedadSeleccionada);
                      alert("Propiedad actualizada correctamente!");
                      setPropiedadSeleccionada(null);
                    } catch (error) {
                      console.error("Error actualizando propiedad:", error);
                    }
                  }}
                >
                  {/* Campos básicos */}
                  <div className="mb-3">
                    <label className="form-label">Título</label>
                    <input
                      type="text"
                      className="form-control"
                      value={propiedadSeleccionada.titulo}
                      onChange={(e) => setPropiedadSeleccionada({ ...propiedadSeleccionada, titulo: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      value={propiedadSeleccionada.descripcion}
                      onChange={(e) => setPropiedadSeleccionada({ ...propiedadSeleccionada, descripcion: e.target.value })}
                    />
                  </div>

                  {/* Precio y moneda */}
                  <div className="mb-3">
                    <label className="form-label">Precio</label>
                    <input
                      type="number"
                      className="form-control"
                      value={propiedadSeleccionada.precio || 0}
                      onChange={(e) => setPropiedadSeleccionada({ ...propiedadSeleccionada, precio: Number(e.target.value) })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Moneda</label>
                    <input
                      type="text"
                      className="form-control"
                      value={propiedadSeleccionada.moneda || ""}
                      onChange={(e) => setPropiedadSeleccionada({ ...propiedadSeleccionada, moneda: e.target.value })}
                    />
                  </div>

                  {/* Características numéricas */}
                  {["habitaciones", "baños", "cochera", "m2", "superficieCubierta", "superficieTerreno"].map((campo) => (
                    <div className="mb-3" key={campo}>
                      <label className="form-label">{campo.charAt(0).toUpperCase() + campo.slice(1)}</label>
                      <input
                        type="number"
                        className="form-control"
                        value={propiedadSeleccionada[campo] || 0}
                        onChange={(e) => setPropiedadSeleccionada({ ...propiedadSeleccionada, [campo]: Number(e.target.value) })}
                      />
                    </div>
                  ))}

                  {/* Booleanos */}
                  <h4 className="mt-3">Servicios / Características</h4>
                  <div className="d-flex flex-wrap gap-3 mb-3">
                    {[
                      "alumbradoPublico",
                      "gasNatural",
                      "cloacas",
                      "agua",
                      "calleAsfaltada",
                      "bombadeagua",
                      "patio",
                      "pileta",
                      "cochera",
                      "jardin",
                      "balcon",
                      "terraza",
                      "lavadero",
                      "parrilla",
                      "alarmaSeguridad",
                      "camarasSeguridad",
                      "aireAcondicionado",
                      "calefaccionCentral",
                      "internet",
                      "tvCable",
                      "telefono",
                      "expensas",
                      "mantenimiento",
                      "gastosComunes",
                      "luz",
                      "gas",
                      "aguaPotable",
                    ].map((campo) => (
                      <div className="form-check col-6 col-md-4" key={campo}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`chk-${campo}`}
                          checked={propiedadSeleccionada[campo] || false}
                          onChange={(e) =>
                            setPropiedadSeleccionada({ ...propiedadSeleccionada, [campo]: e.target.checked })
                          }
                        />
                        <label className="form-check-label text-black" htmlFor={`chk-${campo}`}>
                          {campo
                            .replace(/([A-Z])/g, " $1") // agrega espacio antes de mayúsculas
                            .replace(/^./, (str) => str.toUpperCase())} {/* capitaliza primera letra */}
                        </label>
                      </div>
                    ))}

                  </div>

                  {/* Propiedad y tipo */}
                  <div className="mb-3">
                    <label className="form-label">Propiedad en</label>
                    <select
                      className="form-control"
                      value={propiedadSeleccionada.propiedadEn || ""}
                      onChange={(e) =>
                        setPropiedadSeleccionada({ ...propiedadSeleccionada, propiedadEn: e.target.value })
                      }
                      required
                    >
                      <option value="">Seleccione una opción</option>
                      <option value="venta">Venta</option>
                      <option value="alquiler">Alquiler</option>
                      <option value="alquilada">Alquilada</option>
                      <option value="vendida">Vendida</option>
                    </select>
                  </div>


                  <div className="mb-3">
                    <label className="form-label">
                      Tipo de propiedad:
                    </label>
                    <select
                      className="form-control"
                      value={
                        propiedadSeleccionada.tipoDePropiedad
                          ? propiedadSeleccionada.tipoDePropiedad.charAt(0).toUpperCase() +
                          propiedadSeleccionada.tipoDePropiedad.slice(1).toLowerCase()
                          : ""
                      }
                      onChange={(e) =>
                        setPropiedadSeleccionada({ ...propiedadSeleccionada, tipoDePropiedad: e.target.value })
                      }
                      required
                    >
                      <option value="">Seleccione una opción</option>
                      <option value="Casa">Casa</option>
                      <option value="Lote">Lote</option>
                      <option value="Galpón">Galpón</option>
                      <option value="Departamento">Departamento</option>
                      <option value="Dúplex">Dúplex</option>
                      <option value="Oficinas">Oficinas</option>
                      <option value="Local">Local</option>
                    </select>
                  </div>



                  {/* Dirección */}
                  <h4 className="mt-3">Dirección</h4>
                  {["calle", "codigoPostal", "localidad", "provincia", "pais"].map((campo) => (
                    <div className="mb-2 d-flex align-items-center gap-2" key={campo}>
                      <label style={{ minWidth: "120px", fontWeight: "500" }}>{campo}:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={propiedadSeleccionada.direccion?.[campo] || ""}
                        onChange={(e) =>
                          setPropiedadSeleccionada({
                            ...propiedadSeleccionada,
                            direccion: { ...propiedadSeleccionada.direccion, [campo]: e.target.value },
                          })
                        }
                      />
                    </div>
                  ))}

                  {/* Contacto */}
                  <h4 className="mt-3">Contacto</h4>
                  {["telefono1", "telefono2"].map((campo) => (
                    <div className="mb-2 d-flex align-items-center gap-2" key={campo}>
                      <label style={{ minWidth: "120px", fontWeight: "500" }}>{campo}:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={propiedadSeleccionada.contacto?.[campo] || ""}
                        onChange={(e) =>
                          setPropiedadSeleccionada({
                            ...propiedadSeleccionada,
                            contacto: { ...propiedadSeleccionada.contacto, [campo]: e.target.value },
                          })
                        }
                      />
                    </div>
                  ))}

                  {/* Ubicación geográfica */}
                  <h4 className="mt-3">Ubicación Geográfica</h4>
                  {["lat", "lng"].map((campo) => (
                    <div className="mb-2 d-flex align-items-center gap-2" key={campo}>
                      <label style={{ minWidth: "120px", fontWeight: "500" }}>{campo}:</label>
                      <input
                        type="text"
                        className="form-control"
                        value={propiedadSeleccionada.ubicacionGeo?.[campo] || ""}
                        onChange={(e) =>
                          setPropiedadSeleccionada({
                            ...propiedadSeleccionada,
                            ubicacionGeo: { ...propiedadSeleccionada.ubicacionGeo, [campo]: e.target.value },
                          })
                        }
                      />
                    </div>
                  ))}
                  {/* Fecha de última actualización */}
                  <div className="mb-3">
                    <label className="form-label">Última Actualización</label>
                    <input
                      type="text"
                      className="form-control"
                      value={
                        propiedadSeleccionada.fechaActualizacion
                          ? new Date(propiedadSeleccionada.fechaActualizacion).toLocaleDateString()
                          : new Date().toLocaleDateString()
                      }
                      readOnly
                    />
                  </div>

                  <button type="submit" className="btn btn-success mt-3" onClick={async (e) => {
                    e.preventDefault();

                    try {
                      const { doc, updateDoc } = await import("firebase/firestore");

                      // Actualizamos la fecha de última actualización
                      const fechaActualizacion = new Date().toISOString();

                      await updateDoc(doc(db, "Propiedades", propiedadSeleccionada.id), {
                        ...propiedadSeleccionada,
                        fechaActualizacion,
                      });

                      // Actualizamos el estado local para que se vea al instante
                      setPropiedadSeleccionada(prev => ({
                        ...prev,
                        fechaActualizacion,
                      }));

                      alert("Propiedad actualizada correctamente!");
                    } catch (error) {
                      console.error("Error actualizando propiedad:", error);
                    }
                  }}>
                    Guardar Cambios
                  </button>

                </form>
              </div>

              {/* Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={async () => {
                    const { doc, deleteDoc } = await import("firebase/firestore");
                    if (window.confirm("¿Seguro que quieres eliminar esta propiedad?")) {
                      await deleteDoc(doc(db, "Propiedades", propiedadSeleccionada.id));
                      setPropiedadSeleccionada(null);
                      window.location.reload();
                    }
                  }}
                >
                  Eliminar Propiedad
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    if (window.confirm("¿Desea cerrar el modal? Se perderán los cambios no guardados.")) {
                      setPropiedadSeleccionada(null);
                    }
                  }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Modal para agregar nueva propiedad */}
      {modalNuevaPropiedad && (
        <AgregarPropiedadModal
          onClose={() => setModalNuevaPropiedad(false)}
          refrescarLista={async () => {
            const querySnapshot = await getDocs(collection(db, "Propiedades"));
            setPropiedades(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          }}
        />
      )}




      <style>
        {`
          .hover-shadow:hover {
            box-shadow: 0 0.5rem 1rem rgba(0,0,0,.15);
            transition: box-shadow 0.3s ease-in-out;
          }
        `}
      </style>
    </div>
  );
}
