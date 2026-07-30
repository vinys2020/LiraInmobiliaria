import { useState, useEffect } from "react";
import {
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    collection,
    query,
    where,
    getDocs
} from "firebase/firestore";


import { guardarRecibo } from "../utils/recibos";

import GenerarRecibo from "../components/GenerarRecibo";

import { db } from "../config/firebase";

import { parseExpression } from "../utils/parseExpression";

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

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const anio = Number(pago?.anio);
        const mes = Number(pago?.mes);

        if (!anio || !mes) return 0;


        // ==========================================
        // FECHA DESDE LA QUE EMPIEZA LA MORA
        // ==========================================

        const inicioMes = new Date(anio, mes - 1, 1);
        inicioMes.setHours(0, 0, 0, 0);

        if (hoy < inicioMes) return 0;


        // ==========================================
        // DÍAS DE MORA
        // ==========================================

        const diasMora =
            Math.floor(
                (hoy - inicioMes) /
                (1000 * 60 * 60 * 24)
            ) + 1;


        // ==========================================
        // MONTO
        // ==========================================
        // PAGOS:
        // pago.montoBase
        //
        // LIQUIDACIONES:
        // liquidacion.montoCobrado

        const montoBase = Number(
            pago?.montoBase ??
            pago?.montoCobrado ??
            0
        );


        // ==========================================
        // INTERÉS DIARIO DEL CONTRATO
        // ==========================================

        const porcentajeDiario =
            Number(
                pago?.interesMoraDiario ??
                contratoActivo?.interesMoraDiario
            ) || 1;


        // ==========================================
        // INTERÉS TOTAL
        // ==========================================

        return Math.round(
            montoBase *
            (porcentajeDiario / 100) *
            diasMora
        );

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
    const [contratoActivo, setContratoActivo] = useState(null);
    const [contratoSeleccionado, setContratoSeleccionado] = useState(null);
    const [contratoCache, setContratoCache] = useState({});
    const [modalCobro, setModalCobro] = useState(false);
    const [tipoModal, setTipoModal] = useState("pago"); // "pago" o "liquidacion"
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null);

    const [cobroForm, setCobroForm] = useState({

        // =========================
        // MONTOS
        // =========================

        montoBase: "",

        interesGenerado: "",


        servicios: "",

        administracion: "",



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



    const getContrato = async (locatarioId) => {
        if (!locatarioId) return null;

        try {
            const q = query(
                collection(db, "Contratos"),
                where("locatarioId", "==", locatarioId)
            );

            const snap = await getDocs(q);

            if (snap.empty) {
                console.log("No hay contrato para este locatario");
                return null;
            }

            return snap.docs[0].data();

        } catch (error) {
            console.log("ERROR FIREBASE:", error.code, error.message);
            return null;
        }
    };

    useEffect(() => {
        const cargarContrato = async () => {
            if (!clienteSeleccionado?.id) return;

            const contrato = await getContrato(clienteSeleccionado.id);


            setContratoActivo(contrato);
        };

        cargarContrato();
    }, [clienteSeleccionado?.id]);

    if (!showClienteModal || !clienteSeleccionado) return null;


    const calcularMontoFinal = (form, tipoModal) => {
        const base = Number(form?.montoBase || 0);
        const interes = Number(form?.interesGenerado || 0);
        const servicios = Number(form?.servicios || 0);
        const administracion = Number(form?.administracion || 0);

        if (tipoModal === "liquidacion") {
            // 💼 Liquidación: alquiler + interés + administración + ajustes de servicios
            return base - administracion + servicios;
        }

        // 💰 Cobro: alquiler + interés + servicios
        return base + interes + servicios;
    };



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
                                                                    <strong>Comisión Inmobiliaria:</strong>

                                                                    <div>
                                                                        {modoEdicion ? (
                                                                            <div className="input-group">

                                                                                <input
                                                                                    type="number"
                                                                                    step="0.01"
                                                                                    min="0"
                                                                                    className="form-control"
                                                                                    value={
                                                                                        formEdicion?.comisionInmobiliaria ?? ""
                                                                                    }
                                                                                    onChange={(e) =>
                                                                                        setFormEdicion({
                                                                                            ...formEdicion,
                                                                                            comisionInmobiliaria: e.target.value
                                                                                        })
                                                                                    }
                                                                                />

                                                                                <span className="input-group-text">
                                                                                    %
                                                                                </span>

                                                                            </div>
                                                                        ) : (
                                                                            clienteSeleccionado?.comisionInmobiliaria !== undefined &&
                                                                                clienteSeleccionado?.comisionInmobiliaria !== null
                                                                                ? `${clienteSeleccionado.comisionInmobiliaria}%`
                                                                                : "No registrado"
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
                                                                                        <th>interes</th>
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

                                                                                            const obtenerPorcentajeComision = () => {

                                                                                                const valores = [
                                                                                                    liqForm?.porcentajeComision,
                                                                                                    liq?.porcentajeComision,
                                                                                                    liq?.comisionInmobiliaria,
                                                                                                    liq?.comision,
                                                                                                    contratoActivo?.comisionInmobiliaria,
                                                                                                    contratoActivo?.comision,
                                                                                                    clienteSeleccionado?.contrato?.comisionInmobiliaria,
                                                                                                    clienteSeleccionado?.contrato?.comision,
                                                                                                    clienteSeleccionado?.comisionInmobiliaria,
                                                                                                    clienteSeleccionado?.comision
                                                                                                ];

                                                                                                const encontrado = valores.find(
                                                                                                    (valor) =>
                                                                                                        valor !== undefined &&
                                                                                                        valor !== null &&
                                                                                                        Number(valor) > 0
                                                                                                );

                                                                                                return Number(encontrado ?? 0);
                                                                                            };


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

                                                                                                                    const montoCobrado =
                                                                                                                        Number(e.target.value);

                                                                                                                    setLiqForm((prev) => {

                                                                                                                        // =====================================
                                                                                                                        // INTERÉS
                                                                                                                        // =====================================

                                                                                                                        const interes =
                                                                                                                            prev?.interesAutomatico ?? true
                                                                                                                                ? calcularInteresAutomatico({
                                                                                                                                    ...liq,
                                                                                                                                    ...prev,
                                                                                                                                    montoBase: montoCobrado,

                                                                                                                                    interesMoraDiario:
                                                                                                                                        prev?.interesMoraDiario ??
                                                                                                                                        liq?.interesMoraDiario ??
                                                                                                                                        contratoActivo?.interesMoraDiario ??
                                                                                                                                        clienteSeleccionado?.contrato?.interesMoraDiario ??
                                                                                                                                        clienteSeleccionado?.interesMoraDiario ??
                                                                                                                                        1
                                                                                                                                })
                                                                                                                                : Number(
                                                                                                                                    prev?.interesGenerado || 0
                                                                                                                                );


                                                                                                                        // =====================================
                                                                                                                        // PORCENTAJE COMISIÓN
                                                                                                                        // =====================================

                                                                                                                        const porcentajeComision = Number(
                                                                                                                            contratoActivo?.comisionInmobiliaria ??
                                                                                                                            clienteSeleccionado?.contrato?.comisionInmobiliaria ??
                                                                                                                            clienteSeleccionado?.comisionInmobiliaria ??
                                                                                                                            liq?.comisionInmobiliaria ??
                                                                                                                            liq?.comision ??
                                                                                                                            0
                                                                                                                        );


                                                                                                                        // =====================================
                                                                                                                        // BASE ADMINISTRACIÓN
                                                                                                                        // MONTO + INTERÉS
                                                                                                                        // =====================================

                                                                                                                        const baseAdministracion =
                                                                                                                            montoCobrado + interes;


                                                                                                                        // =====================================
                                                                                                                        // ADMINISTRACIÓN
                                                                                                                        // =====================================

                                                                                                                        const montoComision =
                                                                                                                            baseAdministracion *
                                                                                                                            (porcentajeComision / 100);


                                                                                                                        // =====================================
                                                                                                                        // TOTAL
                                                                                                                        // =====================================

                                                                                                                        const montoLiquidado =
                                                                                                                            baseAdministracion -
                                                                                                                            montoComision;


                                                                                                                        return {
                                                                                                                            ...(prev || {}),

                                                                                                                            montoCobrado,

                                                                                                                            interesGenerado:
                                                                                                                                interes,

                                                                                                                            porcentajeComision,

                                                                                                                            montoComision,

                                                                                                                            montoLiquidado
                                                                                                                        };

                                                                                                                    });

                                                                                                                }}
                                                                                                            />
                                                                                                        ) : (
                                                                                                            formatCurrency(
                                                                                                                liq.montoCobrado || 0
                                                                                                            )
                                                                                                        )}
                                                                                                    </td>

                                                                                                    {/* ============================= */}
                                                                                                    {/* INTERÉS */}
                                                                                                    {/* ============================= */}

                                                                                                    <td>

                                                                                                        {editando ? (

                                                                                                            <div className="d-flex align-items-center gap-2">

                                                                                                                {(() => {

                                                                                                                    const liquidacionActual = {

                                                                                                                        ...liq,

                                                                                                                        ...liqForm,

                                                                                                                        // Liquidación usa montoCobrado
                                                                                                                        // como base para calcular el interés.

                                                                                                                        montoBase:
                                                                                                                            liqForm?.montoCobrado ??
                                                                                                                            liq?.montoCobrado ??
                                                                                                                            0,

                                                                                                                        // MISMO interés diario del contrato
                                                                                                                        // que utilizan los pagos.

                                                                                                                        interesMoraDiario:
                                                                                                                            liqForm?.interesMoraDiario ??
                                                                                                                            liq?.interesMoraDiario ??
                                                                                                                            contratoActivo?.interesMoraDiario ??
                                                                                                                            clienteSeleccionado?.interesMoraDiario ??
                                                                                                                            1

                                                                                                                    };


                                                                                                                    const interesAuto =
                                                                                                                        calcularInteresAutomatico(
                                                                                                                            liquidacionActual
                                                                                                                        );


                                                                                                                    const esAuto =
                                                                                                                        liqForm?.interesAutomatico ?? true;


                                                                                                                    return (

                                                                                                                        <>

                                                                                                                            {/* TOGGLE */}

                                                                                                                            <input
                                                                                                                                className="form-check-input"
                                                                                                                                type="checkbox"
                                                                                                                                checked={esAuto}

                                                                                                                                onChange={(e) => {

                                                                                                                                    const activo =
                                                                                                                                        e.target.checked;


                                                                                                                                    const nuevoInteres =
                                                                                                                                        activo
                                                                                                                                            ? interesAuto
                                                                                                                                            : Number(
                                                                                                                                                liqForm?.interesGenerado || 0
                                                                                                                                            );


                                                                                                                                    setLiqForm((prev) => ({

                                                                                                                                        ...(prev || {}),

                                                                                                                                        interesAutomatico:
                                                                                                                                            activo,

                                                                                                                                        interesGenerado:
                                                                                                                                            nuevoInteres,

                                                                                                                                        montoLiquidado:

                                                                                                                                            Number(
                                                                                                                                                prev?.montoCobrado || 0
                                                                                                                                            )

                                                                                                                                            -

                                                                                                                                            Number(
                                                                                                                                                prev?.montoComision || 0
                                                                                                                                            )

                                                                                                                                            +

                                                                                                                                            nuevoInteres

                                                                                                                                    }));

                                                                                                                                }}

                                                                                                                            />


                                                                                                                            {/* INPUT INTERÉS MANUAL */}

                                                                                                                            <input
                                                                                                                                type="number"
                                                                                                                                className="form-control form-control-sm"
                                                                                                                                style={{ width: "90px" }}


                                                                                                                                value={
                                                                                                                                    esAuto
                                                                                                                                        ? interesAuto
                                                                                                                                        : (
                                                                                                                                            liqForm?.interesGenerado || 0
                                                                                                                                        )
                                                                                                                                }

                                                                                                                                onChange={(e) => {

                                                                                                                                    const val =
                                                                                                                                        Number(e.target.value);


                                                                                                                                    setLiqForm((prev) => ({

                                                                                                                                        ...(prev || {}),

                                                                                                                                        interesAutomatico:
                                                                                                                                            false,

                                                                                                                                        interesGenerado:
                                                                                                                                            val,

                                                                                                                                        montoLiquidado:

                                                                                                                                            Number(
                                                                                                                                                prev?.montoCobrado || 0
                                                                                                                                            )

                                                                                                                                            -

                                                                                                                                            Number(
                                                                                                                                                prev?.montoComision || 0
                                                                                                                                            )

                                                                                                                                            +

                                                                                                                                            val

                                                                                                                                    }));

                                                                                                                                }}

                                                                                                                            />


                                                                                                                            {/* RESET */}

                                                                                                                            <button
                                                                                                                                type="button"
                                                                                                                                className="btn btn-sm btn-outline-danger px-2"

                                                                                                                                onClick={() =>

                                                                                                                                    setLiqForm((prev) => ({

                                                                                                                                        ...(prev || {}),

                                                                                                                                        interesAutomatico:
                                                                                                                                            false,

                                                                                                                                        interesGenerado:
                                                                                                                                            0,

                                                                                                                                        montoLiquidado:

                                                                                                                                            Number(
                                                                                                                                                prev?.montoCobrado || 0
                                                                                                                                            )

                                                                                                                                            -

                                                                                                                                            Number(
                                                                                                                                                prev?.montoComision || 0
                                                                                                                                            )

                                                                                                                                    }))

                                                                                                                                }

                                                                                                                            >
                                                                                                                                0
                                                                                                                            </button>

                                                                                                                        </>

                                                                                                                    );

                                                                                                                })()}

                                                                                                            </div>

                                                                                                        ) : (

                                                                                                            <div className="d-flex align-items-center gap-2">

                                                                                                                {(liq.interesAutomatico ?? true) && (

                                                                                                                    <span className="badge bg-success">
                                                                                                                        ✓
                                                                                                                    </span>

                                                                                                                )}

                                                                                                                <span className="text-danger fw-bold">

                                                                                                                    {formatCurrency(

                                                                                                                        (liq.interesAutomatico ?? true)

                                                                                                                            ? calcularInteresAutomatico({

                                                                                                                                ...liq,

                                                                                                                                // MUY IMPORTANTE:
                                                                                                                                // Liquidación tiene montoCobrado,
                                                                                                                                // pero la función espera montoBase.

                                                                                                                                montoBase:
                                                                                                                                    liq.montoCobrado || 0,

                                                                                                                                // Mismo interés del contrato
                                                                                                                                // utilizado en Pagos.

                                                                                                                                interesMoraDiario:
                                                                                                                                    liq.interesMoraDiario ??
                                                                                                                                    contratoActivo?.interesMoraDiario ??
                                                                                                                                    clienteSeleccionado?.interesMoraDiario ??
                                                                                                                                    1

                                                                                                                            })

                                                                                                                            : Number(
                                                                                                                                liq.interesGenerado || 0
                                                                                                                            )

                                                                                                                    )}

                                                                                                                </span>

                                                                                                            </div>

                                                                                                        )}

                                                                                                    </td>
                                                                                                    {/* ============================= */}
                                                                                                    {/* COMISIÓN / ADMINISTRACIÓN */}
                                                                                                    {/* ============================= */}

                                                                                                    <td>

                                                                                                        {(() => {

                                                                                                            // ==========================================
                                                                                                            // SOLO ESTA LIQUIDACIÓN ESTÁ EN EDICIÓN
                                                                                                            // ==========================================

                                                                                                            const editandoEstaLiquidacion =
                                                                                                                editando &&
                                                                                                                liqForm?.id === liq?.id;


                                                                                                            // ==========================================
                                                                                                            // MONTO BASE
                                                                                                            // ==========================================

                                                                                                            const montoBase =
                                                                                                                Number(
                                                                                                                    editandoEstaLiquidacion
                                                                                                                        ? liqForm?.montoCobrado ??
                                                                                                                        liq?.montoCobrado ??
                                                                                                                        0
                                                                                                                        : liq?.montoCobrado ??
                                                                                                                        0
                                                                                                                );


                                                                                                            // ==========================================
                                                                                                            // INTERÉS
                                                                                                            // ==========================================

                                                                                                            const esInteresAutomatico =
                                                                                                                editandoEstaLiquidacion
                                                                                                                    ? liqForm?.interesAutomatico ??
                                                                                                                    liq?.interesAutomatico ??
                                                                                                                    true
                                                                                                                    : liq?.interesAutomatico ??
                                                                                                                    true;


                                                                                                            const interes =
                                                                                                                esInteresAutomatico

                                                                                                                    ? Number(
                                                                                                                        calcularInteresAutomatico({

                                                                                                                            ...liq,

                                                                                                                            ...(editandoEstaLiquidacion
                                                                                                                                ? liqForm
                                                                                                                                : {}),

                                                                                                                            montoBase,

                                                                                                                            interesMoraDiario:
                                                                                                                                editandoEstaLiquidacion
                                                                                                                                    ? liqForm?.interesMoraDiario ??
                                                                                                                                    liq?.interesMoraDiario ??
                                                                                                                                    contratoActivo?.interesMoraDiario ??
                                                                                                                                    clienteSeleccionado?.contrato?.interesMoraDiario ??
                                                                                                                                    clienteSeleccionado?.interesMoraDiario ??
                                                                                                                                    0
                                                                                                                                    : liq?.interesMoraDiario ??
                                                                                                                                    contratoActivo?.interesMoraDiario ??
                                                                                                                                    clienteSeleccionado?.contrato?.interesMoraDiario ??
                                                                                                                                    clienteSeleccionado?.interesMoraDiario ??
                                                                                                                                    0

                                                                                                                        })
                                                                                                                    )

                                                                                                                    : Number(
                                                                                                                        editandoEstaLiquidacion
                                                                                                                            ? liqForm?.interesGenerado ??
                                                                                                                            liq?.interesGenerado ??
                                                                                                                            0
                                                                                                                            : liq?.interesGenerado ??
                                                                                                                            0
                                                                                                                    );


                                                                                                            // ==========================================
                                                                                                            // BASE PARA ADMINISTRACIÓN
                                                                                                            // MONTO + INTERÉS
                                                                                                            // ==========================================

                                                                                                            const baseAdministracion =
                                                                                                                montoBase + interes;


                                                                                                            // ==========================================
                                                                                                            // PORCENTAJE DEL CONTRATO
                                                                                                            // ==========================================

                                                                                                            const porcentajeComision =
                                                                                                                obtenerPorcentajeComision();


                                                                                                            // ==========================================
                                                                                                            // ADMINISTRACIÓN CALCULADA
                                                                                                            // ==========================================

                                                                                                            const comisionCalculada =
                                                                                                                baseAdministracion *
                                                                                                                (porcentajeComision / 100);


                                                                                                            // ==========================================
                                                                                                            // MOSTRAR
                                                                                                            // ==========================================

                                                                                                            if (editandoEstaLiquidacion) {

                                                                                                                const montoComision =
                                                                                                                    liqForm?.montoComision ??
                                                                                                                    comisionCalculada;


                                                                                                                return (

                                                                                                                    <div>

                                                                                                                        <input
                                                                                                                            type="number"
                                                                                                                            step="0.01"
                                                                                                                            className="form-control form-control-sm"
                                                                                                                            value={montoComision}

                                                                                                                            onChange={(e) => {

                                                                                                                                const nuevoMontoComision =
                                                                                                                                    Number(e.target.value) || 0;

                                                                                                                                setLiqForm((prev) => ({

                                                                                                                                    ...(prev || {}),

                                                                                                                                    // 🔥 MUY IMPORTANTE
                                                                                                                                    // Guardamos a qué liquidación
                                                                                                                                    // pertenece este formulario.
                                                                                                                                    id: liq.id,

                                                                                                                                    montoComision:
                                                                                                                                        nuevoMontoComision,

                                                                                                                                    interesGenerado:
                                                                                                                                        interes,

                                                                                                                                    porcentajeComision,

                                                                                                                                    montoLiquidado:
                                                                                                                                        baseAdministracion -
                                                                                                                                        nuevoMontoComision

                                                                                                                                }));

                                                                                                                            }}
                                                                                                                        />

                                                                                                                        <small className="text-muted">

                                                                                                                            {porcentajeComision}% de{" "}

                                                                                                                            {formatCurrency(
                                                                                                                                baseAdministracion
                                                                                                                            )}

                                                                                                                            {" = "}

                                                                                                                            {formatCurrency(
                                                                                                                                comisionCalculada
                                                                                                                            )}

                                                                                                                        </small>

                                                                                                                    </div>

                                                                                                                );

                                                                                                            }


                                                                                                            // ==========================================
                                                                                                            // SIN EDITAR
                                                                                                            // ==========================================

                                                                                                            return (

                                                                                                                <div>

                                                                                                                    <span className="fw-bold">

                                                                                                                        {formatCurrency(
                                                                                                                            comisionCalculada
                                                                                                                        )}

                                                                                                                    </span>

                                                                                                                    <small className="d-block text-muted">

                                                                                                                        {porcentajeComision}% de{" "}

                                                                                                                        {formatCurrency(
                                                                                                                            baseAdministracion
                                                                                                                        )}

                                                                                                                        {" = "}

                                                                                                                        {formatCurrency(
                                                                                                                            comisionCalculada
                                                                                                                        )}

                                                                                                                    </small>

                                                                                                                </div>

                                                                                                            );

                                                                                                        })()}

                                                                                                    </td>

                                                                                                    {/* ============================= */}
                                                                                                    {/* TOTAL */}
                                                                                                    {/* ============================= */}

                                                                                                    <td className="fw-bold text-success">

                                                                                                        {(() => {

                                                                                                            // ==========================================
                                                                                                            // MONTO BASE
                                                                                                            // ==========================================

                                                                                                            const montoBase =
                                                                                                                Number(
                                                                                                                    editando
                                                                                                                        ? (
                                                                                                                            liqForm?.montoCobrado ??
                                                                                                                            liq?.montoCobrado ??
                                                                                                                            0
                                                                                                                        )
                                                                                                                        : (
                                                                                                                            liq?.montoCobrado ??
                                                                                                                            liq?.montoBase ??
                                                                                                                            0
                                                                                                                        )
                                                                                                                );


                                                                                                            // ==========================================
                                                                                                            // INTERÉS
                                                                                                            // ==========================================

                                                                                                            const esInteresAutomatico =
                                                                                                                editando
                                                                                                                    ? (
                                                                                                                        liqForm?.interesAutomatico ??
                                                                                                                        liq?.interesAutomatico ??
                                                                                                                        true
                                                                                                                    )
                                                                                                                    : (
                                                                                                                        liq?.interesAutomatico ??
                                                                                                                        true
                                                                                                                    );


                                                                                                            const interes =

                                                                                                                esInteresAutomatico

                                                                                                                    ? Number(
                                                                                                                        calcularInteresAutomatico({

                                                                                                                            ...liq,

                                                                                                                            ...(editando
                                                                                                                                ? liqForm
                                                                                                                                : {}
                                                                                                                            ),

                                                                                                                            montoBase,

                                                                                                                            interesMoraDiario:

                                                                                                                                (
                                                                                                                                    editando
                                                                                                                                        ? liqForm?.interesMoraDiario
                                                                                                                                        : liq?.interesMoraDiario
                                                                                                                                )

                                                                                                                                ??

                                                                                                                                liq?.contratoInteresMoraDiario

                                                                                                                                ??

                                                                                                                                contratoActivo?.interesMoraDiario

                                                                                                                                ??

                                                                                                                                clienteSeleccionado
                                                                                                                                    ?.contrato
                                                                                                                                    ?.interesMoraDiario

                                                                                                                                ??

                                                                                                                                clienteSeleccionado
                                                                                                                                    ?.interesMoraDiario

                                                                                                                                ??

                                                                                                                                0

                                                                                                                        })
                                                                                                                    )

                                                                                                                    : Number(

                                                                                                                        editando

                                                                                                                            ? (
                                                                                                                                liqForm?.interesGenerado ??
                                                                                                                                liq?.interesGenerado ??
                                                                                                                                0
                                                                                                                            )

                                                                                                                            : (
                                                                                                                                liq?.interesGenerado ??
                                                                                                                                0
                                                                                                                            )

                                                                                                                    );


                                                                                                            // ==========================================
                                                                                                            // BASE PARA ADMINISTRACIÓN
                                                                                                            // MONTO + INTERÉS
                                                                                                            // ==========================================

                                                                                                            const baseAdministracion =
                                                                                                                montoBase + interes;


                                                                                                            // ==========================================
                                                                                                            // PORCENTAJE DEL CONTRATO
                                                                                                            // ==========================================

                                                                                                            const porcentajeComision =
                                                                                                                obtenerPorcentajeComision();


                                                                                                            // ==========================================
                                                                                                            // ADMINISTRACIÓN
                                                                                                            // ==========================================

                                                                                                            const montoComision =
                                                                                                                baseAdministracion *
                                                                                                                (porcentajeComision / 100);


                                                                                                            // ==========================================
                                                                                                            // TOTAL NETO
                                                                                                            // ==========================================

                                                                                                            const total =
                                                                                                                baseAdministracion -
                                                                                                                montoComision;


                                                                                                            // ==========================================
                                                                                                            // EDITANDO
                                                                                                            // ==========================================

                                                                                                            if (editando) {

                                                                                                                return (

                                                                                                                    <input
                                                                                                                        type="number"
                                                                                                                        step="0.01"
                                                                                                                        className="form-control form-control-sm"
                                                                                                                        value={total}
                                                                                                                        readOnly
                                                                                                                    />

                                                                                                                );

                                                                                                            }


                                                                                                            // ==========================================
                                                                                                            // SIN EDITAR
                                                                                                            // ==========================================

                                                                                                            return formatCurrency(
                                                                                                                total
                                                                                                            );

                                                                                                        })()}

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

                                                                                                                        try {

                                                                                                                            const estadoNuevo =
                                                                                                                                liqForm?.estado || "pendiente";


                                                                                                                            // ==========================================
                                                                                                                            // MONTO BASE
                                                                                                                            // ==========================================

                                                                                                                            const montoCobrado =
                                                                                                                                Number(
                                                                                                                                    liqForm?.montoCobrado ??
                                                                                                                                    liq?.montoCobrado ??
                                                                                                                                    0
                                                                                                                                );


                                                                                                                            // ==========================================
                                                                                                                            // INTERÉS
                                                                                                                            // ==========================================

                                                                                                                            const liquidacionActual = {

                                                                                                                                ...liq,
                                                                                                                                ...liqForm,

                                                                                                                                montoBase:
                                                                                                                                    montoCobrado,

                                                                                                                                interesMoraDiario:
                                                                                                                                    liqForm?.interesMoraDiario ??
                                                                                                                                    liq?.interesMoraDiario ??
                                                                                                                                    liq?.contratoInteresMoraDiario ??
                                                                                                                                    contratoActivo?.interesMoraDiario ??
                                                                                                                                    clienteSeleccionado?.contrato?.interesMoraDiario ??
                                                                                                                                    clienteSeleccionado?.interesMoraDiario ??
                                                                                                                                    1

                                                                                                                            };


                                                                                                                            let interesGenerado;


                                                                                                                            if (estadoNuevo === "pagado") {

                                                                                                                                if (
                                                                                                                                    liqForm?.interesGenerado !== undefined &&
                                                                                                                                    liqForm?.interesGenerado !== null
                                                                                                                                ) {

                                                                                                                                    interesGenerado =
                                                                                                                                        Number(liqForm.interesGenerado);

                                                                                                                                } else if (
                                                                                                                                    liq?.interesGenerado !== undefined &&
                                                                                                                                    liq?.interesGenerado !== null
                                                                                                                                ) {

                                                                                                                                    interesGenerado =
                                                                                                                                        Number(liq.interesGenerado);

                                                                                                                                } else {

                                                                                                                                    interesGenerado =
                                                                                                                                        Number(
                                                                                                                                            calcularInteresAutomatico(
                                                                                                                                                liquidacionActual
                                                                                                                                            )
                                                                                                                                        );
                                                                                                                                }

                                                                                                                            } else {

                                                                                                                                const esAutomatico =
                                                                                                                                    liqForm?.interesAutomatico ??
                                                                                                                                    liq?.interesAutomatico ??
                                                                                                                                    true;


                                                                                                                                interesGenerado =
                                                                                                                                    esAutomatico

                                                                                                                                        ? Number(
                                                                                                                                            calcularInteresAutomatico(
                                                                                                                                                liquidacionActual
                                                                                                                                            )
                                                                                                                                        )

                                                                                                                                        : Number(
                                                                                                                                            liqForm?.interesGenerado ??
                                                                                                                                            liq?.interesGenerado ??
                                                                                                                                            0
                                                                                                                                        );

                                                                                                                            }


                                                                                                                            // ==========================================
                                                                                                                            // BASE ADMINISTRACIÓN
                                                                                                                            // MONTO + INTERÉS
                                                                                                                            // ==========================================

                                                                                                                            const baseAdministracion =
                                                                                                                                montoCobrado +
                                                                                                                                interesGenerado;


                                                                                                                            // ==========================================
                                                                                                                            // % COMISIÓN DEL CONTRATO
                                                                                                                            // ==========================================

                                                                                                                            const porcentajeComision =
                                                                                                                                Number(

                                                                                                                                    liqForm?.porcentajeComision ??
                                                                                                                                    liq?.porcentajeComision ??

                                                                                                                                    liq?.comisionInmobiliaria ??
                                                                                                                                    liq?.comision ??

                                                                                                                                    contratoActivo?.comisionInmobiliaria ??
                                                                                                                                    contratoActivo?.comision ??

                                                                                                                                    clienteSeleccionado?.contrato?.comisionInmobiliaria ??
                                                                                                                                    clienteSeleccionado?.contrato?.comision ??

                                                                                                                                    0

                                                                                                                                );


                                                                                                                            // ==========================================
                                                                                                                            // ADMINISTRACIÓN
                                                                                                                            // ==========================================

                                                                                                                            const montoComision =
                                                                                                                                baseAdministracion *
                                                                                                                                (porcentajeComision / 100);


                                                                                                                            // ==========================================
                                                                                                                            // TOTAL NETO
                                                                                                                            // ==========================================

                                                                                                                            const montoLiquidado =
                                                                                                                                baseAdministracion -
                                                                                                                                montoComision;


                                                                                                                            // ==========================================
                                                                                                                            // DEBUG
                                                                                                                            // ==========================================

                                                                                                                            console.log(
                                                                                                                                "========== GUARDAR LIQUIDACIÓN =========="
                                                                                                                            );

                                                                                                                            console.log(
                                                                                                                                "Monto cobrado:",
                                                                                                                                montoCobrado
                                                                                                                            );

                                                                                                                            console.log(
                                                                                                                                "Interés:",
                                                                                                                                interesGenerado
                                                                                                                            );

                                                                                                                            console.log(
                                                                                                                                "Base administración:",
                                                                                                                                baseAdministracion
                                                                                                                            );

                                                                                                                            console.log(
                                                                                                                                "% comisión:",
                                                                                                                                porcentajeComision
                                                                                                                            );

                                                                                                                            console.log(
                                                                                                                                "Monto comisión:",
                                                                                                                                montoComision
                                                                                                                            );

                                                                                                                            console.log(
                                                                                                                                "Total:",
                                                                                                                                montoLiquidado
                                                                                                                            );


                                                                                                                            // ==========================================
                                                                                                                            // DATOS A GUARDAR
                                                                                                                            // ==========================================

                                                                                                                            const dataUpdate = {

                                                                                                                                montoCobrado,

                                                                                                                                interesGenerado,

                                                                                                                                // 🔥 GUARDAMOS TAMBIÉN EL %
                                                                                                                                porcentajeComision,

                                                                                                                                montoComision,

                                                                                                                                montoLiquidado,

                                                                                                                                interesAutomatico:
                                                                                                                                    estadoNuevo === "pagado"
                                                                                                                                        ? false
                                                                                                                                        : (
                                                                                                                                            liqForm?.interesAutomatico ??
                                                                                                                                            liq?.interesAutomatico ??
                                                                                                                                            true
                                                                                                                                        ),

                                                                                                                                estado:
                                                                                                                                    estadoNuevo,

                                                                                                                                updatedAt:
                                                                                                                                    serverTimestamp()

                                                                                                                            };


                                                                                                                            // ==========================================
                                                                                                                            // FIRESTORE
                                                                                                                            // ==========================================

                                                                                                                            await updateDoc(
                                                                                                                                doc(
                                                                                                                                    db,
                                                                                                                                    "Liquidaciones",
                                                                                                                                    liq.id
                                                                                                                                ),
                                                                                                                                dataUpdate
                                                                                                                            );


                                                                                                                            // ==========================================
                                                                                                                            // ACTUALIZAR TABLA
                                                                                                                            // ==========================================

                                                                                                                            setClienteSeleccionado((prev) => ({

                                                                                                                                ...prev,

                                                                                                                                liquidaciones:
                                                                                                                                    prev.liquidaciones.map((l) =>
                                                                                                                                        l.id === liq.id
                                                                                                                                            ? {
                                                                                                                                                ...l,
                                                                                                                                                ...dataUpdate
                                                                                                                                            }
                                                                                                                                            : l
                                                                                                                                    )

                                                                                                                            }));


                                                                                                                            // ==========================================
                                                                                                                            // CERRAR EDICIÓN
                                                                                                                            // ==========================================

                                                                                                                            setLiqEditando(null);
                                                                                                                            setLiqForm(null);


                                                                                                                            toast.success(
                                                                                                                                estadoNuevo === "pagado"
                                                                                                                                    ? "Liquidación pagada. Interés congelado."
                                                                                                                                    : "Liquidación actualizada"
                                                                                                                            );


                                                                                                                        } catch (error) {

                                                                                                                            console.error(
                                                                                                                                "Error al actualizar liquidación:",
                                                                                                                                error
                                                                                                                            );

                                                                                                                            toast.error(
                                                                                                                                "Error al actualizar liquidación"
                                                                                                                            );

                                                                                                                        }

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

                                                                                                                        // ==========================================
                                                                                                                        // MONTO BASE
                                                                                                                        // ==========================================

                                                                                                                        const montoCobrado =
                                                                                                                            Number(liq.montoCobrado || 0);


                                                                                                                        // ==========================================
                                                                                                                        // INTERÉS DIARIO
                                                                                                                        // ==========================================

                                                                                                                        const interesMoraDiario =
                                                                                                                            Number(
                                                                                                                                liq.interesMoraDiario ??
                                                                                                                                liq.contratoInteresMoraDiario ??
                                                                                                                                contratoActivo?.interesMoraDiario ??
                                                                                                                                clienteSeleccionado?.contrato?.interesMoraDiario ??
                                                                                                                                clienteSeleccionado?.interesMoraDiario ??
                                                                                                                                0
                                                                                                                            );


                                                                                                                        // ==========================================
                                                                                                                        // INTERÉS ACTUAL
                                                                                                                        // ==========================================

                                                                                                                        const interesAutomatico =
                                                                                                                            liq.interesAutomatico ?? true;


                                                                                                                        const interesGenerado =
                                                                                                                            interesAutomatico

                                                                                                                                ? Number(
                                                                                                                                    calcularInteresAutomatico({

                                                                                                                                        ...liq,

                                                                                                                                        montoBase:
                                                                                                                                            montoCobrado,

                                                                                                                                        interesMoraDiario

                                                                                                                                    })
                                                                                                                                )

                                                                                                                                : Number(
                                                                                                                                    liq.interesGenerado || 0
                                                                                                                                );


                                                                                                                        // ==========================================
                                                                                                                        // BASE ADMINISTRACIÓN
                                                                                                                        // MONTO + INTERÉS
                                                                                                                        // ==========================================

                                                                                                                        const baseAdministracion =
                                                                                                                            montoCobrado +
                                                                                                                            interesGenerado;


                                                                                                                        // ==========================================
                                                                                                                        // OBTENER % DEL CONTRATO
                                                                                                                        // ==========================================

                                                                                                                        const valoresComision = [

                                                                                                                            liq.porcentajeComision,

                                                                                                                            liq.comisionInmobiliaria,

                                                                                                                            liq.comision,

                                                                                                                            contratoActivo?.comisionInmobiliaria,

                                                                                                                            contratoActivo?.comision,

                                                                                                                            clienteSeleccionado
                                                                                                                                ?.contrato
                                                                                                                                ?.comisionInmobiliaria,

                                                                                                                            clienteSeleccionado
                                                                                                                                ?.contrato
                                                                                                                                ?.comision,

                                                                                                                            clienteSeleccionado
                                                                                                                                ?.comisionInmobiliaria,

                                                                                                                            clienteSeleccionado
                                                                                                                                ?.comision

                                                                                                                        ];


                                                                                                                        const porcentajeEncontrado =
                                                                                                                            valoresComision.find(
                                                                                                                                (valor) =>
                                                                                                                                    valor !== undefined &&
                                                                                                                                    valor !== null &&
                                                                                                                                    Number(valor) > 0
                                                                                                                            );


                                                                                                                        const porcentajeComision =
                                                                                                                            Number(
                                                                                                                                porcentajeEncontrado ?? 0
                                                                                                                            );


                                                                                                                        // ==========================================
                                                                                                                        // ADMINISTRACIÓN CORRECTA
                                                                                                                        // ==========================================

                                                                                                                        const montoComision =
                                                                                                                            baseAdministracion *
                                                                                                                            (porcentajeComision / 100);


                                                                                                                        // ==========================================
                                                                                                                        // TOTAL NETO
                                                                                                                        // ==========================================

                                                                                                                        const montoLiquidado =
                                                                                                                            baseAdministracion -
                                                                                                                            montoComision;


                                                                                                                        // ==========================================
                                                                                                                        // DEBUG
                                                                                                                        // ==========================================

                                                                                                                        console.log(
                                                                                                                            "========== EDITAR LIQUIDACIÓN =========="
                                                                                                                        );

                                                                                                                        console.log(
                                                                                                                            "Monto cobrado:",
                                                                                                                            montoCobrado
                                                                                                                        );

                                                                                                                        console.log(
                                                                                                                            "Interés:",
                                                                                                                            interesGenerado
                                                                                                                        );

                                                                                                                        console.log(
                                                                                                                            "Base administración:",
                                                                                                                            baseAdministracion
                                                                                                                        );

                                                                                                                        console.log(
                                                                                                                            "% comisión:",
                                                                                                                            porcentajeComision
                                                                                                                        );

                                                                                                                        console.log(
                                                                                                                            "Administración:",
                                                                                                                            montoComision
                                                                                                                        );

                                                                                                                        console.log(
                                                                                                                            "Total:",
                                                                                                                            montoLiquidado
                                                                                                                        );


                                                                                                                        // ==========================================
                                                                                                                        // CARGAR FORMULARIO
                                                                                                                        // ==========================================

                                                                                                                        setLiqForm({

                                                                                                                            montoCobrado,

                                                                                                                            // 🔥 YA NO CARGAMOS EL MONTO VIEJO
                                                                                                                            // DE FIRESTORE.
                                                                                                                            // CARGAMOS EL 8% CALCULADO.

                                                                                                                            montoComision,

                                                                                                                            montoLiquidado,

                                                                                                                            interesGenerado,

                                                                                                                            interesAutomatico,

                                                                                                                            interesMoraDiario,

                                                                                                                            porcentajeComision,

                                                                                                                            estado:
                                                                                                                                liq.estado || "pendiente"

                                                                                                                        });

                                                                                                                    }}
                                                                                                                >
                                                                                                                    Editar
                                                                                                                </button>
                                                                                                                <button
                                                                                                                    className="btn btn-sm btn-success"
                                                                                                                    onClick={() => {

                                                                                                                        // =====================================================
                                                                                                                        // 1. INTERÉS DIARIO
                                                                                                                        // =====================================================

                                                                                                                        const interesMoraDiario =
                                                                                                                            Number(
                                                                                                                                liq?.interesMoraDiario ??
                                                                                                                                liq?.contratoInteresMoraDiario ??
                                                                                                                                contratoActivo?.interesMoraDiario ??
                                                                                                                                clienteSeleccionado?.contrato?.interesMoraDiario ??
                                                                                                                                clienteSeleccionado?.interesMoraDiario ??
                                                                                                                                0
                                                                                                                            );


                                                                                                                        // =====================================================
                                                                                                                        // 2. MONTO COBRADO
                                                                                                                        // =====================================================

                                                                                                                        const montoCobrado =
                                                                                                                            Number(
                                                                                                                                liq?.montoCobrado ??
                                                                                                                                liq?.montoBase ??
                                                                                                                                0
                                                                                                                            );


                                                                                                                        // =====================================================
                                                                                                                        // 3. INTERÉS AUTOMÁTICO
                                                                                                                        // =====================================================

                                                                                                                        const interesAutomatico =
                                                                                                                            liq?.interesAutomatico ?? true;


                                                                                                                        // =====================================================
                                                                                                                        // 4. INTERÉS GENERADO
                                                                                                                        //
                                                                                                                        // Si todavía es automático:
                                                                                                                        // calculamos nuevamente el interés actual.
                                                                                                                        //
                                                                                                                        // Si fue fijado manualmente:
                                                                                                                        // usamos el interés guardado.
                                                                                                                        // =====================================================

                                                                                                                        const interesGenerado =
                                                                                                                            interesAutomatico

                                                                                                                                ? Number(
                                                                                                                                    calcularInteresAutomatico({
                                                                                                                                        ...liq,

                                                                                                                                        montoBase:
                                                                                                                                            montoCobrado,

                                                                                                                                        montoCobrado,

                                                                                                                                        interesMoraDiario
                                                                                                                                    })
                                                                                                                                )

                                                                                                                                : Number(
                                                                                                                                    liq?.interesGenerado ?? 0
                                                                                                                                );


                                                                                                                        // =====================================================
                                                                                                                        // 5. BASE ADMINISTRACIÓN
                                                                                                                        //
                                                                                                                        // MONTO COBRADO + INTERÉS
                                                                                                                        // =====================================================

                                                                                                                        const baseAdministracion =
                                                                                                                            montoCobrado +
                                                                                                                            interesGenerado;


                                                                                                                        // =====================================================
                                                                                                                        // 6. OBTENER % COMISIÓN
                                                                                                                        // =====================================================

                                                                                                                        const valoresComision = [

                                                                                                                            liq?.porcentajeComision,

                                                                                                                            liq?.comisionInmobiliaria,

                                                                                                                            liq?.comision,

                                                                                                                            contratoActivo?.comisionInmobiliaria,

                                                                                                                            contratoActivo?.comision,

                                                                                                                            clienteSeleccionado?.contrato?.comisionInmobiliaria,

                                                                                                                            clienteSeleccionado?.contrato?.comision,

                                                                                                                            clienteSeleccionado?.comisionInmobiliaria,

                                                                                                                            clienteSeleccionado?.comision

                                                                                                                        ];


                                                                                                                        const porcentajeEncontrado =
                                                                                                                            valoresComision.find(
                                                                                                                                (valor) =>
                                                                                                                                    valor !== undefined &&
                                                                                                                                    valor !== null &&
                                                                                                                                    Number(valor) > 0
                                                                                                                            );


                                                                                                                        const porcentajeComision =
                                                                                                                            Number(
                                                                                                                                porcentajeEncontrado ?? 0
                                                                                                                            );


                                                                                                                        // =====================================================
                                                                                                                        // 7. ADMINISTRACIÓN
                                                                                                                        // =====================================================

                                                                                                                        const montoComision =
                                                                                                                            baseAdministracion *
                                                                                                                            (porcentajeComision / 100);


                                                                                                                        // =====================================================
                                                                                                                        // 8. TOTAL NETO
                                                                                                                        // =====================================================

                                                                                                                        const montoLiquidado =
                                                                                                                            baseAdministracion -
                                                                                                                            montoComision;


                                                                                                                        // =====================================================
                                                                                                                        // 9. OBSERVACIONES
                                                                                                                        // =====================================================

                                                                                                                        const observaciones =
                                                                                                                            cobroForm?.observaciones ??
                                                                                                                            liq?.observaciones ??
                                                                                                                            "";


                                                                                                                        // =====================================================
                                                                                                                        // 10. OBJETO NORMALIZADO
                                                                                                                        // =====================================================

                                                                                                                        const p = normalizeLiquidacion({
                                                                                                                            ...liq,

                                                                                                                            montoCobrado,

                                                                                                                            interesGenerado,

                                                                                                                            interesMoraDiario,

                                                                                                                            porcentajeComision,

                                                                                                                            montoComision,

                                                                                                                            montoLiquidado,

                                                                                                                            observaciones
                                                                                                                        });


                                                                                                                        // =====================================================
                                                                                                                        // 11. DATOS PARA EL MODAL
                                                                                                                        //
                                                                                                                        // IMPORTANTE:
                                                                                                                        // usamos los nombres que ahora maneja tu sistema.
                                                                                                                        // =====================================================

                                                                                                                        const liquidacionData = {

                                                                                                                            ...p,

                                                                                                                            id: liq.id,

                                                                                                                            tipo: "liquidacion",

                                                                                                                            esLiquidacion: true,

                                                                                                                            contratoId:
                                                                                                                                p.contratoId ||
                                                                                                                                liq.contratoId ||
                                                                                                                                "",


                                                                                                                            // =================================================
                                                                                                                            // NOMBRES
                                                                                                                            // =================================================

                                                                                                                            clienteNombre:
                                                                                                                                p.clienteNombre ||
                                                                                                                                p.locadorNombre ||
                                                                                                                                "Propietario sin nombre",

                                                                                                                            locadorNombre:
                                                                                                                                p.locadorNombre ||
                                                                                                                                p.clienteNombre ||
                                                                                                                                "Propietario sin nombre",

                                                                                                                            locatarioNombre:
                                                                                                                                p.locatarioNombre ||
                                                                                                                                "Inquilino sin nombre",

                                                                                                                            propietarioNombre:
                                                                                                                                p.propietarioNombre ||
                                                                                                                                p.locadorNombre ||
                                                                                                                                p.clienteNombre ||
                                                                                                                                "Propietario sin nombre",


                                                                                                                            // =================================================
                                                                                                                            // DIRECCIÓN
                                                                                                                            // =================================================

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
                                                                                                                                    "-"
                                                                                                                            },


                                                                                                                            // =================================================
                                                                                                                            // VALORES ACTUALES
                                                                                                                            // =================================================

                                                                                                                            montoCobrado,

                                                                                                                            // El modal usa montoBase como campo visual
                                                                                                                            montoBase:
                                                                                                                                montoCobrado,

                                                                                                                            interesGenerado,

                                                                                                                            interesMoraDiario,

                                                                                                                            interesAutomatico,

                                                                                                                            porcentajeComision,

                                                                                                                            // Administración
                                                                                                                            administracion:
                                                                                                                                montoComision,

                                                                                                                            montoComision,

                                                                                                                            servicios:
                                                                                                                                p.servicios ??
                                                                                                                                liq?.servicios ??
                                                                                                                                0,

                                                                                                                            // Total real de la liquidación
                                                                                                                            montoLiquidado,

                                                                                                                            montoFinal:
                                                                                                                                montoLiquidado,


                                                                                                                            // =================================================
                                                                                                                            // ESTADO
                                                                                                                            // =================================================

                                                                                                                            estado:
                                                                                                                                liq?.estado ||
                                                                                                                                "pendiente",


                                                                                                                            // =================================================
                                                                                                                            // OBSERVACIONES
                                                                                                                            // =================================================

                                                                                                                            observaciones
                                                                                                                        };


                                                                                                                        // =====================================================
                                                                                                                        // DEBUG
                                                                                                                        // =====================================================

                                                                                                                        console.log(
                                                                                                                            "========== ABRIR LIQUIDACIÓN =========="
                                                                                                                        );

                                                                                                                        console.log(
                                                                                                                            "Monto cobrado:",
                                                                                                                            montoCobrado
                                                                                                                        );

                                                                                                                        console.log(
                                                                                                                            "Interés diario:",
                                                                                                                            interesMoraDiario
                                                                                                                        );

                                                                                                                        console.log(
                                                                                                                            "Interés generado:",
                                                                                                                            interesGenerado
                                                                                                                        );

                                                                                                                        console.log(
                                                                                                                            "Base administración:",
                                                                                                                            baseAdministracion
                                                                                                                        );

                                                                                                                        console.log(
                                                                                                                            "% comisión:",
                                                                                                                            porcentajeComision
                                                                                                                        );

                                                                                                                        console.log(
                                                                                                                            "Administración:",
                                                                                                                            montoComision
                                                                                                                        );

                                                                                                                        console.log(
                                                                                                                            "Total neto:",
                                                                                                                            montoLiquidado
                                                                                                                        );

                                                                                                                        console.log(
                                                                                                                            "DATOS MODAL:",
                                                                                                                            liquidacionData
                                                                                                                        );


                                                                                                                        // =====================================================
                                                                                                                        // 12. CARGAR LIQUIDACIÓN EN EL MODAL
                                                                                                                        // =====================================================

                                                                                                                        setPagoSeleccionado(
                                                                                                                            liquidacionData
                                                                                                                        );

                                                                                                                        setTipoModal(
                                                                                                                            "liquidacion"
                                                                                                                        );


                                                                                                                        // =====================================================
                                                                                                                        // 13. FORMULARIO DEL MODAL
                                                                                                                        // =====================================================

                                                                                                                        setCobroForm({

                                                                                                                            // Base real
                                                                                                                            montoBase:
                                                                                                                                montoCobrado,

                                                                                                                            // Datos del cálculo
                                                                                                                            interesGenerado,

                                                                                                                            interesMoraDiario,

                                                                                                                            interesAutomatico,

                                                                                                                            porcentajeComision,

                                                                                                                            // Administración
                                                                                                                            administracion:
                                                                                                                                montoComision,

                                                                                                                            montoComision,

                                                                                                                            // Servicios
                                                                                                                            servicios:
                                                                                                                                p.servicios ??
                                                                                                                                liq?.servicios ??
                                                                                                                                0,

                                                                                                                            // Total
                                                                                                                            montoFinal:
                                                                                                                                montoLiquidado,

                                                                                                                            montoLiquidado,

                                                                                                                            // Cobro
                                                                                                                            metodoPago:
                                                                                                                                liq?.metodoPago ||
                                                                                                                                "Transferencia",

                                                                                                                            fechaCobro:
                                                                                                                                new Date(),

                                                                                                                            numeroRecibo:
                                                                                                                                liq?.numeroRecibo ||
                                                                                                                                "",

                                                                                                                            estado:
                                                                                                                                liq?.estado ||
                                                                                                                                "pendiente",

                                                                                                                            // Observaciones
                                                                                                                            observaciones
                                                                                                                        });


                                                                                                                        // =====================================================
                                                                                                                        // 14. ABRIR MODAL
                                                                                                                        // =====================================================

                                                                                                                        setModalCobro(true);
                                                                                                                    }}
                                                                                                                >
                                                                                                                    Liquidar
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

                                                                                                    <td>
                                                                                                        {editando ? (

                                                                                                            <input
                                                                                                                type="text"
                                                                                                                className="form-control form-control-sm"
                                                                                                                value={
                                                                                                                    pagoForm?.montoBase
                                                                                                                        ? Number(pagoForm.montoBase).toLocaleString("es-AR", {
                                                                                                                            minimumFractionDigits: 2,
                                                                                                                            maximumFractionDigits: 2,
                                                                                                                        })
                                                                                                                        : ""
                                                                                                                }
                                                                                                                onChange={(e) => {

                                                                                                                    const valor = e.target.value
                                                                                                                        .replace(/\./g, "")      // elimina separador de miles
                                                                                                                        .replace(",", ".");      // convierte coma decimal

                                                                                                                    const montoBase = Number(valor) || 0;

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




                                                                                                    {/* ============================= */}
                                                                                                    {/* INTERÉS */}
                                                                                                    {/* ============================= */}
                                                                                                    <td>
                                                                                                        {editando ? (
                                                                                                            <div className="d-flex align-items-center gap-2">

                                                                                                                {(() => {
                                                                                                                    // 🔥 SIEMPRE objeto único consistente
                                                                                                                    const pagoActual = {
                                                                                                                        ...pago,
                                                                                                                        ...pagoForm,
                                                                                                                        interesMoraDiario:
                                                                                                                            pagoForm?.interesMoraDiario ??
                                                                                                                            pago?.interesMoraDiario ??
                                                                                                                            pago?.contratoInteresMoraDiario ??  // 👈 Intenta desde pago primero
                                                                                                                            clienteSeleccionado?.contrato?.interesMoraDiario ??  // 👈 Desde el contrato del cliente
                                                                                                                            clienteSeleccionado?.interesMoraDiario ??
                                                                                                                            0  // Cambiar a 0 como default más seguro
                                                                                                                    };

                                                                                                                    const interesAuto = calcularInteresAutomatico(pagoActual);

                                                                                                                    const esAuto = pagoForm?.interesAutomatico ?? true;

                                                                                                                    return (
                                                                                                                        <>
                                                                                                                            {/* TOGGLE */}
                                                                                                                            <input
                                                                                                                                className="form-check-input"
                                                                                                                                type="checkbox"
                                                                                                                                checked={esAuto}
                                                                                                                                onChange={(e) => {
                                                                                                                                    const activo = e.target.checked;

                                                                                                                                    const nuevoInteres = activo
                                                                                                                                        ? interesAuto
                                                                                                                                        : Number(pagoForm?.interesGenerado || 0);

                                                                                                                                    setPagoForm({
                                                                                                                                        ...pagoForm,
                                                                                                                                        interesAutomatico: activo,
                                                                                                                                        interesGenerado: nuevoInteres,
                                                                                                                                        montoFinal:
                                                                                                                                            Number(pagoForm?.montoBase || 0) +
                                                                                                                                            Number(pagoForm?.servicios || 0) +
                                                                                                                                            nuevoInteres
                                                                                                                                    });
                                                                                                                                }}
                                                                                                                            />

                                                                                                                            {/* INPUT MANUAL */}
                                                                                                                            <input
                                                                                                                                type="number"
                                                                                                                                className="form-control form-control-sm"
                                                                                                                                style={{ width: "90px" }}
                                                                                                                                disabled={esAuto}
                                                                                                                                value={esAuto ? interesAuto : (pagoForm?.interesGenerado || 0)}
                                                                                                                                onChange={(e) => {
                                                                                                                                    const val = Number(e.target.value);

                                                                                                                                    setPagoForm({
                                                                                                                                        ...pagoForm,
                                                                                                                                        interesAutomatico: false,
                                                                                                                                        interesGenerado: val,
                                                                                                                                        montoFinal:
                                                                                                                                            Number(pagoForm?.montoBase || 0) +
                                                                                                                                            Number(pagoForm?.servicios || 0) +
                                                                                                                                            val
                                                                                                                                    });
                                                                                                                                }}
                                                                                                                            />

                                                                                                                            {/* RESET */}
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
                                                                                                                                            Number(pagoForm?.servicios || 0)
                                                                                                                                    })
                                                                                                                                }
                                                                                                                            >
                                                                                                                                0
                                                                                                                            </button>
                                                                                                                        </>
                                                                                                                    );
                                                                                                                })()}

                                                                                                            </div>
                                                                                                        ) : (
                                                                                                            <div className="d-flex align-items-center gap-2">

                                                                                                                {(pago.interesAutomatico ?? true) && (
                                                                                                                    <span className="badge bg-success">✓</span>
                                                                                                                )}

                                                                                                                <span className="text-danger fw-bold">
                                                                                                                    {formatCurrency(
                                                                                                                        (pago.interesAutomatico ?? true)
                                                                                                                            ? calcularInteresAutomatico(pago)
                                                                                                                            : (pago.interesGenerado || 0)
                                                                                                                    )}
                                                                                                                </span>

                                                                                                            </div>
                                                                                                        )}
                                                                                                    </td>


                                                                                                    {/* ============================= */}
                                                                                                    {/* TOTAL */}
                                                                                                    {/* ============================= */}
                                                                                                    <td className="fw-bold text-success">

                                                                                                        {editando ? (

                                                                                                            <input
                                                                                                                type="number"
                                                                                                                className="form-control form-control-sm"
                                                                                                                value={
                                                                                                                    Number(pagoForm?.montoFinal) ??
                                                                                                                    (
                                                                                                                        Number(pagoForm?.montoBase || 0) +
                                                                                                                        Number(pagoForm?.servicios || 0) +
                                                                                                                        (
                                                                                                                            pagoForm?.interesAutomatico
                                                                                                                                ? calcularInteresAutomatico({
                                                                                                                                    ...pago,
                                                                                                                                    ...pagoForm
                                                                                                                                })
                                                                                                                                : Number(pagoForm?.interesGenerado || 0)
                                                                                                                        )
                                                                                                                    )
                                                                                                                }
                                                                                                                onChange={(e) =>
                                                                                                                    setPagoForm({
                                                                                                                        ...pagoForm,
                                                                                                                        montoFinal: Number(e.target.value)
                                                                                                                    })
                                                                                                                }
                                                                                                            />

                                                                                                        ) : (

                                                                                                            formatCurrency(
                                                                                                                Number(pago.montoBase || 0) +
                                                                                                                Number(pago.servicios || 0) +
                                                                                                                (
                                                                                                                    (pago.interesAutomatico ?? true)
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
                                                                                                                            interesGenerado: calcularInteresAutomatico(pagoNormalizado),
                                                                                                                            servicios: pagoNormalizado.servicios || 0,

                                                                                                                            montoFinal:
                                                                                                                                Number(pagoNormalizado.montoBase || 0) +
                                                                                                                                calcularInteresAutomatico(pagoNormalizado) +
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
                                                                                                            value={cobroForm?.montoBase ?? 0}
                                                                                                            onChange={(e) => {

                                                                                                                const montoBase =
                                                                                                                    Number(e.target.value) || 0;

                                                                                                                setCobroForm((prev) => {

                                                                                                                    const servicios =
                                                                                                                        parseExpression(prev?.servicios);

                                                                                                                    const administracion =
                                                                                                                        Number(prev?.administracion || 0);

                                                                                                                    const interes =
                                                                                                                        Number(prev?.interesGenerado || 0);

                                                                                                                    const nuevoForm = {
                                                                                                                        ...prev,

                                                                                                                        montoBase,

                                                                                                                        montoCobrado:
                                                                                                                            montoBase
                                                                                                                    };

                                                                                                                    return {
                                                                                                                        ...nuevoForm,

                                                                                                                        montoFinal:
                                                                                                                            tipoModal === "liquidacion"

                                                                                                                                ? montoBase +
                                                                                                                                interes +
                                                                                                                                servicios -
                                                                                                                                administracion

                                                                                                                                : montoBase +
                                                                                                                                interes +
                                                                                                                                servicios
                                                                                                                    };

                                                                                                                });

                                                                                                            }}
                                                                                                        />

                                                                                                    </div>

                                                                                                    {/* SERVICIOS */}
                                                                                                    {/* SERVICIOS */}
                                                                                                    <div className="col-md-4">

                                                                                                        <label className="form-label fw-semibold">
                                                                                                            Servicios
                                                                                                        </label>

                                                                                                        <input
                                                                                                            type="text"
                                                                                                            className="form-control"
                                                                                                            placeholder="+100 -50"
                                                                                                            value={cobroForm?.servicios ?? ""}
                                                                                                            onChange={(e) => {

                                                                                                                const servicios =
                                                                                                                    e.target.value;

                                                                                                                setCobroForm((prev) => {

                                                                                                                    const montoBase =
                                                                                                                        Number(prev?.montoBase || 0);

                                                                                                                    const interes =
                                                                                                                        Number(prev?.interesGenerado || 0);

                                                                                                                    const administracion =
                                                                                                                        Number(prev?.administracion || 0);

                                                                                                                    const serviciosCalculados =
                                                                                                                        parseExpression(servicios);

                                                                                                                    return {

                                                                                                                        ...prev,

                                                                                                                        servicios,

                                                                                                                        montoFinal:
                                                                                                                            tipoModal === "liquidacion"

                                                                                                                                ? montoBase +
                                                                                                                                interes +
                                                                                                                                serviciosCalculados -
                                                                                                                                administracion

                                                                                                                                : montoBase +
                                                                                                                                interes +
                                                                                                                                serviciosCalculados
                                                                                                                    };

                                                                                                                });

                                                                                                            }}
                                                                                                        />

                                                                                                    </div>

                                                                                                    {/* ADMINISTRACIÓN / INTERÉS */}
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
                                                                                                                    ? cobroForm?.administracion ?? 0
                                                                                                                    : cobroForm?.interesGenerado ?? 0
                                                                                                            }
                                                                                                            onChange={(e) => {

                                                                                                                const valor =
                                                                                                                    Number(e.target.value) || 0;

                                                                                                                setCobroForm((prev) => {

                                                                                                                    const montoBase =
                                                                                                                        Number(prev?.montoBase || 0);

                                                                                                                    const servicios =
                                                                                                                        parseExpression(prev?.servicios);

                                                                                                                    const interes =
                                                                                                                        tipoModal === "liquidacion"
                                                                                                                            ? Number(prev?.interesGenerado || 0)
                                                                                                                            : valor;

                                                                                                                    const administracion =
                                                                                                                        tipoModal === "liquidacion"
                                                                                                                            ? valor
                                                                                                                            : Number(prev?.administracion || 0);

                                                                                                                    return {

                                                                                                                        ...prev,

                                                                                                                        ...(tipoModal === "liquidacion"
                                                                                                                            ? {
                                                                                                                                administracion: valor,
                                                                                                                                montoComision: valor
                                                                                                                            }
                                                                                                                            : {
                                                                                                                                interesGenerado: valor
                                                                                                                            }),

                                                                                                                        montoFinal:
                                                                                                                            tipoModal === "liquidacion"

                                                                                                                                ? montoBase +
                                                                                                                                interes +
                                                                                                                                servicios -
                                                                                                                                administracion

                                                                                                                                : montoBase +
                                                                                                                                interes +
                                                                                                                                servicios
                                                                                                                    };

                                                                                                                });

                                                                                                            }}
                                                                                                        />

                                                                                                    </div>

                                                                                                    {/* INTERÉS / PUNITORIOS - SOLO LIQUIDACIÓN */}
                                                                                                    {tipoModal === "liquidacion" && (
                                                                                                        <div className="col-md-4">

                                                                                                            <label className="form-label fw-semibold">
                                                                                                                Interés / Punitorios
                                                                                                            </label>

                                                                                                            <input
                                                                                                                type="number"
                                                                                                                className="form-control"
                                                                                                                value={cobroForm?.interesGenerado ?? 0}
                                                                                                                readOnly
                                                                                                            />

                                                                                                        </div>
                                                                                                    )}

                                                                                                    {/* TOTAL */}
                                                                                                    <div className="col-12">

                                                                                                        <div className="border rounded-4 p-4 bg-success-subtle">

                                                                                                            <div className="d-flex justify-content-between align-items-center">

                                                                                                                <div>
                                                                                                                    <div className="text-muted small">
                                                                                                                        TOTAL A COBRAR
                                                                                                                    </div>

                                                                                                                    <h2 className="fw-bold text-success mb-0">
                                                                                                                        {formatCurrency(cobroForm?.montoFinal || 0)}
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
                                                                                                        interesAutomatico: false,
                                                                                                        montoLiquidado: cobroForm?.montoFinal ?? 0,
                                                                                                        metodoPago: cobroForm?.metodoPago || "Transferencia",
                                                                                                    } : {
                                                                                                        ...cobroForm,
                                                                                                        interesAutomatico: false,

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

                                                                                                    observaciones:
                                                                                                        cobroForm?.observaciones ||
                                                                                                        pagoSeleccionado?.observaciones ||
                                                                                                        pagoActualizado?.observaciones ||
                                                                                                        "",

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

                                                                                                    interesGenerado: "",
                                                                                                    servicios: "",
                                                                                                    administracion: "",

                                                                                                    descuento: 0,
                                                                                                    montoFinal: 0,

                                                                                                    metodoPago: "Efectivo",
                                                                                                    estado: "pagado",

                                                                                                    fechaCobro: new Date(),

                                                                                                    numeroRecibo: "",
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
                                                                    comisionInmobiliaria: Number(formEdicion.comisionInmobiliaria) || 0,
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
                                                                comisionInmobiliaria: Number(formEdicion.comisionInmobiliaria) || 0,
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

