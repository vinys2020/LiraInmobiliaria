import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
    const { user, loading } = useAuth();

    // Esperar a que Firebase determine si hay una sesión iniciada
    if (loading) {
        return null; // o un spinner
    }

    // Si no hay usuario, enviar al login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}