import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-light text-dark pt-5 pb-3">
      <div className="container">
        <div className="row gy-4">
          {/* Logo y dirección */}
          <div className="col-12 col-md-4 text-center text-md-start">
            <Link to="/">
              <img
                src="https://res.cloudinary.com/dcggcw8df/image/upload/v1755019332/zqrmoousswdjxrzpzchx.png"
                alt="Logo Lira"
                style={{ maxWidth: "200px", height: "auto", marginBottom: "0.5rem" }}
              />
            </Link>


          </div>

          {/* Navegación rápida */}
          <div className="col-md-4 text-center text-md-start mb-md-0">
  <h5 className="">Navegacion</h5>
  <ul className="list-unstyled d-flex justify-content-center justify-content-md-start flex-wrap">
    {[
      { to: "/productos", label: "Inicio" },
      { to: "/ofertas", label: "Alquileres" },
      { to: "/mis-compras", label: "En Venta" },
      { to: "/ayuda", label: "Lotes" },
      { to: "/ingresa", label: "Sobre Nosotros" },
    ].map(({ to, label }) => (
      <li key={to} className="mx-1 mb-1">
        <Link to={to} className="">
          {label}
        </Link>
      </li>
    ))}
  </ul>
</div>


          {/* Redes sociales */}
{/* Redes sociales */}
<div className="col-12 col-md-4 text-center text-md-start">
  <div className="d-flex justify-content-center justify-content-md-start gap-3 fs-6">
    <a
      href="https://www.facebook.com/lirainmobiliaria"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Facebook"
      className="text-decoration-none text-dark d-flex align-items-center gap-2"
      style={{ minWidth: "90px" }}
    >
      <i className="bi bi-facebook"></i>
      <span>Facebook</span>
    </a>
    <a
      href="https://www.instagram.com/lirainmobiliaria"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Instagram"
      className="text-decoration-none text-dark d-flex align-items-center gap-2"
      style={{ minWidth: "90px" }}
    >
      <i className="bi bi-instagram"></i>
      <span>Instagram</span>
    </a>
    <a
      href="https://api.whatsapp.com/send?phone=5493814685931"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="text-decoration-none text-dark d-flex align-items-center gap-2"
      style={{ minWidth: "90px" }}
    >
      <i className="bi bi-whatsapp"></i>
      <span>WhatsApp</span>
    </a>
  </div>
</div>




        </div>

        {/* Línea divisoria */}
        <hr className="my-4" />

        {/* Copyright */}
        <div className="text-center small text-muted">
          &copy; {new Date().getFullYear()} Lira Inmobiliaria. Todos los derechos reservados. Desarrollado por Publik
        </div>
      </div>
    </footer>
  );
};

export default Footer;
