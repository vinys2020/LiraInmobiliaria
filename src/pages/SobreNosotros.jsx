import React from "react";
import "./SobreNosotros.css";
import liraFoto from "../assets/lira-foto.jpg"; // ajustá la ruta si este componente está en otra carpeta
import liraFoto1 from "../assets/llaveentrega.jpg"; // ajustá la ruta si este componente está en otra carpeta
import liraFoto2 from "../assets/asesor.jpg"; // ajustá la ruta si este componente está en otra carpeta
import liraFoto3 from "../assets/tazadora.jpg"; // ajustá la ruta si este componente está en otra carpeta
import liraFoto4 from "../assets/administracion.jpg"; // ajustá la ruta si este componente está en otra carpeta


const SobreNosotros = () => {
  return (
    <main className="sobre-nosotros bg-white">
      {/* Hero */}
      <section
        className="hero-section"
        style={{
          backgroundImage: `url(${liraFoto})`,
        }}
      >
        <div className="hero-overlay">
          <div className="hero-content text-center">
            <h1 className="titulo-prata">Lira Inmobiliaria</h1>
            <p className="mx-2">Más de 30 años de experiencia en el sector inmobiliario</p>
          </div>
        </div>
      </section>



      {/* Sección Misión, Visión y Valores */}
      <section className="container-light py-5 bg-white ">
        <div className="text-center mx-lg-5">
          <p>
            En Lira Inmobiliaria, nuestra misión es brindarte un servicio integral y personalizado en el apasionante mundo de bienes raíces. Nos enorgullece ser tu aliado de confianza en el proceso de compra o venta de propiedades, ofreciéndote un asesoramiento experto que maximice el rendimiento de tu inversión.
            <br />
            <br />

            Nuestro equipo de profesionales altamente capacitados está comprometido a acompañarte en cada paso del camino, desde la evaluación inicial hasta la firma del contrato final. Ya sea que estés buscando tu nuevo hogar, una inversión lucrativa o desees vender una propiedad, estamos aquí para hacer que tu experiencia sea fluida y exitosa.
          </p>
        </div>

      </section>

      {/* Sección Alquiler y venta */}
      <section className=" container-light alquiler-venta-section bg-white">
        <div className="container">
          <div className="row align-items-center">
            {/* Columna imagen */}
            <div className="col-md-6 mb-4 mb-md-0">
              <img
                src={liraFoto1}
                alt="Administración de propiedades"
                className="img-fluid rounded"
              />
            </div>

            {/* Columna texto */}
            <div className="col-md-6 bg-white">
              <h2 className="mb-3 titulo-prata">Alquiler y venta de propiedades</h2>
              <p>
                En Lira Inmobiliaria, nos especializamos en facilitar tanto la
                venta como el alquiler de propiedades. Ya sea que estés buscando
                tu próximo hogar, una inversión comercial o desees poner en el
                mercado tu propiedad, nuestro equipo experto está aquí para
                guiarte a través de todo el proceso.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className=" container-light administracion-section bg-white py-lg-5">
        <div className="container mt-5">
          <div className="row align-items-center">
            {/* Columna texto */}
            <div className="col-md-6 mb-4 mb-md-0">
              <h2 className="mb-3 titulo-prata">Administración</h2>
              <p>
                En Lira Inmobiliaria, comprendemos la importancia de una gestión eficaz y proactiva de propiedades. Nuestro servicio de administración está diseñado para aliviar las preocupaciones de los propietarios, asegurando un manejo profesional y cuidadoso de sus activos inmobiliarios.
              </p>
            </div>

            {/* Columna imagen */}
            <div className="col-md-6">
              <img
                src={liraFoto4}
                alt="Administración de propiedades"
                className="img-fluid rounded"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sección Tasaciones */}
      <section className="container-light tasaciones-section py-lg-5 mt-5 mt-lg-0 bg-white">
        <div className="container">
          <div className="row align-items-center">
            {/* Columna imagen */}
            <div className="col-md-6 mb-4 mb-md-0">
              <img
                src={liraFoto3}
                alt="Tasaciones"
                className="img-fluid rounded"
              />
            </div>

            {/* Columna texto */}
            <div className="col-md-6 bg-white">
              <h2 className="mb-3 titulo-prata">Tasaciones</h2>
              <p>
                Nuestro equipo de expertos en tasaciones está dedicado a proporcionarte
                valoraciones precisas y confiables de tus propiedades. Ya sea que necesites
                determinar el valor de mercado de una propiedad para su venta, alquiler o
                fines financieros, utilizamos nuestro conocimiento y experiencia para ofrecerte
                una evaluación justa y fundamentada.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className=" container-light asesoramiento-section bg-white mb-lg-5 py-5">
        <div className="container">
          <div className="row align-items-center ">
            {/* Columna texto */}
            <div className="col-md-6 mb-4 mb-md-0">
              <h2 className="mb-3 titulo-prata">Asesoramiento</h2>
              <p>
                En Lira Inmobiliaria, entendemos que cada transacción inmobiliaria es única y requiere un enfoque personalizado. Nuestro servicio de asesoramiento inmobiliario está diseñado para brindarte orientación experta y estratégica en cada etapa del proceso.
              </p>
            </div>

            {/* Columna imagen */}
            <div className="col-md-6">
              <img
                src={liraFoto2}
                alt="Asesoramiento inmobiliario"
                className="img-fluid rounded"
              />
            </div>
          </div>
        </div>
      </section>








      {/* CTA */}
      <section className="text-center py-5 bg-light">
        <h2 className="titulo-prata">¿Querés contactarnos?</h2>
        <p>Estamos listos para ayudarte a encontrar la propiedad que buscas.</p>
        <a href="tel:+5493834523097" className="btn btn-danger mt-1">
          Llamanos +549-3834 52-3097
        </a>
      </section>
    </main>
  );
};

export default SobreNosotros;
