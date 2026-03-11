import React from "react";
import "./condiciones-del-servicio.css";

const CondicionesDelServicio = () => {
    return (
        <main className="legal-condiciones-container">

            <section
                className="legal-privacidad-hero"
                style={{
                    backgroundImage: `url("https://res.cloudinary.com/dxdnsblj6/image/upload/v1761174697/loginbackground_1_wan29u.jpg")`,
                }}
            >
                <div className="legal-privacidad-overlay"></div>
            </section>

            <section className="legal-condiciones-content">
                <div className="legal-condiciones-card">

                    <h1 className="legal-title">Condiciones del Servicio</h1>
                    <p className="legal-subtitle">
                        Términos y condiciones de uso del sitio web y canales digitales
                    </p>

                    <h2>1. Aceptación de los términos</h2>
                    <p>
                        El acceso y uso del sitio web https://lirainmobiliaria.com.ar
                        implica la aceptación plena de las presentes Condiciones del Servicio.
                        Si el usuario no estuviera de acuerdo con alguno de los términos,
                        deberá abstenerse de utilizar el sitio.
                    </p>

                    <h2>2. Objeto del sitio</h2>
                    <p>
                        El sitio tiene por finalidad brindar información sobre servicios
                        inmobiliarios, propiedades disponibles y facilitar canales
                        de contacto con Lira Inmobiliaria.
                    </p>

                    <h2>3. Uso adecuado</h2>
                    <p>
                        El usuario se compromete a utilizar el sitio y sus servicios
                        de manera lícita, respetando la legislación vigente en la
                        República Argentina.
                    </p>

                    <h2>4. Información publicada</h2>
                    <p>
                        La información sobre propiedades, precios, características
                        y disponibilidad puede estar sujeta a modificaciones sin previo aviso.
                        La empresa no garantiza la actualización permanente del contenido.
                    </p>

                    <h2>5. Propiedad intelectual</h2>
                    <p>
                        Todos los contenidos del sitio, incluyendo textos, imágenes,
                        logotipos y diseños, son propiedad de Lira Inmobiliaria
                        o se utilizan con autorización, quedando prohibida su
                        reproducción sin consentimiento previo.
                    </p>

                    <h2>6. Limitación de responsabilidad</h2>
                    <p>
                        Lira Inmobiliaria no será responsable por daños derivados
                        del uso indebido del sitio web o de la información publicada.
                    </p>

                    <h2>7. Enlaces a terceros</h2>
                    <p>
                        El sitio puede contener enlaces a plataformas externas
                        (por ejemplo, servicios de mensajería como WhatsApp),
                        cuyas políticas y condiciones son independientes
                        de la empresa.
                    </p>

                    <h2>8. Modificaciones</h2>
                    <p>
                        Lira Inmobiliaria podrá modificar las presentes
                        Condiciones del Servicio en cualquier momento.
                        Las modificaciones entrarán en vigencia desde
                        su publicación en este sitio.
                    </p>

                    <h2>9. Legislación aplicable</h2>
                    <p>
                        Las presentes condiciones se rigen por las leyes
                        de la República Argentina.
                    </p>

                    <div className="legal-condiciones-footer">
                        <p>Última actualización: 13 de febrero de 2026</p>
                    </div>

                </div>
            </section>
        </main>
    );
};

export default CondicionesDelServicio;
