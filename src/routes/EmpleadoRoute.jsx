import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function EmpleadoRoute({ children }) {
  const { rol, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;
  if (rol !== "empleado") return <Navigate to="/" replace />;

  return children;
}
