import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export default function ProximosPeriodos() {

  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busquedaNombre, setBusquedaNombre] = useState("");




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

    // ==========================================
    // TRAER PAGOS Y CONTRATOS
    // ==========================================

    const [pagosSnap, contratosSnap] =
      await Promise.all([
        getDocs(collection(db, "Pagos")),
        getDocs(collection(db, "Contratos"))
      ]);


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
    // TODOS LOS PAGOS
    // IMPORTANTE:
    // NO MIRAMOS estado
    // ==========================================

    const pagosTodos = pagosSnap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(
        (pago) => pago.contratoId
      );


    // ==========================================
    // AGRUPAR POR CONTRATO
    // ==========================================

    const pagosPorContrato = {};

    pagosTodos.forEach((pago) => {

      if (
        !pagosPorContrato[pago.contratoId]
      ) {

        pagosPorContrato[pago.contratoId] = [];

      }

      pagosPorContrato[pago.contratoId].push(
        pago
      );

    });


    // ==========================================
    // RESULTADOS
    // ==========================================

    const resultados = [];


    // ==========================================
    // REVISAR CADA CONTRATO
    // ==========================================

    Object.entries(
      pagosPorContrato
    ).forEach(
      ([contratoId, pagosContrato]) => {

        const contrato =
          contratosMap[contratoId];


        if (!contrato) {
          return;
        }


        // ==========================================
        // ORDENAR POR NÚMERO DE CUOTA
        // ==========================================

        pagosContrato.sort(
          (a, b) => {

            const cuotaA =
              Number(a.numeroCuota || 0);

            const cuotaB =
              Number(b.numeroCuota || 0);

            return cuotaA - cuotaB;

          }
        );


        // ==========================================
        // COMPARAR PAGO CON PAGO SIGUIENTE
        // ==========================================

        for (
          let i = 0;
          i < pagosContrato.length - 1;
          i++
        ) {

          const pagoActual =
            pagosContrato[i];

          const pagoSiguiente =
            pagosContrato[i + 1];


          // ==========================================
          // NÚMERO DE CUOTA
          // ==========================================

          const cuotaActual =
            Number(
              pagoActual.numeroCuota || 0
            );

          const cuotaSiguiente =
            Number(
              pagoSiguiente.numeroCuota || 0
            );


          // ==========================================
          // PERÍODOS
          // ==========================================

          const periodoActual =
            Number(
              pagoActual.periodoNumero || 0
            );

          const periodoSiguiente =
            Number(
              pagoSiguiente.periodoNumero || 0
            );


          // ==========================================
          // VALIDAR DATOS
          // ==========================================

          if (
            !cuotaActual ||
            !cuotaSiguiente ||
            !periodoActual ||
            !periodoSiguiente
          ) {

            continue;

          }


          // ==========================================
          // SOLO NOS INTERESA EL SIGUIENTE PAGO
          // REALMENTE SIGUIENTE
          // ==========================================

          if (
            cuotaSiguiente !==
            cuotaActual + 1
          ) {

            continue;

          }


          // ==========================================
          // SI EL PERÍODO ES IGUAL
          // NO HAY CAMBIO
          // ==========================================

          if (
            periodoActual ===
            periodoSiguiente
          ) {

            continue;

          }


          // ==========================================
          // ENCONTRAMOS CAMBIO
          //
          // Ejemplo:
          //
          // Cuota 4 → período 1
          // Cuota 5 → período 2
          //
          // Entonces:
          // período actual = 1
          // próximo período = 2
          // cuota cambio = 5
          // ==========================================

          const fechaCambio =
            pagoSiguiente
              .fechaVencimiento
              ?.toDate?.() ||
            pagoSiguiente
              .fecha
              ?.toDate?.() ||
            null;


          // ==========================================
          // GUARDAR
          // ==========================================

          resultados.push({

            // Datos del pago anterior
            ...pagoActual,

            // Contrato
            contrato,

            // Información del cambio
            periodoActual:
              periodoActual,

            proximoPeriodo:
              periodoSiguiente,

            cuotaCambio:
              cuotaSiguiente,

            fechaCambio,

            // Pago donde comienza
            // el nuevo período
            pagoCambio:
              pagoSiguiente

          });


          // ==========================================
          // IMPORTANTE:
          // NO HAY BREAK
          //
          // Así sigue revisando:
          //
          // 1 → 2
          // 2 → 3
          // 3 → 4
          // 4 → 5
          //
          // etc.
          // ==========================================

        }

      }
    );


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


    // ==========================================
    // DEBUG
    // ==========================================

    console.log(
      "TODOS LOS CAMBIOS DE PERÍODO:",
      resultados.map((pago) => ({

        contratoId:
          pago.contratoId,

        cliente:
          pago.clienteNombre,

        cuotaActual:
          pago.numeroCuota,

        periodoActual:
          pago.periodoActual,

        cuotaCambio:
          pago.cuotaCambio,

        proximoPeriodo:
          pago.proximoPeriodo,

        fechaCambio:
          pago.fechaCambio

      }))
    );


    // ==========================================
    // GUARDAR
    // ==========================================

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

    const fecha = pago.fechaCambio;

    const coincideFecha =
      fecha.getMonth() + 1 ===
        Number(mesSeleccionado) &&
      fecha.getFullYear() ===
        Number(anioSeleccionado);

    const nombre =
      String(
        pago.clienteNombre ||
        pago.locatarioNombre ||
        ""
      ).toLowerCase();

    const coincideNombre =
      nombre.includes(
        busquedaNombre.toLowerCase().trim()
      );

    return coincideFecha && coincideNombre;

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

            {/* BUSCADOR */}

<div className="col-md-5">

  <label className="form-label fw-semibold">
    Buscar por nombre
  </label>

  <input
    type="text"
    className="form-control"
    placeholder="Nombre del cliente..."
    value={busquedaNombre}
    onChange={(e) =>
      setBusquedaNombre(e.target.value)
    }
  />

</div>

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