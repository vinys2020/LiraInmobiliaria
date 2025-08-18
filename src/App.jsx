import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import WhatsAppButton from "./components/WhatsAppButton";
import Footer from "./components/Footer";
import PreFooter from "./components/PreFooter";
import Login from "./pages/Login";
import EmpleadoDashboard from "./pages/EmpleadoDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Propiedades from "./pages/Propiedades";
import AlquileresDisponibles from "./pages/AlquileresDisponibles";


// Rutas protegidas
import AdminRoute from "./routes/AdminRoute";
import EmpleadoRoute from "./routes/EmpleadoRoute";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} /> {/* Ruta del login */}
        <Route path="/alquileres" element={<AlquileresDisponibles />} />


        {/* Admin solo puede entrar si tiene rol admin */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Empleado solo puede entrar si tiene rol empleado */}
        <Route
          path="/empleado"
          element={
            <EmpleadoRoute>
              <EmpleadoDashboard />
            </EmpleadoRoute>
          }
        />

        <Route path="/propiedades" element={<Propiedades />} />
      </Routes>
      <WhatsAppButton />
      <PreFooter />
      <Footer />
    </>
  );
}

export default App;
