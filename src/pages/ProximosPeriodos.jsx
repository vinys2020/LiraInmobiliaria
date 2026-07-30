import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export default function ProximosPeriodos() {

  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);




  // ==========================================
  // MES SELECCIONADO
  // ==========================================

  const hoy = new Date();

  const [mesSeleccionado, setMesSeleccionado] =
    useState(hoy.getMonth() + 1);

  const [anioSeleccionado, setAnioSeleccionado] =
    useState(hoy.getFullYear());


  // ==========================================
  // CARGAR DATOS
  // ==========================================

  useEffect(() => {
    cargarDatos();
  }, []);




  const cargarDatos = async () => {

    try {

      setLoading(true);

      const pagosSnap =
        await getDocs(
          collection(db, "Pagos")
        );

      const contratosSnap =
        await getDocs(
          collection(db, "Contratos")
        );


      // ==========================================
      // MAPA DE CONTRATOS
      // ==========================================

      const contratosMap = {};

      contratosSnap.docs.forEach((doc) => {

        contratosMap[doc.id] = {
          id: doc.id,
          ...doc.data()
        };

      });


      // ==========================================
      // PAGOS PENDIENTES
      // ==========================================

      const resultados = [];


      pagosSnap.docs.forEach((doc) => {

        const pago = {
          id: doc.id,
          ...doc.data()
        };


        // ==========================================
        // VALIDACIONES
        // ==========================================

        if (!pago.contratoId) {
          return;
        }


        if (
          String(
            pago.estado || ""
          ).toLowerCase() === "pagado"
        ) {
          return;
        }


        // ==========================================
        // BUSCAR CONTRATO
        // ==========================================

        const contrato =
          contratosMap[pago.contratoId];


        if (!contrato) {
          return;
        }


        // ==========================================
        // PERÍODO DE ACTUALIZACIÓN
        // ==========================================

        const periodoActualizacion =
          Number(
            contrato.periodoActualizacion || 0
          );


        if (!periodoActualizacion) {
          return;
        }


        // ==========================================
        // CUOTA ACTUAL
        // ==========================================

        const cuotaActual =
          Number(
            pago.numeroCuota || 0
          );


        if (!cuotaActual) {
          return;
        }


        // ==========================================
        // PERÍODO ACTUAL
        // ==========================================

        // Cada X cuotas corresponde a un período.
        // Ejemplo:
        // 1-4   = período 1
        // 5-8   = período 2
        // 9-12  = período 3
        // 13-16 = período 4
        // 17-20 = período 5

        const periodoActual =
          Math.floor(
            (cuotaActual - 1) /
            periodoActualizacion
          ) + 1;


        // ==========================================
        // PRÓXIMO PERÍODO
        // ==========================================

        const proximoPeriodo =
          periodoActual + 1;


        // ==========================================
        // PRÓXIMA CUOTA
        // ==========================================

        const proximaCuota =
          cuotaActual + 1;


        // ==========================================
        // ¿LA PRÓXIMA CUOTA ES DE ACTUALIZACIÓN?
        // ==========================================

        if (
          proximaCuota %
          periodoActualizacion !==
          0
        ) {
          return;
        }


        // ==========================================
        // FECHA BASE
        // ==========================================

        const fechaBase =
          pago.fechaVencimiento
            ?.toDate?.() ||
          pago.fecha
            ?.toDate?.() ||
          null;


        let fechaCambio;


        if (fechaBase) {

          fechaCambio =
            new Date(fechaBase);

          fechaCambio.setMonth(
            fechaCambio.getMonth() + 1
          );

        } else {

          const anioPago =
            Number(
              pago.anio ||
              hoy.getFullYear()
            );

          const mesPago =
            Number(
              pago.mes ||
              hoy.getMonth() + 1
            );


          fechaCambio =
            new Date(
              anioPago,
              mesPago - 1,
              1
            );

          fechaCambio.setMonth(
            fechaCambio.getMonth() + 1
          );

        }


        // ==========================================
        // GUARDAR RESULTADO
        // ==========================================

        resultados.push({


          ...pago,

          contrato,

          cuotaCambio:
            proximaCuota,

          periodoActual,

          proximoPeriodo,

          fechaCambio

        });

      });


      // ==========================================
      // ORDENAR POR FECHA
      // ==========================================

      resultados.sort(
        (a, b) => {

          const fechaA =
            a.fechaCambio?.getTime() || 0;

          const fechaB =
            b.fechaCambio?.getTime() || 0;

          return fechaA - fechaB;

        }
      );


      console.log(
        "TODOS LOS PRÓXIMOS CAMBIOS:",
        resultados
      );


      setPagos(resultados);

    } catch (error) {

      console.error(
        "Error cargando próximos períodos:",
        error
      );

    } finally {

      setLoading(false);

    }

  };

  // ==========================================
  // FILTRAR POR MES
  // ==========================================

  const pagosFiltrados =
    pagos.filter((pago) => {

      if (!pago.fechaCambio) {
        return false;
      }


      const fecha =
        pago.fechaCambio;


      return (
        fecha.getMonth() + 1 ===
        Number(mesSeleccionado) &&
        fecha.getFullYear() ===
        Number(anioSeleccionado)
      );

    });


  // ==========================================
  // NOMBRE MES
  // ==========================================

  const nombreMes =
    new Date(
      anioSeleccionado,
      mesSeleccionado - 1,
      1
    ).toLocaleDateString(
      "es-ES",
      {
        month: "long"
      }
    );


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {

    return (

      <div className="container py-5">

        <h4>
          Cargando próximos períodos...
        </h4>

      </div>

    );

  }


  return (

    <div
      className="container py-5"
      style={{
        maxWidth: 1400,
        marginTop: 80
      }}
    >

      {/* ========================================== */}
      {/* HEADER */}
      {/* ========================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">

        <div>

          <h3 className="mb-1">
            Próximos Cambios de Período
          </h3>

          <small className="text-muted">
            Contratos que actualizan su alquiler
          </small>

        </div>


        <span className="badge bg-danger fs-6">

          {pagosFiltrados.length}

        </span>

      </div>


      {/* ========================================== */}
      {/* FILTROS */}
      {/* ========================================== */}

      <div className="card border-0 shadow-sm mb-4">

        <div className="card-body">

          <div className="row g-3 align-items-end">

            {/* MES */}

            <div className="col-md-4">

              <label className="form-label fw-semibold">
                Mes
              </label>

              <select
                className="form-select"
                value={mesSeleccionado}
                onChange={(e) =>
                  setMesSeleccionado(
                    Number(e.target.value)
                  )
                }
              >

                {[
                  "Enero",
                  "Febrero",
                  "Marzo",
                  "Abril",
                  "Mayo",
                  "Junio",
                  "Julio",
                  "Agosto",
                  "Septiembre",
                  "Octubre",
                  "Noviembre",
                  "Diciembre"
                ].map(
                  (mes, index) => (

                    <option
                      key={index}
                      value={index + 1}
                    >
                      {mes}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* AÑO */}

            <div className="col-md-3">

              <label className="form-label fw-semibold">
                Año
              </label>

              <select
                className="form-select"
                value={anioSeleccionado}
                onChange={(e) =>
                  setAnioSeleccionado(
                    Number(e.target.value)
                  )
                }
              >

                {[
                  hoy.getFullYear() - 1,
                  hoy.getFullYear(),
                  hoy.getFullYear() + 1,
                  hoy.getFullYear() + 2
                ].map(
                  (anio) => (

                    <option
                      key={anio}
                      value={anio}
                    >
                      {anio}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* RESULTADO */}

            <div className="col-md-5">

              <div className="alert alert-info mb-0">

                <strong>
                  {pagosFiltrados.length}
                </strong>{" "}

                contrato
                {pagosFiltrados.length !== 1
                  ? "s"
                  : ""}{" "}

                actualiza
                {pagosFiltrados.length !== 1
                  ? "n"
                  : ""}{" "}

                en{" "}

                <strong>
                  {nombreMes} {anioSeleccionado}
                </strong>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ========================================== */}
      {/* RESULTADOS */}
      {/* ========================================== */}

      <div className="row g-3">

        {pagosFiltrados.map(
          (pago) => (

            <div
              key={pago.id}
              className="col-12 col-md-6 col-xl-4"
            >

              <div className="card border-0 shadow-sm h-100">

                <div className="card-body">

                  <div className="d-flex justify-content-between align-items-start mb-3">

                    <h5 className="fw-bold mb-0">

                      {pago.clienteNombre ||
                        pago.locatarioNombre ||
                        "Cliente sin nombre"}

                    </h5>

                    <span className="badge bg-warning text-dark">

                      Cuota #
                      {pago.cuotaCambio}

                    </span>

                  </div>


                  <p className="mb-2">

                    <strong>
                      Propiedad:
                    </strong>{" "}

                    {pago.propiedadTitulo ||
                      pago.contrato
                        ?.propiedadTitulo ||
                      "Sin propiedad"}

                  </p>


                  <p className="mb-2">

                    <strong>
                      Período actual:
                    </strong>{" "}

                    #{pago.periodoActual}

                  </p>


                  <p className="mb-2">

                    <strong>
                      Próximo período:
                    </strong>{" "}

                    #{pago.proximoPeriodo}

                  </p>


                  <p className="mb-2">

                    <strong>
                      Actualización:
                    </strong>{" "}

                    Cada{" "}

                    {
                      pago.contrato
                        ?.periodoActualizacion
                    }{" "}

                    meses

                  </p>


                  <p className="mb-2">

                    <strong>
                      Monto actual:
                    </strong>{" "}

                    {Number(
                      pago.montoBase || 0
                    ).toLocaleString(
                      "es-ES",
                      {
                        minimumFractionDigits: 2
                      }
                    )}

                  </p>


                  <p className="mb-0">

                    <strong>
                      Cambio:
                    </strong>{" "}

                    {pago.fechaCambio
                      ?.toLocaleDateString(
                        "es-ES"
                      )}

                  </p>


                  <div className="alert alert-warning mt-3 mb-0">

                    Este contrato cambiará
                    de período en la próxima
                    cuota.

                  </div>

                </div>

              </div>

            </div>

          )
        )}

      </div>


      {/* ========================================== */}
      {/* SIN RESULTADOS */}
      {/* ========================================== */}

      {!pagosFiltrados.length && (

        <div className="alert alert-success">

          No hay contratos que cambien de período
          en{" "}

          <strong>
            {nombreMes} {anioSeleccionado}
          </strong>.

        </div>

      )}

    </div>

  );

}