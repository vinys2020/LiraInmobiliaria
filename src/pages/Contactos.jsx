import React, { useState } from "react";
import "./Contactos.css";
import contactoImg from "../assets/contactanos.jpg";


const Contactos = () => {
  const [formData, setFormData] = useState({
    from_name: "",
    email_id: "",
    telefono: "",
    servicio: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulario enviado:", formData);
    alert("¡Gracias por tu mensaje! Te responderemos pronto.");
    setFormData({
      from_name: "",
      email_id: "",
      telefono: "",
      servicio: "",
      message: "",
    });
  };

  return (
    <main className="contactos-page container py-5 px-lg-5">
      <section className="row align-items-center mb-5">
        {/* Título */}
        <article className="col-12 text-center mb-3">
          <h1 className="titulo-prata">¿Interesado?</h1>
          <p className="fs-5">¡Dejanos tu mensaje y te contestamos a la brevedad!</p>
        </article>

        {/* Imagen */}
        <article className="col-12 col-lg-6 mb-5 d-flex justify-content-center">
          <img
            className="img-fluid rounded shadow contacto-img"
            src={contactoImg}
            alt="Contacto"
          />
        </article>

        {/* Formulario */}
        <article className="col-12 col-lg-6">
          <form onSubmit={handleSubmit}>
            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                name="from_name"
                value={formData.from_name}
                onChange={handleChange}
                placeholder="Nombre"
                required
              />
              <label htmlFor="from_name">Nombre:</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="email"
                className="form-control"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
                placeholder="nombre@example.com"
                required
              />
              <label htmlFor="email_id">Correo electrónico:</label>
            </div>

            <div className="form-floating mb-3">
              <input
                type="text"
                className="form-control"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Teléfono"
                required
              />
              <label htmlFor="telefono">Teléfono:</label>
            </div>


            <div className="form-floating mb-3">
              <select
                className="form-select"
                name="servicio"
                value={formData.servicio}
                onChange={handleChange}
                required
              >
                <option value="">En qué puedo ayudarte?</option>
                <option value="Alquiler y venta de propiedades">Alquiler y venta de propiedades</option>
                <option value="Administración">Administración</option>
                <option value="Produccion Audiovisual">Tasaciones</option>
                <option value="Desarrollo web">Asesoramiento</option>
              </select>
              <label htmlFor="servicio">Servicio de interés:</label>
            </div>

            <div className="form-floating mb-4">
              <textarea
                className="form-control"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Deja un comentario"
                style={{ minHeight: "120px" }}
                required
              />
              <label htmlFor="message">Mensaje:</label>
            </div>

            <div className="text-center">
              <button type="submit" className="btn btn-lg btn-outline-dark w-75">
                Enviar
              </button>
            </div>
          </form>
        </article>
      </section>
    </main>
  );
};

export default Contactos;
