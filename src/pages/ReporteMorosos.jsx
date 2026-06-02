import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

export default function ReporteMorosos() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const pagosRef = collection(db, "Pagos");
            const snap = await getDocs(pagosRef);

            const data = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setClientes(data);
            setLoading(false);
        };

        fetchData();
    }, []);

    // 🔥 estado pendiente real
    const estadoPendiente = (pago) =>
        String(pago.estado || "").toLowerCase().trim() !== "pagado";

    // 🔥 inicio del período (día 1 del mes)
    const getFechaInicio = (pago) => {
        if (!pago?.anio || !pago?.mes) return null;

        const anio = Number(pago.anio);
        const mes = Number(pago.mes) - 1;

        if (isNaN(anio) || isNaN(mes)) return null;

        const inicio = new Date(anio, mes, 1);
        inicio.setHours(0, 0, 0, 0);

        return inicio;
    };

    // 🔥 días de mora correctos
    const getDiasMora = (pago) => {
        const inicio = getFechaInicio(pago);
        if (!inicio) return 0;

        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const dias = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24)) + 1;

        return dias > 0 ? dias : 0;
    };

    // 🔥 semáforo
    const getSemaforo = (dias) => {
        if (dias >= 60) return { label: "Crítico", color: "danger" };
        if (dias >= 30) return { label: "Alto", color: "warning" };
        if (dias > 0) return { label: "Medio", color: "info" };
        return { label: "Sin deuda", color: "success" };
    };

    const morosos = Object.values(
        clientes.reduce((acc, p) => {
            if (!estadoPendiente(p)) return acc;

            const clienteId = p.clienteId;
            if (!clienteId) return acc;

            // 🔥 clave única del pago (evita duplicados reales)
            const keyPago = `${p.clienteId}-${p.anio}-${p.mes}`;

            if (!acc[clienteId]) {
                acc[clienteId] = {
                    clienteId,
                    clienteNombre: p.clienteNombre || "Sin nombre",
                    total: 0,
                    interesTotal: 0,
                    diasMora: 0,
                    _pagos: {}
                };
            }

            // 🔥 si ya sumamos ese pago, lo saltamos
            if (acc[clienteId]._pagos[keyPago]) return acc;

            acc[clienteId]._pagos[keyPago] = true;

            const base = Number(p.montoBase || 0);
            const interes = Number(p.interesGenerado || 0);
            const dias = getDiasMora(p);

            acc[clienteId].total += base;
            acc[clienteId].interesTotal += interes;

            // 🔥 nos quedamos con la mayor mora del cliente
            if (dias > acc[clienteId].diasMora) {
                acc[clienteId].diasMora = dias;
            }

            return acc;
        }, {})
    )
        .map(c => {
            delete c._pagos;
            return c;
        })
        .filter(c => c.diasMora > 0)
        .sort((a, b) => b.interesTotal - a.interesTotal);

    // 🔥 total global correcto
    const totalInteresesGlobal = morosos.reduce(
        (acc, c) => acc + c.interesTotal,
        0
    );

    if (loading) return <p className="p-3">Cargando...</p>;

    return (
        <div className="container py-5" style={{ maxWidth: 1300, marginTop: 80 }}>

            <h3 className="mb-2">Reporte de Morosos</h3>

            <h5 className="mb-4 text-danger">
                Total intereses global: ${totalInteresesGlobal.toLocaleString()}      </h5>

            <div className="row g-3">

                {morosos.map((c, index) => {
                    const semaforo = getSemaforo(c.diasMora);

                    return (
                        <div key={c.clienteId} className="col-12 col-md-6 col-lg-4">

                            <div className="card shadow-sm border-0 h-100">

                                <div className="card-body">

                                    <div className="d-flex justify-content-between align-items-center mb-2">

                                        <h6 className="mb-0">
                                            #{index + 1} {c.clienteNombre}
                                        </h6>

                                        <span className={`badge bg-${semaforo.color}`}>
                                            {semaforo.label}
                                        </span>

                                    </div>

                                    <p className="mb-1">
                                        Días mora: {c.diasMora}
                                    </p>



                                    <p className="mb-1 text-danger fw-semibold">
                                        Intereses acumulados: ${c.interesTotal.toLocaleString()}
                                    </p>



                                </div>

                            </div>

                        </div>
                    );
                })}

            </div>

        </div>
    );
}