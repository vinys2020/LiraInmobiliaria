import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Home() {
  return (
    <div className="container mt-5">
      <header className="text-center mb-4">
        <h1 className="display-4 fw-bold">Bienvenido a Mi Página</h1>
        <p className="lead text-muted">
          Proyecto con React + Vite + Firebase + Bootstrap
        </p>
      </header>

      <div className="row">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Sobre Nosotros</h5>
              <p className="card-text">
                Esta es la página de inicio de tu proyecto. Aquí podrás mostrar información, productos o cualquier contenido inicial.
              </p>
              <a href="#" className="btn btn-primary">Leer más</a>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Próximos pasos</h5>
              <ul>
                <li>Configurar Firebase</li>
                <li>Crear rutas y componentes</li>
                <li>Agregar datos dinámicos</li>
              </ul>
              <a href="#" className="btn btn-success">Comenzar</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
