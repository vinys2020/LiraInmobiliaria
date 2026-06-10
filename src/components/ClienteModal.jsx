import { useState, useEffect } from "react";
import {
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "firebase/firestore";
import { guardarRecibo } from "../utils/recibos";

import GenerarRecibo from "../components/GenerarRecibo";

import { db } from "../config/firebase";

import toast from "react-hot-toast";

export default function ClienteModal({

    showClienteModal,
    setShowClienteModal,

    clienteSeleccionado,
    setClienteSeleccionado,

    modoEdicion,
    setModoEdicion,

    formEdicion,
    setFormEdicion,

    liqEditando,
    setLiqEditando,

    liqForm,
    setLiqForm,

    pagoEditando,
    setPagoEditando,

    pagoForm,
    setPagoForm,

    formatCurrency

}) {


    if (!showClienteModal || !clienteSeleccionado) return null;

    const cleanValue = (value) => {

        if (
            value === undefined ||
            value === null ||
            value === "" ||
            value === "-"
        ) {
            return null;
        }

        return String(value).trim();
    };

    const calcularInteresAutomatico = (pago) => {

        const hoy = new Date(); // 1 junio 2026
        hoy.setHours(0, 0, 0, 0);

        const anio = Number(pago.anio);
        const mes = Number(pago.mes) - 1;
        // 🔥 inicio del mes de deuda (1 del mes vencido)
        const inicioMes = new Date(anio, mes, 1);
        inicioMes.setHours(0, 0, 0, 0);

        // si todavía no llegó ese mes → sin interés
        if (hoy < inicioMes) return 0;

        // 🔥 FIN REAL: hoy
        const fin = new Date(hoy);
        fin.setHours(0, 0, 0, 0);

        // 🔥 diferencia en días EXACTA
        const diasMora = Math.floor(
            (fin - inicioMes) / (1000 * 60 * 60 * 24)
        ) + 1;

        const montoBase = Number(pago.montoBase || 0);

        const interes = montoBase * (diasMora / 100);



        return interes;
    };

    const normalizeLiquidacion = (p) => {



        return {

            tipo: "liquidacion",

            esLiquidacion: true,

            id: p.id,

            // =========================
            // PERSONAS
            // =========================

            // ✅ PROPIETARIO
            locadorNombre:
                p.locadorNombre ||
                p.propietarioNombre ||
                p.clienteNombre ||
                "Propietario sin nombre",

            // ✅ INQUILINO

            locatarioNombre:
                p.locatarioNombre ||
                p.inquilinoNombre ||
                p.nombreInquilino ||
                p.inquilino?.nombre ||
                "Inquilino sin nombre",

            // ✅ CLIENTE DEL RECIBO
            clienteNombre:
                p.clienteNombre ||
                p.locadorNombre ||
                p.propietarioNombre ||
                "Propietario sin nombre",

            // =========================
            // MONTOS
            // =========================

            montoBase:
                Number(p.montoCobrado || 0),

            servicios:
                Number(p.servicios || 0),

            interesGenerado:
                Number(p.interesGenerado || 0),

            administracion:
                Number(p.montoComision || 0),

            montoFinal:
                Number(
                    p.montoLiquidado ??
                    (
                        Number(p.montoCobrado || 0) +
                        Number(p.montoComision || 0)
                    )
                ),

            montoLetras:
                p.montoLetras || "",

            // =========================
            // FECHAS
            // =========================

            fechaCobro:
                p.fechaLiquidacion ??
                p.fechaCobro ??
                new Date().toISOString().split("T")[0],

            periodoNumero:
                p.periodoNumero || "-",

            mes:
                p.mes ?? null,

            anio:
                p.anio ?? null,

            numeroCuota:
                p.numeroCuota ?? "-",

            totalCuotas:
                p.totalCuotas ?? "-",

            numeroRecibo:
                p.numeroRecibo ??
                `REC-${Date.now()}`,

            // =========================
            // PROPIEDAD
            // =========================

            propiedadTitulo:
                p.propiedadTitulo ||
                "Sin Propiedad",

            propiedadDireccion: {

                calle:
                    p.propiedadDireccion?.calle ||
                    p.propiedadTitulo ||
                    "Sin Dirección",

                localidad:
                    p.propiedadDireccion?.localidad ||
                    "-",

                provincia:
                    p.propiedadDireccion?.provincia ||
                    "-",
            },
        };
    };

    const [modalCobro, setModalCobro] = useState(false);
    const [tipoModal, setTipoModal] = useState("pago"); // "pago" o "liquidacion"
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null);

    const [cobroForm, setCobroForm] = useState({

        // =========================
        // MONTOS
        // =========================

        montoBase: 0,

        interesGenerado: 0,

        servicios: 0,


        descuento: 0,

        montoFinal: 0,

        // =========================
        // COBRO
        // =========================

        metodoPago: "Efectivo",

        estado: "pagado",

        fechaCobro: new Date(),

        numeroRecibo: "",

        numeroOperacion: "",



        // =========================
        // OBSERVACIONES
        // =========================

        observaciones: "",

        notasInternas: "",

        // =========================
        // AUDITORIA
        // =========================

        createdAt: new Date(),

        updatedAt: new Date(),
    });

    return (
        <>

            <div className="modal d-block">
                <div className="modal-dialog modal-xl modal-dialog-centered ">
                    <div className="modal-content border-0 shadow-lg">

                        {showClienteModal && clienteSeleccionado && (

                            <>
                                <div className="modal-backdrop fade show"></div>

                                <div className="modal d-block">
                                    <div
                                        className="modal-dialog modal-dialog-centered "
                                        style={{
                                            maxWidth: "98vw",
                                            width: "1800px",
                                            overflowX: "hidden"
                                        }}
                                    >
                                        <div className="modal-content border-0 shadow-lg">

                                            {/* ====================================== */}
                                            {/* HEADER */}
                                            {/* ====================================== */}

                                            <div className="modal-header bg-dark text-white">

                                                <div>

                                                    <h4 className="modal-title fw-bold mb-1">
                                                        {clienteSeleccionado.tipo}
                                                    </h4>

                                                    <small className="opacity-75">
                                                        Información completa del cliente
                                                    </small>

                                                </div>

                                                <button
                                                    className="btn-close btn-close-white"
                                                    onClick={() =>
                                                        setShowClienteModal(false)
                                                    }
                                                ></button>

                                            </div>

                                            {/* ====================================== */}
                                            {/* BODY */}
                                            {/* ====================================== */}

                                            <div className="modal-body">

                                                <div className="row g-2">

                                                    {/* ================================= */}
                                                    {/* DATOS CLIENTE */}
                                                    {/* ================================= */}

                                                    <div className="col-lg-3">

                                                        <div className="card border-0 shadow-sm h-100">

                                                            <div className="card-body">

                                                                <div className="text-center mb-4">

                                                                    <img
                                                                        src={
                                                                            clienteSeleccionado.imagenPerfil ||
                                                                            "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                                                        }
                                                                        alt=""
                                                                        className="rounded-circle border"
                                                                        style={{
                                                                            width: 110,
                                                                            height: 110,
                                                                            objectFit: "cover"
                                                                        }}
                                                                    />

                                                                    <h4 className="mt-3 fw-bold">
                                                                        {modoEdicion ? (
                                                                            <input
                                                                                className="form-control text-center fw-bold"
                                                                                value={formEdicion?.nombre || ""}
                                                                                onChange={(e) =>
                                                                                    setFormEdicion({
                                                                                        ...formEdicion,
                                                                                        nombre: e.target.value,
                                                                                    })
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            clienteSeleccionado.nombre || "-"
                                                                        )}
                                                                    </h4>

                                                                    <span className="badge bg-primary">
                                                                        {clienteSeleccionado.tipo}
                                                                    </span>

                                                                </div>

                                                                <hr />

                                                                <div className="mb-3">
                                                                    <strong>DNI:</strong>

                                                                    <div>
                                                                        {modoEdicion ? (
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                value={formEdicion?.dni || ""}
                                                                                onChange={(e) =>
                                                                                    setFormEdicion({
                                                                                        ...formEdicion,
                                                                                        dni: e.target.value,
                                                                                    })
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            clienteSeleccionado.dni || "-"
                                                                        )}
                                                                    </div>
                                                                </div>



                                                                <div className="mb-3">
                                                                    <strong>Email:</strong>

                                                                    <div>
                                                                        {modoEdicion ? (
                                                                            <input
                                                                                type="email"
                                                                                className="form-control"
                                                                                value={formEdicion?.email || ""}
                                                                                onChange={(e) =>
                                                                                    setFormEdicion({
                                                                                        ...formEdicion,
                                                                                        email: e.target.value,
                                                                                    })
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            clienteSeleccionado.email || "-"
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="mb-3">
                                                                    <strong>Teléfono 1:</strong>

                                                                    <div>
                                                                        {modoEdicion ? (
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                value={formEdicion?.telefono1 || ""}
                                                                                onChange={(e) =>
                                                                                    setFormEdicion({
                                                                                        ...formEdicion,
                                                                                        telefono1: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            clienteSeleccionado.telefono1 || "-"
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="mb-3">
                                                                    <strong>Teléfono 2:</strong>

                                                                    <div>
                                                                        {modoEdicion ? (
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                value={formEdicion?.telefono2 || ""}
                                                                                onChange={(e) =>
                                                                                    setFormEdicion({
                                                                                        ...formEdicion,
                                                                                        telefono2: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            clienteSeleccionado.telefono2 || "-"
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <strong>Depósito:</strong>
                                                                    <div>
                                                                        {clienteSeleccionado.deposito || "No registrado"}
                                                                    </div>
                                                                </div>
                                                                <div className="mb-3">
                                                                    <strong>Estado:</strong>

                                                                    <div>
                                                                        {clienteSeleccionado.estado
                                                                            ? (
                                                                                <span className="badge bg-success">
                                                                                    Activo
                                                                                </span>
                                                                            )
                                                                            : (
                                                                                <span className="badge bg-danger">
                                                                                    Inactivo
                                                                                </span>
                                                                            )}
                                                                    </div>

                                                                </div>

                                                                <div className="mb-3">
                                                                    <strong>Roles:</strong>

                                                                    <div className="d-flex flex-wrap gap-2 mt-2">

                                                                        {clienteSeleccionado.roles?.map(
                                                                            (rol, index) => (
                                                                                <span
                                                                                    key={index}
                                                                                    className="badge bg-dark"
                                                                                >
                                                                                    {rol}
                                                                                </span>
                                                                            )
                                                                        )}

                                                                    </div>

                                                                </div>

                                                                <div>
                                                                    <strong>Observaciones:</strong>

                                                                    <div className="mt-2">
                                                                        {modoEdicion ? (
                                                                            <textarea
                                                                                className="form-control"
                                                                                rows="3"
                                                                                value={formEdicion?.observaciones || ""}
                                                                                onChange={(e) =>
                                                                                    setFormEdicion({
                                                                                        ...formEdicion,
                                                                                        observaciones: e.target.value,
                                                                                    })
                                                                                }
                                                                            />
                                                                        ) : (
                                                                            <div className="text-muted">
                                                                                {clienteSeleccionado.observaciones || "Sin observaciones"}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </div>

                                                    </div>

                                                    {/* ================================= */}
                                                    {/* LIQUIDACIONES / PAGOS */}
                                                    {/* ================================= */}

                                                    <div className="col-lg-9">
                                                        {/* ============================= */}
                                                        {/* LIQUIDACIONES */}
                                                        {/* ============================= */}

                                                        {clienteSeleccionado.tipo === "Locador" && (

                                                            <div className="card border-0 shadow-sm mb-4">

                                                                <div className="card-header bg-success text-white">
                                                                    <h5 className="mb-0">Liquidaciones</h5>
                                                                </div>

                                                                <div className="card-body p-0">

                                                                    {Array.isArray(clienteSeleccionado.liquidaciones) &&
                                                                        clienteSeleccionado.liquidaciones.length > 0 ? (

                                                                        <div className="table-responsive">

                                                                            <table className="table table-hover align-middle mb-0">

                                                                                <thead className="table-light">
                                                                                    <tr>
                                                                                        <th>Periodo</th>
                                                                                        <th>Fecha</th>
                                                                                        <th>Monto</th>
                                                                                        <th>Administración</th>
                                                                                        <th>Total</th>
                                                                                        <th>Estado</th>
                                                                                        <th>Acciones</th>
                                                                                    </tr>
                                                                                </thead>

                                                                                <tbody>

                                                                                    {[...(clienteSeleccionado.liquidaciones || [])]
                                                                                        .sort((a, b) => {
                                                                                            if (a.anio !== b.anio) return a.anio - b.anio;
                                                                                            return a.mes - b.mes;
                                                                                        })
                                                                                        .map((liq) => {

                                                                                            const editando = liqEditando === liq.id;


                                                                                            return (
                                                                                                <tr key={liq.id}>

                                                                                                    {/* PERIODO */}
                                                                                                    <td>
                                                                                                        <span className="fw-bold">
                                                                                                            #{liq.periodoNumero || "-"}
                                                                                                        </span>
                                                                                                    </td>

                                                                                                    {/* FECHA */}
                                                                                                    <td>
                                                                                                        <span className="text-muted">
                                                                                                            {String(liq.mes).padStart(2, "0")}/{liq.anio}
                                                                                                        </span>
                                                                                                    </td>

                                                                                                    {/* MONTO */}
                                                                                                    <td>
                                                                                                        {editando ? (
                                                                                                            <input
                                                                                                                type="number"
                                                                                                                className="form-control form-control-sm"
                                                                                                                value={liqForm?.montoCobrado ?? 0}
                                                                                                                onChange={(e) => {
                                                                                                                    const montoCobrado = Number(e.target.value);

                                                                                                                    setLiqForm((prev) => ({
                                                                                                                        ...(prev || {}),
                                                                                                                        montoCobrado,
                                                                                                                        montoLiquidado:
                                                                                                                            montoCobrado +
                                                                                                                            Number(prev?.montoComision || 0),
                                                                                                                    }));
                                                                                                                }}
                                                                                                            />
                                                                                                        ) : (
                                                                                                            formatCurrency(liq.montoCobrado || 0)
                                                                                                        )}
                                                                                                    </td>

                                                                                                    {/* COMISIÓN */}
                                                                                                    <td>
                                                                                                        {editando ? (
                                                                                                            <input
                                                                                                                type="number"
                                                                                                                className="form-control form-control-sm"
                                                                                                                value={liqForm?.montoComision ?? 0}
                                                                                                                onChange={(e) => {
                                                                                                                    const montoComision = Number(e.target.value);

                                                                                                                    setLiqForm((prev) => ({
                                                                                                                        ...(prev || {}),
                                                                                                                        montoComision,
                                                                                                                        montoLiquidado:
                                                                                                                            Number(prev?.montoCobrado || 0) +
                                                                                                                            montoComision,
                                                                                                                    }));
                                                                                                                }}
                                                                                                            />
                                                                                                        ) : (
                                                                                                            formatCurrency(liq.montoComision || 0)
                                                                                                        )}
                                                                                                    </td>

                                                                                                    {/* TOTAL */}
                                                                                                    <td className="fw-bold text-success">
                                                                                                        {editando ? (
                                                                                                            <input
                                                                                                                type="number"
                                                                                                                className="form-control form-control-sm"
                                                                                                                value={
                                                                                                                    liqForm?.montoLiquidado ??
                                                                                                                    (
                                                                                                                        Number(liqForm?.montoCobrado || 0) +
                                                                                                                        Number(liqForm?.montoComision || 0)
                                                                                                                    )
                                                                                                                }
                                                                                                                onChange={(e) =>
                                                                                                                    setLiqForm((prev) => ({
                                                                                                                        ...(prev || {}),
                                                                                                                        montoLiquidado: Number(e.target.value),
                                                                                                                    }))
                                                                                                                }
                                                                                                            />
                                                                                                        ) : (
                                                                                                            formatCurrency(
                                                                                                                liq.montoLiquidado ??
                                                                                                                (
                                                                                                                    Number(liq.montoCobrado || 0) +
                                                                                                                    Number(liq.montoComision || 0)
                                                                                                                )
                                                                                                            )
                                                                                                        )}
                                                                                                    </td>

                                                                                                    {/* ESTADO */}
                                                                                                    <td>
                                                                                                        {editando ? (
                                                                                                            <select
                                                                                                                className="form-select form-select-sm"
                                                                                                                value={liqForm?.estado || "pendiente"}
                                                                                                                onChange={(e) =>
                                                                                                                    setLiqForm((prev) => ({
                                                                                                                        ...(prev || {}),
                                                                                                                        estado: e.target.value,
                                                                                                                    }))
                                                                                                                }
                                                                                                            >
                                                                                                                <option value="pendiente">Pendiente</option>
                                                                                                                <option value="pagado">Pagado</option>
                                                                                                                <option value="vencido">Vencido</option>
                                                                                                            </select>
                                                                                                        ) : (
                                                                                                            <span
                                                                                                                className={`badge ${liq.estado === "pagado"
                                                                                                                    ? "bg-success"
                                                                                                                    : liq.estado === "vencido"
                                                                                                                        ? "bg-danger"
                                                                                                                        : "bg-warning text-dark"
                                                                                                                    }`}
                                                                                                            >
                                                                                                                {liq.estado || "pendiente"}
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </td>

                                                                                                    {/* ACCIONES */}
                                                                                                    <td>

                                                                                                        {editando ? (

                                                                                                            <div className="d-flex gap-1">

                                                                                                                <button
                                                                                                                    className="btn btn-sm btn-success"
                                                                                                                    onClick={async () => {

                                                                                                                        const dataUpdate = {
                                                                                                                            montoCobrado: Number(liqForm?.montoCobrado || 0),
                                                                                                                            montoComision: Number(liqForm?.montoComision || 0),
                                                                                                                            montoLiquidado:
                                                                                                                                Number(liqForm?.montoLiquidado) ||
                                                                                                                                Number(liqForm?.montoCobrado || 0) +
                                                                                                                                Number(liqForm?.montoComision || 0),
                                                                                                                            estado: liqForm?.estado || "pendiente",
                                                                                                                            updatedAt: serverTimestamp(),
                                                                                                                        };

                                                                                                                        await updateDoc(
                                                                                                                            doc(db, "Liquidaciones", liq.id),
                                                                                                                            dataUpdate
                                                                                                                        );

                                                                                                                        setClienteSeleccionado((prev) => ({
                                                                                                                            ...prev,
                                                                                                                            liquidaciones: prev.liquidaciones.map((l) =>
                                                                                                                                l.id === liq.id
                                                                                                                                    ? { ...l, ...dataUpdate }
                                                                                                                                    : l
                                                                                                                            ),
                                                                                                                        }));

                                                                                                                        setLiqEditando(null);
                                                                                                                        setLiqForm(null);

                                                                                                                        toast.success("Liquidación actualizada");
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Guardar
                                                                                                                </button>

                                                                                                                <button
                                                                                                                    className="btn btn-sm btn-secondary"
                                                                                                                    onClick={() => {
                                                                                                                        setLiqEditando(null);
                                                                                                                        setLiqForm(null);
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Cancelar
                                                                                                                </button>

                                                                                                            </div>

                                                                                                        ) : (

                                                                                                            <div className="d-flex gap-2">

                                                                                                                <button
                                                                                                                    className="btn btn-sm btn-outline-primary"
                                                                                                                    onClick={() => {
                                                                                                                        setLiqEditando(liq.id);

                                                                                                                        setLiqForm({
                                                                                                                            montoCobrado: liq.montoCobrado || 0,
                                                                                                                            montoComision: liq.montoComision || 0,
                                                                                                                            montoLiquidado: liq.montoLiquidado || 0,
                                                                                                                            estado: liq.estado || "pendiente",
                                                                                                                        });
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Editar
                                                                                                                </button>

                                                                                                                <button
                                                                                                                    className="btn btn-sm btn-success"
                                                                                                                    onClick={() => {

                                                                                                                        const p = normalizeLiquidacion(liq);

                                                                                                                        // ✅ NORMALIZACIÓN FINAL
                                                                                                                        const liquidacionData = {

                                                                                                                            ...p,

                                                                                                                            tipo: "liquidacion",

                                                                                                                            contratoId: p.contratoId || "",




                                                                                                                            // ✅ PROPIETARIO / CLIENTE
                                                                                                                            clienteNombre:
                                                                                                                                p.clienteNombre ||
                                                                                                                                p.locadorNombre ||
                                                                                                                                "Propietario sin nombre",

                                                                                                                            locadorNombre:
                                                                                                                                p.locadorNombre ||
                                                                                                                                p.clienteNombre ||
                                                                                                                                "Propietario sin nombre",

                                                                                                                            // ✅ INQUILINO
                                                                                                                            locatarioNombre:
                                                                                                                                p.locatarioNombre ||
                                                                                                                                "Inquilino sin nombre",

                                                                                                                            // ✅ DIRECCIÓN
                                                                                                                            propiedadDireccion: {
                                                                                                                                calle:
                                                                                                                                    p.propiedadDireccion?.calle ||
                                                                                                                                    p.propiedadTitulo ||
                                                                                                                                    "Sin calle",

                                                                                                                                localidad:
                                                                                                                                    p.propiedadDireccion?.localidad ||
                                                                                                                                    "-",

                                                                                                                                provincia:
                                                                                                                                    p.propiedadDireccion?.provincia ||
                                                                                                                                    "-",
                                                                                                                            },

                                                                                                                            // ✅ MONTOS
                                                                                                                            montoBase:
                                                                                                                                p.montoBase ??
                                                                                                                                p.montoLiquidado ??
                                                                                                                                0,

                                                                                                                            montoFinal:
                                                                                                                                p.montoFinal ??
                                                                                                                                p.montoLiquidado ??
                                                                                                                                0,

                                                                                                                            administracion:
                                                                                                                                p.administracion ??
                                                                                                                                p.montoComision ??
                                                                                                                                0,

                                                                                                                            servicios:
                                                                                                                                p.servicios ?? 0,

                                                                                                                            interesGenerado:
                                                                                                                                p.interesGenerado ?? 0,
                                                                                                                        };



                                                                                                                        setPagoSeleccionado(liquidacionData);

                                                                                                                        setTipoModal("liquidacion");

                                                                                                                        setCobroForm({

                                                                                                                            montoBase:
                                                                                                                                liquidacionData.montoBase,

                                                                                                                            interesGenerado:
                                                                                                                                liquidacionData.interesGenerado,

                                                                                                                            servicios:
                                                                                                                                liquidacionData.servicios,

                                                                                                                            administracion:
                                                                                                                                liquidacionData.administracion,

                                                                                                                            montoFinal:
                                                                                                                                liquidacionData.montoFinal,

                                                                                                                            metodoPago: "Transferencia",

                                                                                                                            observaciones: "",

                                                                                                                            fechaCobro: new Date(),

                                                                                                                            numeroRecibo:
                                                                                                                                liquidacionData.numeroRecibo || "",

                                                                                                                            estado:
                                                                                                                                liquidacionData.estado || "pendiente",
                                                                                                                        });

                                                                                                                        setModalCobro(true);
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Liquidar
                                                                                                                </button>
                                                                                                                <button
                                                                                                                    className="btn btn-sm btn-outline-success"
                                                                                                                    onClick={() => {

                                                                                                                        // 🔥 PAGO RELACIONADO (opcional)
                                                                                                                        const pagoRelacionado =
                                                                                                                            clienteSeleccionado?.pagos?.find(
                                                                                                                                (p) => p.periodoNumero === liq.periodoNumero
                                                                                                                            );


                                                                                                                        // =========================
                                                                                                                        // RECIBO CONSOLIDADO
                                                                                                                        // =========================
                                                                                                                        const datosRecibo = {
                                                                                                                            ...liq,

                                                                                                                            tipo: "liquidacion",
                                                                                                                            esLiquidacion: true,



                                                                                                                            // =========================
                                                                                                                            // PROPIETARIO
                                                                                                                            // =========================
                                                                                                                            clienteNombre:
                                                                                                                                clienteSeleccionado?.nombre ||
                                                                                                                                liq.locadorNombre ||
                                                                                                                                "Propietario sin nombre",

                                                                                                                            locadorNombre:
                                                                                                                                clienteSeleccionado?.nombre ||
                                                                                                                                liq.locadorNombre ||
                                                                                                                                "Propietario sin nombre",

                                                                                                                            // =========================
                                                                                                                            // INQUILINO (FIX REAL)
                                                                                                                            // =========================
                                                                                                                            locatarioNombre:
                                                                                                                                liq.locatarioNombre ||
                                                                                                                                liq.inquilino?.nombre ||
                                                                                                                                pagoRelacionado?.locatarioNombre ||
                                                                                                                                pagoRelacionado?.inquilinoNombre ||
                                                                                                                                "Inquilino sin nombre",

                                                                                                                            // =========================
                                                                                                                            // IDS (CLAVE PARA FILTRADO)
                                                                                                                            // =========================
                                                                                                                            locatarioId:
                                                                                                                                liq.locatarioId ||
                                                                                                                                liq.inquilinoId ||
                                                                                                                                pagoRelacionado?.locatarioId ||
                                                                                                                                clienteSeleccionado?.id,

                                                                                                                            locadorId:
                                                                                                                                liq.locadorId ||
                                                                                                                                clienteSeleccionado?.id,

                                                                                                                            // =========================
                                                                                                                            // MONTOS
                                                                                                                            // =========================
                                                                                                                            montoBase: Number(liq.montoCobrado || 0),

                                                                                                                            administracion: Number(liq.montoComision || 0),

                                                                                                                            montoFinal:
                                                                                                                                Number(liq.montoLiquidado || 0) ||
                                                                                                                                Number(liq.montoCobrado || 0),

                                                                                                                            servicios: 0,
                                                                                                                            interesGenerado: 0,

                                                                                                                            // =========================
                                                                                                                            // PROPIEDAD
                                                                                                                            // =========================
                                                                                                                            propiedadDireccion: {
                                                                                                                                calle: liq.propiedadDireccion?.calle || "Sin Dirección",
                                                                                                                                localidad: liq.propiedadDireccion?.localidad || "-",
                                                                                                                                provincia: liq.propiedadDireccion?.provincia || "-",
                                                                                                                            },

                                                                                                                            // =========================
                                                                                                                            // FECHA
                                                                                                                            // =========================
                                                                                                                            fechaCobro: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
                                                                                                                        };


                                                                                                                        GenerarRecibo(datosRecibo, formatCurrency);
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Crear Recibo
                                                                                                                </button>

                                                                                                                <button
    className="btn btn-sm btn-outline-danger"
    onClick={async () => {

        const confirmar = window.confirm(
            `¿Eliminar la liquidación ${String(liq.mes).padStart(2, "0")}/${liq.anio}?`
        );

        if (!confirmar) return;

        try {

            await deleteDoc(
                doc(db, "Liquidaciones", liq.id)
            );

            setClienteSeleccionado({
                ...clienteSeleccionado,
                liquidaciones: clienteSeleccionado.liquidaciones.filter(
                    (l) => l.id !== liq.id
                ),
            });

            toast.success("Liquidación eliminada");

        } catch (error) {

            console.error(error);
            toast.error("Error al eliminar liquidación");

        }
    }}
>
    Eliminar
</button>
                                                                                                            </div>

                                                                                                        )}

                                                                                                    </td>

                                                                                                </tr>
                                                                                            );
                                                                                        })}

                                                                                </tbody>

                                                                            </table>

                                                                        </div>

                                                                    ) : (

                                                                        <div className="p-4 text-center text-muted">
                                                                            No hay liquidaciones registradas
                                                                        </div>

                                                                    )}

                                                                </div>

                                                            </div>

                                                        )}

                                                        {/* ============================= */}
                                                        {/* PAGOS */}
                                                        {/* ============================= */}

                                                        {clienteSeleccionado.tipo === "Locatario" && (

                                                            <div
                                                                className="card border-0 shadow-sm mb-4"
                                                                style={{
                                                                    height: "900px",
                                                                    width: "1050px",
                                                                    maxWidth: "1350px",

                                                                    overflowY: "auto",
                                                                    overflowX: "auto",

                                                                    padding: "0px",
                                                                }}
                                                            >
                                                                <div className="card-header bg-primary text-white">
                                                                    <h5 className="mb-0">Tabla de Pagos</h5>
                                                                </div>

                                                                <div className="card-body p-0">

                                                                    {clienteSeleccionado.pagos?.length > 0 ? (

                                                                        <div className="table-responsive">

                                                                            <table className="table table-hover align-middle mb-0">

                                                                                <thead className="table-light">
                                                                                    <tr>
                                                                                        <th>Periodo</th>
                                                                                        <th>Fecha</th>
                                                                                        <th>Vencimiento</th>
                                                                                        <th>Monto</th>
                                                                                        <th>Servicios</th>

                                                                                        <th>Interés</th>

                                                                                        <th>Total</th>
                                                                                        <th>Estado</th>
                                                                                        <th>Acciones</th>
                                                                                    </tr>
                                                                                </thead>

                                                                                <tbody>

                                                                                    {[...clienteSeleccionado.pagos]
                                                                                        .sort((a, b) => {

                                                                                            const fechaA =
                                                                                                (a.anio * 100) + a.mes;

                                                                                            const fechaB =
                                                                                                (b.anio * 100) + b.mes;

                                                                                            return fechaA - fechaB;

                                                                                        })
                                                                                        .map((pago) => {
                                                                                            const editando = pagoEditando === pago.id;

                                                                                            return (
                                                                                                <tr key={pago.id}>

                                                                                                    {/* PERIODO */}
                                                                                                    <td>
                                                                                                        <span className="fw-bold">
                                                                                                            #{pago.periodoNumero || "-"}
                                                                                                        </span>
                                                                                                    </td>

                                                                                                    {/* FECHA */}
                                                                                                    <td>
                                                                                                        <span className="text-muted">
                                                                                                            {String(pago.mes).padStart(2, "0")}/{pago.anio}
                                                                                                        </span>
                                                                                                    </td>

                                                                                                    {/* VENCIMIENTO */}
                                                                                                    <td>
                                                                                                        {(() => {

                                                                                                            const f = pago.fechaVencimiento;

                                                                                                            if (!f) return "-";

                                                                                                            const date =
                                                                                                                f?.toDate ? f.toDate() : new Date(f);

                                                                                                            return isNaN(date.getTime())
                                                                                                                ? "-"
                                                                                                                : date.toLocaleDateString("es-AR");

                                                                                                        })()}
                                                                                                    </td>

                                                                                                    {/* MONTO */}
                                                                                                    <td>
                                                                                                        {editando ? (

                                                                                                            <input
                                                                                                                type="number"
                                                                                                                className="form-control form-control-sm"
                                                                                                                value={pagoForm?.montoBase || ""}
                                                                                                                onChange={(e) => {

                                                                                                                    const montoBase = Number(e.target.value);

                                                                                                                    setPagoForm({
                                                                                                                        ...pagoForm,

                                                                                                                        montoBase,

                                                                                                                        montoFinal:
                                                                                                                            montoBase +
                                                                                                                            Number(pagoForm?.interesGenerado || 0),
                                                                                                                    });
                                                                                                                }}
                                                                                                            />

                                                                                                        ) : (

                                                                                                            <span>
                                                                                                                {formatCurrency(pago.montoBase || 0)}
                                                                                                            </span>

                                                                                                        )}
                                                                                                    </td>

                                                                                                    {/* SERVICIOS */}
                                                                                                    <td>
                                                                                                        {editando ? (

                                                                                                            <input
                                                                                                                type="number"
                                                                                                                className="form-control form-control-sm"
                                                                                                                value={pagoForm?.servicios || ""}
                                                                                                                onChange={(e) => {

                                                                                                                    const servicios =
                                                                                                                        Number(e.target.value);

                                                                                                                    setPagoForm({
                                                                                                                        ...pagoForm,

                                                                                                                        servicios,

                                                                                                                        montoFinal:
                                                                                                                            Number(pagoForm?.montoBase || 0) +
                                                                                                                            Number(pagoForm?.interesGenerado || 0) +
                                                                                                                            servicios,
                                                                                                                    });
                                                                                                                }}
                                                                                                            />

                                                                                                        ) : (

                                                                                                            <span className="text-primary">
                                                                                                                {formatCurrency(pago.servicios || 0)}
                                                                                                            </span>

                                                                                                        )}
                                                                                                    </td>




                                                                                                    {/* INTERES */}
                                                                                                    <td>

                                                                                                        {editando ? (

                                                                                                            <div className="d-flex align-items-center gap-2">

                                                                                                                {/* TOGGLE AUTOMÁTICO */}
                                                                                                                <input
                                                                                                                    className="form-check-input"
                                                                                                                    type="checkbox"
                                                                                                                    checked={pagoForm?.interesAutomatico ?? false}
                                                                                                                    title="Interés Automático"
                                                                                                                    onChange={(e) => {

                                                                                                                        const activo = e.target.checked;

                                                                                                                        const interesAuto = activo
                                                                                                                            ? calcularInteresAutomatico({
                                                                                                                                ...pago,
                                                                                                                                ...pagoForm,
                                                                                                                            })
                                                                                                                            : 0;

                                                                                                                        setPagoForm({
                                                                                                                            ...pagoForm,
                                                                                                                            interesAutomatico: activo,
                                                                                                                            interesGenerado: interesAuto,

                                                                                                                            montoFinal:
                                                                                                                                Number(pagoForm?.montoBase || 0) +
                                                                                                                                interesAuto +
                                                                                                                                Number(pagoForm?.servicios || 0),
                                                                                                                        });
                                                                                                                    }}
                                                                                                                />

                                                                                                                {/* INPUT MANUAL */}
                                                                                                                <input
                                                                                                                    type="number"
                                                                                                                    className="form-control form-control-sm"
                                                                                                                    style={{ width: "90px" }}
                                                                                                                    disabled={pagoForm?.interesAutomatico}
                                                                                                                    value={
                                                                                                                        pagoForm?.interesAutomatico
                                                                                                                            ? calcularInteresAutomatico({
                                                                                                                                ...pago,
                                                                                                                                ...pagoForm,
                                                                                                                            })
                                                                                                                            : (pagoForm?.interesGenerado ?? 0)
                                                                                                                    }
                                                                                                                    onChange={(e) => {

                                                                                                                        const interesGenerado = Number(e.target.value);

                                                                                                                        setPagoForm({
                                                                                                                            ...pagoForm,
                                                                                                                            interesAutomatico: false,
                                                                                                                            interesGenerado,

                                                                                                                            montoFinal:
                                                                                                                                Number(pagoForm?.montoBase || 0) +
                                                                                                                                interesGenerado +
                                                                                                                                Number(pagoForm?.servicios || 0),
                                                                                                                        });
                                                                                                                    }}
                                                                                                                />

                                                                                                                {/* BOTÓN RESET */}
                                                                                                                <button
                                                                                                                    type="button"
                                                                                                                    className="btn btn-sm btn-outline-danger px-2"
                                                                                                                    onClick={() =>
                                                                                                                        setPagoForm({
                                                                                                                            ...pagoForm,
                                                                                                                            interesAutomatico: false,
                                                                                                                            interesGenerado: 0,
                                                                                                                            montoFinal:
                                                                                                                                Number(pagoForm?.montoBase || 0) +
                                                                                                                                Number(pagoForm?.servicios || 0),
                                                                                                                        })
                                                                                                                    }
                                                                                                                >
                                                                                                                    0
                                                                                                                </button>

                                                                                                            </div>

                                                                                                        ) : (

                                                                                                            <div className="d-flex align-items-center gap-2">

                                                                                                                {(pago.interesAutomatico ?? false) && (
                                                                                                                    <span
                                                                                                                        className="badge bg-success"
                                                                                                                        title="Interés Automático"
                                                                                                                    >
                                                                                                                        ✓
                                                                                                                    </span>
                                                                                                                )}

                                                                                                                <span className="text-danger fw-bold">
                                                                                                                    {formatCurrency(
                                                                                                                        pago.interesAutomatico
                                                                                                                            ? calcularInteresAutomatico(pago)
                                                                                                                            : (pago.interesGenerado || 0)
                                                                                                                    )}
                                                                                                                </span>

                                                                                                            </div>

                                                                                                        )}

                                                                                                    </td>
                                                                                                    {/* TOTAL */}
                                                                                                    <td className="fw-bold text-success">

                                                                                                        {editando ? (

                                                                                                            <input
                                                                                                                type="number"
                                                                                                                className="form-control form-control-sm"
                                                                                                                value={
                                                                                                                    pagoForm?.montoFinal ??
                                                                                                                    (
                                                                                                                        Number(pagoForm?.montoBase || 0) +
                                                                                                                        Number(pagoForm?.servicios || 0) +
                                                                                                                        (
                                                                                                                            pagoForm?.interesAutomatico
                                                                                                                                ? calcularInteresAutomatico(pago)
                                                                                                                                : Number(pagoForm?.interesGenerado || 0)
                                                                                                                        )
                                                                                                                    )
                                                                                                                }
                                                                                                                onChange={(e) =>
                                                                                                                    setPagoForm({
                                                                                                                        ...pagoForm,
                                                                                                                        montoFinal: Number(e.target.value),
                                                                                                                    })
                                                                                                                }
                                                                                                            />

                                                                                                        ) : (

                                                                                                            formatCurrency(

                                                                                                                Number(pago.montoBase || 0) +
                                                                                                                Number(pago.servicios || 0) +
                                                                                                                (
                                                                                                                    pago.interesAutomatico
                                                                                                                        ? calcularInteresAutomatico(pago)
                                                                                                                        : Number(pago.interesGenerado || 0)
                                                                                                                )

                                                                                                            )

                                                                                                        )}

                                                                                                    </td>

                                                                                                    {/* ESTADO */}
                                                                                                    <td>

                                                                                                        {editando ? (

                                                                                                            <select
                                                                                                                className="form-select form-select-sm"
                                                                                                                value={pagoForm?.estado || "pendiente"}
                                                                                                                onChange={(e) =>
                                                                                                                    setPagoForm({
                                                                                                                        ...pagoForm,
                                                                                                                        estado: e.target.value,
                                                                                                                    })
                                                                                                                }
                                                                                                            >
                                                                                                                <option value="pendiente">Pendiente</option>
                                                                                                                <option value="pagado">Pagado</option>
                                                                                                                <option value="vencido">Vencido</option>
                                                                                                            </select>

                                                                                                        ) : (

                                                                                                            <span
                                                                                                                className={`badge ${pago.estado === "pagado"
                                                                                                                    ? "bg-success"
                                                                                                                    : pago.estado === "vencido"
                                                                                                                        ? "bg-danger"
                                                                                                                        : "bg-warning text-dark"
                                                                                                                    }`}
                                                                                                            >
                                                                                                                {pago.estado}
                                                                                                            </span>

                                                                                                        )}

                                                                                                    </td>

                                                                                                    {/* ACCIONES */}
                                                                                                    <td>

                                                                                                        {editando ? (

                                                                                                            <div className="d-flex gap-1">

                                                                                                                <button
                                                                                                                    className="btn btn-sm btn-success"
                                                                                                                    onClick={async () => {

                                                                                                                        await updateDoc(
                                                                                                                            doc(db, "Pagos", pago.id),
                                                                                                                            {
                                                                                                                                ...pagoForm,
                                                                                                                                updatedAt: serverTimestamp(),
                                                                                                                            }
                                                                                                                        );

                                                                                                                        setClienteSeleccionado({
                                                                                                                            ...clienteSeleccionado,

                                                                                                                            pagos:
                                                                                                                                clienteSeleccionado.pagos.map((p) =>
                                                                                                                                    p.id === pago.id
                                                                                                                                        ? { ...p, ...pagoForm }
                                                                                                                                        : p
                                                                                                                                ),
                                                                                                                        });

                                                                                                                        setPagoEditando(null);
                                                                                                                        setPagoForm(null);

                                                                                                                        toast.success("Pago actualizado");
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Guardar
                                                                                                                </button>

                                                                                                                <button
                                                                                                                    className="btn btn-sm btn-secondary"
                                                                                                                    onClick={() => {
                                                                                                                        setPagoEditando(null);
                                                                                                                        setPagoForm(null);
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Cancelar
                                                                                                                </button>

                                                                                                            </div>

                                                                                                        ) : (

                                                                                                            <div className="d-flex gap-2">

                                                                                                                <button
                                                                                                                    className="btn btn-sm btn-outline-primary"
                                                                                                                    onClick={() => {

                                                                                                                        setPagoEditando(pago.id);

                                                                                                                        setPagoForm({
                                                                                                                            ...pago
                                                                                                                        });
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Editar
                                                                                                                </button>
                                                                                                                <button
                                                                                                                    className="btn btn-sm btn-success"
                                                                                                                    onClick={() => {

                                                                                                                        const pagoNormalizado = {
                                                                                                                            ...pago,

                                                                                                                            tipo: "pago",

                                                                                                                            contratoId: pagoSeleccionado?.contratoId || "",


                                                                                                                            // 🔵 LOCADOR (dueño)
                                                                                                                            clienteNombre:
                                                                                                                                pago.locadorNombre ||
                                                                                                                                pago.propietarioNombre ||
                                                                                                                                pago.clienteNombre ||
                                                                                                                                "Propietario sin nombre",

                                                                                                                            locadorNombre:
                                                                                                                                pago.locadorNombre ||
                                                                                                                                pago.propietarioNombre ||
                                                                                                                                pago.clienteNombre ||
                                                                                                                                "Propietario sin nombre",

                                                                                                                            // 🔴 INQUILINO (QUIEN PAGA)
                                                                                                                            locatarioNombre:
                                                                                                                                pago.locatarioNombre ||
                                                                                                                                pago.inquilinoNombre ||
                                                                                                                                pago.nombreInquilino ||
                                                                                                                                pago.inquilino?.nombre ||
                                                                                                                                pago.clienteInquilino?.nombre ||
                                                                                                                                null, // 👈 IMPORTANTE: no pongas string directo acá

                                                                                                                            propiedadDireccion: {
                                                                                                                                calle:
                                                                                                                                    pago.propiedadDireccion?.calle ||
                                                                                                                                    pago.propiedadTitulo ||
                                                                                                                                    "Sin Dirección",
                                                                                                                                localidad:
                                                                                                                                    pago.propiedadDireccion?.localidad || "-",
                                                                                                                                provincia:
                                                                                                                                    pago.propiedadDireccion?.provincia || "-",
                                                                                                                            },
                                                                                                                        };

                                                                                                                        setPagoSeleccionado(pagoNormalizado);
                                                                                                                        setTipoModal("pago");

                                                                                                                        setCobroForm({
                                                                                                                            montoBase: pagoNormalizado.montoBase || 0,
                                                                                                                            interesGenerado: calcularInteresAutomatico(pago),
                                                                                                                            servicios: pagoNormalizado.servicios || 0,

                                                                                                                            montoFinal:
                                                                                                                                Number(pagoNormalizado.montoBase || 0) +
                                                                                                                                calcularInteresAutomatico(pago) +
                                                                                                                                Number(pagoNormalizado.servicios || 0),

                                                                                                                            metodoPago: "Efectivo",
                                                                                                                            estado: pagoNormalizado.estado || "pendiente",
                                                                                                                            observaciones: "",
                                                                                                                            fechaCobro: new Date(),
                                                                                                                            numeroRecibo: pagoNormalizado.numeroRecibo || "",
                                                                                                                        });

                                                                                                                        setModalCobro(true);
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Cobrar
                                                                                                                </button>
                                                                                                                <button
                                                                                                                    className="btn btn-sm btn-outline-success"
                                                                                                                    onClick={() => {

                                                                                                                        // 🔥 EXACTAMENTE LA MISMA LÓGICA QUE "COBRAR"
                                                                                                                        const pagoRelacionado =
                                                                                                                            clienteSeleccionado?.pagos?.find(
                                                                                                                                (p) => p.periodoNumero === pago.periodoNumero
                                                                                                                            );

                                                                                                                        const pagoNormalizado = {
                                                                                                                            ...pago,

                                                                                                                            tipo: "pago",
                                                                                                                            esLiquidacion: false,

                                                                                                                            contratoId:
                                                                                                                                pago.contratoId ||
                                                                                                                                contratoRecibosInquilino?.id ||
                                                                                                                                "",

                                                                                                                            // =========================
                                                                                                                            // LOCADOR
                                                                                                                            // =========================
                                                                                                                            clienteNombre:
                                                                                                                                pago.locadorNombre ||
                                                                                                                                pago.propietarioNombre ||
                                                                                                                                pago.clienteNombre ||
                                                                                                                                clienteSeleccionado?.nombre ||
                                                                                                                                "Propietario sin nombre",

                                                                                                                            locadorNombre:
                                                                                                                                pago.locadorNombre ||
                                                                                                                                pago.propietarioNombre ||
                                                                                                                                pago.clienteNombre ||
                                                                                                                                clienteSeleccionado?.nombre ||
                                                                                                                                "Propietario sin nombre",

                                                                                                                            locadorId:
                                                                                                                                pago.locadorId ||
                                                                                                                                clienteSeleccionado?.id ||
                                                                                                                                "",

                                                                                                                            // =========================
                                                                                                                            // INQUILINO (🔥 FIX REAL COMO COBRAR)
                                                                                                                            // =========================
                                                                                                                            locatarioNombre:
                                                                                                                                pago.locatarioNombre ||
                                                                                                                                pago.inquilino?.nombre ||
                                                                                                                                pago.inquilinoNombre ||
                                                                                                                                pago.nombreInquilino ||
                                                                                                                                pago.clienteInquilino?.nombre ||
                                                                                                                                pagoRelacionado?.locatarioNombre ||
                                                                                                                                clienteSeleccionado?.nombre ||
                                                                                                                                "Inquilino sin nombre",

                                                                                                                            locatarioId:
                                                                                                                                pago.locatarioId ||
                                                                                                                                pago.inquilinoId ||
                                                                                                                                pagoRelacionado?.locatarioId ||
                                                                                                                                "",

                                                                                                                            // =========================
                                                                                                                            // DIRECCIÓN
                                                                                                                            // =========================
                                                                                                                            propiedadDireccion: {
                                                                                                                                calle:
                                                                                                                                    pago.propiedadDireccion?.calle ||
                                                                                                                                    pago.propiedadTitulo ||
                                                                                                                                    "Sin Dirección",
                                                                                                                                localidad:
                                                                                                                                    pago.propiedadDireccion?.localidad || "-",
                                                                                                                                provincia:
                                                                                                                                    pago.propiedadDireccion?.provincia || "-",
                                                                                                                            },

                                                                                                                            // =========================
                                                                                                                            // MONTOS
                                                                                                                            // =========================
                                                                                                                            montoBase: Number(pago.montoBase || 0),
                                                                                                                            servicios: Number(pago.servicios || 0),
                                                                                                                            interesGenerado: Number(pago.interesGenerado || 0),

                                                                                                                            montoFinal:
                                                                                                                                Number(
                                                                                                                                    pago.montoFinal ??
                                                                                                                                    (
                                                                                                                                        Number(pago.montoBase || 0) +
                                                                                                                                        Number(pago.interesGenerado || 0) +
                                                                                                                                        Number(pago.servicios || 0)
                                                                                                                                    )
                                                                                                                                ),
                                                                                                                        };


                                                                                                                        GenerarRecibo(pagoNormalizado, formatCurrency);
                                                                                                                    }}
                                                                                                                >
                                                                                                                    +R
                                                                                                                </button>


                                                                                                                <button
    className="btn btn-sm btn-outline-danger"
    onClick={async () => {

        const confirmar = window.confirm(
            `¿Eliminar el pago ${String(pago.mes).padStart(2, "0")}/${pago.anio}?`
        );

        if (!confirmar) return;

        try {

            await deleteDoc(doc(db, "Pagos", pago.id));

            setClienteSeleccionado({
                ...clienteSeleccionado,
                pagos: clienteSeleccionado.pagos.filter(
                    (p) => p.id !== pago.id
                ),
            });

            toast.success("Pago eliminado");

        } catch (error) {

            console.error(error);
            toast.error("Error al eliminar pago");

        }
    }}
>
    Eliminar
</button>

                                                                                                            </div>

                                                                                                        )}

                                                                                                    </td>

                                                                                                </tr>
                                                                                            );
                                                                                        })}

                                                                                </tbody>

                                                                            </table>

                                                                        </div>

                                                                    ) : (
                                                                        <div className="p-4 text-center text-muted">
                                                                            No hay pagos registrados
                                                                        </div>
                                                                    )}

                                                                </div>

                                                            </div>

                                                        )}

                                                        {/* ============================= */}
                                                        {/* MODAL COBRO */}
                                                        {/* ============================= */}

                                                        {modalCobro && pagoSeleccionado && (

                                                            <>
                                                                <div className="modal-backdrop fade show"></div>

                                                                <div className="modal d-block">
                                                                    <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                                                                        <div className="modal-content border-0 shadow-lg">

                                                                            {/* HEADER */}
                                                                            <div className="modal-header bg-success text-white">

                                                                                <div>
                                                                                    <h4 className="modal-title fw-bold mb-1">
                                                                                        {tipoModal === "liquidacion"
                                                                                            ? "Registrar Liquidación"
                                                                                            : "Registrar Cobro"}
                                                                                    </h4>

                                                                                    <small className="opacity-75">
                                                                                        Periodo #{pagoSeleccionado.periodoNumero || "-"}
                                                                                    </small>
                                                                                </div>

                                                                                <button
                                                                                    className="btn-close btn-close-white"
                                                                                    onClick={() => {
                                                                                        setModalCobro(false);
                                                                                        setPagoSeleccionado(null);
                                                                                        setCobroForm(null);
                                                                                    }}
                                                                                />

                                                                            </div>

                                                                            {/* BODY */}
                                                                            <div className="modal-body">

                                                                                <div className="row g-4">

                                                                                    {/* ========================= */}
                                                                                    {/* DATOS PAGO */}
                                                                                    {/* ========================= */}

                                                                                    <div className="col-lg-7">

                                                                                        <div className="card border-0 shadow-sm h-100">

                                                                                            <div className="card-header bg-light">
                                                                                                <h5 className="mb-0">
                                                                                                    Información del Pago
                                                                                                </h5>
                                                                                            </div>

                                                                                            <div className="card-body">

                                                                                                <div className="row g-3">

                                                                                                    {/* MONTO BASE */}
                                                                                                    <div className="col-md-4">

                                                                                                        <label className="form-label fw-semibold">
                                                                                                            Monto Base
                                                                                                        </label>

                                                                                                        <input
                                                                                                            type="number"
                                                                                                            className="form-control"
                                                                                                            value={cobroForm?.montoBase || 0}
                                                                                                            onChange={(e) => {

                                                                                                                const montoBase =
                                                                                                                    Number(e.target.value);

                                                                                                                setCobroForm({
                                                                                                                    ...cobroForm,

                                                                                                                    montoBase,

                                                                                                                    montoFinal:
                                                                                                                        montoBase +
                                                                                                                        Number(cobroForm?.servicios || 0) +
                                                                                                                        Number(cobroForm?.interesGenerado || 0),
                                                                                                                });
                                                                                                            }}
                                                                                                        />

                                                                                                    </div>

                                                                                                    {/* SERVICIOS */}
                                                                                                    <div className="col-md-4">

                                                                                                        <label className="form-label fw-semibold">
                                                                                                            Servicios
                                                                                                        </label>

                                                                                                        <input
                                                                                                            type="number"
                                                                                                            className="form-control"
                                                                                                            value={cobroForm?.servicios || 0}
                                                                                                            onChange={(e) => {

                                                                                                                const servicios =
                                                                                                                    Number(e.target.value);

                                                                                                                setCobroForm({
                                                                                                                    ...cobroForm,

                                                                                                                    servicios,

                                                                                                                    montoFinal:
                                                                                                                        Number(cobroForm?.montoBase || 0) +
                                                                                                                        servicios +
                                                                                                                        Number(cobroForm?.interesGenerado || 0),
                                                                                                                });
                                                                                                            }}
                                                                                                        />

                                                                                                    </div>

                                                                                                    {/* INTERES */}
                                                                                                    <div className="col-md-4">

                                                                                                        <label className="form-label fw-semibold">
                                                                                                            {tipoModal === "liquidacion"
                                                                                                                ? "Administración"
                                                                                                                : "Interés"}
                                                                                                        </label>

                                                                                                        <input
                                                                                                            type="number"
                                                                                                            className="form-control"
                                                                                                            value={
                                                                                                                tipoModal === "liquidacion"
                                                                                                                    ? cobroForm?.administracion || 0
                                                                                                                    : cobroForm?.interesGenerado || 0
                                                                                                            }
                                                                                                            onChange={(e) => {

                                                                                                                const valor = Number(e.target.value);

                                                                                                                if (tipoModal === "liquidacion") {

                                                                                                                    setCobroForm({
                                                                                                                        ...cobroForm,
                                                                                                                        administracion: valor,

                                                                                                                        montoFinal:
                                                                                                                            Number(cobroForm?.montoBase || 0) +
                                                                                                                            Number(cobroForm?.servicios || 0) -
                                                                                                                            valor,
                                                                                                                    });

                                                                                                                } else {

                                                                                                                    setCobroForm({
                                                                                                                        ...cobroForm,
                                                                                                                        interesGenerado: valor,

                                                                                                                        montoFinal:
                                                                                                                            Number(cobroForm?.montoBase || 0) +
                                                                                                                            Number(cobroForm?.servicios || 0) +
                                                                                                                            valor,
                                                                                                                    });

                                                                                                                }

                                                                                                            }}
                                                                                                        />

                                                                                                    </div>

                                                                                                    {/* TOTAL */}
                                                                                                    <div className="col-12">

                                                                                                        <div className="border rounded-4 p-4 bg-success-subtle">

                                                                                                            <div className="d-flex justify-content-between align-items-center">

                                                                                                                <div>
                                                                                                                    <div className="text-muted small">
                                                                                                                        TOTAL A COBRAR
                                                                                                                    </div>

                                                                                                                    <h2 className="fw-bold text-success mb-0">
                                                                                                                        {
                                                                                                                            formatCurrency(
                                                                                                                                cobroForm?.montoFinal || 0
                                                                                                                            )
                                                                                                                        }
                                                                                                                    </h2>
                                                                                                                </div>

                                                                                                                <i className="bi bi-cash-stack fs-1 text-success"></i>

                                                                                                            </div>

                                                                                                        </div>

                                                                                                    </div>

                                                                                                </div>

                                                                                            </div>

                                                                                        </div>

                                                                                    </div>

                                                                                    {/* ========================= */}
                                                                                    {/* DETALLES */}
                                                                                    {/* ========================= */}

                                                                                    <div className="col-lg-5">

                                                                                        <div className="card border-0 shadow-sm h-100">

                                                                                            <div className="card-header bg-light">
                                                                                                <h5 className="mb-0">
                                                                                                    Detalles del Cobro
                                                                                                </h5>
                                                                                            </div>

                                                                                            <div className="card-body">

                                                                                                {/* FECHA */}
                                                                                                <div className="mb-3">

                                                                                                    <label className="form-label fw-semibold">
                                                                                                        Fecha de Cobro
                                                                                                    </label>

                                                                                                    <input
                                                                                                        type="date"
                                                                                                        className="form-control"
                                                                                                        value={
                                                                                                            cobroForm?.fechaCobro
                                                                                                                ? cobroForm.fechaCobro.toISOString().split("T")[0]
                                                                                                                : ""
                                                                                                        }
                                                                                                        onChange={(e) =>
                                                                                                            setCobroForm({
                                                                                                                ...cobroForm,
                                                                                                                fechaCobro: new Date(e.target.value + "T00:00:00"),
                                                                                                            })
                                                                                                        }
                                                                                                    />

                                                                                                </div>

                                                                                                {/* METODO */}
                                                                                                <div className="mb-3">

                                                                                                    <label className="form-label fw-semibold">
                                                                                                        Método de Pago
                                                                                                    </label>

                                                                                                    <select
                                                                                                        className="form-select"
                                                                                                        value={cobroForm?.metodoPago || "Efectivo"}
                                                                                                        onChange={(e) =>
                                                                                                            setCobroForm({
                                                                                                                ...cobroForm,
                                                                                                                metodoPago: e.target.value,
                                                                                                            })
                                                                                                        }
                                                                                                    >
                                                                                                        <option value="Efectivo">
                                                                                                            Efectivo
                                                                                                        </option>

                                                                                                        <option value="Transferencia">
                                                                                                            Transferencia
                                                                                                        </option>

                                                                                                        <option value="Tarjeta Débito">
                                                                                                            Tarjeta Débito
                                                                                                        </option>

                                                                                                        <option value="Tarjeta Crédito">
                                                                                                            Tarjeta Crédito
                                                                                                        </option>

                                                                                                        <option value="Mercado Pago">
                                                                                                            Mercado Pago
                                                                                                        </option>
                                                                                                    </select>

                                                                                                </div>

                                                                                                {/* NUMERO OPERACION */}
                                                                                                <div className="mb-3">

                                                                                                    <label className="form-label fw-semibold">
                                                                                                        Nº Operación / Comprobante
                                                                                                    </label>

                                                                                                    <input
                                                                                                        type="text"
                                                                                                        className="form-control"
                                                                                                        value={
                                                                                                            cobroForm?.numeroRecibo ||

                                                                                                            `REC-${String(
                                                                                                                pagoSeleccionado?.periodoNumero || 0
                                                                                                            ).padStart(4, "0")}-${new Date()
                                                                                                                .getFullYear()}-${Date.now()
                                                                                                                    .toString()
                                                                                                                    .slice(-5)}`
                                                                                                        }
                                                                                                        readOnly
                                                                                                    />

                                                                                                </div>

                                                                                                {/* OBSERVACIONES */}
                                                                                                <div className="mb-3">

                                                                                                    <label className="form-label fw-semibold">
                                                                                                        Observaciones
                                                                                                    </label>

                                                                                                    <textarea
                                                                                                        className="form-control"
                                                                                                        rows="5"
                                                                                                        value={cobroForm?.observaciones || ""}
                                                                                                        onChange={(e) =>
                                                                                                            setCobroForm({
                                                                                                                ...cobroForm,
                                                                                                                observaciones: e.target.value,
                                                                                                            })
                                                                                                        }
                                                                                                    />

                                                                                                </div>

                                                                                            </div>

                                                                                        </div>

                                                                                    </div>

                                                                                </div>

                                                                            </div>

                                                                            {/* FOOTER */}
                                                                            <div className="modal-footer d-flex justify-content-between">

                                                                                <div className="text-muted small">
                                                                                    El pago quedará marcado como pagado automáticamente.
                                                                                </div>

                                                                                <div className="d-flex gap-2">

                                                                                    <button
                                                                                        className="btn btn-secondary"
                                                                                        onClick={() => {
                                                                                            setModalCobro(false);
                                                                                            setPagoSeleccionado(null);
                                                                                            setCobroForm(null);
                                                                                        }}
                                                                                    >
                                                                                        Cancelar
                                                                                    </button>

                                                                                    <button
                                                                                        className="btn btn-success px-4"
                                                                                        onClick={async () => {
                                                                                            try {
                                                                                                const numeroRecibo = cobroForm?.numeroRecibo || `REC-${Date.now()}`;

                                                                                                const pagoActualizado = {
                                                                                                    ...(tipoModal === "liquidacion" ? {
                                                                                                        montoCobrado: cobroForm?.montoBase ?? 0,
                                                                                                        montoComision: cobroForm?.administracion ?? 0,
                                                                                                        servicios: cobroForm?.servicios ?? 0,
                                                                                                        interesGenerado: cobroForm?.interesGenerado ?? 0,
                                                                                                        montoLiquidado: cobroForm?.montoFinal ?? 0,
                                                                                                        metodoPago: cobroForm?.metodoPago || "Transferencia",
                                                                                                    } : {
                                                                                                        ...cobroForm,
                                                                                                    }),

                                                                                                    numeroRecibo,
                                                                                                    estado: "pagado",
                                                                                                    fechaCobro: cobroForm.fechaCobro,
                                                                                                    updatedAt: serverTimestamp(),
                                                                                                };

                                                                                                const coleccion = tipoModal === "liquidacion" ? "Liquidaciones" : "Pagos";

                                                                                                await updateDoc(
                                                                                                    doc(db, coleccion, pagoSeleccionado.id),
                                                                                                    pagoActualizado
                                                                                                );

                                                                                                if (tipoModal === "liquidacion") {
                                                                                                    setClienteSeleccionado({
                                                                                                        ...clienteSeleccionado,
                                                                                                        liquidaciones: clienteSeleccionado.liquidaciones.map((l) =>
                                                                                                            l.id === pagoSeleccionado.id
                                                                                                                ? { ...l, ...pagoActualizado }
                                                                                                                : l
                                                                                                        ),
                                                                                                    });
                                                                                                } else {
                                                                                                    setClienteSeleccionado({
                                                                                                        ...clienteSeleccionado,
                                                                                                        pagos: clienteSeleccionado.pagos.map((p) =>
                                                                                                            p.id === pagoSeleccionado.id
                                                                                                                ? { ...p, ...pagoActualizado }
                                                                                                                : p
                                                                                                        ),
                                                                                                    });
                                                                                                }

                                                                                                // 🔴 DEBUG: Verificar datos
                                                                                                const datosRecibo = {
                                                                                                    ...pagoSeleccionado,
                                                                                                    ...pagoActualizado,

                                                                                                    administracion:
                                                                                                        cobroForm?.administracion ??
                                                                                                        pagoSeleccionado?.administracion ??
                                                                                                        pagoSeleccionado?.montoComision ??
                                                                                                        0,
                                                                                                    tipo: tipoModal,
                                                                                                    esLiquidacion: tipoModal === "liquidacion",



                                                                                                    // ✅ CRÍTICO: Asegurar que estos campos existan
                                                                                                    clienteNombre:
                                                                                                        pagoSeleccionado?.clienteNombre ||
                                                                                                        pagoSeleccionado?.locatarioNombre ||
                                                                                                        clienteSeleccionado?.nombre ||
                                                                                                        "Cliente sin nombre",

                                                                                                    locatarioNombre:
                                                                                                        pagoSeleccionado?.locatarioNombre ||
                                                                                                        clienteSeleccionado?.nombre ||
                                                                                                        "Inquilino sin nombre",

                                                                                                    locadorNombre:
                                                                                                        pagoSeleccionado?.locadorNombre ||
                                                                                                        pagoSeleccionado?.propietarioNombre ||
                                                                                                        "Propietario sin nombre",

                                                                                                    propiedadDireccion: {
                                                                                                        calle: pagoSeleccionado?.propiedadDireccion?.calle || "Sin calle",
                                                                                                        localidad: pagoSeleccionado?.propiedadDireccion?.localidad || "Sin localidad",
                                                                                                        provincia: pagoSeleccionado?.propiedadDireccion?.provincia || "Sin provincia",
                                                                                                    },

                                                                                                    montoFinal: cobroForm?.montoFinal ?? 0,
                                                                                                    numeroRecibo,
                                                                                                    fechaCobro: cobroForm?.fechaCobro,
                                                                                                };


                                                                                                GenerarRecibo(datosRecibo, formatCurrency);
                                                                                                guardarRecibo(datosRecibo);
                                                                                                toast.success(
                                                                                                    tipoModal === "liquidacion"
                                                                                                        ? "Liquidación registrada correctamente"
                                                                                                        : "Cobro registrado correctamente"
                                                                                                );

                                                                                                setModalCobro(false);
                                                                                                setPagoSeleccionado(null);
                                                                                                setCobroForm({
                                                                                                    montoBase: 0,
                                                                                                    interesGenerado: 0,
                                                                                                    servicios: 0,
                                                                                                    descuento: 0,
                                                                                                    montoFinal: 0,
                                                                                                    metodoPago: "Efectivo",
                                                                                                    estado: "pagado",
                                                                                                    fechaCobro: cobroForm?.fechaCobro
                                                                                                        ? new Date(cobroForm.fechaCobro + "T12:00:00")
                                                                                                        : new Date(), numeroRecibo: "",
                                                                                                    numeroOperacion: "",
                                                                                                    observaciones: "",
                                                                                                    notasInternas: "",
                                                                                                    createdAt: new Date(),
                                                                                                    updatedAt: new Date(),
                                                                                                });

                                                                                            } catch (error) {
                                                                                                console.error("❌ Error:", error);
                                                                                                toast.error(
                                                                                                    tipoModal === "liquidacion"
                                                                                                        ? "Error al registrar liquidación"
                                                                                                        : "Error al registrar cobro"
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        Confirmar {tipoModal === "liquidacion" ? "Liquidación" : "Cobro"}
                                                                                    </button>
                                                                                </div>

                                                                            </div>

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </>

                                                        )}



                                                        {/* ============================= */}
                                                        {/* ARCHIVOS */}
                                                        {/* ============================= */}

                                                        <div className="card border-0 shadow-sm">

                                                            <div className="card-header bg-secondary text-white">

                                                                <h5 className="mb-0">
                                                                    Archivos del Cliente
                                                                </h5>

                                                            </div>

                                                            <div className="card-body">

                                                                {clienteSeleccionado.archivos?.length > 0 ? (

                                                                    <div className="row g-3">

                                                                        {clienteSeleccionado.archivos.map(
                                                                            (archivo, index) => (

                                                                                <div
                                                                                    className="col-md-6"
                                                                                    key={index}
                                                                                >

                                                                                    <div className="border rounded p-3 h-100">

                                                                                        <div className="fw-semibold small mb-2">
                                                                                            {archivo.nombre}
                                                                                        </div>

                                                                                        <a
                                                                                            href={archivo.url}
                                                                                            target="_blank"
                                                                                            rel="noreferrer"
                                                                                            className="btn btn-sm btn-outline-primary w-100"
                                                                                        >
                                                                                            Ver archivo
                                                                                        </a>

                                                                                    </div>

                                                                                </div>

                                                                            )
                                                                        )}

                                                                    </div>

                                                                ) : (

                                                                    <div className="text-muted">
                                                                        No hay archivos cargados
                                                                    </div>

                                                                )}

                                                            </div>

                                                        </div>

                                                    </div>

                                                </div>

                                            </div>

                                            {/* ====================================== */}
                                            {/* FOOTER */}
                                            {/* ====================================== */}

                                            <div className="modal-footer d-flex gap-2">

                                                <button
                                                    className={`btn ${modoEdicion ? "btn-success" : "btn-warning"}`}
                                                    onClick={async () => {

                                                        if (!modoEdicion) {

                                                            setModoEdicion(true);

                                                            setFormEdicion(
                                                                structuredClone(clienteSeleccionado)
                                                            );

                                                            return;
                                                        }

                                                        try {

                                                            await updateDoc(
                                                                doc(db, "Clientes", clienteSeleccionado.id),
                                                                {
                                                                    nombre: formEdicion.nombre,
                                                                    dni: formEdicion.dni,
                                                                    email: formEdicion.email,
                                                                    telefono1: formEdicion.telefono1,
                                                                    telefono2: formEdicion.telefono2,
                                                                    observaciones: formEdicion.observaciones,
                                                                    updatedAt: serverTimestamp(),
                                                                }
                                                            );

                                                            toast.success("Cliente actualizado");

                                                            // 🔴 ESTE BLOQUE ES EL QUE CAMBIÁS
                                                            setClienteSeleccionado({
                                                                ...clienteSeleccionado,

                                                                nombre: formEdicion.nombre,
                                                                dni: formEdicion.dni,
                                                                email: formEdicion.email,
                                                                telefono1: formEdicion.telefono1,
                                                                telefono2: formEdicion.telefono2,
                                                                observaciones: formEdicion.observaciones,
                                                            });

                                                            setModoEdicion(false);

                                                            setFormEdicion(null);

                                                        } catch (error) {

                                                            console.error(error);

                                                            toast.error("Error al guardar cambios");
                                                        }
                                                    }}
                                                >
                                                    {modoEdicion ? "Guardar" : "Modificar"}
                                                </button>

                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => {
                                                        setShowClienteModal(false);
                                                        setModoEdicion(false);
                                                        setFormEdicion(null);
                                                    }}
                                                >
                                                    Cerrar
                                                </button>

                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>




                </div>


            </div>


        </>


    );
}

