import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaPhoneAlt, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

import "./navbar.css";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navbarRef = useRef(null);
  const [isTop, setIsTop] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const { user, rol, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY === 0) {
        setIsTop(true);
        setIsVisible(true);
      } else if (currentScrollY > 10) {
        setIsTop(false);
        setIsVisible(false);
      } else {
        setIsTop(false);
        setIsVisible(true);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      id="header-section"
      className={`header-desktop header-v4 bg-transparent ${isTop ? "" : "scrolled"}`}
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1000,
        backgroundColor: isTop ? "transparent" : "#000",
        transition: "background-color 0.3s ease, opacity 0.3s ease",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <div className="container-fluid">
        <div className="header-inner-wrap">
          <div className="navbar d-flex align-items-center justify-content-between" ref={navbarRef}>
            {/* Logo desktop */}
            <div className="logo logo-splash d-none d-lg-block">
              <NavLink to="/">
                <img
                  src="https://lirainmobiliaria.com.ar/wp-content/uploads/2024/03/logo-lira-1.png"
                  alt="logo"
                  height="55"
                  width="220"
                />
              </NavLink>
            </div>

            {/* Logo móvil */}
            <div className="logo logo-splash d-lg-none">
              <NavLink to="/">
                <img
                  src="https://lirainmobiliaria.com.ar/wp-content/uploads/2024/03/logo-lira-1.png"
                  alt="logo móvil"
                  height="40"
                  width="140"
                />
              </NavLink>
            </div>

            {/* Menu Desktop */}
            <nav className="main-nav navbar-expand-lg d-none d-lg-flex flex-grow-1 justify-content-end">
              <ul id="main-nav" className="navbar-nav">
              <li className="nav-item">
                  <NavLink
                    to="/"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Inicio
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/alquileres"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Alquileres
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/PropiedadesEnVenta"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Venta
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/LotesEnVenta"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Lotes
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/SobreNosotros"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Sobre Nosotros
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/contacto"
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Contacto
                  </NavLink>
                </li>

                {/* Indicador de usuario logeado */}
                {user ? (
                  <>
                    <li className="nav-item">
                      <button className="nav-link btn" onClick={handleLogout}>
                        Cerrar sesión
                      </button>
                    </li>
                    <li className="nav-item align-items-center">
                      <NavLink
                        className={({ isActive }) =>
                          `nav-link d-flex align-items-center ${isActive ? "active" : ""}`
                        }
                        to={rol === "admin" ? "/admin" : "/empleado"}
                        onClick={() => setMenuOpen(false)}
                      >
                        <img
                          src={
                            user.photoURL ||
                            "https://cdn-icons-png.flaticon.com/512/847/847969.png"
                          }
                          alt="Avatar"
                          className="avatar-img me-2 mb-0 align-items-top"
                          style={{ width: "28px", height: "25px", borderRadius: "50%" }}
                        />
                        {user.displayName || user.email}
                      </NavLink>
                    </li>
                  </>
                ) : (
                  <li className="nav-item">
                    <NavLink
                      className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                    >
                      Iniciar sesión
                    </NavLink>
                  </li>
                )}

                {/* Número de teléfono */}
                <li className="nav-item d-flex align-items-center">
  <a href="tel:+5493834523097" className="nav-link d-flex align-items-center fw-bold">
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
              {menuOpen ? <FaTimes color="white" size={24} /> : <FaBars color="white" size={24} />}
            </button>
          </div>

          {/* Sidebar móvil */}
          <div className={`sidebar-mobile d-lg-none ${menuOpen ? "open" : ""}`} ref={navbarRef}>
            <ul className="navbar-nav flex-column p-3">
              <li className="nav-item">
                <NavLink
                  to="/alquileres"
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Alquileres
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/venta"
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Venta
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/lotes"
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Lotes
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/sobre-nosotros"
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Sobre Nosotros
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/contacto"
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Contacto
                </NavLink>
              </li>

              {user ? (
                <>
                  <li className="nav-item">
                    <button className="nav-link btn" onClick={handleLogout}>
                      Cerrar sesión
                    </button>
                  </li>
                  <li className="nav-item align-items-center">
                    <NavLink
                      to="/perfil"
                      className={({ isActive }) =>
                        `nav-link d-flex align-items-center ${isActive ? "active" : ""}`
                      }
                      onClick={() => setMenuOpen(false)}
                    >
                      <img
                        src={user.photoURL || "https://via.placeholder.com/40"}
                        alt="Avatar"
                        className="avatar-img me-2 mb-0 align-items-top"
                        style={{ width: "28px", height: "28px", borderRadius: "50%" }}
                      />
                      {user.displayName || user.email}
                    </NavLink>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <NavLink
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                  >
                    Iniciar sesión
                  </NavLink>
                </li>
              )}

              <li className="nav-item mt-3">
                <a
                  href="tel:+5493834523097"
                  className="btn w-100 d-flex align-items-center justify-content-center border-0 gap-2" style={{ backgroundColor: "#b02a37", color: "#fff" }}
                  aria-label="Llamar al +54 9 3834 52 3097"
                >
                  <FaPhoneAlt aria-hidden="true" />
                  <span>+54 9 3834 52 3097</span>
                </a>
              </li>
            </ul>

            {/* Logo al final */}
            <div className="sidebar-logo text-center py-4">
              <NavLink to="/" onClick={() => setMenuOpen(false)}>
                <img
                  src="https://res.cloudinary.com/dcggcw8df/image/upload/v1755019332/zqrmoousswdjxrzpzchx.png"
                  alt="Logo Lira"
                  style={{
                    height: "40px",
                    width: "auto",
                    maxWidth: "140px",
                    marginTop: "40px",
                    marginBottom: "10px",
                    display: "inline-block",
                  }}
                />
              </NavLink>
              <p
                style={{
                  padding: "0 20px",
                  margin: "0 0 12px 0",
                  color: "grey",
                  fontSize: "0.85rem",
                  lineHeight: "1.2",
                  whiteSpace: "pre-line",
                }}
              >                San Martín 579, San Fernando del Valle de Catamarca, Argentina
              </p>
            </div>
          </div>

          {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)}></div>}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
