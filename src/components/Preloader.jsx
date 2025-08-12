import React, { useState, useEffect } from "react";
import "./preloader.css";

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula el tiempo de carga, puedes ajustar a tu necesidad
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // 1.5 segundos

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="preloader">
      <img
        src="https://lirainmobiliaria.com.ar/wp-content/uploads/2024/03/logo-lira-1.png"
        alt="Lira Inmobiliaria"
        className="preloader-logo"
      />
    </div>
  );
};

export default Preloader;
