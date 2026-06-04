import React, { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { db } from "../config/firebase";

export default function RecibosLiquidacionModal({
  mostrarRecibos,
  setMostrarRecibos,
  contratoRecibosLiquidacion,
}) {
  const [recibos, setRecibos] = useState([]);

  // =====================================================
  // OBTENER RECIBOS
  // =====================================================

useEffect(() => {
  if (!mostrarRecibos || !contratoRecibosLiquidacion?.id) return;

  const ref = collection(db, "Recibos");

  const unsub = onSnapshot(ref, (snap) => {
    const data = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    console.log("📦 TODOS RECIBOS LIQUIDACIÓN:", data);

const filtrados = data.filter((r) => {
  const tipo = (r.tipo || "").toString().toLowerCase().trim();

  const propiedadMatch =
    r.propiedadTitulo === contratoRecibosLiquidacion?.propiedadTitulo;

  return (
    tipo === "liquidacion" &&
    r.esLiquidacion === true &&
    propiedadMatch &&
    r.pdfUrl
  );
});

    console.log("🎯 FILTRADOS LIQUIDACIÓN:", filtrados);

    setRecibos(filtrados);
  });

  return () => unsub();
}, [mostrarRecibos, contratoRecibosLiquidacion?.id]);

  // =====================================================
  // ELIMINAR
  // =====================================================

  const eliminarRecibo = async (id) => {
    const ok = window.confirm(
      "¿Eliminar recibo?"
    );

    if (!ok) return;

    try {
      await deleteDoc(
        doc(db, "Recibos", id)
      );

      console.log("✅ RECIBO ELIMINADO");
    } catch (error) {
      console.error(
        "❌ ERROR ELIMINANDO:",
        error
      );
    }
  };

  // =====================================================
  // CERRAR
  // =====================================================

  if (!mostrarRecibos) return null;


  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div
        className="modal fade show d-block"
        tabIndex="-1"
      >
        <div className="modal-dialog modal-xl modal-dialog-centered">
          <div className="modal-content">

            {/* HEADER */}
            <div className="modal-header">
              <h5 className="modal-title">
                HISTORIAL DE RECIBOS PROPIETARIO
              </h5>

              <button
                type="button"
                className="btn-close"
                onClick={() =>
                  setMostrarRecibos(false)
                }
              ></button>
            </div>

            {/* BODY */}
            <div className="modal-body">
              <div style={{ overflowX: "auto" }}>
                <table className="table table-bordered align-middle mb-0">

                  <thead className="table-light">
                    <tr>
                      <th>Fecha</th>
                      <th>Recibo</th>
                      <th>Total</th>
                      <th>Abonado</th>
                      <th>Saldo</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recibos.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center text-muted"
                        >
                          Sin recibos
                        </td>
                      </tr>
                    ) : (
                      recibos.map((r) => (
                        <tr key={r.id}>

                          {/* FECHA */}
                          <td>
                            {
                              r.fechaCobro
                                ? (
                                    r.fechaCobro?.toDate
                                      ? r.fechaCobro
                                          .toDate()
                                          .toLocaleDateString("es-AR")
                                      : new Date(
                                          r.fechaCobro
                                        ).toLocaleDateString("es-AR")
                                  )
                                : "-"
                            }
                          </td>

                          {/* RECIBO */}
                          <td>
                            {r.numeroRecibo || "S/N"}
                          </td>

                          {/* TOTAL */}
                          <td>
                            $
                            {Number(
                              r.montoFinal || 0
                            ).toLocaleString("es-AR")}
                          </td>

                          {/* ABONADO */}
                          <td>
                            $
                            {Number(
                              r.montoFinal || 0
                            ).toLocaleString("es-AR")}
                          </td>

                          {/* SALDO */}
                          <td>
                            $0
                          </td>

                          {/* ACCIONES */}
                          <td>
                            <div className="d-flex gap-2 flex-wrap">

                              {/* VER PDF */}
                              <button
                                className="btn btn-info btn-sm"
                                onClick={() => {
                                  if (!r.pdfUrl) {
                                    alert(
                                      "Este recibo no tiene PDF"
                                    );
                                    return;
                                  }

                                  window.open(
                                    r.pdfUrl,
                                    "_blank"
                                  );
                                }}
                              >
                                Ver
                              </button>

                              {/* DESCARGAR */}
                              <a
                                href={r.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="btn btn-success btn-sm"
                              >
                                Descargar
                              </a>

                              {/* WHATSAPP */}
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => {
                                  if (!r.pdfUrl) return;

                                  const texto =
                                    `Hola, aquí está tu recibo de liquidación:\n${r.pdfUrl}`;

                                  window.open(
                                    `https://wa.me/?text=${encodeURIComponent(texto)}`,
                                    "_blank"
                                  );
                                }}
                              >
                                WhatsApp
                              </button>

                              {/* ELIMINAR */}
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() =>
                                  eliminarRecibo(r.id)
                                }
                              >
                                Eliminar
                              </button>

                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>

                </table>
              </div>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() =>
                  setMostrarRecibos(false)
                }
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}