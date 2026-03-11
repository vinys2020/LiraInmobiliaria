import React from "react";
import "./politica-de-privacidad.css";

const PoliticaDePrivacidad = () => {
    return (
        <main className="legal-privacidad-container">

            <section
                className="legal-privacidad-hero"
                style={{
                    backgroundImage: `url("https://res.cloudinary.com/dxdnsblj6/image/upload/v1761174697/loginbackground_1_wan29u.jpg")`,
                }}
            >
                <div className="legal-privacidad-overlay"></div>
            </section>

            <section className="legal-privacidad-content">
                <div className="legal-privacidad-card">

                    <h1 className="legal-title">Política de Privacidad</h1>
                    <p className="legal-subtitle">
                        Tratamiento de datos personales conforme a la normativa vigente en la República Argentina
                    </p>

                    <h2>1. Responsable del tratamiento</h2>
                    <p>
                        Lira Inmobiliaria, con domicilio en la República Argentina,
                        es responsable del tratamiento de los datos personales
                        recopilados a través del sitio web
                        https://lirainmobiliaria.com.ar y de sus canales oficiales
                        de comunicación.
                    </p>
                    <p>
                        Correo electrónico de contacto: lirainmobiliaria2021@gmail.com
                    </p>

                    <h2>2. Marco normativo</h2>
                    <p>
                        El tratamiento de los datos personales se realiza en cumplimiento
                        de la Ley N° 25.326 de Protección de los Datos Personales de la
                        República Argentina y su normativa complementaria.
                    </p>

                    <h2>3. Datos personales recopilados</h2>
                    <p>Podrán recopilarse las siguientes categorías de datos:</p>
                    <ul>
                        <li>Nombre y apellido.</li>
                        <li>Número de teléfono.</li>
                        <li>Dirección de correo electrónico.</li>
                        <li>Mensajes enviados a través de formularios web o WhatsApp.</li>
                        <li>Información relacionada con consultas inmobiliarias.</li>
                    </ul>

                    <h2>4. Finalidad del tratamiento</h2>
                    <p>Los datos serán utilizados exclusivamente para:</p>
                    <ul>
                        <li>Responder consultas realizadas por los usuarios.</li>
                        <li>Brindar información sobre propiedades y servicios inmobiliarios.</li>
                        <li>Coordinar visitas, reuniones o asesoramiento.</li>
                        <li>Gestionar comunicaciones comerciales relacionadas con la actividad inmobiliaria.</li>
                    </ul>

                    <h2>5. Base legal</h2>
                    <p>
                        El tratamiento de los datos se basa en el consentimiento
                        otorgado voluntariamente por el usuario al contactarse
                        mediante los canales oficiales de la empresa.
                    </p>

                    <h2>6. Almacenamiento y seguridad</h2>
                    <p>
                        Los datos podrán almacenarse en sistemas digitales seguros,
                        incluyendo plataformas de gestión, servicios de alojamiento web
                        y herramientas de mensajería utilizadas para la administración
                        comercial.
                    </p>
                    <p>
                        Se adoptan medidas técnicas y organizativas razonables
                        para proteger la información contra accesos no autorizados,
                        pérdida, alteración o divulgación indebida.
                    </p>

                    <h2>7. Cesión y transferencia de datos</h2>
                    <p>
                        Los datos personales no serán vendidos ni cedidos a terceros,
                        salvo obligación legal o cuando resulte necesario para la
                        prestación de servicios vinculados a la actividad inmobiliaria.
                    </p>
                    <p>
                        Determinadas plataformas tecnológicas utilizadas por la empresa,
                        tales como servicios de mensajería (por ejemplo, WhatsApp),
                        proveedores de hosting o herramientas de gestión comercial,
                        podrían procesar datos conforme a sus propias políticas de privacidad.
                    </p>

                    <h2>8. Conservación de los datos</h2>
                    <p>
                        Los datos serán conservados durante el tiempo necesario
                        para cumplir con la finalidad para la cual fueron recopilados
                        o mientras exista una relación comercial o consulta activa,
                        salvo obligación legal de conservación por un plazo mayor.
                    </p>

                    <h2>9. Derechos del titular de los datos</h2>
                    <p>
                        El titular de los datos personales tiene derecho a:
                    </p>
                    <ul>
                        <li>Acceder a sus datos.</li>
                        <li>Solicitar la rectificación o actualización.</li>
                        <li>Solicitar la supresión o eliminación.</li>
                    </ul>
                    <p>
                        Para ejercer estos derechos podrá enviar una solicitud
                        al correo electrónico indicado en la presente política.
                    </p>

                    <p className="legal-note">
                        La Agencia de Acceso a la Información Pública,
                        órgano de control de la Ley N° 25.326,
                        tiene la atribución de atender denuncias y reclamos
                        relacionados con el incumplimiento de las normas
                        sobre protección de datos personales.
                    </p>

                    <h2>10. Uso de cookies</h2>
                    <p>
                        El sitio web puede utilizar cookies técnicas necesarias
                        para su correcto funcionamiento y para mejorar
                        la experiencia del usuario. El usuario puede configurar
                        su navegador para rechazar o eliminar cookies
                        según sus preferencias.
                    </p>

                    <h2>11. Modificaciones</h2>
                    <p>
                        Lira Inmobiliaria podrá actualizar la presente Política de
                        Privacidad cuando resulte necesario. Las modificaciones
                        entrarán en vigencia desde su publicación en este sitio web.
                    </p>

                    <div className="legal-privacidad-footer">
                        <p>Última actualización: 13 de febrero de 2026</p>
                    </div>

                </div>
            </section>
        </main>
    );
};

export default PoliticaDePrivacidad;
