  import React from "react";
  import { Routes, Route } from "react-router-dom";
  import Navbar from "./components/Navbar";
  import Home from "./pages/Home";
  import WhatsAppButton from "./components/WhatsAppButton";
  import Footer from "./components/Footer";
  import PreFooter from "./components/PreFooter";
  import Login from "./pages/Login"; // Aquí importas el nuevo login
  import EmpleadoDashboard from "./pages/EmpleadoDashboard";
  import AdminDashboard from "./pages/AdminDashboard"; // Asegurate de tener este archivo creado
  import Propiedades from "./pages/Propiedades";



  function App() {
    return (
      <>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} /> {/* Ruta del login */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/empleado" element={<EmpleadoDashboard />} />
          <Route path="/propiedades" element={<Propiedades />} />


        </Routes>
        <WhatsAppButton />
        <PreFooter />
        <Footer />
      </>
    );
  }

  export default App;
