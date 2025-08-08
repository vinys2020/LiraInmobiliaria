import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FaPhoneAlt, FaBars, FaTimes } from "react-icons/fa";
import "./navbar.css"; // si tienes estilos propios adicionales

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navbarRef = useRef(null);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        navbarRef.current &&
        !navbarRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      id="header-section"
      className="header-desktop header-v4 bg-transparent"
      data-sticky="0"
    >
      <div className="container-fluid"> {/* <-- container-fluid para ancho completo */}
        <div className="header-inner-wrap">
          <div
            className="navbar d-flex align-items-center justify-content-between"
            ref={navbarRef}
          >
            {/* Logo */}
            <div className="logo logo-splash">
              <Link to="/">
                <img
                  src="https://lirainmobiliaria.com.ar/wp-content/uploads/2024/03/logo-lira-1.png"
                  alt="logo"
                  height="55"
                  width="220"
                />
              </Link>
            </div>

            {/* Menu Desktop */}
            <nav className="main-nav navbar-expand-lg d-none d-lg-flex flex-grow-1 justify-content-end">
              <ul id="main-nav" className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/alquileres" onClick={() => setMenuOpen(false)}>Alquileres</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/venta" onClick={() => setMenuOpen(false)}>Venta</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/lotes" onClick={() => setMenuOpen(false)}>Lotes</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/sobre-nosotros" onClick={() => setMenuOpen(false)}>Sobre Nosotros</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contacto" onClick={() => setMenuOpen(false)}>Contacto</Link>
                </li>
              </ul>
            </nav>

            {/* Contacto y avatar */}
            <nav className="logged-in-nav-wrap d-flex align-items-center gap-3">
              <a
                href="tel:+5493834523097"
                className="btn-phone-number text-decoration-none d-flex align-items-center text-white"
              >
                <FaPhoneAlt className="me-1" />
                +549-3834 52-3097
              </a>

              <div className="navbar-logged-in-wrap">
                <img
                  src="https://lirainmobiliaria.com.ar/wp-content/themes/houzez/img/profile-avatar.png"
                  alt="author"
                  className="rounded"
                  width="42"
                  height="42"
                />
              </div>
            </nav>

            {/* Botón hamburguesa para móvil */}
            <button
              className="navbar-toggler d-lg-none border border-light"
              type="button"
              onClick={toggleMenu}
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <FaTimes color="white" size={24} />
              ) : (
                <FaBars color="white" size={24} />
              )}
            </button>
          </div>

          {/* Menu móvil */}
          {menuOpen && (
            <nav className="d-lg-none mt-3">
              <ul className="navbar-nav flex-column">
                <li className="nav-item">
                  <Link className="nav-link" to="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/alquileres" onClick={() => setMenuOpen(false)}>Alquileres</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/venta" onClick={() => setMenuOpen(false)}>Venta</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/lotes" onClick={() => setMenuOpen(false)}>Lotes</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/sobre-nosotros" onClick={() => setMenuOpen(false)}>Sobre Nosotros</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/contacto" onClick={() => setMenuOpen(false)}>Contacto</Link>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
