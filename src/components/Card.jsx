// Card.jsx
import React, { useState } from "react";
import { FaBed, FaBath, FaRulerCombined, FaCar, FaMapMarkerAlt } from "react-icons/fa";
import "./Card.css";
import { useNavigate } from "react-router-dom"; // ✅ Importar navegación

const Card = ({ propiedad }) => {
  const navigate = useNavigate(); // ✅ Hook para navegar
  const [imgIndex, setImgIndex] = useState(0);
  const imagenes =
    propiedad.imagenes && propiedad.imagenes.length > 0
      ? propiedad.imagenes
      : ["/images/placeholder.png"];

  const handlePrev = (e) => {
    e.stopPropagation(); // ✅ Evita abrir el detalle
    setImgIndex((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation(); // ✅ Evita abrir el detalle
    setImgIndex((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  const getMonedaSimbolo = (moneda) => {
    if (moneda === "U$S" || moneda === "USD") return "U$S";
    if (moneda === "ARS") return "ARS $";
    return "";
  };

  const formatPrecio = (precio, moneda) => {
    if (precio == null || precio === "") return "Consultar precio";
    return `${getMonedaSimbolo(moneda)} ${Number(precio).toLocaleString("es-AR")}`;
  };

  return (
    <article className="col-12 col-md-12 col-lg-12">
      <div
        className="card h-100 shadow-sm border-0 rounded-3 p-0 overflow-hidden hover-shadow"
        onClick={() => navigate("/detalle-propiedad", { state: { id: propiedad.id } })} // ✅ Abre detalle
        style={{ cursor: "pointer" }}
      >
        {/* Imagen + badge */}
        <div className="position-relative">
          <img
            alt={propiedad.titulo}
            className="card-img-top"
            src={imagenes[imgIndex]}
            style={{ objectFit: "cover", height: "250px" }}
          />

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
                  zIndex: 10,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.8)}
              >
                &#8250;
              </button>
            </>
          )}

          <span
            className={`badge position-absolute top-0 end-0 m-2 px-3 py-2 ${propiedad.propiedadEn === "venta"
                ? "bg-primary"
                : propiedad.propiedadEn === "alquiler"
                  ? "bg-success"
                  : "bg-secondary"
              }`}
          >
            {propiedad.propiedadEn === "venta"
              ? "En Venta"
              : propiedad.propiedadEn === "alquiler"
                ? "En Alquiler"
                : "Disponible"}
          </span>
        </div>

        {/* Cuerpo */}
        <div className="card-body d-flex flex-column p-4">
          <h5 className="card-title text-truncate mb-2">{propiedad.titulo}</h5>
          <h6 className="fw-bold text-success mb-2">
            {formatPrecio(propiedad.precio, propiedad.moneda)}
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
          <div className="d-flex flex-wrap gap-2 text-muted small mb-2">
            {propiedad.habitaciones > 0 && (
              <span className="d-inline-flex align-items-center">
                <FaBed className="me-1" /> {propiedad.habitaciones} Hab.
              </span>
            )}
            {propiedad.baños > 0 && (
              <span className="d-inline-flex align-items-center">
                <FaBath className="me-1" /> Baño{propiedad.baños > 1 ? "s" : ""}
              </span>
            )}
            {propiedad.m2 > 0 && (
              <span className="d-inline-flex align-items-center">
                <FaRulerCombined className="me-1" /> {propiedad.m2} m²
              </span>
            )}
            {propiedad.cochera > 0 && (
              <span className="d-inline-flex align-items-center">
                <FaCar className="me-1" /> {propiedad.cochera} Coch.
              </span>
            )}
          </div>

          {/* Ubicación */}
          {propiedad.direccion && (
            <div className="mb-0 mt-auto">
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
                  {propiedad.direccion.localidad},{" "}
                  {propiedad.direccion.provincia},{" "}
                  {propiedad.direccion.pais}
                </div>
                <a
                  className="btn btn-danger btn-sm d-flex align-items-center justify-content-center"
                  href={
                    propiedad.ubicacionGeo?.lat &&
                      propiedad.ubicacionGeo?.lng
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
                  onClick={(e) => e.stopPropagation()} // ✅ Evita navegar al detalle
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

export default Card;
