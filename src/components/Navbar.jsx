import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPhoneAlt, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext"; // <-- importamos tu AuthContext
import "./navbar.css"; // si tienes estilos propios adicionales

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navbarRef = useRef(null);
  const [isTop, setIsTop] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  const { user, rol, logout } = useAuth(); // 🔹 obtenemos usuario, rol y logout
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
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY === 0) {
        setIsTop(true);
        setIsVisible(true);
      } else if (currentScrollY > 100) {
        setIsTop(false);
        setIsVisible(false);
      } else {
        setIsTop(false);
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;
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

                {/* Indicador de usuario logeado */}
                {user ? (
                  <>
                    <li className="nav-item">
                      <button className="nav-link btn" onClick={handleLogout}>Cerrar sesión</button>
                    </li>
                    <li className="nav-item align-items-center">
                    <Link
  className="nav-link d-flex align-items-center"
  to={rol === "admin" ? "/admin" : "/empleado"}
  onClick={() => setMenuOpen(false)}
>
  <img
    src={
      user.photoURL ||
      "https://cdn-icons-png.flaticon.com/512/847/847969.png" // logo usuario
    }
    alt="Avatar"
    className="avatar-img me-2 mb-0 align-items-top"
    style={{ width: "28px", height: "25px", borderRadius: "50%" }}
  />
  {user.displayName || user.email}
</Link>


                    </li>
                  </>
                ) : (
                  <li className="nav-item">
                    <Link className="nav-link" to="/login" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
                  </li>
                )}

                {/* Número de teléfono */}
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
              {menuOpen ? <FaTimes color="white" size={24} /> : <FaBars color="white" size={24} />}
            </button>
          </div>

          {/* Sidebar móvil */}
          <div className={`sidebar-mobile d-lg-none ${menuOpen ? "open" : ""}`} ref={navbarRef}>
            <ul className="navbar-nav flex-column p-3">
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

              {/* Indicador de usuario logeado en móvil */}
              {user ? (
                <>
                  <li className="nav-item">
                    <button className="nav-link btn" onClick={handleLogout}>Cerrar sesión</button>
                  </li>
                  <li className="nav-item align-items-center">
                    <Link className="nav-link d-flex align-items-center" to="/perfil" onClick={() => setMenuOpen(false)}>
                      <img
                        src={user.photoURL || "https://via.placeholder.com/40"}
                        alt="Avatar"
                        className="avatar-img me-2 mb-0 align-items-top"
                        style={{ width: "28px", height: "28px", borderRadius: "50%" }}
                      />
                      {user.displayName || user.email}
                    </Link>
                  </li>
                </>
              ) : (
                <li className="nav-item">
                  <Link className="nav-link" to="/login" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
                </li>
              )}

              {/* Número teléfono móvil */}
              <li className="nav-item mt-3">
                <a
                  href="tel:+5493834523097"
                  className="btn btn-danger w-100 d-flex align-items-center justify-content-center border-0 gap-2"
                  aria-label="Llamar al +54 9 3834 52 3097"
                >
                  <FaPhoneAlt aria-hidden="true" />
                  <span>+54 9 3834 52 3097</span>
                </a>
              </li>
            </ul>

            {/* Logo al final */}
            <div className="sidebar-logo text-center py-4">
              <Link to="/" onClick={() => setMenuOpen(false)}>
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
              </Link>
              <p style={{ margin: "0 0 12px 0", fontWeight: "700", color: "#333" }}>
                San Martín 579, San Fernando del Valle de Catamarca, Argentina
              </p>
            </div>
          </div>

          {/* Fondo oscurecido cuando sidebar está abierto */}
          {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)}></div>}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
