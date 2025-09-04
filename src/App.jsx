import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import WhatsAppButton from "./components/WhatsAppButton";
import Footer from "./components/Footer";
import PreFooter from "./components/PreFooter";
import Login from "./pages/Login";
import EmpleadoDashboard from "./pages/EmpleadoDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Propiedades from "./pages/Propiedades";
import AlquileresDisponibles from "./pages/AlquileresDisponibles";
import PropiedadesEnVenta from "./pages/PropiedadesEnVenta";
import LotesEnVenta from "./pages/LotesEnVenta";
import SobreNosotros from "./pages/SobreNosotros";
import Contactos from "./pages/Contactos";
import TodasPropiedades from "./pages/TodasPropiedades";
import DetallePropiedad from "./pages/DetallePropiedad";


// Rutas protegidas
import AdminRoute from "./routes/AdminRoute";
import EmpleadoRoute from "./routes/EmpleadoRoute";

function App() {
  return (
    <>
      <Navbar />
      <ScrollToTop smooth={true} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/alquileres" element={<AlquileresDisponibles />} />
        <Route path="/PropiedadesEnVenta" element={<PropiedadesEnVenta />} />
        <Route path="/LotesEnVenta" element={<LotesEnVenta />} />
        <Route path="/SobreNosotros" element={<SobreNosotros />} />
        <Route path="/contacto" element={<Contactos />} />
        <Route path="/todaspropiedades" element={<TodasPropiedades />} />
        <Route path="/detalle-propiedad/:id" element={<DetallePropiedad />} />



        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
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
