import React, { useState, useEffect } from "react";

const ScrollTopWhatsAppToggle = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      const nearBottom = scrollPosition >= document.body.offsetHeight - 50;

      setVisible(window.scrollY > 50);
      setShowScrollTop(nearBottom);
    };

    window.addEventListener("scroll", handleScroll);
    // Chequeo inicial
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    const start = window.scrollY;
    const duration = 10; // ms - ajusta según la velocidad deseada
    const startTime = performance.now();
  
    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      // Easing suave pero rápido
      const ease = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, start * (1 - ease));
  
      if (progress < 1) requestAnimationFrame(animate);
    };
  
    requestAnimationFrame(animate);
  };
  

  // Ambos botones ocupan la misma posición fija
  const buttonStyle = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    cursor: "pointer",
    border: "none",
    zIndex: 1050,
    opacity: visible ? 1 : 0,
    transition: "opacity 0.3s ease",
    pointerEvents: visible ? "auto" : "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };

  return (
    <>
      {!showScrollTop && (
        <a
          href="https://api.whatsapp.com/send?phone=5493834523097"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Envíanos un WhatsApp!"
          style={{
            ...buttonStyle,
            backgroundColor: "#25D366", // verde WhatsApp
            color: "white",
            textDecoration: "none",
          }}
          title="Envíanos un WhatsApp!"
        >
          <i className="bi bi-whatsapp fs-3" aria-hidden="true"></i>
        </a>
      )}

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Subir al inicio"
          style={{
            ...buttonStyle,
            backgroundColor: "red", // azul Bootstrap para scroll top
            color: "white",
          }}
          title="Subir al inicio"
        >
          <i className="bi bi-arrow-up fs-3" aria-hidden="true"></i>
        </button>
      )}
    </>
  );
};

export default ScrollTopWhatsAppToggle;
