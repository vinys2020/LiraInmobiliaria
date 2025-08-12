import React from "react";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import WhatsAppButton from "./components/WhatsAppButton";

function App() {
  return (
    <>
      <Preloader />
      <Navbar />
      <Home />
      <WhatsAppButton />
    </>
  );
}

export default App;
