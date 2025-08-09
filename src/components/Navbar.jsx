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

  // Bloquear scroll body cuando el menú esté abierto
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [menuOpen]);

  return (
    <header
      id="header-section"
      className="header-desktop header-v4 bg-transparent"
      data-sticky="0"
    >
      <div className="container-fluid">
        <div className="header-inner-wrap">
          <div
            className="navbar d-flex align-items-center justify-content-between"
            ref={navbarRef}
          >
            {/* Logo desktop */}
            <div className="logo logo-splash d-none d-lg-block">
              <Link to="/">
                <img
                  src="https://lirainmobiliaria.com.ar/wp-content/uploads/2024/03/logo-lira-1.png"
                  alt="logo"
                  height="55"
                  width="220"
                />
              </Link>
            </div>

            {/* Logo móvil */}
            <div className="logo logo-splash d-lg-none">
              <Link to="/">
                <img
                  src="https://lirainmobiliaria.com.ar/wp-content/uploads/2024/03/logo-lira-1.png"
                  alt="logo móvil"
                  height="40"
                  width="140"
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
                {/* Número de teléfono como opción del menú desktop */}
                <li className="nav-item d-flex align-items-center">
                  <a href="tel:+5493834523097" className="nav-link d-flex align-items-center">
                    <FaPhoneAlt className="me-1" /> +549-3834 52-3097
                  </a>
                </li>
              </ul>
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

          {/* Sidebar móvil */}
          <div className={`sidebar-mobile d-lg-none ${menuOpen ? "open" : ""}`} ref={navbarRef}>
            <ul className="navbar-nav flex-column p-3">
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
              {/* Número teléfono móvil */}
              <li className="nav-item mt-3">
                <a href="tel:+5493834523097" className="btn btn-danger w-100 d-flex align-items-center justify-content-center gap-2">
                  <FaPhoneAlt /> +549-3834 52-3097
                </a>
              </li>
            </ul>
          </div>

          {/* Fondo oscurecido cuando sidebar está abierto */}
          {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)}></div>}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
