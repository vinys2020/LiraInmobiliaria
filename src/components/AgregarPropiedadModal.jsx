import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export default function AgregarPropiedadModal({ onClose, refrescarLista }) {
  const [propiedad, setPropiedad] = useState({
    titulo: "",
    descripcion: "",
    precio: "",
    moneda: "",
    habitaciones: "",
    baños: "",
    cochera: false,
    m2: "",
    superficieCubierta: "",
    superficieTerreno: "",
    bombadeagua: false,
    gasNatural: false,
    patio: false,
    pileta: false,
    alumbradoPublico: false,
    cloacas: false,
    agua: false,
    calleAsfaltada: false,
    jardin: false,
    balcon: false,
    terraza: false,
    lavadero: false,
    parrilla: false,
    alarmaSeguridad: false,
    camarasSeguridad: false,
    aireAcondicionado: false,
    calefaccionCentral: false,
    internet: false,
    tvCable: false,
    telefono: false,
    expensas: false,
    mantenimiento: false,
    gastosComunes: false,
    luz: false,
    gas: false,
    aguaPotable: false,
    propiedadEn: "",
    tipoDePropiedad: "",
    estado: "activo",
    fechaActualizacion: new Date().toLocaleDateString(),
    direccion: { calle: "", codigoPostal: "", localidad: "", provincia: "", pais: "" },
    contacto: { telefono1: "", telefono2: "" },
    ubicacionGeo: { lat: "", lng: "" },
    imagenes: [],
  });


  const [fullscreenIndex, setFullscreenIndex] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convertir campos numéricos a número antes de guardar
      const propiedadFinal = {
        ...propiedad,
        precio: Number(propiedad.precio),
        habitaciones: Number(propiedad.habitaciones),
        baños: Number(propiedad.baños),
        cochera: Number(propiedad.cochera),
        m2: Number(propiedad.m2),
        superficieCubierta: Number(propiedad.superficieCubierta),
        superficieTerreno: Number(propiedad.superficieTerreno),
      };
      await addDoc(collection(db, "Propiedades"), propiedadFinal);
      alert("Propiedad agregada correctamente!");
      onClose();
      refrescarLista();
    } catch (error) {
      console.error("Error al agregar propiedad:", error);
    }
  };

  const handleNumberChange = (campo, value) => {
    const soloNumeros = value.replace(/\D/g, ""); // eliminar todo menos números
    setPropiedad((prev) => ({ ...prev, [campo]: soloNumeros }));
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      onClick={() => { if (window.confirm("¿Desea cerrar el modal? Se perderán los cambios no guardados.")) onClose(); }}
      aria-modal="true"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="modal-dialog modal-xl modal-dialog-centered"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Nueva Propiedad</h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Cerrar"
            ></button>
          </div>

          <div className="modal-body" style={{ maxHeight: "80vh", overflowY: "auto" }}>
            {/* Carrusel de imágenes */}
            {propiedad.imagenes.length > 0 && (
              <>
                <div
                  id="carouselNuevo"
                  className="carousel slide mb-3 shadow-lg"
                  style={{ borderRadius: "12px", overflow: "hidden", position: "relative" }}
                >
                  <div className="carousel-inner">
                    {propiedad.imagenes.map((img, idx) => (
                      <div key={idx} className={`carousel-item ${idx === 0 ? "active" : ""}`}>
                        <img
                          src={img}
                          alt={`Imagen ${idx + 1}`}
                          className="d-block w-100"
                          style={{ maxHeight: "320px", objectFit: "cover", cursor: "zoom-in" }}
                          onClick={() => setFullscreenIndex(idx)}
                        />
                      </div>
                    ))}
                  </div>
                  {propiedad.imagenes.length > 1 && (
                    <>
                      <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target="#carouselNuevo"
                        data-bs-slide="prev"
                      >
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Anterior</span>
                      </button>
                      <button
                        className="carousel-control-next"
                        type="button"
                        data-bs-target="#carouselNuevo"
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

                    {propiedad.imagenes.length > 1 && (
                      <button
                        className="btn btn-dark position-absolute start-0 m-3"
                        style={{ fontSize: "2rem" }}
                        onClick={() =>
                          setFullscreenIndex(
                            (fullscreenIndex - 1 + propiedad.imagenes.length) %
                            propiedad.imagenes.length
                          )
                        }
                      >
                        ‹
                      </button>
                    )}

                    <img
                      src={propiedad.imagenes[fullscreenIndex]}
                      alt="Vista completa"
                      style={{
                        maxHeight: "100%",
                        maxWidth: "100%",
                        objectFit: "contain",
                        borderRadius: "8px",
                      }}
                    />

                    {propiedad.imagenes.length > 1 && (
                      <button
                        className="btn btn-dark position-absolute end-0 m-3"
                        style={{ fontSize: "2rem" }}
                        onClick={() =>
                          setFullscreenIndex((fullscreenIndex + 1) % propiedad.imagenes.length)
                        }
                      >
                        ›
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            <form onSubmit={handleSubmit}>
              {/* Información básica */}
              <div className="mb-3">
                <label className="form-label">Título</label>
                <input
                  type="text"
                  className="form-control"
                  value={propiedad.titulo}
                  onChange={(e) => setPropiedad({ ...propiedad, titulo: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <textarea
                  className="form-control"
                  value={propiedad.descripcion}
                  onChange={(e) => setPropiedad({ ...propiedad, descripcion: e.target.value })}
                  required
                />
              </div>

              {/* Precio y moneda */}
              <div className="mb-3">
                <label className="form-label">Precio</label>
                <input
                  type="text"
                  className="form-control"
                  value={propiedad.precio}
                  onChange={(e) => handleNumberChange("precio", e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Moneda</label>
                <input
                  type="text"
                  className="form-control"
                  value={propiedad.moneda}
                  onChange={(e) => setPropiedad({ ...propiedad, moneda: e.target.value })}
                />
              </div>

              {/* Características numéricas */}
              {["habitaciones", "baños", "cochera", "m2", "superficieCubierta", "superficieTerreno"].map(
                (campo) => (
                  <div className="mb-3" key={campo}>
                    <label className="form-label">{campo.charAt(0).toUpperCase() + campo.slice(1)}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={propiedad[campo]}
                      onChange={(e) => handleNumberChange(campo, e.target.value)}
                    />
                  </div>
                )
              )}

              {/* Servicios */}
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
                      checked={propiedad[campo] || false} // ✅ usar propiedad en vez de propiedadSeleccionada
                      onChange={(e) =>
                        setPropiedad({ ...propiedad, [campo]: e.target.checked }) // ✅ actualizar propiedad
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
                <label className="form-label">Propiedad</label>
                <select
                  className="form-control"
                  value={propiedad.propiedadEn}
                  onChange={(e) => setPropiedad({ ...propiedad, propiedadEn: e.target.value })}
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
                <label className="form-label">Tipo de propiedad</label>
                <select
                  className="form-control"
                  value={propiedad.tipoDePropiedad}
                  onChange={(e) => setPropiedad({ ...propiedad, tipoDePropiedad: e.target.value })}
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
                  <label style={{ minWidth: "120px", fontWeight: 500 }}>{campo}:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={propiedad.direccion[campo]}
                    onChange={(e) =>
                      setPropiedad({
                        ...propiedad,
                        direccion: { ...propiedad.direccion, [campo]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}

              {/* Contacto */}
              <h4 className="mt-3">Contacto</h4>
              {["telefono1", "telefono2"].map((campo) => (
                <div className="mb-2 d-flex align-items-center gap-2" key={campo}>
                  <label style={{ minWidth: "120px", fontWeight: 500 }}>{campo}:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={propiedad.contacto[campo]}
                    onChange={(e) =>
                      setPropiedad({
                        ...propiedad,
                        contacto: { ...propiedad.contacto, [campo]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}

              {/* Ubicación geográfica */}
              <h4 className="mt-3">Ubicación Geográfica</h4>
              {["lat", "lng"].map((campo) => (
                <div className="mb-2 d-flex align-items-center gap-2" key={campo}>
                  <label style={{ minWidth: "120px", fontWeight: 500 }}>{campo}:</label>
                  <input
                    type="text"
                    className="form-control"
                    value={propiedad.ubicacionGeo[campo]}
                    onChange={(e) =>
                      setPropiedad({
                        ...propiedad,
                        ubicacionGeo: { ...propiedad.ubicacionGeo, [campo]: e.target.value },
                      })
                    }
                  />
                </div>
              ))}

              {/* Subida de imágenes */}
              <div className="mb-3">
                <label className="form-label">Imágenes</label>
                <input
                  accept="image/*"
                  multiple
                  className="form-control mb-2"
                  type="file"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const files = Array.from(e.target.files);
                      for (const file of files) {
                        const formData = new FormData();
                        formData.append("file", file);
                        formData.append("upload_preset", "ml_default");
                        try {
                          const res = await fetch(
                            "https://api.cloudinary.com/v1_1/dcggcw8df/upload",
                            { method: "POST", body: formData }
                          );
                          const data = await res.json();
                          if (data.secure_url) {
                            setPropiedad((prev) => ({
                              ...prev,
                              imagenes: [...(prev.imagenes || []), data.secure_url],
                            }));
                          }
                        } catch (err) {
                          console.error("Error al subir imagen:", err);
                        }
                      }
                    }
                  }}
                />
                <div className="d-flex flex-wrap gap-3 mt-2">
                  {propiedad.imagenes.map((img, idx) => (
                    <div
                      key={idx}
                      className="border rounded p-2 text-center"
                      style={{ width: "150px" }}
                    >
                      <img
                        src={img}
                        alt={`imagen-${idx}`}
                        style={{ width: "100%", height: "80px", objectFit: "cover", borderRadius: "5px" }}
                      />
                      <input
                        type="text"
                        className="form-control form-control-sm mt-1"
                        value={img}
                        onChange={(e) => {
                          const nuevas = [...propiedad.imagenes];
                          nuevas[idx] = e.target.value;
                          setPropiedad((prev) => ({ ...prev, imagenes: nuevas }));
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger mt-1"
                        onClick={() =>
                          setPropiedad((prev) => ({
                            ...prev,
                            imagenes: prev.imagenes.filter((_, i) => i !== idx),
                          }))
                        }
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-success mt-3">
                Agregar Propiedad
              </button>
            </form>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
