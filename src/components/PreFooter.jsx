const PreFooter = () => {
  return (
    <section className="footer-top-wrap bg-light py-4 p-2">
      <div className="container">
        <div className="row gy-4">
          {/* Sobre Lira Inmobiliaria */}
          <article className="col-12 col-sm-6 col-lg-3">
            <h3 className="h5 mb-3 text-center text-sm-start">Lira Inmobiliaria</h3>
            <ul className="list-unstyled fs-6 lh-lg mb-0 text-center text-sm-start">
              <li>Alquiler y venta de propiedades.</li>
              <li>Administración.</li>
              <li>Tasaciones.</li>
              <li>Asesoramiento Inmobiliario.</li>
            </ul>
          </article>

          {/* Contacto */}
          <article className="col-12 col-sm-6 col-lg-3">
            <h3 className="h5 mb-3 text-center text-sm-start">Contacto</h3>
            <ul className="list-unstyled mb-0 fs-6">
              <li className="mb-2 d-flex align-items-start">
                <i className="bi bi-geo-alt-fill me-2 fs-5 text-danger" aria-hidden="true"></i>
                <span>San Martín 579, San Fernando del Valle de Catamarca, Argentina</span>
              </li>
              <li className="d-flex align-items-center">
                <i className="bi bi-envelope-fill me-2 fs-5 text-danger" aria-hidden="true"></i>
                <a href="mailto:info@lirainmobiliaria.com.ar" className="text-decoration-none">
                  info@lirainmobiliaria.com.ar
                </a>
              </li>
            </ul>
          </article>

          {/* Mapa */}
          <article className="col-12 col-lg-6">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3507.3303756539813!2d-65.78113772555528!3d-28.469595575754138!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x942428c74b291899%3A0xcf22a00d6593663e!2sLira%20Inmobiliaria!5e0!3m2!1ses-419!2sar!4v1710778470425!5m2!1ses-419!2sar"
              width="100%"
              height="200"
              style={{ border: 0, borderRadius: "0.25rem" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa Lira Inmobiliaria"
            ></iframe>
          </article>
        </div>
      </div>
    </section>
  );
};

export default PreFooter;
