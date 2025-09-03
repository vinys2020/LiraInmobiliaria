import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import fondoLogin from "../assets/lira-foto.jpg"; // ajusta la ruta según tu proyecto

import "./login.css"; // Mantiene tu estilo

const Login = () => {
  const { login, rol, user } = useAuth(); // obtenemos rol y usuario del contexto
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 estado para el ojo
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // 🔹 Si el usuario ya está logueado y el rol está definido, redirigimos
  useEffect(() => {
    if (user && rol) {
      if (rol === "admin") {
        navigate("/admin");
      } else if (rol === "empleado") {
        navigate("/empleado");
      }
    }
  }, [user, rol, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password); // no redirigimos aquí, sino en el useEffect
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas");
    }
  };

  return (
<div
  className="login-container"
  style={{
    backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${fondoLogin})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  }}
>
      <div className="login-box">
        <h2>Iniciar Sesión</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="usuario@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <div className="input-group">
              <input
                type={showPassword ? "text" : "password"} // 👈 cambia tipo
                id="password"
                className="form-control"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
<button
  type="button"
  className="btn btn-outline-secondary"
  onClick={() => setShowPassword(!showPassword)}
>
  {showPassword ? (
    <i className="bi bi-eye-slash"></i>
  ) : (
    <i className="bi bi-eye"></i>
  )}
</button>

            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Ingresar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
