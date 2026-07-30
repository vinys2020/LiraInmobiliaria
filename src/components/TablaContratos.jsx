
import React from "react";

const TablaContratos = ({
    contratosFiltrados,
    openRow,
    clientes,
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
                                                                            <i className="bi bi-file-earmark-text me-1"></i>
                                                                            ID Contrato: <strong>{c.id}</strong>
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

                                                            <div className="border rounded-3 p-3 h-100 bg-white shadow-sm">

                                                                <h6 className="fw-semibold text-dark mb-3">
                                                                    <i className="bi bi-person-badge me-2 text-success"></i>
                                                                    Inquilino
                                                                </h6>

                                                                <div className="small">

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">Nombre</span>
                                                                        <span className="fw-semibold text-dark">
                                                                            {c.locatario || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">DNI</span>
                                                                        <span className="text-dark">
                                                                            {c.locatarioDni || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">CUIL</span>
                                                                        <span className="text-dark">
                                                                            {c.locatarioCuil || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">Email</span>
                                                                        <span
                                                                            className="text-dark text-end"
                                                                            style={{
                                                                                maxWidth: "200px",
                                                                                overflowWrap: "break-word"
                                                                            }}
                                                                        >
                                                                            {c.locatarioEmail || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">Tel. 1</span>
                                                                        <span className="text-dark">
                                                                            {c.locatarioTelefono1 || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">Tel. 2</span>
                                                                        <span className="text-dark">
                                                                            {c.locatarioTelefono2 || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="mt-3 p-2 rounded bg-success bg-opacity-10 border border-success-subtle">
                                                                        <div className="text-muted small">
                                                                            Depósito
                                                                        </div>

                                                                        <div className="fw-bold text-success">
                                                                            {c.deposito || "No registrado"}
                                                                        </div>
                                                                    </div>

                                                                </div>

                                                            </div>

                                                        </div>

                                                        {/* LOCADOR */}
                                                        <div className="col-md-3">

                                                            <div className="border rounded-3 p-3 h-100 bg-white shadow-sm">

                                                                <h6 className="fw-semibold text-dark mb-3">
                                                                    <i className="bi bi-person-badge me-2 text-primary"></i>
                                                                    Propietario
                                                                </h6>

                                                                <div className="small">

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">Nombre</span>
                                                                        <span className="fw-semibold text-dark">
                                                                            {c.locador || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">DNI</span>
                                                                        <span className="text-dark">
                                                                            {c.locadorDni || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">CUIL</span>
                                                                        <span className="text-dark">
                                                                            {c.locadorCuil || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">Email</span>
                                                                        <span
                                                                            className="text-dark text-end"
                                                                            style={{
                                                                                maxWidth: "200px",
                                                                                overflowWrap: "break-word"
                                                                            }}
                                                                        >
                                                                            {c.locadorEmail || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">Tel. 1</span>
                                                                        <span className="text-dark">
                                                                            {c.locadorTelefono1 || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">Tel. 2</span>
                                                                        <span className="text-dark">
                                                                            {c.locadorTelefono2 || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div
                                                                        className="mt-3 p-2 rounded"
                                                                        style={{
                                                                            backgroundColor: "#e8f5e9",
                                                                            border: "1px solid #c8e6c9"
                                                                        }}
                                                                    >
                                                                        <div className="text-muted small">
                                                                            Comisión Inmobiliaria
                                                                        </div>

                                                                        <div className="fw-bold text-success">

                                                                            {(() => {

                                                                                const propietario =
                                                                                    clientes?.find(
                                                                                        (cliente) =>
                                                                                            cliente.id === c.locadorId
                                                                                    );

                                                                                const comision =
                                                                                    propietario?.comisionInmobiliaria;

                                                                                return comision !== undefined &&
                                                                                    comision !== null &&
                                                                                    comision !== ""
                                                                                    ? `${comision}%`
                                                                                    : "No registrado";

                                                                            })()}

                                                                        </div>
                                                                    </div>

                                                                </div>

                                                            </div>

                                                        </div>



                                                        {/* GARANTE 1 */}
                                                        <div className="col-md-3">

                                                            <div className="border rounded-3 p-3 h-100 bg-white shadow-sm">

                                                                <h6 className="fw-semibold text-dark mb-3">
                                                                    <i className="bi bi-shield-check me-2 text-warning"></i>
                                                                    Garante 1
                                                                </h6>

                                                                <div className="small">

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">Nombre</span>
                                                                        <span className="fw-semibold text-dark">
                                                                            {c.garante || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">DNI</span>
                                                                        <span className="text-dark">
                                                                            {c.garanteDni || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">CUIL</span>
                                                                        <span className="text-dark">
                                                                            {c.garanteCuil || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">Email</span>
                                                                        <span
                                                                            className="text-dark text-end"
                                                                            style={{
                                                                                maxWidth: "200px",
                                                                                overflowWrap: "break-word"
                                                                            }}
                                                                        >
                                                                            {c.garanteEmail || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">Tel. 1</span>
                                                                        <span className="text-dark">
                                                                            {c.garanteTelefono1 || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between">
                                                                        <span className="text-muted">Tel. 2</span>
                                                                        <span className="text-dark">
                                                                            {c.garanteTelefono2 || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                </div>

                                                            </div>

                                                        </div>

                                                        {/* GARANTE 2 */}
                                                        <div className="col-md-3">

                                                            <div className="border rounded-3 p-3 h-100 bg-white shadow-sm">

                                                                <h6 className="fw-semibold text-dark mb-3">
                                                                    <i className="bi bi-shield-check me-2 text-secondary"></i>
                                                                    Garante 2
                                                                </h6>

                                                                <div className="small">

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">Nombre</span>
                                                                        <span className="fw-semibold text-dark">
                                                                            {c.garante2 || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">DNI</span>
                                                                        <span className="text-dark">
                                                                            {c.garante2Dni || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">CUIL</span>
                                                                        <span className="text-dark">
                                                                            {c.garante2Cuil || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">Email</span>
                                                                        <span
                                                                            className="text-dark text-end"
                                                                            style={{
                                                                                maxWidth: "200px",
                                                                                overflowWrap: "break-word"
                                                                            }}
                                                                        >
                                                                            {c.garante2Email || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between border-bottom pb-2 mb-2">
                                                                        <span className="text-muted">Tel. 1</span>
                                                                        <span className="text-dark">
                                                                            {c.garante2Telefono1 || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between">
                                                                        <span className="text-muted">Tel. 2</span>
                                                                        <span className="text-dark">
                                                                            {c.garante2Telefono2 || "No registrado"}
                                                                        </span>
                                                                    </div>

                                                                </div>

                                                            </div>

                                                        </div>
                                                        {/* DETALLES CONTRACTUALES */}
                                                        <div className="col-md-4">

                                                            <div className="border rounded-3 p-3 h-100 bg-white shadow-sm">

                                                                <h6 className="fw-semibold text-dark mb-3">
                                                                    <i className="bi bi-journal-text me-2 text-primary"></i>
                                                                    Detalles Contractuales
                                                                </h6>

                                                                <div
                                                                    className="small text-dark"
                                                                    style={{
                                                                        whiteSpace: "pre-wrap",
                                                                        lineHeight: "1.6"
                                                                    }}
                                                                >
                                                                    {c.detalles || "Sin detalles registrados"}
                                                                </div>

                                                            </div>

                                                        </div>

                                                        {/* ACUERDOS */}
                                                        <div className="col-md-8">

                                                            <div className="border rounded-3 p-3 h-100 bg-white shadow-sm">

                                                                <h6 className="fw-semibold text-dark mb-3">
                                                                    <i className="bi bi-card-checklist me-2 text-success"></i>
                                                                    Acuerdos
                                                                </h6>

                                                                <div
                                                                    className="small text-dark"
                                                                    style={{
                                                                        whiteSpace: "pre-wrap",
                                                                        lineHeight: "1.6"
                                                                    }}
                                                                >
                                                                    {c.acuerdos || "Sin acuerdos registrados"}
                                                                </div>

                                                            </div>

                                                        </div>

                                                        {/* CLÁUSULAS */}
                                                        <div className="col-md-4">

                                                            <div className="border rounded-3 p-3 h-100 bg-white shadow-sm">

                                                                <h6 className="fw-semibold text-dark mb-3">
                                                                    <i className="bi bi-file-earmark-text me-2 text-secondary"></i>
                                                                    Cláusulas
                                                                </h6>

                                                                <div
                                                                    className="small text-dark"
                                                                    style={{
                                                                        whiteSpace: "pre-wrap",
                                                                        lineHeight: "1.6"
                                                                    }}
                                                                >
                                                                    {c.clausulas || "Sin cláusulas registradas"}
                                                                </div>

                                                            </div>

                                                        </div>

                                                        {/* OBSERVACIONES */}
                                                        <div className="col-md-4">

                                                            <div className="border rounded-3 p-3 h-100 bg-white shadow-sm">

                                                                <h6 className="fw-semibold text-dark mb-3">
                                                                    <i className="bi bi-chat-left-text me-2 text-warning"></i>
                                                                    Observaciones
                                                                </h6>

                                                                <div
                                                                    className="small text-dark"
                                                                    style={{
                                                                        whiteSpace: "pre-wrap",
                                                                        lineHeight: "1.6"
                                                                    }}
                                                                >
                                                                    {c.observaciones || "Sin observaciones"}
                                                                </div>

                                                            </div>

                                                        </div>

                                                        {/* ÍNDICE DE ACTUALIZACIÓN */}
                                                        <div className="col-md-4">

                                                            <div className="border rounded-3 p-3 h-100 bg-white shadow-sm">

                                                                <h6 className="fw-semibold text-dark mb-3">
                                                                    <i className="bi bi-graph-up-arrow me-2 text-info"></i>
                                                                    Índice de Actualización
                                                                </h6>

                                                                <div
                                                                    className="rounded p-3 text-center"
                                                                    style={{
                                                                        backgroundColor: "#e7f5ff",
                                                                        border: "1px solid #b6e0fe"
                                                                    }}
                                                                >
                                                                    <div className="small text-muted mb-1">
                                                                        Índice Aplicado
                                                                    </div>

                                                                    <div className="fw-bold fs-5 text-info">
                                                                        {c.indiceActualizacion || "No definido"}
                                                                    </div>
                                                                </div>

                                                            </div>

                                                        </div>
                                                        {/* INTERÉS POR MORA */}
                                                        <div className="col-md-4">

                                                            <div className="border rounded-3 p-3 h-100 bg-white shadow-sm">

                                                                <h6 className="fw-semibold text-dark mb-3">
                                                                    <i className="bi bi-percent me-2 text-danger"></i>
                                                                    Interés por Mora Diario
                                                                </h6>

                                                                <div
                                                                    className="rounded p-3 text-center"
                                                                    style={{
                                                                        backgroundColor: "#fff5f5",
                                                                        border: "1px solid #fecaca"
                                                                    }}
                                                                >
                                                                    <div className="small text-muted mb-1">
                                                                        Tasa Aplicada
                                                                    </div>

                                                                    <div className="fw-bold fs-4 text-danger">
                                                                        {c.interesMoraDiario || 0}%
                                                                    </div>

                                                                    <small className="text-muted">
                                                                        Por cada día de atraso
                                                                    </small>
                                                                </div>

                                                            </div>

                                                        </div>

                                                        {/* ARCHIVO DEL CONTRATO */}
                                                        <div className="col-md-8">

                                                            <div className="border rounded-3 p-3 h-100 bg-white shadow-sm">

                                                                <h6 className="fw-semibold text-dark mb-3">
                                                                    <i className="bi bi-paperclip me-2"></i>
                                                                    Archivo del Contrato
                                                                </h6>

                                                                {c.archivoUrl ? (

                                                                    <div
                                                                        className="d-flex align-items-center justify-content-between p-3 rounded"
                                                                        style={{
                                                                            backgroundColor: "#f8f9fa",
                                                                            border: "1px solid #dee2e6"
                                                                        }}
                                                                    >

                                                                        <div>
                                                                            <div className="fw-semibold text-dark">
                                                                                <i className="bi bi-file-earmark-pdf text-danger me-2"></i>
                                                                                Contrato PDF
                                                                            </div>

                                                                            <small className="text-muted">
                                                                                Documento cargado correctamente
                                                                            </small>
                                                                        </div>

                                                                        <a
                                                                            href={c.archivoUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="btn btn-outline-dark btn-sm"
                                                                        >
                                                                            <i className="bi bi-eye me-1"></i>
                                                                            Ver PDF
                                                                        </a>

                                                                    </div>

                                                                ) : (

                                                                    <div
                                                                        className="text-center p-4 rounded"
                                                                        style={{
                                                                            border: "2px dashed #ced4da",
                                                                            backgroundColor: "#fafafa"
                                                                        }}
                                                                    >

                                                                        <i
                                                                            className="bi bi-cloud-upload text-primary"
                                                                            style={{ fontSize: "2rem" }}
                                                                        ></i>

                                                                        <div className="mt-2 mb-3 text-muted">
                                                                            No hay archivo cargado
                                                                        </div>

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

                                                                    </div>

                                                                )}

                                                            </div>

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