import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import MapaPropiedades from "../components/MapaPropiedades"; 
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase"; // Ajusta la ruta
import "./Home.css";
import fondoGif from "../assets/slider-lira.gif";



function Home() {
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [propiedades, setPropiedades] = useState([]);



  const tipos = [
    "Casa",
    "Departamento",
    "Dúplex",
    "Galpón",
    "Local",
    "Lote",
    "Oficinas",
  ];

  const estados = ["Todos", "En Alquiler", "En Venta"];

  const toggleTipo = (tipo) => {
    if (tiposSeleccionados.includes(tipo)) {
      setTiposSeleccionados(tiposSeleccionados.filter((t) => t !== tipo));
    } else {
      setTiposSeleccionados([...tiposSeleccionados, tipo]);
    }
  };

  useEffect(() => {
    const propiedadesRef = collection(db, "Propiedades");
    const unsubscribe = onSnapshot(propiedadesRef, (snapshot) => {
      const props = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPropiedades(props);
    });

    return () => unsubscribe();
  }, []);

    // Filtrado de propiedades para el mapa
    const propiedadesFiltradas = propiedades.filter((p) => {
      // Filtrar por estado seleccionado
      if (estadoSeleccionado === "alquiler") return p.propiedadEn === "alquiler";
      if (estadoSeleccionado === "en-venta") return p.propiedadEn === "venta";
      return true; // "Todos"
    });

  const tiposTexto =
    tiposSeleccionados.length === 0
      ? "Tipo"
      : tiposSeleccionados.join(", ");

  


  return (
    <div>
      {/* Sección con video de fondo */}

      <section className="home-container">
      <img
  src={fondoGif}
  alt="fondo animado"
  className="background-video"
  decoding="async"
  fetchpriority="high"
/>

        <div className="content-overlay container py-5 mt-lg-3 mt-4">
          <header className="text-center mb-4 mt-5 text-white">
            <h2 className="banner-title">
              Más de 30 años de experiencia en el sector inmobiliario.
            </h2>


          </header>

          <form
            className="mb-5 p-4"
            method="get"
            autoComplete="off"
            action="https://lirainmobiliaria.com.ar/search-results/"
          >

            {/* Tabs de estado */}
            <ul
              className="nav nav-pills justify-content-center mb-3 bg-transparent rounded"
              role="tablist"
            >
              {estados.map((estado) => {
                const estadoMap = {
                  "Todos": "",
                  "En Alquiler": "alquiler",
                  "En Venta": "en-venta"
                };
                const val = estadoMap[estado] || "";
                return (
                  <li className="nav-item" key={estado}>
                    <a
                      href="#"
                      className={`nav-link ${estadoSeleccionado === val
                          ? " text-black"
                          : "bg-danger text-white"
                        }`}
                      style={{
                        cursor: "pointer",
                        color: "black",
                        backgroundColor: "white",
                        borderTopLeftRadius: "0.5rem",
                        borderTopRightRadius: "0.5rem",
                        borderBottomLeftRadius: 0,
                        borderBottomRightRadius: 0,
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        setEstadoSeleccionado(val);
                      }}
                    >
                      {estado}
                    </a>
                  </li>
                );
              })}
              <input
                type="hidden"
                name="status[]"
                id="search-tabs"
                value={estadoSeleccionado}
              />
            </ul>

            {/* Contenedor filtro y botón */}
            <div
              className="row g-3 align-items-center justify-content-center rounded p-3"
              style={{ backgroundColor: "white" }}
            >
              {/* Dropdown filtro tipo */}
              <div className="col-md-7 pb-3 align-items-center justify-content-center rounded">
                <div className="dropdown">
                  <button
                    className="btn btn-light dropdown-toggle w-100 text-truncate text-danger border border-danger"
                    type="button"
                    id="dropdownTipos"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {tiposTexto}
                  </button>
                  <ul
                    className="dropdown-menu"
                    aria-labelledby="dropdownTipos"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    {tipos.map((tipo) => {
                      const seleccionado = tiposSeleccionados.includes(tipo);
                      return (
                        <li
                          key={tipo}
                          className={`dropdown-item ${seleccionado ? "bg-danger text-danger" : ""
                            }`}
                          style={{ cursor: "pointer" }}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleTipo(tipo);
                          }}
                        >
                          {tipo}
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {/* Inputs ocultos para enviar selección */}
                {tiposSeleccionados.map((tipo) => (
                  <input
                    key={tipo}
                    type="hidden"
                    name="type[]"
                    value={tipo.toLowerCase()}
                  />
                ))}
              </div>

              {/* Botón buscar */}
              <div className="col-md-3 d-grid mb-3">
                <button
                  type="submit"
                  className="btn btn-light text-danger border border-danger"
                >
                  Buscar
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Sección de Mapa */}


      <section className=" py-5 p-lg-5 p-3 bg-white">
  <div className="text-center mb-4">
    <h2 className="text-danger">Explorá nuestras propiedades</h2>
    <p className="text-muted mb-3">
      Descubrí todas las ubicaciones de nuestras propiedades en un mapa interactivo. 
    </p>
    <button
      className="btn btn-outline-danger btn-lg"
      onClick={() => setMostrarMapa(!mostrarMapa)}
    >
      {mostrarMapa ? "Ocultar Mapa" : "Ver todas las ubicaciones"}
    </button>
  </div>

  {mostrarMapa && (
    <div className="mapa-propiedades-container shadow-sm rounded mb-5 w-80">
      <MapaPropiedades propiedades={propiedadesFiltradas} />
    </div>
  )}
</section>




      {/* Nueva sección con fondo blanco */}
      <section style={{ backgroundColor: "white", padding: "30px 0" }}>
        <div className="container">
          <h2 className="text-danger mb-2 text-center">Alquileres Destacados</h2>
          <p className="mb-5 text-center">
            Encontrá la propiedad ideal para vos.
          </p>
          <div className="row g-4 justify-content-center">
            <article className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://res.cloudinary.com/dcggcw8df/image/upload/v1754585164/n1s5t4xipz7eaprwrduo.jpg"
                  className="card-img-top"
                  alt="Alquiler departamento zona centro 1"
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">ALQUILER DE DEPARTAMENTO EN ZONA CENTRO</h5>
                  <h6 className="text-danger mb-3">$500,000/Mensuales</h6>
                  <div className="mb-2">
                    <small><strong>Habitaciones:</strong> 2</small><br />
                    <small><strong>Baños:</strong> 1</small><br />
                    <small><strong>Superficie:</strong> 48 m²</small>
                  </div>
                  <span className="badge bg-danger mt-auto align-self-start">En Alquiler</span>
                </div>
              </div>
            </article>

            <article className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://res.cloudinary.com/dcggcw8df/image/upload/v1754585161/wdmz7u1z47urdshqiyp8.jpg"
                  className="card-img-top"
                  alt="Alquiler departamento zona centro 2"
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">ALQUILER DE DEPARTAMENTO EN ZONA CENTRO</h5>
                  <h6 className="text-danger mb-3">$450,000/Mensuales</h6>
                  <div className="mb-2">
                    <small><strong>Habitaciones:</strong> 2</small><br />
                    <small><strong>Baños:</strong> 1</small><br />
                    <small><strong>Superficie:</strong> 35 m²</small>
                  </div>
                  <span className="badge bg-danger mt-auto align-self-start">En Alquiler</span>
                </div>
              </div>
            </article>

            <article className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://res.cloudinary.com/dcggcw8df/image/upload/v1754585160/ferqdyagmjmh78fptgrs.jpg"
                  className="card-img-top"
                  alt="Alquiler casa zona oeste 1"
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">ALQUILER DE CASA EN ZONA OESTE</h5>
                  <h6 className="text-danger mb-3">$600,000</h6>
                  <div className="mb-2">
                    <small><strong>Habitaciones:</strong> 2</small><br />
                    <small><strong>Baños:</strong> 1</small><br />
                    <small><strong>Superficie:</strong> 81 m²</small>
                  </div>
                  <span className="badge bg-danger mt-auto align-self-start">En Alquiler</span>
                </div>
              </div>
            </article>
            <article className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://res.cloudinary.com/dcggcw8df/image/upload/v1754585160/ferqdyagmjmh78fptgrs.jpg"
                  className="card-img-top"
                  alt="Alquiler casa zona oeste 1"
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">ALQUILER DE CASA EN ZONA OESTE</h5>
                  <h6 className="text-danger mb-3">$600,000</h6>
                  <div className="mb-2">
                    <small><strong>Habitaciones:</strong> 2</small><br />
                    <small><strong>Baños:</strong> 1</small><br />
                    <small><strong>Superficie:</strong> 81 m²</small>
                  </div>
                  <span className="badge bg-danger mt-auto align-self-start">En Alquiler</span>
                </div>
              </div>
            </article>
            <article className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://res.cloudinary.com/dcggcw8df/image/upload/v1754585160/ferqdyagmjmh78fptgrs.jpg"
                  className="card-img-top"
                  alt="Alquiler casa zona oeste 1"
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">ALQUILER DE CASA EN ZONA OESTE</h5>
                  <h6 className="text-danger mb-3">$600,000</h6>
                  <div className="mb-2">
                    <small><strong>Habitaciones:</strong> 2</small><br />
                    <small><strong>Baños:</strong> 1</small><br />
                    <small><strong>Superficie:</strong> 81 m²</small>
                  </div>
                  <span className="badge bg-danger mt-auto align-self-start">En Alquiler</span>
                </div>
              </div>
            </article>
            <article className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://res.cloudinary.com/dcggcw8df/image/upload/v1754585160/ferqdyagmjmh78fptgrs.jpg"
                  className="card-img-top"
                  alt="Alquiler casa zona oeste 1"
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">ALQUILER DE CASA EN ZONA OESTE</h5>
                  <h6 className="text-danger mb-3">$600,000</h6>
                  <div className="mb-2">
                    <small><strong>Habitaciones:</strong> 2</small><br />
                    <small><strong>Baños:</strong> 1</small><br />
                    <small><strong>Superficie:</strong> 81 m²</small>
                  </div>
                  <span className="badge bg-danger mt-auto align-self-start">En Alquiler</span>
                </div>
              </div>
            </article>

          </div>

          <div className="text-center mt-4 mb-5">
            <a href="#" className="btn btn-danger">VER MÁS PROPIEDADES EN ALQUILER</a>
          </div>


          <div>
  <hr className="bg-dark" />

  <div className="container py-5">
  <div className="row g-5">
    {/* Primer ítem */}
    <div className="col-12 col-md-4 d-flex flex-column align-items-center text-center">
      <div className="mb-3">
        {/* Ícono casa */}
        <svg
          aria-hidden="true"
          className="e-font-icon-svg"
          viewBox="0 0 576 512"
          xmlns="http://www.w3.org/2000/svg"
          width="52"
          height="52"
          fill="currentColor"
        >
          <path d="M280.37 148.26L96 300.11V464a16 16 0 0 0 16 16l112.06-.29a16 16 0 0 0 15.92-16V368a16 16 0 0 1 16-16h64a16 16 0 0 1 16 16v95.64a16 16 0 0 0 16 16.05L464 480a16 16 0 0 0 16-16V300L295.67 148.26a12.19 12.19 0 0 0-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 0 0-12-12h-56a12 12 0 0 0-12 12v72.61L318.47 43a48 48 0 0 0-61 0L4.34 251.47a12 12 0 0 0-1.6 16.9l25.5 31A12 12 0 0 0 45.15 301l235.22-193.74a12.19 12.19 0 0 1 15.3 0L530.9 301a12 12 0 0 0 16.9-1.6l25.5-31a12 12 0 0 0-1.7-16.93z" />
        </svg>
      </div>
      <h3 className="h5 mb-1">Encontrá tu espacio</h3>
      <p className="mb-0 text-muted">
        Encontrá la propiedad ideal para vos en la provincia de Catamarca.
      </p>
    </div>

    {/* Segundo ítem */}
    <div className="col-12 col-md-4 d-flex flex-column align-items-center text-center">
      <div className="mb-3">
        {/* Ícono handshake */}
        <svg
          aria-hidden="true"
          className="e-font-icon-svg"
          viewBox="0 0 640 512"
          xmlns="http://www.w3.org/2000/svg"
          width="52"
          height="52"
          fill="currentColor"
        >
          <path d="M434.7 64h-85.9c-8 0-15.7 3-21.6 8.4l-98.3 90c-.1.1-.2.3-.3.4-16.6 15.6-16.3 40.5-2.1 56 12.7 13.9 39.4 17.6 56.1 2.7.1-.1.3-.1.4-.2l79.9-73.2c6.5-5.9 16.7-5.5 22.6 1 6 6.5 5.5 16.6-1 22.6l-26.1 23.9L504 313.8c2.9 2.4 5.5 5 7.9 7.7V128l-54.6-54.6c-5.9-6-14.1-9.4-22.6-9.4zM544 128.2v223.9c0 17.7 14.3 32 32 32h64V128.2h-96zm48 223.9c-8.8 0-16-7.2-16-16s7.2-16 16-16 16 7.2 16 16-7.2 16-16 16zM0 384h64c17.7 0 32-14.3 32-32V128.2H0V384zm48-63.9c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16c0-8.9 7.2-16 16-16zm435.9 18.6L334.6 217.5l-30 27.5c-29.7 27.1-75.2 24.5-101.7-4.4-26.9-29.4-24.8-74.9 4.4-101.7L289.1 64h-83.8c-8.5 0-16.6 3.4-22.6 9.4L128 128v223.9h18.3l90.5 81.9c27.4 22.3 67.7 18.1 90-9.3l.2-.2 17.9 15.5c15.9 13 39.4 10.5 52.3-5.4l31.4-38.6 5.4 4.4c13.7 11.1 33.9 9.1 45-4.7l9.5-11.7c11.2-13.8 9.1-33.9-4.6-45.1z" />
        </svg>
      </div>
      <h3 className="h5 mb-1">Seriedad y confianza</h3>
      <p className="mb-0 text-muted">
        En Lira Inmobiliaria nos esforzamos para brindarte el mejor asesoramiento.
      </p>
    </div>

    {/* Tercer ítem */}
    <div className="col-12 col-md-4 d-flex flex-column align-items-center text-center">
      <div className="mb-3">
        {/* Ícono check-circle */}
        <svg
          aria-hidden="true"
          className="e-font-icon-svg"
          viewBox="0 0 512 512"
          xmlns="http://www.w3.org/2000/svg"
          width="52"
          height="52"
          fill="currentColor"
        >
          <path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z" />
        </svg>
      </div>
      <h3 className="h5 mb-1">Somos expertos</h3>
      <p className="mb-0 text-muted">
        Contamos con más de 30 años de experiencia en el sector inmobiliario.
      </p>
    </div>
  </div>
</div>


  <hr className="bg-dark" />
</div>




          <h2 className="text-danger mb-2 text-center mt-5">Propiedades en Venta</h2>
          <p className="mb-5 fs-6 text-center">
            En Lira Inmobiliaria te asesoramos para que puedas tener el mejor rendimiento de tu venta o compra de un inmueble.
          </p>
          <div className="row g-4 justify-content-center">
            <article className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://res.cloudinary.com/dcggcw8df/image/upload/v1754703963/kr44nq2hxklfh2cpyuga.jpg"
                  className="card-img-top"
                  alt="Venta departamento zona centro"
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">VENTA DE DEPARTAMENTO EN ZONA CENTRO</h5>
                  <h6 className="text-danger mb-3">U$S 60.000</h6>
                  <div className="mb-2">
                    <small><strong>Habitaciones:</strong> 2</small><br />
                    <small><strong>Baños:</strong> 1</small><br />
                    <small><strong>Superficie:</strong> 48 m²</small>
                  </div>
                  <span className="badge bg-danger mt-auto align-self-start">En Venta</span>
                </div>
              </div>
            </article>

            <article className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://res.cloudinary.com/dcggcw8df/image/upload/v1754704006/lbif6bjnh7jf60cjits4.jpg"
                  className="card-img-top"
                  alt="Venta casa zona oeste"
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">VENTA DE CASA EN ZONA OESTE</h5>
                  <h6 className="text-danger mb-3">U$S 130.000</h6>
                  <div className="mb-2">
                    <small><strong>Habitaciones:</strong> 3</small><br />
                    <small><strong>Baños:</strong> 1</small><br />
                    <small><strong>Superficie:</strong> 79 m²</small>
                  </div>
                  <span className="badge bg-danger mt-auto align-self-start">En Venta</span>
                </div>
              </div>
            </article>

            <article className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://res.cloudinary.com/dcggcw8df/image/upload/v1754585161/wdmz7u1z47urdshqiyp8.jpg"
                  className="card-img-top"
                  alt="Venta terreno fray mamerto esquiú"
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">VENTA DE TERRENO EN FRAY MAMERTO ESQUIÚ</h5>
                  <h6 className="text-danger mb-3">U$S 26.500</h6>
                  <div className="mb-2">
                    <small><strong>Superficie:</strong> 697 m²</small>
                  </div>
                  <span className="badge bg-danger mt-auto align-self-start">En Venta</span>
                </div>
              </div>
            </article>
            <article className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://res.cloudinary.com/dcggcw8df/image/upload/v1754704006/lbif6bjnh7jf60cjits4.jpg"
                  className="card-img-top"
                  alt="Venta casa zona oeste"
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">VENTA DE CASA EN ZONA OESTE</h5>
                  <h6 className="text-danger mb-3">U$S 130.000</h6>
                  <div className="mb-2">
                    <small><strong>Habitaciones:</strong> 3</small><br />
                    <small><strong>Baños:</strong> 1</small><br />
                    <small><strong>Superficie:</strong> 79 m²</small>
                  </div>
                  <span className="badge bg-danger mt-auto align-self-start">En Venta</span>
                </div>
              </div>
            </article>
            <article className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://res.cloudinary.com/dcggcw8df/image/upload/v1754704006/lbif6bjnh7jf60cjits4.jpg"
                  className="card-img-top"
                  alt="Venta casa zona oeste"
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">VENTA DE CASA EN ZONA OESTE</h5>
                  <h6 className="text-danger mb-3">U$S 130.000</h6>
                  <div className="mb-2">
                    <small><strong>Habitaciones:</strong> 3</small><br />
                    <small><strong>Baños:</strong> 1</small><br />
                    <small><strong>Superficie:</strong> 79 m²</small>
                  </div>
                  <span className="badge bg-danger mt-auto align-self-start">En Venta</span>
                </div>
              </div>
            </article>
            <article className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://res.cloudinary.com/dcggcw8df/image/upload/v1754704006/lbif6bjnh7jf60cjits4.jpg"
                  className="card-img-top"
                  alt="Venta casa zona oeste"
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">VENTA DE CASA EN ZONA OESTE</h5>
                  <h6 className="text-danger mb-3">U$S 130.000</h6>
                  <div className="mb-2">
                    <small><strong>Habitaciones:</strong> 3</small><br />
                    <small><strong>Baños:</strong> 1</small><br />
                    <small><strong>Superficie:</strong> 79 m²</small>
                  </div>
                  <span className="badge bg-danger mt-auto align-self-start">En Venta</span>
                </div>
              </div>
            </article>
          </div>

          <div className="text-center mt-4">
            <a href="#" className="btn btn-danger mb-5">VER MÁS PROPIEDADES EN VENTA</a>
          </div>
        </div>
      </section>


    </div>
  );
}

export default Home;
