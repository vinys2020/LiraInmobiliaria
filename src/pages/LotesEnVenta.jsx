import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import "./LotesEnVenta.css";
import Card from "../components/Card"; // ✅ Usamos el mismo componente que en PropiedadesEnVenta


const LotesEnVenta = () => {
  const [propiedades, setPropiedades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchZone, setSearchZone] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPropiedades = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Propiedades"));
        const props = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((p) => p.propiedadEn === "venta" && p.tipoDePropiedad === "Lote");
        setPropiedades(props);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando lotes:", error);
        setLoading(false);
      }
    };
    fetchPropiedades();
  }, []);

  const propiedadesFiltradas = propiedades.filter((p) => {
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
        (campo) => campo && campo.toString().toLowerCase().includes(valor.toLowerCase())
      );
    };

    const matchSearchDesktop = searchTerm ? buscarEnDireccion(searchTerm) : true;
    const matchSearchMobile = searchZone ? buscarEnDireccion(searchZone) : true;

    return matchSearchDesktop && matchSearchMobile;
  });


  return (
    <main className="lotes-venta-page" style={{ backgroundColor: "#ffffff" }}>

      <section className="py-5" style={{ backgroundColor: "inherit", paddingBottom: 0 }}>
        <div className="container">
          <h2 className="text-center text-dark mb-4 mx-lg-1" style={{ fontFamily: "Prata, serif" }}>
            Lotes en Venta
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
            </div>
          </div>

          <div className="row g-4">
            <section className="col-lg-12">
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
                  <p className="mt-3">Cargando lotes...</p>
                </div>
              ) : propiedadesFiltradas.length === 0 ? (
                <div className="alert alert-warning text-center">No se encontraron lotes disponibles.</div>
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
          </div>
        </div>
      </section>

    </main>
  );
};

export default LotesEnVenta;
