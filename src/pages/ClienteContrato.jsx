
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

import {
    Container,
    Card,
    Button,
    Row,
    Col,
    Spinner,
    Alert,
    Badge,
} from "react-bootstrap";

import {
    doc,
    getDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

const ClienteContrato = () => {
    const { user, rol, loading } = useAuth();
    const { contratoId } = useParams();
    const navigate = useNavigate();

    const [contrato, setContrato] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    // ============================================
    // VERIFICAR AUTENTICACIÓN
    // ============================================

    useEffect(() => {
        if (loading) return;

        if (!user) {
            navigate("/login", { replace: true });
            return;
        }

        if (rol === null || rol === undefined) {
            return;
        }

        if (rol !== "cliente") {
            navigate("/", { replace: true });
        }
    }, [loading, user, rol, navigate]);

    // ============================================
    // CARGAR CONTRATO
    // ============================================

    useEffect(() => {
        if (
            loading ||
            !user ||
            rol !== "cliente" ||
            !contratoId
        ) {
            return;
        }

        const cargarContrato = async () => {
            try {
                setCargando(true);
                setError("");

                console.log("=================================");
                console.log("CARGANDO CONTRATO");
                console.log("CONTRATO ID:", contratoId);

                const contratoRef = doc(
                    db,
                    "Contratos",
                    contratoId
                );

                const contratoSnap = await getDoc(
                    contratoRef
                );

                if (!contratoSnap.exists()) {
                    console.log(
                        "EL CONTRATO NO EXISTE"
                    );

                    setError(
                        "No encontramos el contrato solicitado."
                    );

                    return;
                }

                const contratoData = {
                    id: contratoSnap.id,
                    ...contratoSnap.data(),
                };

                console.log(
                    "CONTRATO ENCONTRADO:",
                    contratoData
                );

                setContrato(contratoData);

            } catch (error) {
                console.error(
                    "ERROR CARGANDO CONTRATO:",
                    error
                );

                setError(
                    "Ocurrió un error al cargar el contrato."
                );
            } finally {
                setCargando(false);
            }
        };

        cargarContrato();

    }, [
        loading,
        user,
        rol,
        contratoId,
    ]);

    // ============================================
    // LOADING
    // ============================================

    if (
        loading ||
        rol === null ||
        rol === undefined ||
        cargando
    ) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ minHeight: "100vh" }}
            >
                <Spinner animation="border" />
            </div>
        );
    }

    if (!user || rol !== "cliente") {
        return null;
    }

    // ============================================
    // ERROR
    // ============================================

    if (error) {
        return (
            <div className="mt-5 pt-5">
                <Container>

                    <Alert variant="danger">
                        {error}
                    </Alert>

                    <Button
                        variant="dark"
                        onClick={() =>
                            navigate("/cliente")
                        }
                    >
                        Volver a mis propiedades
                    </Button>

                </Container>
            </div>
        );
    }

    if (!contrato) {
        return null;
    }

    // ============================================
    // DIRECCIÓN
    // ============================================

    const direccion =
        contrato.propiedadDireccion || {};

    const direccionCompleta = [
        direccion.calle,
        direccion.localidad,
        direccion.provincia,
    ]
        .filter(Boolean)
        .join(", ");

    // ============================================
    // FECHAS
    // ============================================

    const formatearFecha = (fecha) => {
        if (!fecha) return "-";

        if (
            typeof fecha?.toDate === "function"
        ) {
            return fecha
                .toDate()
                .toLocaleDateString("es-AR");
        }

        if (
            fecha instanceof Date
        ) {
            return fecha.toLocaleDateString(
                "es-AR"
            );
        }

        return String(fecha);
    };

    // ============================================
    // PRECIO
    // ============================================

    const precioMensual = Number(
        contrato.precioMensual || 0
    );

    // ============================================
    // RENDER
    // ============================================

    return (
        <div
            className="min-vh-100"
            style={{
                background: "#f5f6f8",
                paddingTop: "90px",
                paddingBottom: "50px",
            }}
        >

            <Container>

                {/* ========================================
            VOLVER
        ======================================== */}

                <div className="mb-3">

                    <Button
                        variant="link"
                        className="text-dark p-0"
                        onClick={() =>
                            navigate("/cliente")
                        }
                    >
                        ← Volver a mis propiedades
                    </Button>

                </div>

                {/* ========================================
            PORTADA
        ======================================== */}

                <Card
                    className="border-0 shadow-sm mb-4"
                    style={{
                        overflow: "hidden",
                        borderRadius: "16px",
                    }}
                >

                    {contrato.propiedadImagen && (

                        <div
                            style={{
                                height: "350px",
                                position: "relative",
                            }}
                        >

                            <img
                                src={
                                    contrato.propiedadImagen
                                }
                                alt={
                                    contrato.propiedadTitulo ||
                                    "Propiedad"
                                }
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />

                            {/* DEGRADADO */}

                            <div
                                style={{
                                    position: "absolute",
                                    inset: 0,
                                    background:
                                        "linear-gradient(transparent 40%, rgba(0,0,0,.75))",
                                }}
                            />

                            {/* INFORMACIÓN SOBRE LA FOTO */}

                            <div
                                className="position-absolute text-white"
                                style={{
                                    bottom: "25px",
                                    left: "30px",
                                    right: "30px",
                                }}
                            >

                                <h1 className="fw-bold mb-1">
                                    {contrato.propiedadTitulo ||
                                        "Propiedad"}
                                </h1>

                                <p className="mb-0">
                                    {direccionCompleta ||
                                        "Dirección no disponible"}
                                </p>

                            </div>

                        </div>

                    )}

                </Card>

                {/* ========================================
            INFORMACIÓN PRINCIPAL
        ======================================== */}

                <Row className="g-4">

                    {/* ======================================
              PROPIEDAD
          ====================================== */}

                    <Col
                        xs={12}
                        lg={8}
                    >

                        <Card
                            className="border-0 shadow-sm mb-4"
                        >

                            <Card.Body className="p-4">

                                <h4 className="fw-bold mb-4">
                                    Información de la propiedad
                                </h4>

                                <Row>

                                    <Col md={6} className="mb-3">

                                        <small className="text-muted">
                                            Dirección
                                        </small>

                                        <div className="fw-semibold">
                                            {direccionCompleta ||
                                                "-"}
                                        </div>

                                    </Col>

                                    <Col md={6} className="mb-3">

                                        <small className="text-muted">
                                            Código postal
                                        </small>

                                        <div className="fw-semibold">
                                            {direccion.codigoPostal ||
                                                "-"}
                                        </div>

                                    </Col>

                                    <Col md={6} className="mb-3">

                                        <small className="text-muted">
                                            Localidad
                                        </small>

                                        <div className="fw-semibold">
                                            {direccion.localidad ||
                                                "-"}
                                        </div>

                                    </Col>

                                    <Col md={6} className="mb-3">

                                        <small className="text-muted">
                                            Provincia
                                        </small>

                                        <div className="fw-semibold">
                                            {direccion.provincia ||
                                                "-"}
                                        </div>

                                    </Col>

                                </Row>

                            </Card.Body>

                        </Card>

                        {/* ====================================
                CONTRATO
            ==================================== */}

                        <Card
                            className="border-0 shadow-sm mb-4"
                        >

                            <Card.Body className="p-4">

                                <div className="d-flex justify-content-between align-items-center mb-4">

                                    <h4 className="fw-bold mb-0">
                                        Información del contrato
                                    </h4>

                                    <Badge
                                        bg={
                                            contrato.estado ===
                                                "activo"
                                                ? "success"
                                                : "secondary"
                                        }
                                    >
                                        {contrato.estado ||
                                            "Sin estado"}
                                    </Badge>

                                </div>

                                <Row>

                                    <Col md={6} className="mb-4">

                                        <small className="text-muted">
                                            Inicio del contrato
                                        </small>

                                        <div className="fw-semibold">
                                            {formatearFecha(
                                                contrato.fechaInicio
                                            )}
                                        </div>

                                    </Col>

                                    <Col md={6} className="mb-4">

                                        <small className="text-muted">
                                            Finalización
                                        </small>

                                        <div className="fw-semibold">
                                            {formatearFecha(
                                                contrato.fechaFin
                                            )}
                                        </div>

                                    </Col>

                                    <Col md={6} className="mb-4">

                                        <small className="text-muted">
                                            Precio mensual
                                        </small>

                                        <div className="fw-bold fs-5">
                                            $
                                            {precioMensual.toLocaleString(
                                                "es-AR"
                                            )}
                                        </div>

                                    </Col>

                                    <Col md={6} className="mb-4">

                                        <small className="text-muted">
                                            Moneda
                                        </small>

                                        <div className="fw-semibold">
                                            {contrato.moneda ||
                                                "ARS"}
                                        </div>

                                    </Col>

                                    <Col md={6} className="mb-4">

                                        <small className="text-muted">
                                            Índice de actualización
                                        </small>

                                        <div className="fw-semibold">
                                            {contrato.indiceActualizacion ||
                                                "-"}
                                        </div>

                                    </Col>

                                    <Col md={6} className="mb-4">

                                        <small className="text-muted">
                                            Período de actualización
                                        </small>

                                        <div className="fw-semibold">
                                            {contrato.periodoActualizacion
                                                ? `${contrato.periodoActualizacion} meses`
                                                : "-"}
                                        </div>

                                    </Col>

                                    <Col md={6} className="mb-4">

                                        <small className="text-muted">
                                            Plazo de pago
                                        </small>

                                        <div className="fw-semibold">

                                            {contrato.plazoPagoDesde &&
                                                contrato.plazoPagoHasta
                                                ? `Del día ${contrato.plazoPagoDesde} al ${contrato.plazoPagoHasta}`
                                                : "-"}

                                        </div>

                                    </Col>

                                    <Col md={6} className="mb-4">

                                        <small className="text-muted">
                                            Interés por mora diario
                                        </small>

                                        <div className="fw-semibold">

                                            {contrato.interesMoraDiario ??
                                                "-"}
                                            %

                                        </div>

                                    </Col>


                                    <Col md={6} className="mb-4">

                                        <small className="text-muted">
                                            Contrato
                                        </small>

                                        <div className="mt-2">

                                            {contrato.archivoUrl ? (

                                                <Button
                                                    variant="dark"
                                                    href={contrato.archivoUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="d-inline-flex align-items-center gap-2"
                                                >
                                                    📄 Ver contrato PDF
                                                </Button>

                                            ) : (

                                                <span className="text-muted">
                                                    No hay contrato PDF disponible
                                                </span>

                                            )}

                                        </div>

                                    </Col>


                                </Row>

                                {/* DETALLES */}

                                {contrato.detalles && (

                                    <div className="mt-2">

                                        <small className="text-muted">
                                            Detalles
                                        </small>

                                        <p className="mb-0 mt-1">
                                            {contrato.detalles}
                                        </p>

                                    </div>

                                )}

                                {/* OBSERVACIONES */}

                                {contrato.observaciones && (

                                    <div className="mt-4">

                                        <small className="text-muted">
                                            Observaciones
                                        </small>

                                        <p className="mb-0 mt-1">
                                            {contrato.observaciones}
                                        </p>

                                    </div>

                                )}

                            </Card.Body>

                        </Card>

                        {/* ====================================
                PARTICIPANTES
            ==================================== */}

                        <Card
                            className="border-0 shadow-sm mb-4"
                        >

                            <Card.Body className="p-4">

                                <h4 className="fw-bold mb-4">
                                    Participantes
                                </h4>

                                <Row>

                                    <Col md={6} className="mb-4">

                                        <small className="text-muted">
                                            Locador
                                        </small>

                                        <div className="fw-semibold">
                                            {contrato.locador ||
                                                "-"}
                                        </div>

                                        {contrato.locadorDni && (
                                            <small className="text-muted">
                                                DNI:{" "}
                                                {contrato.locadorDni}
                                            </small>
                                        )}

                                    </Col>

                                    <Col md={6} className="mb-4">

                                        <small className="text-muted">
                                            Locatario
                                        </small>

                                        <div className="fw-semibold">
                                            {contrato.locatario ||
                                                "-"}
                                        </div>

                                        {contrato.locatarioDni && (
                                            <small className="text-muted">
                                                DNI:{" "}
                                                {contrato.locatarioDni}
                                            </small>
                                        )}

                                    </Col>

                                    <Col md={6} className="mb-4">

                                        <small className="text-muted">
                                            Garante
                                        </small>

                                        <div className="fw-semibold">
                                            {contrato.garante ||
                                                "-"}
                                        </div>

                                        {contrato.garanteDni && (
                                            <small className="text-muted">
                                                DNI:{" "}
                                                {contrato.garanteDni}
                                            </small>
                                        )}

                                    </Col>

                                    {contrato.garante2 && (

                                        <Col md={6} className="mb-4">

                                            <small className="text-muted">
                                                Segundo garante
                                            </small>

                                            <div className="fw-semibold">
                                                {contrato.garante2}
                                            </div>

                                            {contrato.garante2Dni && (
                                                <small className="text-muted">
                                                    DNI:{" "}
                                                    {contrato.garante2Dni}
                                                </small>
                                            )}

                                        </Col>

                                    )}

                                </Row>

                            </Card.Body>

                        </Card>

                    </Col>

                    {/* ======================================
              COLUMNA DERECHA
          ====================================== */}

                    <Col
                        xs={12}
                        lg={4}
                    >

                        {/* ====================================
                RESUMEN
            ==================================== */}

                        <Card
                            className="border-0 shadow-sm mb-4"
                        >

                            <Card.Body className="p-4">

                                <h5 className="fw-bold mb-4">
                                    Resumen
                                </h5>

                                <div className="d-flex justify-content-between mb-3">

                                    <span className="text-muted">
                                        Estado
                                    </span>

                                    <Badge
                                        bg={
                                            contrato.estado ===
                                                "activo"
                                                ? "success"
                                                : "secondary"
                                        }
                                    >
                                        {contrato.estado ||
                                            "-"}
                                    </Badge>

                                </div>

                                <div className="d-flex justify-content-between mb-3">

                                    <span className="text-muted">
                                        Alquiler
                                    </span>

                                    <strong>
                                        $
                                        {precioMensual.toLocaleString(
                                            "es-AR"
                                        )}
                                    </strong>

                                </div>

                                <div className="d-flex justify-content-between">

                                    <span className="text-muted">
                                        Actualización
                                    </span>

                                    <strong>
                                        {contrato.indiceActualizacion ||
                                            "-"}
                                    </strong>

                                </div>

                            </Card.Body>

                        </Card>

                        {/* ====================================
                DOCUMENTO
            ==================================== */}

                        {contrato.archivoUrl && (

                            <Card
                                className="border-0 shadow-sm mb-4"
                            >

                                <Card.Body className="p-4">

                                    <h5 className="fw-bold mb-3">
                                        Documento del contrato
                                    </h5>

                                    <p className="text-muted">
                                        Podés consultar el contrato
                                        firmado.
                                    </p>

                                    <Button
                                        variant="dark"
                                        className="w-100"
                                        href={
                                            contrato.archivoUrl
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Ver contrato
                                    </Button>

                                </Card.Body>

                            </Card>

                        )}

                        {/* ====================================
                PAGOS
            ==================================== */}

                        <Card
                            className="border-0 shadow-sm"
                        >

                            <Card.Body className="p-4">

                                <h5 className="fw-bold mb-3">
                                    Pagos
                                </h5>

                                <p className="text-muted">
                                    Acá podrás consultar tus pagos,
                                    recibos, vencimientos y pagos
                                    pendientes.
                                </p>

                                <Button
                                    variant="outline-dark"
                                    className="w-100"
                                    onClick={() =>
                                        navigate(
                                            `/cliente/contrato/${contrato.id}/pagos`
                                        )
                                    }
                                >
                                    Ver pagos
                                </Button>

                            </Card.Body>

                        </Card>

                    </Col>

                </Row>

            </Container>

        </div>
    );
};

export default ClienteContrato;

