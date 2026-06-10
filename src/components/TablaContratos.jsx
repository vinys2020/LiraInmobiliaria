
import React from "react";

const TablaContratos = ({
    contratosFiltrados,
    openRow,
    toggleRow,
    abrirCliente,
    verRecibosInquilino,
    cobrarAlquiler,
    verRecibosPropietario,
    facturarPago,
    getContractStatus,
    formatCurrency,
    handleEditContract,
    handleFileUpload,
    eliminarContrato,
    eliminandoContrato

}) => {
    return (
        <>

            <div className="p-1 shadow-sm border-0">
                <div className="card-body p-0">

                    <div className="table-responsive">
                        <table className="table align-middle mb-0">

                            <thead className="table-light">
                                <tr>
                                    <th>Propiedad</th>
                                    <th>Cobranza</th>
                                    <th>Liquidación</th>
                                    <th>Estado</th>
                                    <th>Inicio</th>
                                    <th>Fin</th>
                                    <th>Mensual</th>
                                    <th></th>
                                </tr>
                            </thead>

                            <tbody>

                                {contratosFiltrados.map((c, index) => (<React.Fragment key={c.id}>

                                    {/* FILA PRINCIPAL */}
                                    <tr>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">

                                                {/* Imagen */}
                                                <img
                                                    src={c.propiedadImagen || "/images/placeholder.png"}
                                                    alt={c.propiedadTitulo}
                                                    style={{
                                                        width: "70px",
                                                        height: "55px",
                                                        objectFit: "cover",
                                                        borderRadius: "6px",
                                                    }}
                                                />

                                                {/* Info */}
                                                <div>
                                                    <strong>{c.propiedadTitulo}</strong>
                                                    <div className="small text-muted">
                                                        ID: #{c.propiedadId}
                                                    </div>
                                                </div>

                                            </div>
                                        </td>

                                        <td>

                                            <div className="d-flex align-items-center gap-1">

                                                {/* Usuario */}
                                                <button
                                                    className="btn btn-link p-0 text-primary"
                                                    onClick={() => abrirCliente("locatario", c)}
                                                    title="Ver información del locatario"
                                                >
                                                    <i className="bi bi-person-circle"></i>
                                                </button>

                                                {/* Recibos */}
                                                <button
                                                    className="btn btn-link p-0 text-primary"
                                                    alt="Recibos del locatario"
                                                    onClick={() => verRecibosInquilino(c)}
                                                    title="Ver recibos del inquilino"
                                                >
                                                    <i className="bi bi-file-earmark-text"></i>
                                                </button>

                                                {/* Cobrar alquiler */}
                                                <button
                                                    className="btn btn-link p-0 text-primary"
                                                    onClick={() => cobrarAlquiler(c)}
                                                    title="Cobrar alquiler"
                                                >
                                                    <i className="bi bi-cash-coin"></i>
                                                </button>

{/* Nombre */}
<button
    className="btn btn-link p-0 text-decoration-none text-primary small"
    style={{
        fontSize: "0.85rem",
        fontWeight: "500",
    }}
    onClick={() => abrirCliente("locatario", c)}
>
    {c.locatario || "Sin nombre"}
</button>

                                            </div>

                                        </td>

                                        <td>

                                            <div className="d-flex align-items-center gap-1">

                                                {/* Usuario */}
                                                <button
                                                    className="btn btn-link p-0 text-primary"
                                                    onClick={() => abrirCliente("locador", c)}
                                                    title="Ver información del locador"
                                                >
                                                    <i className="bi bi-person-circle"></i>
                                                </button>

                                                {/* Recibos */}
                                                <button
                                                    className="btn btn-link p-0 text-primary"
                                                    onClick={() => verRecibosPropietario(c)}
                                                    title="Ver recibos del propietario"
                                                >
                                                    <i className="bi bi-file-earmark-text"></i>
                                                </button>

                                                {/* Facturar pago */}
                                                <button
                                                    className="btn btn-link p-0 text-primary"
                                                    onClick={() => facturarPago(c)}
                                                    title="Facturar pago"
                                                >
                                                    <i className="bi bi-cash-coin"></i>
                                                </button>

{/* Nombre */}
<button
    className="btn btn-link p-0 text-decoration-none text-primary small"
    style={{
        fontSize: "0.85rem",
        fontWeight: "500",
    }}
    onClick={() => abrirCliente("locador", c)}
>
    {c.locador || "Sin nombre"}
</button>

                                            </div>

                                        </td>

                                        <td>
                                            <span className="badge bg-success">
                                                {c.estado}
                                            </span>
                                        </td>
                                        <td>{c.inicio}</td>
                                        <td style={{ minWidth: "120px" }}>
                                            <div className="small mb-1">{c.fin}</div>


                                            {(() => {
                                                const status = getContractStatus(c.fin);
                                                return (
                                                    <div className="progress" style={{ height: "7px" }}>
                                                        <div
                                                            className={`progress-bar ${status.color}`}
                                                            role="progressbar"
                                                            style={{ width: `${status.porcentaje}%` }}
                                                        />
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td>
                                            <span className="fw-semibold text-success">
                                                {formatCurrency(c.precioMensual)}
                                            </span>
                                        </td>

                                        <td className="text-end" style={{ minWidth: "140px" }}>                              <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => toggleRow(index)}
                                        >
                                            {openRow === index ? "Cerrar" : "Ver"}
                                        </button>
                                            <button
                                                className="btn btn-sm btn-outline-warning me-2"
                                                onClick={() => handleEditContract(c)}
                                            >
                                                Modificar
                                            </button>


                                        </td>
                                    </tr>

                                    {/* FILA EXPANDIBLE */}
                                    {openRow === index && (
                                        <tr className="expand-row">
                                            <td colSpan="8">
                                                <div className="p-3 bg-light border-top rounded-3">

                                                    <div className="row g-4">

                                                        {/* PROPIEDAD */}
                                                        <div className="col-12">


                                                            <div className="border-0 shadow-sm overflow-hidden">

                                                                <div className="position-relative">

                                                                    {/* Imagen portada */}
                                                                    <img
                                                                        src={c.propiedadImagen || "/images/placeholder.png"}
                                                                        alt={c.propiedadTitulo}
                                                                        className="w-100"
                                                                        style={{
                                                                            borderRadius: "5px",
                                                                            height: "200px",
                                                                            objectFit: "cover"
                                                                        }}
                                                                    />

                                                                    {/* Degradado oscuro */}
                                                                    <div
                                                                        className="position-absolute top-0 start-0 w-100 h-100"
                                                                        style={{
                                                                            background:
                                                                                "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.1))"
                                                                        }}
                                                                    ></div>

                                                                    {/* Información sobre la imagen */}
                                                                    <div className="position-absolute bottom-0 start-0 text-white p-3 w-100 mb-2">

                                                                        <h6 className="fw-bold mb-1">
                                                                            <i className="bi bi-house-door me-2"></i>
                                                                            {c.propiedadTitulo || "Propiedad"}
                                                                        </h6>

                                                                        <div className="small mb-1">
                                                                            <i className="bi bi-hash me-1"></i>
                                                                            ID: {c.propiedadId}
                                                                        </div>

                                                                        <div className="small mb-2">
                                                                            <i className="bi bi-geo-alt me-1"></i>
                                                                            {
                                                                                [
                                                                                    c.propiedadDireccion?.calle,
                                                                                    c.propiedadDireccion?.localidad,
                                                                                    c.propiedadDireccion?.provincia
                                                                                ]
                                                                                    .filter(Boolean)
                                                                                    .join(" - ") || "No registrada"
                                                                            }
                                                                        </div>

                                                                        <div className="fw-bold fs-5 text-warning">
                                                                            {formatCurrency(c.precioMensual)}
                                                                        </div>

                                                                    </div>
                                                                </div>

                                                            </div>



                                                        </div>

                                                        {/* LOCATARIO */}
                                                        <div className="col-md-3">
                                                            <h6 className="fw-semibold text-dark mb-2">
                                                                <i className="bi bi-person-badge me-2 text-success"></i>
                                                                Inquilino
                                                            </h6>
                                                            <p className="text-muted small mb-1">Nombre: {c.locatario || "No registrado"}</p>
                                                            <p className="text-muted small mb-1">DNI: {c.locatarioDni || "No registrado"}</p>
                                                            <p className="text-muted small mb-1">CUIL: {c.locatarioCuil || "No registrado"}</p>
                                                            <p className="text-muted small mb-1">Email: {c.locatarioEmail || "No registrado"}</p>
                                                            <p className="text-muted small mb-0">Teléfono1: {c.locatarioTelefono1 || "No registrado"}</p>
                                                            <p className="text-muted small mb-0">Teléfono2: {c.locatarioTelefono2 || "No registrado"}</p>
                                                            <p className="text-muted small mb-0">Depósito: {c.deposito || "No registrado"}</p>
                                                        </div>

                                                        {/* LOCADOR */}
                                                        <div className="col-md-3">
                                                            <h6 className="fw-semibold text-dark mb-2">
                                                                <i className="bi bi-person-badge me-2 text-primary"></i>
                                                                Propietario
                                                            </h6>
                                                            <p className="text-muted small mb-1">Nombre: {c.locador || "No registrado"}</p>
                                                            <p className="text-muted small mb-1">DNI: {c.locadorDni || "No registrado"}</p>
                                                            <p className="text-muted small mb-1">CUIL: {c.locadorCuil || "No registrado"}</p>
                                                            <p className="text-muted small mb-1">Email: {c.locadorEmail || "No registrado"}</p>
                                                            <p className="text-muted small mb-0">Teléfono1: {c.locadorTelefono1 || "No registrado"}</p>
                                                            <p className="text-muted small mb-0">Teléfono2: {c.locadorTelefono2 || "No registrado"}</p>
                                                        </div>



                                                        {/* GARANTE */}
                                                        <div className="col-md-3">
                                                            <h6 className="fw-semibold text-dark mb-2">
                                                                <i className="bi bi-shield-check me-2 text-warning"></i>
                                                                Garante 1
                                                            </h6>
                                                            <p className="text-muted small mb-1">Nombre: {c.garante || "No registrado"}</p>
                                                            <p className="text-muted small mb-1">DNI: {c.garanteDni || "No registrado"}</p>
                                                            <p className="text-muted small mb-1">CUIL: {c.garanteCuil || "No registrado"}</p>
                                                            <p className="text-muted small mb-1">Email: {c.garanteEmail || "No registrado"}</p>
                                                            <p className="text-muted small mb-0">Teléfono1: {c.garanteTelefono1 || "No registrado"}</p>
                                                            <p className="text-muted small mb-0">Teléfono2: {c.garanteTelefono2 || "No registrado"}</p>

                                                        </div>

                                                        {/* GARANTE 2 */}
                                                        <div className="col-md-3">
                                                            <h6 className="fw-semibold text-dark mb-2">
                                                                <i className="bi bi-shield-check me-2 text-secondary"></i>
                                                                Garante 2
                                                            </h6>
                                                            <p className="text-muted small mb-1">Nombre: {c.garante2 || "No registrado"}</p>
                                                            <p className="text-muted small mb-1">DNI: {c.garante2Dni || "No registrado"}</p>
                                                            <p className="text-muted small mb-1">CUIL: {c.garante2Cuil || "No registrado"}</p>
                                                            <p className="text-muted small mb-1">Email: {c.garante2Email || "No registrado"}</p>
                                                            <p className="text-muted small mb-0">Teléfono1: {c.garante2Telefono1 || "No registrado"}</p>
                                                            <p className="text-muted small mb-0">Teléfono2: {c.garante2Telefono2 || "No registrado"}</p>

                                                        </div>

                                                        {/* DETALLES CONTRACTUALES */}
                                                        <div className="col-md-4">
                                                            <h6 className="fw-semibold text-dark mb-2">
                                                                <i className="bi bi-journal-text me-2 text-primary"></i>
                                                                Detalles Contractuales
                                                            </h6>
                                                            <p className="text-muted small mb-0">{c.detalles || "Sin detalles registrados"}</p>
                                                        </div>

                                                        {/* ACUERDOS */}
                                                        <div className="col-md-6">
                                                            <h6 className="fw-semibold text-dark mb-2">
                                                                <i className="bi bi-card-checklist me-2 text-success"></i>
                                                                Acuerdos
                                                            </h6>
                                                            <p className="text-muted small mb-0">{c.acuerdos || "Sin acuerdos registrados"}</p>
                                                        </div>

                                                        {/* CLÁUSULAS */}
                                                        <div className="col-md-4">
                                                            <h6 className="fw-semibold text-dark mb-2">
                                                                <i className="bi bi-file-earmark-text me-2 text-secondary"></i>
                                                                Cláusulas
                                                            </h6>
                                                            <p className="text-muted small mb-0">{c.clausulas || "Sin cláusulas registradas"}</p>
                                                        </div>

                                                        {/* OBSERVACIONES */}
                                                        <div className="col-md-4">
                                                            <h6 className="fw-semibold text-dark mb-2">
                                                                <i className="bi bi-chat-left-text me-2 text-warning"></i>
                                                                Observaciones
                                                            </h6>
                                                            <p className="text-muted small mb-0">{c.observaciones || "Sin observaciones"}</p>
                                                        </div>

                                                        {/* ÍNDICE DE ACTUALIZACIÓN */}
<div className="col-md-4">
    <h6 className="fw-semibold text-dark mb-2">
        <i className="bi bi-graph-up-arrow me-2 text-info"></i>
        Índice de Actualización
    </h6>

    <p className="text-muted small mb-0">
        {c.indiceActualizacion || "No definido"}
    </p>
</div>

                                                        

                                                        {/* ARCHIVO */}
                                                        <div className="col-12 mt-3">
                                                            <h6 className="fw-semibold text-dark mb-3">
                                                                <i className="bi bi-paperclip me-2 text-dark"></i>
                                                                Archivo del Contrato
                                                            </h6>

                                                            {c.archivoUrl ? (
                                                                <div className="d-flex gap-2 align-items-center">
                                                                    <a
                                                                        href={c.archivoUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="btn btn-outline-dark btn-sm"
                                                                    >
                                                                        <i className="bi bi-file-earmark-pdf me-1"></i>
                                                                        Ver PDF
                                                                    </a>
                                                                </div>
                                                            ) : (
                                                                <div>
                                                                    <label className="btn btn-outline-primary btn-sm mb-0">
                                                                        <i className="bi bi-upload me-1"></i>
                                                                        Importar PDF
                                                                        <input
                                                                            type="file"
                                                                            accept="application/pdf"
                                                                            hidden
                                                                            onChange={(e) => handleFileUpload(e, c.id)}
                                                                        />
                                                                    </label>
                                                                    <div className="small text-muted mt-2">No hay archivo cargado</div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="col-12 mt-4 pt-3 border-top d-flex justify-content-end">

                                                            <button
                                                                className="btn btn-outline-danger btn-sm px-3"
                                                                onClick={() => eliminarContrato(c)}
                                                                disabled={eliminandoContrato === c.id}
                                                                style={{ pointerEvents: eliminandoContrato === c.id ? "none" : "auto" }}
                                                            >

                                                                {eliminandoContrato === c.id && (
                                                                    <span className="spinner-border spinner-border-sm me-2" />
                                                                )}

                                                                {eliminandoContrato === c.id
                                                                    ? "Eliminando..."
                                                                    : (
                                                                        <>
                                                                            <i className="bi bi-trash me-1"></i>
                                                                            Eliminar Contrato
                                                                        </>
                                                                    )
                                                                }

                                                            </button>

                                                        </div>

                                                    </div>

                                                </div>
                                            </td>
                                        </tr>
                                    )}




                                </React.Fragment>
                                ))}

                            </tbody>

                        </table>
                    </div>





                </div>




            </div>
        </>
    );
};

export default TablaContratos;