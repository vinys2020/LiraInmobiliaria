import React, { useState, useEffect } from "react";
import "./preloader.css";

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="preloader" role="alert" aria-busy="true" aria-live="polite">
      <h1 className="preloader-welcome">
        Bienvenido a <span>Lira Inmobiliaria</span>
      </h1>
      <img
        src="https://lirainmobiliaria.com.ar/wp-content/uploads/2024/03/logo-lira-1.png"
        alt="Logo Lira Inmobiliaria"
        className="preloader-logo"
        aria-hidden="true"
      />
    </div>
  );
};

export default Preloader;
