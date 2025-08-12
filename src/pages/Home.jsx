import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';



import "./Home.css";

import fondoGif from "../assets/slider-lira.gif";



function Home() {
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");

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

  const tiposTexto =
    tiposSeleccionados.length === 0
      ? "Tipo"
      : tiposSeleccionados.join(", ");


  return (
    <div>
      {/* Sección con video de fondo */}

      <section className="home-container">
        <img src={fondoGif} alt="fondo animado" className="background-video" />

        <div className="content-overlay container py-5 mt-5">
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

      {/* Nueva sección con fondo blanco */}
      <section style={{ backgroundColor: "white", padding: "50px 0" }}>
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
                  src="https://res.cloudinary.com/dcggcw8df/image/upload/v1754585153/kivkflvbx39lsof59mg3.jpg"
                  className="card-img-top"
                  alt="Alquiler casa zona oeste 2"
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

          <hr className="bg-dark " />

          <h2 className="text-danger mb-2 text-center mt-3">Propiedades en Venta</h2>
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
          </div>

          <div className="text-center mt-4">
            <a href="#" className="btn btn-danger">VER MÁS PROPIEDADES EN VENTA</a>
          </div>
        </div>
      </section>


    </div>
  );
}

export default Home;
