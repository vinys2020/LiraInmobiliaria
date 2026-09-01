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
import CustomerDashboard from "./pages/CustomerDashboard";
import TodasPropiedades from "./pages/TodasPropiedades";
import DetallePropiedad from "./pages/DetallePropiedad";
import Politicadeprivacidad from "./pages/politica-de-privacidad";
import Condicionesdelservicio from "./pages/condiciones-del-servicio";
import PropietariosPage from "./pages/PropietariosPage";
import InquilinosPage from "./pages/InquilinosPage";
import GarantesPage from "./pages/GarantesPage";
import EstadoCajaPage from "./pages/EstadoCajaPage";
import ReporteMorosos from "./pages/ReporteMorosos";
import ProximosPeriodos from "./pages/ProximosPeriodos";
import PrivateRoute from "./routes/PrivateRoute";
import ClienteRoute from "./routes/ClienteRoute";
import ClienteDashboard from "./pages/ClienteDashboard";
import ClienteContrato from "./pages/ClienteContrato";
import ClientePagos from "./pages/ClientePagos";

import NormalizeTrailingSlash from "./components/NormalizeTrailingSlash";

import InstagramWarning from "./components/InstagramWarning";
import { Toaster } from "react-hot-toast"; // 👈 IMPORTANTE


import AdminRoute from "./routes/AdminRoute";
import EmpleadoRoute from "./routes/EmpleadoRoute";

function App() {
  return (
    <>

      {/* 🔔 TOASTER GLOBAL */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#111",
            color: "#fff",
          },
        }}
      />

      <InstagramWarning />

      <Navbar />
      <ScrollToTop smooth={true} />

      <NormalizeTrailingSlash />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/alquileres" element={<AlquileresDisponibles />} />
        <Route path="/PropiedadesEnVenta" element={<PropiedadesEnVenta />} />
        <Route path="/propiedades-en-venta" element={<PropiedadesEnVenta />} />
        <Route path="/politica-de-privacidad" element={<Politicadeprivacidad />} />
        <Route path="/condiciones-del-servicio" element={<Condicionesdelservicio />} />
<Route
  path="/clientes"
  element={
    <PrivateRoute>
      <CustomerDashboard />
    </PrivateRoute>
  }
/>       <Route path="/LotesEnVenta" element={<LotesEnVenta />} />
        <Route path="/lotes-en-venta" element={<LotesEnVenta />} />
        <Route path="/SobreNosotros" element={<SobreNosotros />} />
        <Route path="/contacto" element={<Contactos />} />
        <Route path="/todaspropiedades" element={<TodasPropiedades />} />
        <Route path="/detalle-propiedad/:id" element={<DetallePropiedad />} />
<Route
  path="/propietarios"
  element={
    <PrivateRoute>
      <PropietariosPage />
    </PrivateRoute>
  }
/>
<Route
  path="/inquilinos"
  element={
    <PrivateRoute>
      <InquilinosPage />
    </PrivateRoute>
  }
/>

<Route
  path="/garantes"
  element={
    <PrivateRoute>
      <GarantesPage />
    </PrivateRoute>
  }
/>
<Route
  path="/estado"
  element={
    <PrivateRoute>
      <EstadoCajaPage />
    </PrivateRoute>
  }
/><Route
  path="/reporte-morosos"
  element={
    <PrivateRoute>
      <ReporteMorosos />
    </PrivateRoute>
  }
/><Route
  path="/proximos-periodos"
  element={
    <PrivateRoute>
      <ProximosPeriodos />
    </PrivateRoute>
  }
/>

<Route
  path="/cliente"
  element={
    <ClienteRoute>
      <ClienteDashboard />
    </ClienteRoute>
  }
/>


<Route
  path="/cliente/contrato/:contratoId"
  element={
    <ClienteRoute>
      <ClienteContrato />
    </ClienteRoute>
  }
/>

<Route path="/cliente/contrato/:contratoId/pagos" element={ <ClienteRoute> <ClientePagos /> </ClienteRoute> } />



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
<Route
  path="/propiedades"
  element={
    <PrivateRoute>
      <Propiedades />
    </PrivateRoute>
  }
/>      </Routes>
      <WhatsAppButton />
      <PreFooter />
      <Footer />
    </>
  );
}

export default App;
