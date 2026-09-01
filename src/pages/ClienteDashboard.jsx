
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Row,
  Col,
  Spinner,
  Alert,
} from "react-bootstrap";

import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { db } from "../config/firebase";

const ClienteDashboard = () => {
  const { user, rol, logout, loading } = useAuth();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [contratos, setContratos] = useState([]);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // VERIFICAR AUTENTICACIÓN Y ROL
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
  // CARGAR CLIENTE Y CONTRATOS
  // ============================================

  useEffect(() => {
    if (loading || !user || rol !== "cliente") return;

    const cargarDatosCliente = async () => {
      try {
        setCargandoDatos(true);
        setError("");

        console.log("=================================");
        console.log("BUSCANDO CLIENTE");
        console.log("EMAIL:", user.email);

        // ============================================
        // 1. BUSCAR CLIENTE EN "Clientes"
        // ============================================

        const clientesRef = collection(db, "Clientes");

        const qCliente = query(
          clientesRef,
          where("email", "==", user.email)
        );

        const clienteSnapshot = await getDocs(qCliente);

        console.log(
          "CLIENTES ENCONTRADOS:",
          clienteSnapshot.size
        );

        if (clienteSnapshot.empty) {
          console.log("NO SE ENCONTRÓ EL CLIENTE");

          setError(
            "No encontramos tus datos de cliente en el sistema."
          );

          setCargandoDatos(false);
          return;
        }

        const clienteDoc = clienteSnapshot.docs[0];

        const clienteData = {
          id: clienteDoc.id,
          ...clienteDoc.data(),
        };

        console.log("CLIENTE ENCONTRADO:");
        console.log(clienteData);

        setCliente(clienteData);

        // ============================================
        // 2. OBTENER DNI
        // ============================================

        const dniCliente = clienteData.dni;

        console.log("DNI DEL CLIENTE:", dniCliente);

        if (!dniCliente) {
          setError(
            "Tu registro de cliente no tiene un DNI asociado."
          );

          setCargandoDatos(false);
          return;
        }


// ============================================
// 3. BUSCAR TODOS LOS CONTRATOS POR DNI
// ============================================

console.log(
  "BUSCANDO CONTRATOS CON DNI:",
  dniCliente
);

const contratosRef = collection(db, "Contratos");

// Buscar como LOCATARIO
const qLocatario = query(
  contratosRef,
  where(
    "locatarioDni",
    "==",
    String(dniCliente)
  )
);

// Buscar como LOCADOR
const qLocador = query(
  contratosRef,
  where(
    "locadorDni",
    "==",
    String(dniCliente)
  )
);

// Ejecutar ambas búsquedas
const [
  snapshotLocatario,
  snapshotLocador,
] = await Promise.all([
  getDocs(qLocatario),
  getDocs(qLocador),
]);

console.log(
  "CONTRATOS COMO LOCATARIO:",
  snapshotLocatario.size
);

console.log(
  "CONTRATOS COMO LOCADOR:",
  snapshotLocador.size
);

// ============================================
// 4. GUARDAR TODOS LOS CONTRATOS
// ============================================

const contratosMap = new Map();

// Agregar contratos como locatario
snapshotLocatario.docs.forEach((doc) => {
  contratosMap.set(doc.id, {
    id: doc.id,
    ...doc.data(),
    tipoCliente: "locatario",
  });
});

// Agregar contratos como locador
snapshotLocador.docs.forEach((doc) => {
  // Evita duplicados si aparece en ambas búsquedas
  if (!contratosMap.has(doc.id)) {
    contratosMap.set(doc.id, {
      id: doc.id,
      ...doc.data(),
      tipoCliente: "locador",
    });
  }
});

// Convertir a array
const contratosData = Array.from(
  contratosMap.values()
);

console.log(
  "TOTAL CONTRATOS ENCONTRADOS:",
  contratosData.length
);

console.log(
  "CONTRATOS DEL CLIENTE:",
  contratosData
);

setContratos(contratosData);

} catch (error) {
  console.error(
    "ERROR CARGANDO DATOS DEL CLIENTE:",
    error
  );

  setError(
    "Ocurrió un error al cargar tus datos."
  );
} finally {
  setCargandoDatos(false);
}
};

cargarDatosCliente();
}, [loading, user, rol]);



  // ============================================
  // CARGANDO AUTENTICACIÓN
  // ============================================

  if (
    loading ||
    rol === null ||
    rol === undefined
  ) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!user || rol !== "cliente") {
    return null;
  }

  // ============================================
  // CERRAR SESIÓN
  // ============================================

  const handleLogout = async () => {
    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="d-flex min-vh-100 mt-5 pt-5">

      {/* ============================================
          SIDEBAR
      ============================================ */}

      <div
        className="bg-dark text-white p-3 mt-2"
        style={{
          width: "250px",
          minWidth: "250px",
        }}
      >
        <h3 className="mb-4">
          Lira
        </h3>

        <p>
          Hola,{" "}
          {cliente?.nombre || user.email}
        </p>

        <hr />

        <ul className="nav flex-column">

          <li className="nav-item mb-2">
            <Button
              variant="outline-light"
              className="w-100"
              onClick={() =>
                navigate("/cliente")
              }
            >
              Inicio
            </Button>
          </li>

          <li className="nav-item mb-2">
            <Button
              variant="outline-light"
              className="w-100"
            >
              Mis propiedades
            </Button>
          </li>

          <li className="nav-item mb-2">
            <Button
              variant="outline-light"
              className="w-100"
            >
              Mis contratos
            </Button>
          </li>

          <li className="nav-item mb-2">
            <Button
              variant="outline-light"
              className="w-100"
            >
              Pagos
            </Button>
          </li>

          <li className="nav-item mt-4">
            <Button
              variant="danger"
              className="w-100"
              onClick={handleLogout}
            >
              Cerrar sesión
            </Button>
          </li>

        </ul>
      </div>

      {/* ============================================
          CONTENIDO
      ============================================ */}

      <div
        className="flex-grow-1 p-4 mt-2"
        style={{
          background: "#f8f9fa",
          minWidth: 0,
        }}
      >
        <Container fluid>

          {/* ============================================
              ENCABEZADO
          ============================================ */}

          <div className="mb-4">

            <h2>
              Portal del cliente
            </h2>

            <p className="text-muted mb-0">
              Bienvenido,{" "}
              {cliente?.nombre || user.email}
            </p>

          </div>

          {/* ============================================
              ERROR
          ============================================ */}

          {error && (
            <Alert variant="danger">
              {error}
            </Alert>
          )}

          {/* ============================================
              CARGANDO DATOS
          ============================================ */}

          {cargandoDatos && !error && (
            <div className="d-flex align-items-center gap-2">

              <Spinner
                animation="border"
                size="sm"
              />

              <span>
                Cargando tus propiedades...
              </span>

            </div>
          )}

          {/* ============================================
              DATOS DEL CLIENTE
          ============================================ */}

          {!cargandoDatos &&
            cliente &&
            !error && (
              <>

                <Card className="mb-4">

                  <Card.Body>

                    <h5 className="mb-3">
                      Mis datos
                    </h5>

                    <p className="mb-1">
                      <strong>
                        Nombre:
                      </strong>{" "}
                      {cliente.nombre || "-"}
                    </p>

                    <p className="mb-1">
                      <strong>
                        DNI:
                      </strong>{" "}
                      {cliente.dni || "-"}
                    </p>

                    <p className="mb-0">
                      <strong>
                        Email:
                      </strong>{" "}
                      {cliente.email ||
                        user.email}
                    </p>

                  </Card.Body>

                </Card>

                {/* ========================================
                    PROPIEDADES
                ======================================== */}

                <div className="mb-3">

                  <h4>
                    Mis propiedades
                  </h4>

                  <p className="text-muted">
                    Propiedades que actualmente
                    administra Lira Inmobiliaria.
                  </p>

                </div>

                {/* ========================================
                    SIN CONTRATOS
                ======================================== */}

                {contratos.length === 0 ? (

                  <Alert variant="info">
                    No encontramos contratos
                    asociados a tu DNI.
                  </Alert>

                ) : (

                  <Row>

                    {contratos.map(
                      (contrato) => (

                        <Col
                          key={contrato.id}
                          xs={12}
                          md={6}
                          lg={4}
                          className="mb-4"
                        >

                          <Card
                            className="h-100 shadow-sm"
                            style={{
                              overflow: "hidden",
                            }}
                          >

                            {/* IMAGEN */}

                            {contrato.propiedadImagen && (

                              <Card.Img
                                variant="top"
                                src={
                                  contrato.propiedadImagen
                                }
                                style={{
                                  height: "200px",
                                  objectFit:
                                    "cover",
                                }}
                              />

                            )}

                            <Card.Body>

                              {/* TITULO */}

                              <Card.Title>

                                {contrato.propiedadTitulo ||
                                  "Propiedad"}

                              </Card.Title>

                              {/* DIRECCIÓN */}

                              <Card.Text>

                                <strong>
                                  Dirección:
                                </strong>

                                <br />

                                {contrato
                                  .propiedadDireccion
                                  ?.calle ||
                                  "Sin dirección"}

                                <hr />

                                {/* ALQUILER */}

                                <strong>
                                  Alquiler:
                                </strong>

                                <br />

                                $
                                {Number(
                                  contrato.precioMensual ||
                                    0
                                ).toLocaleString(
                                  "es-AR"
                                )}

                                <hr />

                                {/* ESTADO */}

                                <strong>
                                  Estado:
                                </strong>{" "}

                                {contrato.estado ||
                                  "-"}

                              </Card.Text>

                              {/* ====================================
                                  VER CONTRATO
                              ==================================== */}

                              <Button
                                variant="dark"
                                className="w-100"
                                onClick={() =>
                                  navigate(
                                    `/cliente/contrato/${contrato.id}`
                                  )
                                }
                              >
                                Ver contrato
                              </Button>

                            </Card.Body>

                          </Card>

                        </Col>

                      )
                    )}

                  </Row>

                )}

              </>
            )}

        </Container>
      </div>

    </div>
  );
};

export default ClienteDashboard;

