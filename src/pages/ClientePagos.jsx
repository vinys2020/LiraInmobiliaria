
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
  Table,
} from "react-bootstrap";

import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import {
  ref,
  getDownloadURL,
} from "firebase/storage";

import { db, storage } from "../config/firebase";

const ClientePagos = () => {
  const { user, rol, loading } = useAuth();
  const { contratoId } = useParams();
  const navigate = useNavigate();

  const [contrato, setContrato] = useState(null);
  const [recibos, setRecibos] = useState([]);
  const [tipoCliente, setTipoCliente] = useState(null);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // AUTENTICACIÓN
  // =========================================================

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (rol === null || rol === undefined) return;

    if (rol !== "cliente") {
      navigate("/", { replace: true });
    }
  }, [loading, user, rol, navigate]);

  // =========================================================
  // CARGAR DATOS
  // =========================================================

  useEffect(() => {
    if (
      loading ||
      !user ||
      rol !== "cliente" ||
      !contratoId
    ) {
      return;
    }

    const cargarDatos = async () => {
      try {
        setCargando(true);
        setError("");
        setRecibos([]);
        setTipoCliente(null);

        // =====================================================
        // 1. BUSCAR CONTRATO
        // =====================================================

        const contratoRef = doc(
          db,
          "Contratos",
          contratoId
        );

        const contratoSnap = await getDoc(
          contratoRef
        );

        if (!contratoSnap.exists()) {
          setError(
            "No encontramos el contrato solicitado."
          );
          return;
        }

        const contratoData = {
          id: contratoSnap.id,
          ...contratoSnap.data(),
        };

        setContrato(contratoData);

        // =====================================================
        // 2. BUSCAR CLIENTE POR EMAIL
        // =====================================================

        const clientesRef = collection(
          db,
          "Clientes"
        );

        const qCliente = query(
          clientesRef,
          where("email", "==", user.email)
        );

        const clienteSnapshot =
          await getDocs(qCliente);

        if (clienteSnapshot.empty) {
          setError(
            "No encontramos tus datos de cliente."
          );
          return;
        }

        const clienteData = {
          id: clienteSnapshot.docs[0].id,
          ...clienteSnapshot.docs[0].data(),
        };

        const dniCliente = String(
          clienteData.dni || ""
        ).trim();

        const dniLocatario = String(
          contratoData.locatarioDni || ""
        ).trim();

        const dniLocador = String(
          contratoData.locadorDni || ""
        ).trim();

        // =====================================================
        // 3. DETERMINAR SI ES LOCATARIO O LOCADOR
        // =====================================================

        let tipo = null;

        if (
          dniCliente &&
          dniCliente === dniLocatario
        ) {
          tipo = "locatario";
        } else if (
          dniCliente &&
          dniCliente === dniLocador
        ) {
          tipo = "locador";
        }

        if (!tipo) {
          setError(
            "Este contrato no está asociado a tu DNI."
          );
          return;
        }

        setTipoCliente(tipo);

        console.log(
          "======================================"
        );

        console.log(
          "CLIENTE:",
          clienteData
        );

        console.log(
          "DNI CLIENTE:",
          dniCliente
        );

        console.log(
          "TIPO DE CLIENTE:",
          tipo
        );

        console.log(
          "CONTRATO:",
          contratoData
        );

        console.log(
          "======================================"
        );

        // =====================================================
        // 4. DETERMINAR COLECCIÓN
        // =====================================================
        //
        // LOCATARIO -> Pagos
        // LOCADOR   -> Liquidaciones
        //
        // IMPORTANTE:
        // Recibos YA NO es la fuente principal.
        //
        // Primero verificamos que el pago/liquidación
        // exista y esté PAGADO.
        // =====================================================

        const coleccionPrincipal =
          tipo === "locatario"
            ? "Pagos"
            : "Liquidaciones";

        console.log(
          "COLECCIÓN PRINCIPAL:",
          coleccionPrincipal
        );

        // =====================================================
        // 5. BUSCAR PAGOS / LIQUIDACIONES DEL CONTRATO
        // =====================================================

        const principalRef = collection(
          db,
          coleccionPrincipal
        );

        const qPrincipal = query(
          principalRef,
          where(
            "contratoId",
            "==",
            contratoId
          )
        );

        const principalSnapshot =
          await getDocs(qPrincipal);

        console.log(
          "REGISTROS ENCONTRADOS EN",
          coleccionPrincipal,
          ":",
          principalSnapshot.size
        );

        const registros = principalSnapshot.docs.map(
          (registroDoc) => ({
            id: registroDoc.id,
            ...registroDoc.data(),
          })
        );

        // =====================================================
        // 6. MOSTRAR EN CONSOLA LOS REGISTROS
        // =====================================================

        console.log(
          "======================================"
        );

        console.log(
          `TODOS LOS REGISTROS DE ${coleccionPrincipal}:`
        );

        registros.forEach(
          (registro, index) => {
            console.log(
              `REGISTRO ${index + 1}:`,
              registro
            );

            console.log(
              "ID:",
              registro.id
            );

            console.log(
              "estado:",
              registro.estado
            );

            console.log(
              "contratoId:",
              registro.contratoId
            );

            console.log(
              "clienteId:",
              registro.clienteId
            );

            console.log(
              "clienteNombre:",
              registro.clienteNombre
            );

            console.log(
              "clienteCuil:",
              registro.clienteCuil
            );

            console.log(
              "anio:",
              registro.anio
            );

            console.log(
              "mes:",
              registro.mes
            );

            console.log(
              "numeroCuota:",
              registro.numeroCuota
            );

            console.log(
              "numeroRecibo:",
              registro.numeroRecibo
            );

            console.log(
              "montoBase:",
              registro.montoBase
            );

            console.log(
              "montoFinal:",
              registro.montoFinal
            );

            console.log(
              "fechaPago:",
              registro.fechaPago
            );

            console.log(
              "fechaVencimiento:",
              registro.fechaVencimiento
            );

            console.log(
              "--------------------------------------"
            );
          }
        );

        console.log(
          "======================================"
        );

        // =====================================================
        // 7. SOLO REGISTROS PAGADOS
        // =====================================================

        const registrosPagados =
          registros.filter(
            (registro) =>
              String(
                registro.estado || ""
              ).toLowerCase().trim() ===
              "pagado"
          );

        console.log(
          "======================================"
        );

        console.log(
          "REGISTROS PAGADOS:",
          registrosPagados.length
        );

        console.log(
          registrosPagados
        );

        console.log(
          "======================================"
        );

        // =====================================================
        // 8. BUSCAR LOS RECIBOS CORRESPONDIENTES
        // =====================================================
        //
        // AHORA sí vamos a Recibos.
        //
        // Pero solamente para los registros que ya
        // verificamos que están PAGADOS.
        //
        // Primero intentamos encontrar por contratoId.
        // Después relacionamos por:
        //
        // - numeroRecibo
        // - numeroCuota
        // - anio
        // - mes
        //
        // Esto permite trabajar también con recibos
        // que tengan información adicional.
        // =====================================================

        const recibosRef = collection(
          db,
          "Recibos"
        );

        const qRecibos = query(
          recibosRef,
          where(
            "contratoId",
            "==",
            contratoId
          )
        );

        const recibosSnapshot =
          await getDocs(qRecibos);

        const todosLosRecibos =
          recibosSnapshot.docs.map(
            (reciboDoc) => ({
              id: reciboDoc.id,
              ...reciboDoc.data(),
            })
          );

        console.log(
          "RECIBOS DEL CONTRATO:",
          todosLosRecibos.length
        );

        // =====================================================
        // 9. CREAR RESULTADO FINAL
        // =====================================================

        const resultados = [];

        for (
          const registro of registrosPagados
        ) {

          // ---------------------------------------------------
          // BUSCAR RECIBO CORRESPONDIENTE
          // ---------------------------------------------------

          let reciboEncontrado = null;

          // Primero por numeroRecibo
          if (
            registro.numeroRecibo
          ) {
            reciboEncontrado =
              todosLosRecibos.find(
                (recibo) =>
                  String(
                    recibo.numeroRecibo || ""
                  ).trim() ===
                  String(
                    registro.numeroRecibo
                  ).trim()
              );
          }

          // ---------------------------------------------------
          // Si no lo encontramos por numeroRecibo,
          // buscamos por cuota + año + mes
          // ---------------------------------------------------

          if (!reciboEncontrado) {

            reciboEncontrado =
              todosLosRecibos.find(
                (recibo) => {

                  const mismaCuota =
                    registro.numeroCuota !==
                      undefined &&
                    recibo.numeroCuota !==
                      undefined &&
                    Number(
                      recibo.numeroCuota
                    ) ===
                      Number(
                        registro.numeroCuota
                      );

                  const mismoAnio =
                    registro.anio !==
                      undefined &&
                    recibo.anio !==
                      undefined &&
                    Number(
                      recibo.anio
                    ) ===
                      Number(
                        registro.anio
                      );

                  const mismoMes =
                    registro.mes !==
                      undefined &&
                    recibo.mes !==
                      undefined &&
                    Number(
                      recibo.mes
                    ) ===
                      Number(
                        registro.mes
                      );

                  return (
                    mismaCuota &&
                    mismoAnio &&
                    mismoMes
                  );
                }
              );
          }

          // ---------------------------------------------------
          // Si todavía no encontramos recibo,
          // intentamos solamente año + mes
          // ---------------------------------------------------

          if (!reciboEncontrado) {

            reciboEncontrado =
              todosLosRecibos.find(
                (recibo) => {

                  const mismoAnio =
                    registro.anio !==
                      undefined &&
                    recibo.anio !==
                      undefined &&
                    Number(
                      recibo.anio
                    ) ===
                      Number(
                        registro.anio
                      );

                  const mismoMes =
                    registro.mes !==
                      undefined &&
                    recibo.mes !==
                      undefined &&
                    Number(
                      recibo.mes
                    ) ===
                      Number(
                        registro.mes
                      );

                  return (
                    mismoAnio &&
                    mismoMes
                  );
                }
              );
          }

          // ===================================================
          // 10. BUSCAR PDF
          // ===================================================

          let pdfUrl = "";

          if (reciboEncontrado) {

            pdfUrl =
              reciboEncontrado.pdfUrl ||
              reciboEncontrado.archivoUrl ||
              reciboEncontrado.urlPdf ||
              reciboEncontrado.url ||
              "";
          }

          // ---------------------------------------------------
          // Si el recibo existe pero no tiene URL,
          // buscamos directamente en Storage.
          // ---------------------------------------------------

          if (
            !pdfUrl &&
            reciboEncontrado?.numeroRecibo
          ) {

            const nombreArchivo =
              `Recibo-${reciboEncontrado.numeroRecibo}.pdf`;

            const rutaStorage =
              `recibos/${nombreArchivo}`;

            try {

              const archivoRef =
                ref(
                  storage,
                  rutaStorage
                );

              pdfUrl =
                await getDownloadURL(
                  archivoRef
                );

              console.log(
                "PDF ENCONTRADO EN STORAGE:",
                rutaStorage
              );

            } catch (errorPdf) {

              console.log(
                "PDF NO ENCONTRADO EN STORAGE:",
                rutaStorage
              );
            }
          }

          // ===================================================
          // 11. GUARDAR RESULTADO
          // ===================================================

          resultados.push({
            ...registro,

            recibo: reciboEncontrado,

            pdfUrl,
          });
        }

        // =====================================================
        // 12. EVITAR DUPLICADOS
        // =====================================================
        //
        // Un pago/liquidación debe aparecer una sola vez.
        //
        // Primero usamos el ID del registro principal.
        // Si no existe, usamos cuota + año + mes.
        // =====================================================

        const mapaResultados =
          new Map();

        resultados.forEach(
          (resultado) => {

            const clave =
              resultado.id ||
              `${resultado.numeroCuota || ""}-${resultado.anio || ""}-${resultado.mes || ""}`;

            if (
              !mapaResultados.has(
                clave
              )
            ) {
              mapaResultados.set(
                clave,
                resultado
              );
            }
          }
        );

        const resultadosFinales =
          Array.from(
            mapaResultados.values()
          );

        // =====================================================
        // 13. ORDENAR POR FECHA
        // =====================================================

        const convertirFecha = (
          valor
        ) => {

          if (!valor) {
            return 0;
          }

          if (
            typeof valor.toDate ===
            "function"
          ) {
            return valor
              .toDate()
              .getTime();
          }

          if (
            valor instanceof Date
          ) {
            return valor.getTime();
          }

          if (
            typeof valor === "object" &&
            valor.seconds !== undefined
          ) {
            return (
              Number(
                valor.seconds
              ) * 1000
            );
          }

          const fecha =
            new Date(valor);

          return isNaN(
            fecha.getTime()
          )
            ? 0
            : fecha.getTime();
        };

        resultadosFinales.sort(
          (a, b) => {

            const fechaA =
              convertirFecha(
                a.fechaPago
              ) ||
              convertirFecha(
                a.fechaCobro
              ) ||
              convertirFecha(
                a.fechaVencimiento
              );

            const fechaB =
              convertirFecha(
                b.fechaPago
              ) ||
              convertirFecha(
                b.fechaCobro
              ) ||
              convertirFecha(
                b.fechaVencimiento
              );

            return (
              fechaB - fechaA
            );
          }
        );

        console.log(
          "======================================"
        );

        console.log(
          "RESULTADO FINAL PARA EL CLIENTE:"
        );

        console.log(
          resultadosFinales
        );

        console.log(
          "CANTIDAD FINAL:",
          resultadosFinales.length
        );

        console.log(
          "======================================"
        );

        setRecibos(
          resultadosFinales
        );

      } catch (err) {

        console.error(
          "ERROR CARGANDO DATOS:",
          err
        );

        setError(
          "Ocurrió un error al cargar la información."
        );

      } finally {

        setCargando(false);
      }
    };

    cargarDatos();

  }, [
    loading,
    user,
    rol,
    contratoId,
  ]);

  // =========================================================
  // LOADING
  // =========================================================

  if (
    loading ||
    rol === null ||
    rol === undefined ||
    cargando
  ) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
        }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  if (
    !user ||
    rol !== "cliente"
  ) {
    return null;
  }

  // =========================================================
  // FECHA
  // =========================================================

  const formatearFecha = (
    timestamp
  ) => {

    if (!timestamp) {
      return "-";
    }

    try {

      let fecha;

      if (
        typeof timestamp.toDate ===
        "function"
      ) {
        fecha =
          timestamp.toDate();
      } else if (
        timestamp instanceof Date
      ) {
        fecha = timestamp;
      } else if (
        typeof timestamp ===
          "object" &&
        timestamp.seconds !==
          undefined
      ) {
        fecha = new Date(
          Number(
            timestamp.seconds
          ) * 1000
        );
      } else {
        fecha =
          new Date(timestamp);
      }

      if (
        isNaN(
          fecha.getTime()
        )
      ) {
        return "-";
      }

      return fecha.toLocaleDateString(
        "es-AR",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }
      );

    } catch {

      return "-";
    }
  };

  // =========================================================
  // MONEDA
  // =========================================================

  const formatearMoneda = (
    valor
  ) => {

    const numero =
      Number(valor || 0);

    return numero.toLocaleString(
      "es-AR",
      {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // =========================================================
  // DATOS VISUALES
  // =========================================================

  const esLocador =
    tipoCliente === "locador";

  const titulo =
    esLocador
      ? "Mis liquidaciones"
      : "Mis pagos";

  const descripcion =
    esLocador
      ? "Consultá las liquidaciones correspondientes a este contrato."
      : "Consultá los pagos realizados correspondientes a este contrato.";

  // =========================================================
  // TOTAL REGISTRADO
  // =========================================================

  const totalRegistrado =
    recibos.reduce(
      (total, registro) => {

        const importe =
          esLocador
            ? (
                registro.montoLiquidado ??
                registro.montoFinal ??
                0
              )
            : (
                registro.montoCobrado ??
                registro.montoFinal ??
                0
              );

        return (
          total +
          Number(importe || 0)
        );
      },
      0
    );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="min-vh-100"
      style={{
        background: "#f5f6f8",
        paddingTop: "100px",
        paddingBottom: "50px",
      }}
    >

      <Container>

        {/* VOLVER */}

        <Button
          variant="link"
          className="text-dark p-0 mb-4"
          onClick={() =>
            navigate(
              `/cliente/contrato/${contratoId}`
            )
          }
        >
          ← Volver al contrato
        </Button>

        {/* ENCABEZADO */}

        <div className="mb-4">

          <div className="d-flex align-items-center gap-3 flex-wrap">

            <h2 className="fw-bold mb-0">
              {titulo}
            </h2>

            <Badge
              bg={
                esLocador
                  ? "primary"
                  : "success"
              }
            >
              {esLocador
                ? "Locador"
                : "Locatario"}
            </Badge>

          </div>

          <p className="text-muted mt-2 mb-0">
            {descripcion}
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}

        {/* CONTRATO */}

        {contrato && !error && (

          <Card className="border-0 shadow-sm mb-4">

            <Card.Body>

              <Row className="g-3">

                <Col
                  xs={12}
                  md={6}
                >

                  <small className="text-muted">
                    Propiedad
                  </small>

                  <div className="fw-semibold">
                    {contrato.propiedadTitulo ||
                      "-"}
                  </div>

                </Col>

                <Col
                  xs={12}
                  md={6}
                >

                  <small className="text-muted">
                    Contrato
                  </small>

                  <div
                    className="fw-semibold"
                    style={{
                      wordBreak:
                        "break-all",
                    }}
                  >
                    {contrato.id}
                  </div>

                </Col>

              </Row>

            </Card.Body>

          </Card>
        )}

        {/* RESUMEN */}

        {!error && (

          <Row className="g-3 mb-4">

            <Col
              xs={12}
              md={4}
            >

              <Card className="border-0 shadow-sm h-100">

                <Card.Body>

                  <small className="text-muted">
                    Registros pagados
                  </small>

                  <h3 className="fw-bold mb-0 mt-1">
                    {recibos.length}
                  </h3>

                </Card.Body>

              </Card>

            </Col>

            <Col
              xs={12}
              md={4}
            >

              <Card className="border-0 shadow-sm h-100">

                <Card.Body>

                  <small className="text-muted">
                    Total registrado
                  </small>

                  <h4 className="fw-bold mb-0 mt-2">
                    {formatearMoneda(
                      totalRegistrado
                    )}
                  </h4>

                </Card.Body>

              </Card>

            </Col>

            <Col
              xs={12}
              md={4}
            >

              <Card className="border-0 shadow-sm h-100">

                <Card.Body>

                  <small className="text-muted">
                    Estado del contrato
                  </small>

                  <div className="mt-2">

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

                </Card.Body>

              </Card>

            </Col>

          </Row>
        )}

        {/* TABLA */}

        {!error && (

          <Card className="border-0 shadow-sm">

            <Card.Body className="p-4">

              <h4 className="fw-bold mb-4">
                {esLocador
                  ? "Liquidaciones"
                  : "Pagos realizados"}
              </h4>

              {recibos.length === 0 ? (

                <div className="text-center py-5">

                  <h5>
                    No hay registros pagados
                  </h5>

                  <p className="text-muted mb-0">

                    {esLocador
                      ? "Todavía no existen liquidaciones pagadas para este contrato."
                      : "Todavía no existen pagos pagados para este contrato."}

                  </p>

                </div>

              ) : (

                <div className="table-responsive">

                  <Table
                    hover
                    className="align-middle"
                  >

                    <thead>

                      <tr>

                        <th>
                          Fecha
                        </th>

                        <th>
                          Recibo
                        </th>

                        <th>
                          Total
                        </th>

                        <th>
                          Abonado
                        </th>

                        <th>
                          Saldo
                        </th>

                        <th>
                          Acciones
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {recibos.map(
                        (registro) => {

                          const recibo =
                            registro.recibo;

                          // ---------------------------------
                          // FECHA
                          // ---------------------------------

                          const fecha =
                            registro.fechaPago ||
                            recibo?.fechaCobro ||
                            registro.fechaCobro ||
                            registro.fechaVencimiento;

                          // ---------------------------------
                          // NUMERO RECIBO
                          // ---------------------------------

                          const numeroRecibo =
                            recibo?.numeroRecibo ||
                            registro.numeroRecibo ||
                            "-";

                          // ---------------------------------
                          // TOTAL
                          // ---------------------------------

                          const total =
                            esLocador
                              ? (
                                  registro.montoLiquidado ??
                                  registro.montoFinal ??
                                  recibo?.montoLiquidado ??
                                  recibo?.montoFinal ??
                                  0
                                )
                              : (
                                  registro.montoFinal ??
                                  recibo?.montoFinal ??
                                  registro.montoBase ??
                                  0
                                );

                          // ---------------------------------
                          // ABONADO
                          // ---------------------------------

                          const abonado =
                            registro.montoCobrado ??
                            registro.montoFinal ??
                            recibo?.montoCobrado ??
                            recibo?.montoFinal ??
                            0;

                          // ---------------------------------
                          // SALDO
                          // ---------------------------------

                          const saldo = Math.max(
                            0,
                            Number(total || 0) -
                            Number(abonado || 0)
                          );

                          // ---------------------------------
                          // PDF
                          // ---------------------------------

                          const urlPdf =
                            registro.pdfUrl ||
                            recibo?.pdfUrl ||
                            recibo?.archivoUrl ||
                            recibo?.urlPdf ||
                            recibo?.url ||
                            "";

                          return (

                            <tr
                              key={
                                registro.id
                              }
                            >

                              {/* FECHA */}

                              <td>

                                {formatearFecha(
                                  fecha
                                )}

                              </td>

                              {/* RECIBO */}

                              <td>

                                <span
                                  className="fw-semibold"
                                >
                                  {numeroRecibo}
                                </span>

                              </td>

                              {/* TOTAL */}

                              <td className="fw-semibold">

                                {formatearMoneda(
                                  total
                                )}

                              </td>

                              {/* ABONADO */}

                              <td>

                                {formatearMoneda(
                                  abonado
                                )}

                              </td>

                              {/* SALDO */}

                              <td>

                                <span
                                  className={
                                    saldo > 0
                                      ? "text-danger fw-semibold"
                                      : "text-success fw-semibold"
                                  }
                                >
                                  {formatearMoneda(
                                    saldo
                                  )}
                                </span>

                              </td>

                              {/* ACCIONES */}

                              <td>

                                {urlPdf ? (

                                  <Button
                                    size="sm"
                                    variant="outline-dark"
                                    href={urlPdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Ver recibo
                                  </Button>

                                ) : (

                                  <span className="text-muted">
                                    Sin PDF
                                  </span>

                                )}

                              </td>

                            </tr>

                          );
                        }
                      )}

                    </tbody>

                  </Table>

                </div>
              )}

            </Card.Body>

          </Card>
        )}

      </Container>

    </div>
  );
};

export default ClientePagos;
