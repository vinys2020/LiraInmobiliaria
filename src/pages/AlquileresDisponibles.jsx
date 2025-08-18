import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import { FaBed, FaBath, FaRulerCombined, FaCar, FaWifi, FaSwimmingPool, FaBurn, FaLeaf, FaMapMarkerAlt } from "react-icons/fa";
import "./AlquileresDisponibles.css";

// Tarjeta de propiedad
const PropertyCard = ({ propiedad }) => {
    return (
      <article className="col-12 col-md-6 col-lg-4">
        <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden hover-shadow">
          {/* Imagen + Badge */}
          <div className="position-relative">
            <img
              alt={propiedad.titulo}
              className="card-img-top"
              src={propiedad.imagenes?.[0] || "/images/placeholder.png"}
              style={{ objectFit: "cover", height: "180px" }}
            />
            <span className="badge position-absolute top-0 end-0 m-2 px-3 py-2 bg-success">
              En Alquiler
            </span>
          </div>
  
          <div className="card-body d-flex flex-column">
            <h5 className="card-title text-truncate mb-2">{propiedad.titulo}</h5>
            <h6 className="fw-bold text-success mb-2">
              {propiedad.precio
                ? `ARS $${propiedad.precio.toLocaleString("es-AR")}`
                : "Consultar precio"}
            </h6>
  
            <p
              className="card-text text-muted small mb-1"
              style={{ minHeight: "2em" }}
            >
              {propiedad.descripcion?.length > 120
                ? propiedad.descripcion.slice(0, 120) + "…"
                : propiedad.descripcion || "Sin descripción disponible"}
            </p>
  
            {/* Métricas */}
            <div className="d-flex flex-wrap gap-2 text-muted small mb-1">
              {propiedad.habitaciones && (
                <span className="d-inline-flex align-items-center">
                  <FaBed className="me-1" /> {propiedad.habitaciones} Hab.
                </span>
              )}
              {propiedad.baños && (
                <span className="d-inline-flex align-items-center">
                  <FaBath className="me-1" /> {propiedad.baños} Baño
                  {propiedad.baños > 1 ? "s" : ""}
                </span>
              )}
              {propiedad.m2 && (
                <span className="d-inline-flex align-items-center">
                  <FaRulerCombined className="me-1" /> {propiedad.m2} m²
                </span>
              )}
              {propiedad.cochera && (
                <span className="d-inline-flex align-items-center">
                  <FaCar className="me-1" /> {propiedad.cochera} Coch.
                </span>
              )}
            </div>
  
            {/* Extras */}
            <div className="d-flex flex-wrap gap-2 mb-3">
              {propiedad.internet && (
                <span className="badge rounded-pill bg-light text-dark border">
                  <FaWifi className="me-1" /> Internet
                </span>
              )}
              {propiedad.pileta && (
                <span className="badge rounded-pill bg-light text-dark border">
                  <FaSwimmingPool className="me-1" /> Pileta
                </span>
              )}
              {propiedad.gasNatural && (
                <span className="badge rounded-pill bg-light text-dark border">
                  <FaBurn className="me-1" /> Gas natural
                </span>
              )}
              {propiedad.patio && (
                <span className="badge rounded-pill bg-light text-dark border">
                  <FaLeaf className="me-1" /> Patio
                </span>
              )}
            </div>
  
            {/* Dirección y Google Maps */}
            {propiedad.direccion && (
              <div className="mb-3 mt-auto">
                <div
                  className="text-muted small d-flex align-items-start"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minHeight: "3em",
                  }}
                >
                  <FaMapMarkerAlt className="me-1 mt-1" />
                  {propiedad.direccion.calle}
                </div>
  
                <div
                  className="d-flex align-items-center justify-content-between mt-1"
                  style={{ overflow: "hidden" }}
                >
                  <div
                    className="text-muted small text-truncate"
                    title={`${propiedad.direccion.localidad}, ${propiedad.direccion.provincia}, ${propiedad.direccion.pais}`}
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginRight: "8px",
                    }}
                  >
                    {propiedad.direccion.localidad}, {propiedad.direccion.provincia}, {propiedad.direccion.pais}
                  </div>
  
                  <a
                    className="btn btn-danger btn-sm d-flex align-items-center justify-content-center"
                    href={
                      propiedad.ubicacionGeo?.lat && propiedad.ubicacionGeo?.lng
                        ? `https://www.google.com/maps?q=${propiedad.ubicacionGeo.lat},${propiedad.ubicacionGeo.lng}`
                        : `https://www.google.com/maps?q=${encodeURIComponent(
                            `${propiedad.direccion.calle} ${propiedad.direccion.localidad} ${propiedad.direccion.provincia} ${propiedad.direccion.pais}`
                          )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Ver en Google Maps"
                    style={{
                      minWidth: "110px",
                      padding: "4px 8px",
                      gap: "6px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <img
                      alt="Google Maps"
                      src="https://res.cloudinary.com/dcggcw8df/image/upload/v1755458272/r3kx7npz5muhzio5agq8.png"
                      style={{ width: "20px", height: "20px" }}
                    />
                    <span>Ver en Maps</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    );
  };
  

// Sidebar con subfiltros
const Sidebar = ({ propiedades, subfiltro, onSetSubfiltro }) => {
    const subtipos = ["Casa", "Departamento", "Dúplex", "Galpón", "Local", "Oficinas"];

    // Contar propiedades por subtipo
    const subCounts = {};
    propiedades.forEach((p) => {
        const tipo = p.tipoDePropiedad || "Otro";
        subCounts[tipo] = (subCounts[tipo] || 0) + 1;
    });

    const totalSubtipos = propiedades.length;

    return (
        <div className="p-3 bg-white rounded shadow-sm mb-5 py-2 mt-3">
            <h5 className=" text-black mb-2">Tipos de Propiedades</h5>
            <div className="list-group list-group-flush">
                {subtipos.map((sub) => (
                    <button
                        key={sub}
                        className={`list-group-item list-group-item-action rounded-2 mb-2 ${subfiltro === sub ? "active fw-bold" : ""
                            }`}
                        onClick={() => onSetSubfiltro(sub)}
                    >
                        {sub} ({subCounts[sub] || 0})
                    </button>
                ))}
                <button
                    className={`list-group-item list-group-item-action rounded-2 ${subfiltro === null ? "active fw-bold" : ""
                        }`}
                    onClick={() => onSetSubfiltro(null)}
                >
                    Todos ({totalSubtipos})
                </button>
            </div>
        </div>
    );
};

const AlquileresDisponibles = () => {
    const [propiedades, setPropiedades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [subfiltro, setSubfiltro] = useState(null); // null significa "Todos"

    useEffect(() => {
        const fetchPropiedades = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "Propiedades"));
                const props = querySnapshot.docs
                    .map((doc) => ({ id: doc.id, ...doc.data() }))
                    .filter((p) => p.propiedadEn === "alquiler"); // solo alquileres

                setPropiedades(props);
                setLoading(false);
            } catch (error) {
                console.error("Error cargando propiedades:", error);
                setLoading(false);
            }
        };
        fetchPropiedades();
    }, []);

    const propiedadesFiltradas = subfiltro
        ? propiedades.filter((p) => (p.tipoDePropiedad || "Otro") === subfiltro)
        : propiedades;

    return (
        <main className="alquileres-page">
            <section className="py-5 bg-light">
                <div className="container">
                    <h2 className="text-start text-danger fw-bold mb-4">
                        Alquileres Disponibles
                    </h2>
                    <div className="row g-4">
                        <section className="col-lg-8">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-danger" role="status"></div>
                                    <p className="mt-3">Cargando propiedades...</p>
                                </div>
                            ) : propiedadesFiltradas.length === 0 ? (
                                <div className="alert alert-warning text-center">
                                    No se encontraron propiedades disponibles.
                                </div>
                            ) : (
                                <div className="row">
                                    {propiedadesFiltradas.map((prop) => (
                                        <PropertyCard key={prop.id} propiedad={prop} />
                                    ))}
                                </div>
                            )}
                        </section>

                        <aside className="col-lg-4 p-0 mt-0">
                            <Sidebar
                                propiedades={propiedades}
                                subfiltro={subfiltro}
                                onSetSubfiltro={setSubfiltro}
                            />
                        </aside>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default AlquileresDisponibles;
