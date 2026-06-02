import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import { db } from "../config/firebase";

export default function EstadoCajaPage() {

  const [pagos, setPagos] = useState([]);
  const [liquidaciones, setLiquidaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const pagosRef = query(
      collection(db, "Pagos"),
      orderBy("createdAt", "desc")
    );

    const liquiRef = query(
      collection(db, "Liquidaciones"),
      orderBy("createdAt", "desc")
    );

    const unsubPagos = onSnapshot(pagosRef, (snap) => {

      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      // SOLO pagados (defensivo)
      const filtrados = data.filter(p =>
        String(p.estado || "").trim().toLowerCase() === "pagado"
      );

      setPagos(filtrados);
      setLoading(false);
    });

    const unsubLiqui = onSnapshot(liquiRef, (snap) => {

      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      const filtrados = data.filter(l =>
        String(l.estado || "").trim().toLowerCase() === "pagado"
      );

      setLiquidaciones(filtrados);
      setLoading(false);
    });

    return () => {
      unsubPagos();
      unsubLiqui();
    };

  }, []);

  const formatMoney = (n) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS"
    }).format(n || 0);

  const totalPagos = pagos.reduce(
    (acc, p) => acc + Number(p.montoCobrado || p.montoFinal || 0),
    0
  );

  const totalLiquidaciones = liquidaciones.reduce(
    (acc, l) => acc + Number(l.montoLiquidado || 0),
    0
  );

const totalAdministracion = liquidaciones.reduce(
  (acc, l) => acc + Number(l.montoComision || 0),
  0
);
  const dataGrafico = [
    {
      name: "Caja",
      Pagos: totalPagos,
      Liquidaciones: totalLiquidaciones
    }
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid py-5" style={{ maxWidth: 1300, marginTop: 80 }}>

      <h2 className="fw-bold mb-4">📊 Estado de Caja</h2>

      {/* RESUMEN */}
      <div className="row g-3 mb-4">

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6 className="text-success">Pagos</h6>
              <h3>{pagos.length}</h3>
              <p>{formatMoney(totalPagos)}</p>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm border-0">
            <div className="card-body text-center">
              <h6 className="text-danger">Liquidaciones</h6>
              <h3>{liquidaciones.length}</h3>
              <p>{formatMoney(totalLiquidaciones)}</p>
            </div>
          </div>
        </div>

<div className="col-md-4 ">
  <div className="card shadow-sm border-0">
    <div className="card-body text-center">
      <h6 className="text-dark">
        Ganancia por Administración
      </h6>

      <h3 className="text-success">
        {formatMoney(totalAdministracion)}
      </h3>

    </div>
  </div>
</div>

      </div>

      {/* GRÁFICO */}
<div className="card shadow border-0 p-2">
  <div className="card-body px-4 py-3">

    <h5 className="mb-3">Ingresos vs Egresos</h5>

    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={dataGrafico}
          margin={{ top: 10, right: 20, left: 30, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis width={80} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Pagos" fill="#198754" />
          <Bar dataKey="Liquidaciones" fill="#dc3545" />
        </BarChart>
      </ResponsiveContainer>
    </div>

  </div>
</div>

    </div>
  );
}