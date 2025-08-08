import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer bg-dark text-white py-4 w-100">
      <div className="container">
        <div className="row">

          <div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
            <h4 className="fw-bold">Trip Drugstore</h4>

            <p className="mb-0">
              📍Terminal de Ómnibus Concepción, Tucumán
              <br />
              🚍Local N°1 - <a href="https://www.instagram.com/tripconcep/" target="_blank" rel="noreferrer" className="text-decoration-underline text-info">@tripconcep</a>
              <br />
              ⏳ Horario de atención: 6:30hs a 00:00hs
            </p>

          </div>

          <div className="col-md-4 text-center mb-3 mb-md-0">
            <h5 className="fw-bold text">Enlaces</h5>
            <ul className="list-unstyled d-flex justify-content-center flex-wrap">
              <li className="mx-2">
                <a href="/productos" className="footer-link">Categorías</a>
              </li>
              <li className="mx-2">
                <a href="/ofertas" className="footer-link">Ofertas</a>
              </li>
              <li className="mx-2">
                <a href="/contacto" className="footer-link">Mis Compras</a>
              </li>
              <li className="mx-2">
                <a href="/contacto" className="footer-link">Ayuda</a>
              </li>
              <li className="mx-2">
                <a href="/ingresa" className="footer-link">Mi Cuenta</a>
              </li>
              <li className="mx-2">
                <a href="/creatucuenta" className="footer-link">Creá tu cuenta</a>
              </li>
            </ul>
          </div>

          <div className="col-md-4 text-center text-md-end">
            <h5 className="fw-bold">Contactanos</h5>
            <div className="d-flex justify-content-center justify-content-md-end gap-3">
              <a href="https://facebook.com" className="social-icon"><i className="bi bi-facebook"></i></a>
              <a href="https://instagram.com" className="social-icon"><i className="bi bi-instagram"></i></a>
              <a
                href="https://wa.me/5493812024221?text=Hola%20Trip%20concep!%20Quisiera%20hacer%20una%20consulta."
                className="social-icon"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-whatsapp"></i>
              </a>
            </div>
          </div>
        </div>

        <hr className="my-3 text-white" />

        <div className="text-center">
          <p className="mb-0">
            © 2025 Trip Drugstore - Página creada por <a href="https://www.instagram.com/publik.tuc/" className="text-info text-decoration-underline" target="_blank" rel="noreferrer"><b>Publik.</b></a>
          </p>
        </div>
      </div>
    </footer>

  );
};

export default Footer;
