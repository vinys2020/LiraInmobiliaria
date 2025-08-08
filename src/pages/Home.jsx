import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Home.css";

import fondoGif from "../assets/slider-lira.gif";

function Home() {
  const [tiposSeleccionados, setTiposSeleccionados] = useState([]);

  const tipos = [
    "Casa",
    "Departamento",
    "Dúplex",
    "Galpón",
    "Local",
    "Lote",
    "Oficinas",
  ];

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
    <div className="home-container">
      <img src={fondoGif} alt="fondo animado" className="background-video" />

      <div className="content-overlay container py-5">
        <header className="text-center mb-5 mt-5 text-white">
          <h4 className="display-4 text-white">
            Más de 30 años de experiencia en el sector inmobiliario.
          </h4>
          <p className="lead">
            Encuentra tu hogar ideal con nosotros. Propiedades en venta y alquiler
            a tu alcance.
          </p>
        </header>

        <form
  className="mb-5"
  method="get"
  autoComplete="off"
  action="https://lirainmobiliaria.com.ar/search-results/"
>
  {/* Tabs de estado con fondo rojo */}
  <ul
    className="nav nav-pills justify-content-center mb-3 bg-transparent rounded"
    role="tablist"
  >
    {["Todos", "En Alquiler", "En Venta"].map((estado, idx) => {
      const val = estado === "Todos" ? "" : estado.toLowerCase().replace(" ", "-");
      return (
        <li className="nav-item" key={estado}>
          <a
            className={`nav-link ${idx === 0 ? "active" : ""}  `}
            data-val={val}
            data-bs-toggle="pill"
            href="#"
            role="tab"
            aria-selected={idx === 0 ? "true" : "false"}
            style={{ cursor: "pointer" }}
          >
            {estado}
          </a>
        </li>
      );
    })}
    <input type="hidden" name="status[]" id="search-tabs" />
  </ul>

  {/* Contenedor filtro y botón, fondo rojo */}
  <div
    className="row g-3 align-items-center justify-content-center rounded"
    style={{ backgroundColor: "#ff" }} // bg-danger
  >
    {/* Dropdown filtro tipo */}
    <div className="col-md-7 pb-3 align-items-center justify-content-center rounded">
      <div className="dropdown">
        <button
          className="btn btn-light dropdown-toggle w-100 text-truncate text-danger border"
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
          {tipos.map((tipo) => (
            <li key={tipo} className="dropdown-item bg-white text-black">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`check-${tipo}`}
                  checked={tiposSeleccionados.includes(tipo)}
                  onChange={() => toggleTipo(tipo)}
                  name="type[]"
                  value={tipo.toLowerCase()}
                  style={{ cursor: "pointer" }}
                />
                <label
                  className="form-check-label text-white"
                  htmlFor={`check-${tipo}`}
                  style={{ cursor: "pointer" }}
                >
                  {tipo}
                </label>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Botón buscar */}
    <div className="col-md-3 d-grid mb-3">
      <button type="submit" className="btn btn-light text-danger border">
        Buscar
      </button>
    </div>
  </div>
</form>



        {/* Aquí sigue la sección de alquileres o lo que ya tengas */}
      </div>
    </div>
  );
}

export default Home;
