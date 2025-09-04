import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import "./PropiedadesEnVenta.css";
import { useLocation } from "react-router-dom";
import Card from "../components/Card";




const Sidebar = ({ propiedades, subfiltro, onSetSubfiltro, searchTerm, setSearchTerm }) => {
  const subtipos = ["Casa", "Departamento", "Dúplex", "Galpón", "Local", "Oficinas", "Lote"];

  // Contar propiedades por subtipo
  const subCounts = {};
  propiedades.forEach((p) => {
    const tipo = p.tipoDePropiedad || "Otro";
    subCounts[tipo] = (subCounts[tipo] || 0) + 1;
  });

  const totalSubtipos = propiedades.length;

  // Manejo de selección múltiple
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
            className={`list-group-item list-group-item-action rounded-2 mb-2 ${Array.isArray(subfiltro) && subfiltro.includes(sub) ? "active fw-bold" : ""
              }`}
            onClick={() => toggleSubtipo(sub)}
          >
            {sub} ({subCounts[sub] || 0})
          </button>
        ))}

        <button
          className={`list-group-item list-group-item-action rounded-2 ${Array.isArray(subfiltro) && subfiltro.length === 0 ? "active fw-bold" : ""
            }`}
          onClick={() => onSetSubfiltro([])}
        >
          Todos ({totalSubtipos})
        </button>
      </div>
    </div>
  );
};


const PropiedadesEnVenta = () => {
  const location = useLocation(); // ← aquí
  const tiposIniciales = location.state?.tipos || []; // ← aquí (lo que envíe Home)

  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subfiltro, setSubfiltro] = useState(Array.isArray(tiposIniciales) ? tiposIniciales : []); // inicializa con filtro de Home si existe
  const [showFilters, setShowFilters] = useState(false);
  const [searchZone, setSearchZone] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPropiedades = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Propiedades"));
        const props = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((p) => p.propiedadEn === "venta");
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
    // Filtrado por tipos seleccionados (multiselección)
    const matchTipo =
      subfiltro.length === 0 || subfiltro.includes(p.tipoDePropiedad || "Otro");

    // Función para búsqueda en todos los campos de dirección
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
      return campos.some((campo) => campo && campo.toString().toLowerCase().includes(valor.toLowerCase()));
    };

    const matchSearchDesktop = searchTerm ? buscarEnDireccion(searchTerm) : true;
    const matchSearchMobile = searchZone ? buscarEnDireccion(searchZone) : true;

    return matchTipo && matchSearchDesktop && matchSearchMobile;
  });


  return (
    <main className="alquileres-page" style={{ backgroundColor: "#ffffff" }}>
      <section className="py-5" style={{ backgroundColor: "inherit", paddingBottom: 0 }}>
        <div className="mx-lg-5 mx-3">
          <h2 className="text-center text-danger mb-4 mx-lg-1" style={{ fontFamily: "Prata, serif" }}>
            Propiedades en Venta
          </h2>

          {/* Barra de búsqueda móvil */}
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
              <button className="btn btn-outline-danger d-flex align-items-center" onClick={() => setShowFilters(true)}>
                <span>Filtrar</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="ms-2" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 4H21M6 12H18M10 20H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="row g-4">
            <section className="col-lg-10">
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
                <div className="alert alert-warning text-center">No se encontraron propiedades disponibles.</div>
              ) : (
                <div className="row g-4">
                  {propiedadesFiltradas.map((prop) => (
                    <div key={prop.id} className="col-12 col-md-6 col-lg-4 d-flex">
                      <Card propiedad={prop} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <aside className="col-lg-2 d-none d-lg-block p-0 mt-0">
              <Sidebar propiedades={propiedades} subfiltro={subfiltro} onSetSubfiltro={setSubfiltro} />
            </aside>
          </div>
        </div>
      </section>

      {showFilters && <div className="offcanvas-backdrop fade show" onClick={() => setShowFilters(false)}></div>}
      <div className={`offcanvas offcanvas-end ${showFilters ? "show" : ""} d-lg-none`} style={{ visibility: showFilters ? "visible" : "hidden" }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Filtrar</h5>
          <button type="button" className="btn-close text-reset" onClick={() => setShowFilters(false)}></button>
        </div>
        <div className="offcanvas-body">
          <Sidebar propiedades={propiedades} subfiltro={subfiltro} onSetSubfiltro={setSubfiltro} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </div>
    </main>
  );
};

export default PropiedadesEnVenta;
