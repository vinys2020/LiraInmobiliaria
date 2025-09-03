import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import {
  FaBed,
  FaBath,
  FaRulerCombined,
  FaCar,
  FaWifi,
  FaSwimmingPool,
  FaBurn,
  FaLeaf,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "./AlquileresDisponibles.css";
import { useLocation } from "react-router-dom";


// Tarjeta de propiedad con carousel de imágenes
const PropertyCard = ({ propiedad }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const imagenes = propiedad.imagenes && propiedad.imagenes.length > 0 ? propiedad.imagenes : ["/images/placeholder.png"];

  const handlePrev = () => {
    setImgIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setImgIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  return (
    <article className="col-12 col-md-6 col-lg-4">
      <div className="card h-100 shadow-sm border-0 rounded-3 overflow-hidden hover-shadow">
        <div className="position-relative">
          <img
            alt={propiedad.titulo}
            className="card-img-top"
            src={imagenes[imgIndex]}
            style={{ objectFit: "cover", height: "180px" }}
          />

{/* Botones de navegación de imágenes */}
{imagenes.length > 1 && (
  <>
    <button
      className="position-absolute top-50 start-0 translate-middle-y d-flex align-items-center justify-content-center mx-2"
      onClick={handlePrev}
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        border: "none",
        color: "#fff",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        opacity: 0.8,
        cursor: "pointer",
        transition: "all 0.2s",
        zIndex: 10,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.8)}
    >
      &#8249;
    </button>

    <button
      className="position-absolute top-50 end-0 translate-middle-y d-flex align-items-center justify-content-center mx-2"
      onClick={handleNext}
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        border: "none",
        color: "#fff",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        opacity: 0.8,
        cursor: "pointer",
        transition: "all 0.2s",
        zIndex: 10,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.8)}
    >
      &#8250;
    </button>
  </>
)}




          <span className="badge position-absolute top-0 end-0 m-2 px-3 py-2 bg-success">
            En Alquiler
          </span>
        </div>

        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-truncate mb-2">{propiedad.titulo}</h5>
          <h6 className="fw-bold text-success mb-2">
  {(() => {
    // Definir símbolo manual
    let symbol = "";
    if (propiedad.moneda === "U$S" || propiedad.moneda === "USD") symbol = "U$S";
    else if (propiedad.moneda === "ARS") symbol = "ARS $";

    // Formatear precio
    return propiedad.precio != null && propiedad.precio !== ""
      ? `${symbol} ${Number(propiedad.precio).toLocaleString("es-AR")}`
      : "Consultar precio";
  })()}
</h6>

          <p className="card-text text-muted small mb-1" style={{ minHeight: "2em" }}>
            {propiedad.descripcion?.length > 120
              ? propiedad.descripcion.slice(0, 120) + "…"
              : propiedad.descripcion || "Sin descripción disponible"}
          </p>

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

              <div className="d-flex align-items-center justify-content-between mt-1" style={{ overflow: "hidden" }}>
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
                  style={{ minWidth: "110px", padding: "4px 8px", gap: "6px", whiteSpace: "nowrap" }}
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

const Sidebar = ({ propiedades, subfiltro, onSetSubfiltro, searchTerm, setSearchTerm }) => {
  const subtipos = ["Casa", "Departamento", "Dúplex", "Galpón", "Local", "Oficinas"];

  // Contar propiedades por subtipo
  const subCounts = {};
  propiedades.forEach((p) => {
    const tipo = p.tipoDePropiedad || "Otro";
    subCounts[tipo] = (subCounts[tipo] || 0) + 1;
  });

  const totalSubtipos = propiedades.length;

  // Manejo de selección de subtipo
  const toggleSubtipo = (sub) => {
    if (!Array.isArray(subfiltro)) return onSetSubfiltro([sub]);

    if (subfiltro.includes(sub)) {
      // Quitar del array
      onSetSubfiltro(subfiltro.filter((t) => t !== sub));
    } else {
      // Agregar al array
      onSetSubfiltro([...subfiltro, sub]);
    }
  };

  return (
    <div className="p-2 bg-transparent rounded shadow-sm mb-5 py-2 mt-3">
      <h5 className="text-black mb-2 text-center">Propiedades</h5>

      {/* Barra de búsqueda solo si viene de offcanvas (móvil) */}
      {setSearchTerm && (
        <input
          type="text"
          className="form-control mb-3"
          placeholder="Buscar por calle, localidad, provincia, código postal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )}

      <div className="list-group list-group-flush bg-transparent">
        {subtipos.map((sub) => (
          <button
            key={sub}
            className={`list-group-item list-group-item-action rounded-2 mb-2 ${
              Array.isArray(subfiltro) && subfiltro.includes(sub) ? "active fw-bold" : ""
            }`}
            onClick={() => toggleSubtipo(sub)}
          >
            {sub} ({subCounts[sub] || 0})
          </button>
        ))}

        <button
          className={`list-group-item list-group-item-action rounded-2 ${
            Array.isArray(subfiltro) && subfiltro.length === 0 ? "active fw-bold" : ""
          }`}
          onClick={() => onSetSubfiltro([])}
        >
          Todos ({totalSubtipos})
        </button>
      </div>
    </div>
  );
};


const AlquileresDisponibles = () => {
  const location = useLocation(); // ← aquí
  const tiposIniciales = location.state?.tipos || []; // ← aquí

  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subfiltro, setSubfiltro] = useState(Array.isArray(tiposIniciales) ? tiposIniciales : []);
  const [showFilters, setShowFilters] = useState(false);
  const [searchZone, setSearchZone] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  

  useEffect(() => {
    const fetchPropiedades = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Propiedades"));
        const props = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((p) => p.propiedadEn === "alquiler");
        setPropiedades(props);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando propiedades:", error);
        setLoading(false);
      }
    };
    fetchPropiedades();
  }, []);

  const propiedadesFiltradas = propiedades.filter((p) => {
    const tipoProp = p.tipoDePropiedad || "Otro";
  
    // ✅ Filtrado por tipos seleccionados (subfiltro)
    const matchTipo =
      !subfiltro || subfiltro.length === 0  // si no hay filtro, todo pasa
        ? true
        : subfiltro.includes(tipoProp);
  
    // Función auxiliar para buscar en todos los campos de la dirección
    const buscarEnDireccion = (valor) => {
      if (!valor) return false;
      const campos = [
        p.direccion?.calle,
        p.direccion?.codigoPostal,
        p.direccion?.localidad,
        p.direccion?.provincia,
        p.direccion?.pais,
        p.ubicacionGeo?.lat,
        p.ubicacionGeo?.lng,
      ];
      return campos.some(
        (campo) =>
          campo &&
          campo.toString().toLowerCase().includes(valor.toLowerCase())
      );
    };
  
    // Filtrado por barra de búsqueda desktop y móvil
    const matchSearchDesktop = searchTerm ? buscarEnDireccion(searchTerm) : true;
    const matchSearchMobile = searchZone ? buscarEnDireccion(searchZone) : true;
  
    return matchTipo && matchSearchDesktop && matchSearchMobile;
  });
  
  
  
  

  return (
    <main className="alquileres-page">
<section className="py-5 bg-light">
  <div className="mx-lg-5 mx-3">
  <h2
  className="text-center text-danger mb-4 mx-lg-1"
  style={{ fontFamily: 'Prata, serif' }}
>
  Alquileres Disponibles
</h2>


    {/* Barra de búsqueda + botón móvil */}
    <div className="mb-3 d-md-none">
      <div className="d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar por calle, localidad, provincia, código postal"
          value={searchZone}
          onChange={(e) => setSearchZone(e.target.value)}
          style={{ flex: 1 }}
        />
        <button
          className="btn btn-outline-danger d-flex align-items-center"
          onClick={() => setShowFilters(true)}
        >
          <span>Filtrar</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="ms-2"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 4H21M6 12H18M10 20H14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <div className="row g-4">
      {/* Lista de propiedades */}
      <section className="col-lg-10">
            {/* Barra de búsqueda desktop arriba de propiedades */}
    <div className="d-none d-md-flex gap-2 mb-4 col-12">
      <input
        type="text"
        className="form-control"
        placeholder="Buscar por calle, localidad, provincia, código postal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ flex: 1 }}
      />
    </div>
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

      {/* Sidebar desktop */}
      <aside className="col-lg-2 d-none d-lg-block p-0 mt-0">
        <Sidebar
          propiedades={propiedades}
          subfiltro={subfiltro}
          onSetSubfiltro={setSubfiltro}
          // no hace falta repetir la búsqueda aquí
        />
      </aside>
    </div>
  </div>
</section>


      {/* Offcanvas móvil */}
      {showFilters && <div className="offcanvas-backdrop fade show" onClick={() => setShowFilters(false)}></div>}
      <div className={`offcanvas offcanvas-end ${showFilters ? "show" : ""} d-lg-none`} style={{ visibility: showFilters ? "visible" : "hidden" }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Filtrar</h5>
          <button type="button" className="btn-close text-reset" onClick={() => setShowFilters(false)}></button>
        </div>
        <div className="offcanvas-body">
          <Sidebar
            propiedades={propiedades}
            subfiltro={subfiltro}
            onSetSubfiltro={setSubfiltro}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </div>
    </main>
  );
};

export default AlquileresDisponibles;
