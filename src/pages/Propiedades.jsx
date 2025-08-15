import React, { useState, useEffect } from "react";
import "./Propiedades.css";


const imagenesGenerales = [
  "https://res.cloudinary.com/dcggcw8df/image/upload/v1754585164/n1s5t4xipz7eaprwrduo.jpg",
  "https://res.cloudinary.com/dcggcw8df/image/upload/v1754585161/wdmz7u1z47urdshqiyp8.jpg",
  "https://res.cloudinary.com/dcggcw8df/image/upload/v1754585160/ferqdyagmjmh78fptgrs.jpg",
  "https://res.cloudinary.com/dcggcw8df/image/upload/v1754585156/i3ldqu8tdenlu6agdkxy.jpg",
  "https://res.cloudinary.com/dcggcw8df/image/upload/v1754585153/kivkflvbx39lsof59mg3.jpg",
];

const imagenesTerrenos = [
  "https://res.cloudinary.com/dcggcw8df/image/upload/v1754585801/portslllllllllllll-584x438_oamfws.png",
  "https://res.cloudinary.com/dcggcw8df/image/upload/v1754585749/IMG_6924-584x438_crryqw.jpg",
  "https://res.cloudinary.com/dcggcw8df/image/upload/v1754585747/c3849e34-c92e-485c-86bf-e0d487724091-584x438_gff4ui.jpg",
  "https://res.cloudinary.com/dcggcw8df/image/upload/v1754585745/terreo-elbolson-584x438_labmff.png",
];

const propiedadesMock = [
  {
    id: 1,
    tipo: "venta",
    titulo: "Departamento moderno en el centro",
    descripcion: "2 dormitorios, 1 baño, balcón con vista.",
  },
  {
    id: 2,
    tipo: "alquiler",
    titulo: "Casa familiar en barrio tranquilo",
    descripcion: "3 dormitorios, jardín, cochera.",
  },
  {
    id: 3,
    tipo: "para alquilar",
    titulo: "Local comercial en avenida principal",
    descripcion: "100 m2, vidriera amplia.",
  },
  {
    id: 4,
    tipo: "terrenos",
    titulo: "Terreno amplio en zona rural",
    descripcion: "5000 m2, acceso pavimentado.",
  },
  {
    id: 5,
    tipo: "terrenos",
    titulo: "Terreno con buena ubicación",
    descripcion: "3000 m2, cercano a ruta principal.",
  },
  {
    id: 6,
    tipo: "venta",
    titulo: "Departamento con terraza",
    descripcion: "3 dormitorios, 2 baños, terraza propia.",
  },
  {
    id: 7,
    tipo: "alquiler",
    titulo: "Casa con jardín y pileta",
    descripcion: "4 dormitorios, gran jardín, pileta climatizada.",
  },
  {
    id: 8,
    tipo: "venta",
    titulo: "Departamento moderno en el centro",
    descripcion: "2 dormitorios, 1 baño, balcón con vista.",
  },
  {
    id: 9,
    tipo: "venta",
    titulo: "Departamento moderno en el centro",
    descripcion: "2 dormitorios, 1 baño, balcón con vista.",
  },
  {
    id: 10,
    tipo: "alquiler",
    titulo: "Casa familiar en barrio tranquilo",
    descripcion: "3 dormitorios, jardín, cochera.",
  },
  {
    id: 11,
    tipo: "alquiler",
    titulo: "Casa familiar en barrio tranquilo",
    descripcion: "3 dormitorios, jardín, cochera.",
  },
  {
    id: 12,
    tipo: "para alquilar",
    titulo: "Local comercial en avenida principal",
    descripcion: "100 m2, vidriera amplia.",
  },
  {
    id: 13,
    tipo: "para alquilar",
    titulo: "Local comercial en avenida principal",
    descripcion: "100 m2, vidriera amplia.",
  },
  {
    id: 14,
    tipo: "para alquilar",
    titulo: "Local comercial en avenida principal",
    descripcion: "100 m2, vidriera amplia.",
  },
  {
    id: 15,
    tipo: "terrenos",
    titulo: "Terreno amplio en zona rural",
    descripcion: "5000 m2, acceso pavimentado.",
  },
  {
    id: 16,
    tipo: "terrenos",
    titulo: "Terreno amplio en zona rural",
    descripcion: "5000 m2, acceso pavimentado.",
  },
  {
    id: 17,
    tipo: "terrenos",
    titulo: "Terreno amplio en zona rural",
    descripcion: "5000 m2, acceso pavimentado.",
  },
];

export default function Propiedades() {
  const [filtro, setFiltro] = useState("todos");
  const [propiedadSeleccionada, setPropiedadSeleccionada] = useState(null);

  useEffect(() => {
    document.body.classList.add("propiedades-body");
    return () => {
      document.body.classList.remove("propiedades-body");
    };
  }, []);

  // Filtrar propiedades según filtro seleccionado
  const propiedadesFiltradas =
    filtro === "todos"
      ? propiedadesMock
      : propiedadesMock.filter((p) => p.tipo === filtro);

      

  return (
    <div className="container-fluid min-vh-100 p-4 bg-light ">
      <div className="row ">
        {/* Sidebar */}
        <aside className="col-12 col-md-4 col-lg-3 mb-4">
          <div className="list-group sticky-top" style={{ top: "1rem" }}>
            {[
              { key: "todos", label: "Todos" },
              { key: "venta", label: "En Venta" },
              { key: "alquiler", label: "En Alquiler" },
              { key: "para alquilar", label: "Para Alquilar" },
              { key: "terrenos", label: "Terrenos" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFiltro(key)}
                className={`list-group-item list-group-item-action ${
                  filtro === key ? "active" : ""
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* Contenido principal */}
        <main className="col-12 col-md-8 col-lg-9">
          <h2 className="mb-4">
            Propiedades{" "}
            {filtro !== "todos" &&
              `- ${filtro.charAt(0).toUpperCase() + filtro.slice(1)}`}
          </h2>

          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {propiedadesFiltradas.map((prop, idx) => {
              // Si es terreno, usamos las imagenes de terrenos rotando
              const imagen =
                prop.tipo === "terrenos"
                  ? imagenesTerrenos[idx % imagenesTerrenos.length]
                  : imagenesGenerales[idx % imagenesGenerales.length];
              const cardId = `${prop.tipo}-${prop.id}`;

              return (
                <div key={cardId} className="col" id={cardId}>
                  <div className="card h-100 shadow-sm border rounded hover-shadow">
                    <img
                      src={imagen}
                      alt={prop.titulo}
                      className="card-img-top"
                      style={{ objectFit: "cover", height: "180px" }}
                    />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title">{prop.titulo}</h5>
                      <p className="card-text flex-grow-1">{prop.descripcion}</p>
                      <button
                        className="btn btn-primary mt-auto"
                        onClick={() => setPropiedadSeleccionada(prop)}
                      >
                        Ver más detalles
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Modal */}
      {propiedadSeleccionada && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          role="dialog"
          onClick={() => setPropiedadSeleccionada(null)}
          aria-modal="true"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{propiedadSeleccionada.titulo}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setPropiedadSeleccionada(null)}
                  aria-label="Cerrar"
                ></button>
              </div>
              <div className="modal-body">
                <img
                  src={
                    propiedadSeleccionada.tipo === "terrenos"
                      ? imagenesTerrenos[
                          propiedadesMock.findIndex(
                            (p) => p.id === propiedadSeleccionada.id
                          ) % imagenesTerrenos.length
                        ]
                      : imagenesGenerales[
                          propiedadesMock.findIndex(
                            (p) => p.id === propiedadSeleccionada.id
                          ) % imagenesGenerales.length
                        ]
                  }
                  alt={propiedadSeleccionada.titulo}
                  className="img-fluid mb-3 rounded"
                />
                <p>{propiedadSeleccionada.descripcion}</p>
                <p>
                  <strong>Tipo:</strong>{" "}
                  {propiedadSeleccionada.tipo.charAt(0).toUpperCase() +
                    propiedadSeleccionada.tipo.slice(1)}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setPropiedadSeleccionada(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
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
