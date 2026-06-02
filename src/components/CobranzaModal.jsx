import React from "react";

export default function CobranzaModal({
  mostrarCobranza,
  setMostrarCobranza,

  contratoCobranza,
  formCobranza,
  setFormCobranza,

  modo = "cobranza" // 👈 ESTO
}) {

  if (!mostrarCobranza) return null;

  const esLiquidacion = modo === "liquidacion";

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg">

            {mostrarCobranza && (
              <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                  <div className="modal-content border-0 shadow-lg">

                    {/* HEADER */}
                    <div className="modal-header border-0 pb-0">

                      <div>
<h4 className="modal-title fw-bold mb-1">
  {esLiquidacion
    ? "Liquidación Inmobiliaria"
    : "Cobranza de Alquiler"}
</h4>

<p className="text-muted mb-0">
  {esLiquidacion
    ? "Registrá la liquidación del propietario."
    : "Registrá el pago realizado por el inquilino."}
</p>

                      </div>

                      <button
                        className="btn-close"
                        onClick={() => setMostrarCobranza(false)}
                      ></button>

                    </div>

                    {/* BODY */}
                    <div className="modal-body pt-4">

                      {/* ========================= */}
                      {/* VALORES */}
                      {/* ========================= */}

                      {(() => {

                        const totalCobrado =
                          Number(formCobranza?.totalCobrado || 0);

                        return (

                          <>

                            {/* INFORMACIÓN DEL CONTRATO */}
                            <div className="border rounded-4 p-4 mb-4 bg-light">

                              <h6 className="fw-bold mb-4">
                                Información del contrato
                              </h6>

                              <div className="row g-3">

                                {/* Inquilino */}
                                <div className="col-md-6">

                                  <label className="form-label">
                                    Inquilino
                                  </label>

                                  <input
                                    type="text"
                                    className="form-control"
                                    value={contratoCobranza?.locatario || ""}
                                    readOnly
                                  />

                                </div>

                                {/* Propietario */}
                                <div className="col-md-6">

                                  <label className="form-label">
                                    Propietario
                                  </label>

                                  <input
                                    type="text"
                                    className="form-control"
                                    value={contratoCobranza?.locador || ""}
                                    readOnly
                                  />

                                </div>

                                {/* PROPIEDAD */}
                                <div className="col-12">

                                  <label className="form-label">
                                    Propiedad
                                  </label>

                                  <div className="border rounded-4 p-3 bg-white shadow-sm">

                                    <div className="d-flex align-items-center gap-3">

                                      {/* Imagen */}
                                      <img
                                        src={
                                          contratoCobranza?.propiedadImagen ||
                                          "/placeholder.jpg"
                                        }
                                        alt="Propiedad"
                                        className="rounded-3 border"
                                        style={{
                                          width: "110px",
                                          height: "85px",
                                          objectFit: "cover"
                                        }}
                                      />

                                      {/* Info */}
                                      <div className="flex-grow-1">

                                        <h5 className="fw-bold mb-1">
                                          {contratoCobranza?.propiedadTitulo ||
                                            "Sin título"}
                                        </h5>

                                        <p className="text-muted mb-2 small">
                                          <i className="bi bi-geo-alt me-1"></i>

                                          {contratoCobranza?.direccion ||
                                            "Dirección no disponible"}
                                        </p>

                                        <div className="d-flex flex-wrap gap-2">

                                          <span className="badge bg-success-subtle text-success border">
                                            Contrato activo
                                          </span>

                                          <span className="badge bg-light text-dark border">
                                            {contratoCobranza?.moneda === "USD"
                                              ? "USD"
                                              : "ARS"}
                                          </span>

                                        </div>

                                      </div>

                                      {/* Precio */}
                                      <div className="text-end">

                                        <small className="text-muted d-block">
                                          Alquiler mensual
                                        </small>

                                        <h4 className="fw-bold text-success mb-0">

                                          {contratoCobranza?.moneda === "USD"
                                            ? `U$S ${Number(
                                              contratoCobranza?.precioMensual || 0
                                            ).toLocaleString("es-AR")}`
                                            : `$ ${Number(
                                              contratoCobranza?.precioMensual || 0
                                            ).toLocaleString("es-AR")}`}

                                        </h4>

                                      </div>

                                    </div>

                                  </div>

                                </div>

                                {/* Periodo */}
                                <div className="col-md-4">

                                  <label className="form-label">
                                    Periodo
                                  </label>

                                  <input
                                    type="month"
                                    className="form-control"
                                  />

                                </div>

                              </div>

                            </div>

                            {/* DETALLE DEL COBRO */}
                            <div className="border rounded-4 p-4 mb-4">

                              <h6 className="fw-bold mb-4">
                                Detalle del cobro
                              </h6>

                              <div className="row g-3">

                                {/* TOTAL COBRADO */}
                                <div className="col-md-4">

                                  <label className="form-label fw-semibold text-success">
                                    Total cobrado al Inquilino
                                  </label>

                                  <input
                                    type="number"
                                    className="form-control form-control-lg border-success shadow-sm"
                                    style={{
                                      backgroundColor: "#f0fff4",
                                      borderWidth: "2px"
                                    }}
                                    value={formCobranza.totalCobrado}
                                    onChange={(e) =>
                                      setFormCobranza({
                                        ...formCobranza,
                                        totalCobrado: Number(e.target.value)
                                      })
                                    }
                                  />

                                </div>

                                {/* Alquiler */}
                                <div className="col-md-4">

                                  <label className="form-label">
                                    Alquiler
                                  </label>

                                  <input
                                    type="number"
                                    className="form-control"
                                    defaultValue={
                                      contratoCobranza?.precioMensual || 0
                                    }
                                  />

                                </div>

                                {/* Expensas */}
                                <div className="col-md-4">

                                  <label className="form-label">
                                    Expensas
                                  </label>

                                  <input
                                    type="number"
                                    className="form-control"
                                    defaultValue={0}
                                  />

                                </div>

                                {/* Impuestos */}
                                <div className="col-md-4">

                                  <label className="form-label">
                                    Impuestos
                                  </label>

                                  <input
                                    type="number"
                                    className="form-control"
                                    defaultValue={0}
                                  />

                                </div>

                                {/* Intereses */}
                                <div className="col-md-4">

                                  <label className="form-label">
                                    Intereses
                                  </label>

                                  <input
                                    type="number"
                                    className="form-control"
                                    defaultValue={0}
                                  />

                                </div>

                                {/* Descuentos */}
                                <div className="col-md-4">

                                  <label className="form-label">
                                    Descuentos
                                  </label>

                                  <input
                                    type="number"
                                    className="form-control"
                                    defaultValue={0}
                                  />

                                </div>

                              </div>

                            </div>

                            {/* INFORMACIÓN DEL PAGO */}
                            <div className="border rounded-4 p-4 mb-4">

                              <h6 className="fw-bold mb-4">
                                Información del pago
                              </h6>

                              <div className="row g-3">

                                {/* Moneda */}
                                <div className="col-md-4">

                                  <label className="form-label">
                                    Moneda
                                  </label>

                                  <select
                                    className="form-select"
                                    defaultValue={
                                      contratoCobranza?.moneda || "ARS"
                                    }
                                  >
                                    <option value="ARS">
                                      Pesos Argentinos (ARS)
                                    </option>

                                    <option value="USD">
                                      Dólares (USD)
                                    </option>
                                  </select>

                                </div>

                                {/* Método */}
                                <div className="col-md-4">

                                  <label className="form-label">
                                    Método de pago
                                  </label>

                                  <select className="form-select">

                                    <option value="efectivo">
                                      Efectivo
                                    </option>

                                    <option value="transferencia">
                                      Transferencia
                                    </option>

                                    <option value="mercado_pago">
                                      Mercado Pago
                                    </option>

                                    <option value="debito">
                                      Débito
                                    </option>

                                    <option value="credito">
                                      Crédito
                                    </option>

                                  </select>

                                </div>

                                {/* Estado */}
                                <div className="col-md-4">

                                  <label className="form-label">
                                    Estado
                                  </label>

                                  <select
                                    className="form-select"
                                    defaultValue="pagado"
                                  >

                                    <option value="pagado">
                                      Pagado
                                    </option>

                                    <option value="pendiente">
                                      Pendiente
                                    </option>

                                    <option value="parcial">
                                      Parcial
                                    </option>

                                    <option value="vencido">
                                      Vencido
                                    </option>

                                  </select>

                                </div>

                                {/* Fecha */}
                                <div className="col-md-6">

                                  <label className="form-label">
                                    Fecha de pago
                                  </label>

                                  <input
                                    type="date"
                                    className="form-control"
                                  />

                                </div>

                                {/* Archivos */}
                                <div className="col-md-6">

                                  <label className="form-label">
                                    Comprobantes / archivos
                                  </label>

                                  <input
                                    type="file"
                                    className="form-control"
                                    multiple
                                  />

                                </div>

                                {/* Observaciones */}
                                <div className="col-12">

                                  <label className="form-label">
                                    Observaciones
                                  </label>

                                  <textarea
                                    className="form-control"
                                    rows="3"
                                    placeholder="Notas sobre el cobro..."
                                  ></textarea>

                                </div>

                              </div>

                            </div>

                            {/* RESUMEN */}
                            <div className="border rounded-4 p-4 bg-light">

                              <div className="d-flex justify-content-between align-items-center mb-4">

                                <div>

                                  <h5 className="fw-bold mb-1">
                                    Resumen del cobro
                                  </h5>

                                  <p className="text-muted mb-0">
                                    Información final registrada
                                  </p>

                                </div>

                                <i className="bi bi-cash-stack fs-2 text-success"></i>

                              </div>

                              <div className="row g-3">

                                {/* Total */}
                                <div className="col-md-4">

                                  <div className="border rounded-4 p-3 bg-white h-100">

                                    <small className="text-muted d-block mb-2">
                                      Total cobrado
                                    </small>

                                    <h4 className="fw-bold text-success mb-0">

                                      {contratoCobranza?.moneda === "USD"
                                        ? `U$S ${totalCobrado.toLocaleString("es-AR")}`
                                        : `$ ${totalCobrado.toLocaleString("es-AR")}`}

                                    </h4>

                                  </div>

                                </div>

                                {/* Estado */}
                                <div className="col-md-4">

                                  <div className="border rounded-4 p-3 bg-white h-100">

                                    <small className="text-muted d-block mb-2">
                                      Estado
                                    </small>

                                    <h4 className="fw-bold text-primary mb-0">
                                      Pagado
                                    </h4>

                                  </div>

                                </div>

                                {/* Método */}
                                <div className="col-md-4">

                                  <div className="border rounded-4 p-3 bg-white h-100">

                                    <small className="text-muted d-block mb-2">
                                      Método
                                    </small>

                                    <h4 className="fw-bold text-dark mb-0">
                                      Transferencia
                                    </h4>

                                  </div>

                                </div>

                              </div>

                            </div>

                          </>

                        );

                      })()}

                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer border-0 pt-0">

                      <button
                        className="btn btn-light px-4"
                        onClick={() => setMostrarCobranza(false)}
                      >
                        Cancelar
                      </button>
<button className="btn btn-success px-4">
  <i className="bi bi-cash-coin me-2"></i>

  {esLiquidacion
    ? "Registrar Liquidación"
    : "Registrar Cobro"}
</button>

                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}