import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {

  useEffect(() => {
    // Agregar clase al body al montar
    document.body.classList.add("admin-dashboard-body");

    // Quitar clase al desmontar
    return () => {
      document.body.classList.remove("admin-dashboard-body");
    };
  }, []);

  return (
    <div className="admin-dashboard-body container-fluid bg-light min-vh-100 p-5">
      <div className="text-center mb-5">
        <h1 className="fw-bold">
          Panel de <span className="text-primary">Administración</span>
        </h1>
        <p className="text-muted fs-5">
          Gestioná todo desde un solo lugar: propiedades, clientes, operaciones y más.
        </p>
      </div>

      <div className="row g-4">
        {/* Propiedades */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <i className="bi bi-house-door-fill fs-1 text-primary mb-3"></i>
              <h5 className="card-title">Gestión de Propiedades</h5>
              <p className="card-text">
                Agregá, editá o eliminá propiedades disponibles.
              </p>
              <Link to="/propiedades" className="btn btn-outline-primary w-100">
                Ir a Propiedades
              </Link>
            </div>
          </div>
        </div>

        {/* Clientes */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <i className="bi bi-people-fill fs-1 text-success mb-3"></i>
              <h5 className="card-title">Clientes</h5>
              <p className="card-text">
                Administrá datos de propietarios e interesados.
              </p>
              <button className="btn btn-outline-success w-100">Ver Clientes</button>
            </div>
          </div>
        </div>

        {/* Citas */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <i className="bi bi-calendar-event-fill fs-1 text-warning mb-3"></i>
              <h5 className="card-title">Citas y Visitas</h5>
              <p className="card-text">
                Programá y gestioná las visitas agendadas.
              </p>
              <button className="btn btn-outline-warning w-100">Ver Citas</button>
            </div>
          </div>
        </div>

        {/* Operaciones */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <i className="bi bi-currency-dollar fs-1 text-danger mb-3"></i>
              <h5 className="card-title">Operaciones</h5>
              <p className="card-text">
                Controlá ventas, alquileres y estados de operación.
              </p>
              <button className="btn btn-outline-danger w-100">Ver Operaciones</button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <i className="bi bi-graph-up-arrow fs-1 text-info mb-3"></i>
              <h5 className="card-title">Estadísticas</h5>
              <p className="card-text">
                Visualizá el rendimiento mensual de tu inmobiliaria.
              </p>
              <button className="btn btn-outline-info w-100">Ver Gráficos</button>
            </div>
          </div>
        </div>

        {/* Documentación */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body text-center">
              <i className="bi bi-file-earmark-text fs-1 text-secondary mb-3"></i>
              <h5 className="card-title">Documentación</h5>
              <p className="card-text">
                Subí contratos, escrituras y documentos legales.
              </p>
              <button className="btn btn-outline-secondary w-100">Ver Archivos</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
