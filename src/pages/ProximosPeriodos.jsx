import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export default function ProximosPeriodos() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, []);

const cargarDatos = async () => {
  try {
    const pagosSnap = await getDocs(collection(db, "Pagos"));
    const contratosSnap = await getDocs(collection(db, "Contratos"));

    const contratosMap = {};

    contratosSnap.docs.forEach((doc) => {
      contratosMap[doc.id] = {
        id: doc.id,
        ...doc.data()
      };
    });

    // 🔥 agrupar pagos pendientes por contrato
    const pagosPorContrato = {};

    pagosSnap.docs.forEach((doc) => {
      const pago = {
        id: doc.id,
        ...doc.data()
      };

      if (
        !pago.contratoId ||
        String(pago.estado || "").toLowerCase() === "pagado"
      ) {
        return;
      }

      if (!pagosPorContrato[pago.contratoId]) {
        pagosPorContrato[pago.contratoId] = [];
      }

      pagosPorContrato[pago.contratoId].push(pago);
    });

    const resultados = [];

    Object.keys(pagosPorContrato).forEach((contratoId) => {
      const contrato = contratosMap[contratoId];

      if (!contrato) return;

      const periodoActualizacion = Number(
        contrato.periodoActualizacion || 0
      );

      if (!periodoActualizacion) return;

      // 🔥 ordenar cuotas
      const pagosOrdenados = pagosPorContrato[contratoId]
        .sort(
          (a, b) =>
            Number(a.numeroCuota || 0) -
            Number(b.numeroCuota || 0)
        );

      // 🔥 primer pago pendiente
      const pago = pagosOrdenados[0];

      const cuotaActual = Number(
        pago.numeroCuota || 0
      );

      const proximaCuota = cuotaActual + 1;

      if (
        proximaCuota % periodoActualizacion === 0
      ) {
        resultados.push({
          ...pago,
          contrato,
          cuotaCambio: proximaCuota
        });
      }
    });

    resultados.sort(
      (a, b) =>
        Number(a.numeroCuota || 0) -
        Number(b.numeroCuota || 0)
    );

    setPagos(resultados);

  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};
  if (loading) {
    return (
      <div className="container py-5">
        <h4>Cargando...</h4>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Próximos Cambios de Período</h3>

        <span className="badge bg-danger fs-6">
          {pagos.length}
        </span>
      </div>

      <div className="row g-3">

        {pagos.map((pago) => (
          <div
            key={pago.id}
            className="col-12 col-md-6 col-xl-4"
          >
            <div className="card border-0 shadow-sm h-100">

              <div className="card-body">

                <h5 className="fw-bold mb-3">
                  {pago.clienteNombre}
                </h5>

                <p className="mb-2">
                  <strong>Propiedad:</strong>{" "}
                  {pago.propiedadTitulo}
                </p>

                <p className="mb-2">
                  <strong>Periodo actual:</strong>{" "}
                  #{pago.numeroCuota}
                </p>

                <p className="mb-2">
                  <strong>Próximo periodo:</strong>{" "}
                  #{pago.cuotaCambio}
                </p>

                <p className="mb-2">
                  <strong>Actualización:</strong>{" "}
                  Cada {pago.contrato.periodoActualizacion} meses
                </p>

                <p className="mb-2">
                  <strong>Monto actual:</strong>{" "}
                  ${Number(
                    pago.montoBase || 0
                  ).toLocaleString()}
                </p>

                <div className="alert alert-warning mt-3 mb-0">
                  Este contrato cambiará de período en la
                  próxima cuota.
                </div>

              </div>

            </div>
          </div>
        ))}

      </div>

      {!pagos.length && (
        <div className="alert alert-success">
          No hay contratos próximos a cambiar de período.
        </div>
      )}
    </div>
  );
}