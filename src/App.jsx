import React from "react";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import WhatsAppButton from "./components/WhatsAppButton";
import Footer from "./components/Footer";
import PreFooter from "./components/PreFooter";



function App() {
  return (
    <>
      <Preloader />
      <Navbar />
      <Home />
      <WhatsAppButton />
      <PreFooter />
      <Footer />

    </>
  );
}

export default App;
