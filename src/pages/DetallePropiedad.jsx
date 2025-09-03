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

const DetallePropiedad = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [propiedad, setPropiedad] = useState(null);
  const [loading, setLoading] = useState(true);

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

{/* Cuadrícula de imágenes */}
{propiedad.imagenes && propiedad.imagenes.length > 0 && (
  <div className="row justify-content-center g-3 mb-5">
    {/* Primera imagen grande */}
    {propiedad.imagenes.slice(0, 1).map((img, index) => (
      <div key={index} className="col-12 col-md-6">
        <img
          src={img}
          alt={`${propiedad.titulo} ${index + 1}`}
          className="img-fluid rounded-3 shadow-sm propiedad-img"
          style={{ height: "350px", objectFit: "cover", width: "100%" }}
        />
      </div>
    ))}

    {/* Cuatro imágenes pequeñas a la derecha */}
    <div className="col-12 col-md-6">
      <div className="row g-3">
        {propiedad.imagenes.slice(1, 5).map((img, index) => (
          <div key={index} className="col-6">
            <img
              src={img}
              alt={`${propiedad.titulo} ${index + 2}`}
              className="img-fluid rounded-3 shadow-sm propiedad-img"
              style={{ height: "170px", objectFit: "cover", width: "100%" }}
            />
          </div>
        ))}
      </div>
    </div>
  </div>
)}



      {/* Descripción */}
      <div className="detalle-section bg-white rounded-3 p-4 shadow-sm mb-4">
        <h4 className="titulo-prata text-danger mb-3">Descripción</h4>
        <p className="mb-0">{propiedad.descripcion}</p>
      </div>

      {/* Características */}
      <div className="detalle-section bg-white rounded-3 p-4 shadow-sm mb-4">
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
        <div className="detalle-section bg-white rounded-3 p-4 shadow-sm mb-4">
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
        <div className="detalle-section bg-white rounded-3 p-4 shadow-sm mb-4">
          <h4 className="titulo-prata text-danger mb-3">Ubicación</h4>
          <p className="mb-3">
            <FaMapMarkerAlt className="me-2 text-danger" />
            {propiedad.direccion.calle}, {propiedad.direccion.localidad},{" "}
            {propiedad.direccion.provincia}, {propiedad.direccion.pais}
          </p>
          <a
            className="btn btn-danger shadow-sm"
            href={
              propiedad.ubicacionGeo
                ? `https://www.google.com/maps?q=${propiedad.ubicacionGeo.lat},${propiedad.ubicacionGeo.lng}`
                : "#"
            }
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver en Google Maps
          </a>
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
