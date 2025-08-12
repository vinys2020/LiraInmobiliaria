import React, { useState, useEffect } from "react";

const WhatsAppButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Check scroll position on mount
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      className={`scroll-top btn ${visible ? "" : "hidden"}`}
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: 0,
        borderRadius: "50%",
        width: "60px",
        height: "60px",
        backgroundColor: "#25D366",  // verde típico WhatsApp
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        cursor: "pointer",
        border: "none",
        zIndex: 1050,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
      aria-label="Envíanos un WhatsApp!"
    >
      <a
        href="https://api.whatsapp.com/send?phone=5493834523097"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
          textDecoration: "none",
        }}
        title="Envíanos un WhatsApp!"
      >
        <i className="bi bi-whatsapp fs-3" aria-hidden="true"></i>
      </a>
    </button>
  );
};

export default WhatsAppButton;
