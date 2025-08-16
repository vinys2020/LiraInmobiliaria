import React, { useState, useEffect } from "react";

const ScrollTopWhatsAppToggle = () => {
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const nearBottom = scrollPosition >= docHeight - 10; // margen de 10px del final
      setAtBottom(nearBottom);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // chequeo inicial

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const wspStyle = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "#25D366",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textDecoration: "none",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    zIndex: 1050,
    transition: "opacity 0.3s ease",
  };

  const scrollStyle = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    backgroundColor: "red",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    zIndex: 1100,
    transition: "opacity 0.3s ease",
  };

  return (
    <>
      {!atBottom && (
        <a
          href="https://api.whatsapp.com/send?phone=5493834523097"
          target="_blank"
          rel="noopener noreferrer"
          style={wspStyle}
          title="Envíanos un WhatsApp!"
          aria-label="Envíanos un WhatsApp!"
        >
          <i className="bi bi-whatsapp fs-3"></i>
        </a>
      )}

      {atBottom && (
        <button
          onClick={scrollToTop}
          style={scrollStyle}
          title="Subir al inicio"
          aria-label="Subir al inicio"
        >
          <i className="bi bi-arrow-up fs-3"></i>
        </button>
      )}
    </>
  );
};

export default ScrollTopWhatsAppToggle;
