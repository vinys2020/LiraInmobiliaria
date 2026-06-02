import React from "react";

export default function LiquidacionModal({

  mostrarCaja,
  setMostrarCaja,

  contratoCaja,

  formLiquidacion,
  setFormLiquidacion,

}) {

  if (!mostrarCaja || !contratoCaja) return null;

  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div className="modal d-block">

        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

          <div className="modal-content border-0 shadow-lg">

            {mostrarCaja && (
              <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                  <div className="modal-content border-0 shadow-lg">

                    {/* HEADER */}
                    <div className="modal-header border-0 pb-0">
                      <div>

                        <h4 className="modal-title fw-bold mb-1">
                          Registrar Liquidacion
                        </h4>

                        <p className="text-muted mb-0">
                          Registrá el pago del alquiler al propietario.
                        </p>

                      </div>

                      <button
                        className="btn-close"
                        onClick={() => setMostrarCaja(false)}
                      ></button>
                    </div>

                    {/* BODY */}
                    <div className="modal-body pt-4">

                      {/* INFORMACIÓN DEL CONTRATO */}
                      <div className="border rounded-4 p-4 mb-4 bg-light">

                        <h6 className="fw-bold mb-4">
                          Información del contrato
                        </h6>

                        <div className="row g-3">

                          {/* Propietario */}
                          <div className="col-md-6">
                            <label className="form-label">
                              Propietario
                            </label>

                            <input
                              type="text"
                              className="form-control"
                              value={contratoCaja?.locador || ""}
                              readOnly
                            />
                          </div>

                          {/* Inquilino */}
                          <div className="col-md-6">
                            <label className="form-label">
                              Inquilino
                            </label>

                            <input
                              type="text"
                              className="form-control"
                              value={contratoCaja?.locatario || ""}
                              readOnly
                            />
                          </div>

                          {/* Propiedad */}
                          <div className="col-12">

                            <label className="form-label">
                              Propiedad
                            </label>

                            <div className="border rounded-4 p-3 bg-white shadow-sm">

                              <div className="d-flex align-items-center gap-3">

                                {/* Imagen */}
                                <img
                                  src={contratoCaja?.propiedadImagen || "/placeholder.jpg"}
                                  alt="Propiedad"
                                  className="rounded-3 border"
                                  style={{
                                    width: "110px",
                                    height: "85px",
                                    objectFit: "cover"
                                  }}
                                />

                                {/* Información */}
                                <div className="flex-grow-1">

                                  {/* Título */}
                                  <h5 className="fw-bold mb-1">
                                    {contratoCaja?.propiedadTitulo || "Sin título"}
                                  </h5>

                                  {/* Dirección */}
                                  <p className="text-muted mb-2 small">
                                    <i className="bi bi-geo-alt me-1"></i>

                                    {contratoCaja?.direccion ||
                                      "Dirección no disponible"}
                                  </p>

                                  {/* Badges */}
                                  <div className="d-flex flex-wrap gap-2">

                                    <span className="badge bg-success-subtle text-success border">
                                      Contrato activo
                                    </span>

                                    <span className="badge bg-light text-dark border">
                                      {contratoCaja?.moneda === "USD"
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

                                    {contratoCaja?.moneda === "USD"
                                      ? `U$S ${Number(
                                        contratoCaja?.precioMensual || 0
                                      ).toLocaleString("es-AR")}`
                                      : `$ ${Number(
                                        contratoCaja?.precioMensual || 0
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

                      {/* DETALLE DEL PAGO */}
                      <div className="border rounded-4 p-4 mb-4">

                        <h6 className="fw-bold mb-4">
                          Detalle del pago
                        </h6>

                        <div className="row g-3">

                          {/* Total a liquidar */}
                          <div className="col-md-4">

                            <label className="form-label fw-semibold text-success">
                              Total a liquidar
                            </label>

                            <input
                              type="number"
                              className="form-control form-control-lg border-success shadow-sm"
                              style={{
                                backgroundColor: "#f0fff4", // verde muy suave tipo "success light"
                                borderWidth: "2px"
                              }}
                              value={formLiquidacion.totalLiquidacion}
                              onChange={(e) =>
                                setFormLiquidacion({
                                  ...formLiquidacion,
                                  totalLiquidacion: Number(e.target.value)
                                })
                              }
                            />

                            <small className="text-success fw-semibold">
                              Base del cálculo de liquidación
                            </small>

                          </div>

                          {/* Monto alquiler */}
                          <div className="col-md-4">
                            <label className="form-label">
                              Monto alquiler
                            </label>

                            <input
                              type="number"
                              className="form-control"
                              defaultValue={contratoCaja?.precioMensual || ""}
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

                          {/* Comisión */}
                          <div className="col-md-4">
                            <label className="form-label">
                              Comisión (%)
                            </label>

                            <input
                              type="number"
                              className="form-control"
                              value={formLiquidacion.comision}
                              onChange={(e) =>
                                setFormLiquidacion({
                                  ...formLiquidacion,
                                  comision: Number(e.target.value)
                                })
                              }
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
                              defaultValue="ARS"
                            >
                              <option value="ARS">
                                Pesos Argentinos (ARS)
                              </option>

                              <option value="USD">
                                Dólares (USD)
                              </option>
                            </select>
                          </div>

                          {/* Método pago */}
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

                            <select className="form-select">
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

                          {/* Fecha pago */}
                          <div className="col-md-6">
                            <label className="form-label">
                              Fecha de pago
                            </label>

                            <input
                              type="date"
                              className="form-control"
                            />
                          </div>

                          {/* Adjuntar comprobantes */}
                          <div className="col-md-6">
                            <label className="form-label">
                              Archivos / comprobantes
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
                              placeholder="Notas sobre el pago..."
                            ></textarea>
                          </div>

                        </div>

                      </div>

                      {/* RESUMEN */}
                      <div className="border rounded-4 p-4 bg-light">

                        <div className="d-flex justify-content-between align-items-center mb-4">

                          <div>

                            <h5 className="fw-bold mb-1">
                              Resumen del pago
                            </h5>

                            <p className="text-muted mb-0">
                              Detalle automático de la operación
                            </p>

                          </div>

                          <i className="bi bi-receipt fs-2 text-success"></i>

                        </div>

                        {(() => {

                          const totalLiquidacion =
                            Number(formLiquidacion?.totalLiquidacion || 0);

                          const porcentajeComision =
                            Number(formLiquidacion?.comision || 0);

                          const montoComision =
                            (totalLiquidacion * porcentajeComision) / 100;

                          const pagoLocador =
                            totalLiquidacion - montoComision;

                          return (

                            <div className="row g-3">

                              {/* Total */}
                              <div className="col-md-4">

                                <div className="border rounded-4 p-3 bg-white h-100">

                                  <small className="text-muted d-block mb-2">
                                    Total a liquidar
                                  </small>

                                  <h4 className="fw-bold text-success mb-0">

                                    {contratoCaja?.moneda === "USD"
                                      ? `U$S ${totalLiquidacion.toLocaleString("es-AR")}`
                                      : `$ ${totalLiquidacion.toLocaleString("es-AR")}`}

                                  </h4>

                                </div>

                              </div>

                              {/* Comisión */}
                              <div className="col-md-4">

                                <div className="border rounded-4 p-3 bg-white h-100">

                                  <small className="text-muted d-block mb-2">
                                    Comisión inmobiliaria
                                  </small>

                                  <h4 className="fw-bold text-danger mb-0">

                                    {contratoCaja?.moneda === "USD"
                                      ? `U$S ${montoComision.toLocaleString("es-AR")}`
                                      : `$ ${montoComision.toLocaleString("es-AR")}`}

                                  </h4>

                                </div>

                              </div>

                              {/* Pago locador */}
                              <div className="col-md-4">

                                <div className="border rounded-4 p-3 bg-white h-100">

                                  <small className="text-muted d-block mb-2">
                                    Pago locador
                                  </small>

                                  <h4 className="fw-bold text-primary mb-0">

                                    {contratoCaja?.moneda === "USD"
                                      ? `U$S ${pagoLocador.toLocaleString("es-AR")}`
                                      : `$ ${pagoLocador.toLocaleString("es-AR")}`}

                                  </h4>

                                </div>

                              </div>

                            </div>

                          );

                        })()}

                      </div>

                    </div>

                    {/* FOOTER */}
                    <div className="modal-footer border-0 pt-0">

                      <button
                        className="btn btn-light px-4"
                        onClick={() => setMostrarCaja(false)}
                      >
                        Cancelar
                      </button>

                      <button
                        className="btn btn-success px-4"
                        onClick={() => console.log("Registrar pago")}
                      >
                        <i className="bi bi-cash-coin me-2"></i>
                        Registrar Pago
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