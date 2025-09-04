import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./DetallePropiedad.css";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";



const DetallePropiedad = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [propiedad, setPropiedad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);


  const propiedadId = location.state?.id || null;

  useEffect(() => {
    if (!propiedadId) return;
    const fetchPropiedad = async () => {
      try {
        const docRef = doc(db, "Propiedades", propiedadId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPropiedad({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No existe la propiedad");
        }
      } catch (error) {
        console.error("Error al obtener propiedad:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPropiedad();
  }, [propiedadId]);

  if (loading)
    return (
      <div className="spinner-container">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );

  if (!propiedad)
    return <div className="text-center py-5">Propiedad no encontrada</div>;

  return (
    <div className="container detalle-propiedad p-5">
      {/* Título */}
      <h1 className="text-danger titulo-prata text-center mb-4">
        {propiedad.titulo}
      </h1>

      {/* Cuadrícula de imágenes mejorada */}
      {propiedad.imagenes && propiedad.imagenes.length > 0 && (
        <div className="row justify-content-center g-3 mb-5 position-relative">
          {/* Imagen principal grande */}
          <div className="col-12 col-md-8 mb-3 mb-md-0">
            <img
              src={propiedad.imagenes[0]}
              alt={`${propiedad.titulo} principal`}
              className="img-fluid rounded-3 shadow-sm propiedad-img"
              style={{ height: "450px", objectFit: "cover", width: "100%", cursor: "pointer" }}
              onClick={() => setOpen(true)}
            />
          </div>

          {/* Máximo 2 imágenes pequeñas a la derecha */}
          <div className="col-12 col-md-4">
            <div className="row g-3">
              {propiedad.imagenes.slice(1, 3).map((img, index) => (
                <div key={index} className="col-6 col-md-12 position-relative">
                  <img
                    src={img}
                    alt={`${propiedad.titulo} ${index + 2}`}
                    className="img-fluid rounded-3 shadow-sm propiedad-img"
                    style={{ height: "215px", objectFit: "cover", width: "100%", cursor: "pointer" }}
                    onClick={() => setOpen(true)}
                  />
                  {/* Overlay si hay más imágenes de las mostradas */}
                  {index === 1 && propiedad.imagenes.length > 3 && (
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                      style={{
                        borderRadius: "0.5rem", // coincide con el border-radius de la imagen
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                      onClick={() => setOpen(true)}
                    >
                      <span
                        style={{
                          backgroundColor: "rgba(0,0,0,0.7)",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.5rem",
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: "1.25rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        +{propiedad.imagenes.length - 3} <i className="fas fa-images"></i>
                      </span>
                    </div>

                  )}

                </div>
              ))}
            </div>
          </div>

          {/* Lightbox */}
          {open && (
            <Lightbox
              slides={propiedad.imagenes.map((img) => ({ src: img }))}
              open={open}
              close={() => setOpen(false)}
            />
          )}
        </div>
      )}

      {/* Pie de fotos / Overview */}
      <div className="col-12 mb-4">
        <div className="block-wrap">
          <div className="d-flex property-overview-data">
            {/* Tipo de propiedad */}
            <ul className="list-unstyled flex-fill text-center">
              <li className="property-overview-item">
                <strong>{propiedad.tipo || "Casa"}</strong>
              </li>
              <li className="hz-meta-label property-overview-type">Tipo de propiedad</li>
            </ul>

            {/* Habitaciones */}
            <ul className="list-unstyled flex-fill text-center">
              <li className="property-overview-item">
                <FaBed className="me-1 text-danger" /> <strong>{propiedad.habitaciones || 0}</strong>
              </li>
              <li className="hz-meta-label h-beds">Habitaciones</li>
            </ul>

            {/* Baños */}
            <ul className="list-unstyled flex-fill text-center">
              <li className="property-overview-item">
                <FaBath className="me-1 text-danger" /> <strong>{propiedad.baños || 0}</strong>
              </li>
              <li className="hz-meta-label h-baths">Baño(s)</li>
            </ul>

            {/* Garage / Cochera */}
            <ul className="list-unstyled flex-fill text-center">
              <li className="property-overview-item">
                <FaCar className="me-1 text-danger" /> <strong>{propiedad.cochera || 0}</strong>
              </li>
              <li className="hz-meta-label h-garage">Cochera</li>
            </ul>

            {/* Superficie */}
            <ul className="list-unstyled flex-fill text-center">
              <li className="property-overview-item">
                <FaRulerCombined className="me-1 text-danger" /> <strong>{propiedad.m2 || 0}</strong>
              </li>
              <li className="hz-meta-label h-area">m²</li>
            </ul>
          </div>
        </div>
      </div>






      {/* Descripción */}
      <div className="detalle-section bg-light rounded-3 p-4 shadow-sm mb-4 border">
        <h4 className="titulo-prata text-danger mb-3">Descripción</h4>
        <p
          className="mb-0"
          style={{ whiteSpace: "pre-line" }}
        >
          {propiedad.descripcion}
        </p>
      </div>


      {/* Características */}
      <div className="detalle-section bg-light rounded-3 p-4 shadow-sm mb-4 border">
        <h4 className="titulo-prata text-danger mb-3">Características</h4>
        <div className="d-flex flex-wrap gap-3">
          {Number(propiedad.habitaciones) > 0 && (
            <span className="badge detalle-badge">
              <FaBed className="me-2 text-danger" />
              {propiedad.habitaciones} Hab.
            </span>
          )}
          {Number(propiedad.baños) > 0 && (
            <span className="badge detalle-badge">
              <FaBath className="me-2 text-danger" />
              {propiedad.baños} Baño(s)
            </span>
          )}
          {Number(propiedad.m2) > 0 && (
            <span className="badge detalle-badge">
              <FaRulerCombined className="me-2 text-danger" />
              {propiedad.m2} m²
            </span>
          )}
          {Number(propiedad.cochera) > 0 && (
            <span className="badge detalle-badge">
              <FaCar className="me-2 text-danger" />
              {propiedad.cochera} Cochera(s)
            </span>
          )}
        </div>
      </div>

      {/* Extras */}
      {(propiedad.internet ||
        propiedad.pileta ||
        propiedad.gasNatural ||
        propiedad.patio) && (
          <div className="detalle-section bg-light rounded-3 p-4 shadow-sm mb-4 border">
            <h4 className="titulo-prata text-danger mb-3">Extras</h4>
            <div className="d-flex flex-wrap gap-3">
              {propiedad.internet && (
                <span className="badge detalle-badge">
                  <FaWifi className="me-2 text-danger" />
                  Internet
                </span>
              )}
              {propiedad.pileta && (
                <span className="badge detalle-badge">
                  <FaSwimmingPool className="me-2 text-danger" />
                  Pileta
                </span>
              )}
              {propiedad.gasNatural && (
                <span className="badge detalle-badge">
                  <FaBurn className="me-2 text-danger" />
                  Gas Natural
                </span>
              )}
              {propiedad.patio && (
                <span className="badge detalle-badge">
                  <FaLeaf className="me-2 text-danger" />
                  Patio
                </span>
              )}
            </div>
          </div>
        )}

      {/* Ubicación */}
      {propiedad.direccion && (
        <div className="detalle-section bg-light rounded-3 p-4 shadow-sm mb-4 border">
          <h4 className="titulo-prata text-danger mb-3">Ubicación</h4>
          <p className="mb-2">
            <strong>Calle:</strong> {propiedad.direccion.calle}
          </p>
          <p className="mb-2">
            <strong>Código Postal:</strong> {propiedad.direccion.codigoPostal}
          </p>
          <p className="mb-2">
            <strong>Localidad:</strong> {propiedad.direccion.localidad}
          </p>
          <p className="mb-2">
            <strong>Provincia:</strong> {propiedad.direccion.provincia}
          </p>


          {propiedad.ubicacionGeo && (
            <a
              className="btn btn-danger shadow-sm"
              href={`https://www.google.com/maps?q=${propiedad.ubicacionGeo.lat},${propiedad.ubicacionGeo.lng}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver en Google Maps
            </a>
          )}
        </div>
      )}


      {/* Botón Volver */}
      <div className="text-center mt-4">
        <button
          className="btn btn-outline-secondary px-4"
          onClick={() => navigate(-1)}
        >
          Volver
        </button>
      </div>
    </div>
  );
};

export default DetallePropiedad;
