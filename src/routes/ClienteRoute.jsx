import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ClienteRoute({ children }) {
  const { user, rol, loading } = useAuth();

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (rol !== "cliente") {
    return <Navigate to="/" replace />;
  }

  return children;
}