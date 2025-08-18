import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/admin");
    } catch {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-3">
      <h3 className="mb-4">Iniciar Sesión</h3>
      {error && <div className="alert alert-danger">{error}</div>}

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
            type={showPassword ? "text" : "password"}
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
            style={{
              borderColor: "rgba(255, 255, 255, 0.952)",
              width: "45px",
            }}
          >
            <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
          </button>
        </div>
      </div>

      <button type="submit" className="btn btn-primary w-100">
        Ingresar
      </button>
    </form>
  );
}
