import { useEffect, useState } from "react";

import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

import { db, storage } from "../config/firebase";

export default function InquilinosPage() {

  const [busqueda, setBusqueda] = useState("");
  const [inquilinos, setInquilinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clienteArchivos, setClienteArchivos] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);

  const [formEdicion, setFormEdicion] = useState({
    nombre: "",
    dni: "",
    cuil: "",
    email: "",
    telefono1: "",
    telefono2: "",
    observaciones: "",
    estado: true,
    imagenPerfil: "",
    roles: [],
    archivos: [],
  });

  // =====================================
  // LISTAR SOLO INQUILINOS
  // =====================================
  useEffect(() => {

    const refClientes = collection(db, "Clientes");

    const unsub = onSnapshot(refClientes, (snapshot) => {

      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (c) =>
            Array.isArray(c.roles) &&
            c.roles.includes("locatario")
        );

      // Eliminar duplicados
      const inquilinosUnicos = [];
      const vistos = new Set();

      data.forEach((cliente) => {

        const clave =
          cliente.dni?.trim() ||
          cliente.cuil?.trim() ||
          cliente.nombre?.trim().toLowerCase();

        if (!vistos.has(clave)) {
          vistos.add(clave);
          inquilinosUnicos.push(cliente);
        }

      });

      inquilinosUnicos.sort((a, b) =>
        (a.nombre || "").localeCompare(
          b.nombre || "",
          "es",
          { sensitivity: "base" }
        )
      );

      setInquilinos(inquilinosUnicos);
      setLoading(false);

    });

    return () => unsub();

  }, []);

  // =====================================
  // GUARDAR CAMBIOS
  // =====================================
  const guardarCambiosCliente = async () => {

    try {

      let archivosFinales = [];

      const archivosExistentes =
        formEdicion.archivos.filter((a) => a.url);

      archivosFinales = [...archivosExistentes];

      const archivosNuevos =
        formEdicion.archivos.filter((a) => a.file);

      for (const archivo of archivosNuevos) {

        const storageRef = ref(
          storage,
          `clientes/${clienteArchivos.id}/${Date.now()}-${archivo.nombre}`
        );

        await uploadBytes(storageRef, archivo.file);

        const url = await getDownloadURL(storageRef);

        archivosFinales.push({
          nombre: archivo.nombre,
          url,
          createdAt: new Date(),
        });
      }

      await updateDoc(
        doc(db, "Clientes", clienteArchivos.id),
        {
          ...formEdicion,
          archivos: archivosFinales,
          updatedAt: serverTimestamp(),
        }
      );

      setClienteArchivos({
        ...clienteArchivos,
        ...formEdicion,
        archivos: archivosFinales,
      });

      setModoEdicion(false);

    } catch (error) {
      console.error(error);
    }
  };

  // =====================================
  // ELIMINAR CLIENTE
  // =====================================
  const eliminarCliente = async () => {

    const confirmar = window.confirm(
      `¿Eliminar a ${clienteArchivos.nombre}?`
    );

    if (!confirmar) return;

    try {

      await deleteDoc(
        doc(db, "Clientes", clienteArchivos.id)
      );

      setClienteArchivos(null);
      setModoEdicion(false);

    } catch (error) {
      console.error(error);
      alert("Error al eliminar inquilino");
    }
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "-";

    try {
      const d = fecha?.toDate
        ? fecha.toDate()
        : new Date(fecha);

      return d.toLocaleString("es-AR");
    } catch {
      return "-";
    }
  };

  const inquilinosFiltrados = inquilinos.filter((cliente) => {

    const texto = busqueda.toLowerCase().trim();

    return (
      (cliente.nombre || "").toLowerCase().includes(texto) ||
      (cliente.dni || "").toLowerCase().includes(texto) ||
      (cliente.cuil || "").toLowerCase().includes(texto) ||
      (cliente.email || "").toLowerCase().includes(texto) ||
      (cliente.telefono1 || "").toLowerCase().includes(texto) ||
      (cliente.telefono2 || "").toLowerCase().includes(texto)
    );

  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid py-5" style={{ maxWidth: 1300, marginTop: 80 }}>

      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold">
          <i className="bi bi-person-fill me-2"></i>
          Inquilinos
        </h2>

        <p className="text-muted">
          Total registrados: {inquilinos.length}
        </p>
      </div>

      <div className="row mb-4">

        <div className="col-md-6">

          <div className="input-group">

            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>

            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre, DNI, CUIL, email o teléfono..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

          </div>

        </div>

      </div>

      {/* TABLE */}
      <div className="card shadow border-0">
        <div className="card-body table-responsive">

          <table className="table table-hover align-middle">

            <thead className="table-dark">
              <tr>
                <th>Perfil</th>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Archivos</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>

              {inquilinosFiltrados.length === 0 ? (<tr>
                <td colSpan="8" className="text-center">
                  No hay inquilinos registrados
                </td>
              </tr>
              ) : (
                inquilinosFiltrados.map((cliente) => (<tr key={cliente.id}>

                  <td>
                    {cliente.imagenPerfil ? (
                      <img src={cliente.imagenPerfil} width="50" height="50" className="rounded-circle object-fit-cover" />
                    ) : (
                      <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 50, height: 50 }}>
                        <i className="bi bi-person-fill"></i>
                      </div>
                    )}
                  </td>

                  <td>{cliente.nombre || "-"}</td>
                  <td>{cliente.dni || "-"}</td>
                  <td>{cliente.email || "-"}</td>
                  <td>{cliente.telefono1 || "-"}</td>

                  <td>
                    <span className={`badge ${cliente.estado ? "bg-success" : "bg-danger"}`}>
                      {cliente.estado ? "Activo" : "Inactivo"}
                    </span>
                  </td>

                  <td>
                    <span className="badge bg-primary">
                      {cliente.archivos?.length || 0}
                    </span>
                  </td>

                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setClienteArchivos(cliente)}
                    >
                      Ver Detalle
                    </button>
                  </td>

                </tr>
                ))
              )}

            </tbody>

          </table>

        </div>
      </div>

      {/* MODAL */}
      {/* MODAL */}
      {clienteArchivos && (
        <>
          <div className="modal-backdrop fade show"></div>

          <div className="modal d-block">
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

              <div className="modal-content">

                {/* HEADER */}
                <div className="modal-header">

                  <h5 className="modal-title">
                    <i className="bi bi-person-vcard-fill me-2"></i>
                    {modoEdicion
                      ? `Editar Inquilino - ${clienteArchivos.nombre}`
                      : clienteArchivos.nombre}
                  </h5>

                  <button
                    className="btn-close"
                    onClick={() => {
                      setModoEdicion(false);
                      setClienteArchivos(null);
                    }}
                  />

                </div>

                {/* BODY */}
                <div className="modal-body">

                  {/* ===================== DATOS ===================== */}
                  <div className="card mb-4 border-0 shadow-sm">

                    <div className="card-header bg-dark text-white">
                      Datos del Inquilino
                    </div>

                    <div className="card-body">

                      {/* PERFIL */}
                      <div className="text-center mb-4">

                        {clienteArchivos.imagenPerfil ? (
                          <img
                            src={clienteArchivos.imagenPerfil}
                            className="rounded-circle border shadow-sm"
                            style={{
                              width: 120,
                              height: 120,
                              objectFit: "cover"
                            }}
                            alt=""
                          />
                        ) : (
                          <div
                            className="bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{
                              width: 120,
                              height: 120,
                              fontSize: 40
                            }}
                          >
                            <i className="bi bi-person-fill"></i>
                          </div>
                        )}

                      </div>

                      <div className="row g-3">

                        {/* NOMBRE */}
                        <div className="col-md-6">
                          <strong>Nombre:</strong><br />
                          {modoEdicion ? (
                            <input
                              className="form-control"
                              value={formEdicion.nombre}
                              onChange={(e) =>
                                setFormEdicion({
                                  ...formEdicion,
                                  nombre: e.target.value
                                })
                              }
                            />
                          ) : (
                            clienteArchivos.nombre || "-"
                          )}
                        </div>

                        {/* DNI */}
                        <div className="col-md-6">
                          <strong>DNI:</strong><br />
                          {modoEdicion ? (
                            <input
                              className="form-control"
                              value={formEdicion.dni}
                              onChange={(e) =>
                                setFormEdicion({
                                  ...formEdicion,
                                  dni: e.target.value
                                })
                              }
                            />
                          ) : (
                            clienteArchivos.dni || "-"
                          )}
                        </div>

                        {/* CUIL */}
                        <div className="col-md-6">
                          <strong>CUIL:</strong><br />
                          {modoEdicion ? (
                            <input
                              className="form-control"
                              value={formEdicion.cuil}
                              onChange={(e) =>
                                setFormEdicion({
                                  ...formEdicion,
                                  cuil: e.target.value
                                })
                              }
                            />
                          ) : (
                            clienteArchivos.cuil || "-"
                          )}
                        </div>

                        {/* EMAIL */}
                        <div className="col-md-6">
                          <strong>Email:</strong><br />
                          {modoEdicion ? (
                            <input
                              type="email"
                              className="form-control"
                              value={formEdicion.email}
                              onChange={(e) =>
                                setFormEdicion({
                                  ...formEdicion,
                                  email: e.target.value
                                })
                              }
                            />
                          ) : (
                            clienteArchivos.email || "-"
                          )}
                        </div>

                        {/* TELEFONOS */}
                        <div className="col-md-6">
                          <strong>Teléfono 1:</strong><br />
                          {modoEdicion ? (
                            <input
                              className="form-control"
                              value={formEdicion.telefono1}
                              onChange={(e) =>
                                setFormEdicion({
                                  ...formEdicion,
                                  telefono1: e.target.value
                                })
                              }
                            />
                          ) : (
                            clienteArchivos.telefono1 || "-"
                          )}
                        </div>

                        <div className="col-md-6">
                          <strong>Teléfono 2:</strong><br />
                          {modoEdicion ? (
                            <input
                              className="form-control"
                              value={formEdicion.telefono2}
                              onChange={(e) =>
                                setFormEdicion({
                                  ...formEdicion,
                                  telefono2: e.target.value
                                })
                              }
                            />
                          ) : (
                            clienteArchivos.telefono2 || "-"
                          )}
                        </div>

                        {/* ESTADO */}
                        <div className="col-md-6">
                          <strong>Estado:</strong><br />
                          <span className={`badge ${clienteArchivos.estado ? "bg-success" : "bg-danger"}`}>
                            {clienteArchivos.estado ? "Activo" : "Inactivo"}
                          </span>
                        </div>

                        {/* ROLES */}
                        <div className="col-md-6">
                          <strong>Roles:</strong><br />
                          {clienteArchivos.roles?.map((r, i) => (
                            <span key={i} className="badge bg-primary me-1">
                              {r}
                            </span>
                          ))}
                        </div>

                        {/* FECHAS */}
                        <div className="col-md-6">
                          <strong>Creado:</strong><br />
                          {formatFecha(clienteArchivos.createdAt)}
                        </div>

                        <div className="col-md-6">
                          <strong>Actualizado:</strong><br />
                          {formatFecha(clienteArchivos.updatedAt)}
                        </div>

                        {/* OBSERVACIONES */}
                        <div className="col-12">
                          <strong>Observaciones:</strong>

                          {modoEdicion ? (
                            <textarea
                              className="form-control mt-2"
                              rows={4}
                              value={formEdicion.observaciones}
                              onChange={(e) =>
                                setFormEdicion({
                                  ...formEdicion,
                                  observaciones: e.target.value
                                })
                              }
                            />
                          ) : (
                            <div className="border rounded p-2 mt-1 bg-light">
                              {clienteArchivos.observaciones || "Sin observaciones"}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* ===================== ARCHIVOS ===================== */}
                  <div className="card border-0 shadow-sm">

                    <div className="card-header bg-primary text-white">
                      Archivos Adjuntos
                    </div>

                    <div className="card-body">

                      {!modoEdicion ? (
                        !clienteArchivos.archivos?.length ? (
                          <div className="alert alert-warning mb-0">
                            Este inquilino no tiene archivos.
                          </div>
                        ) : (
                          <div className="list-group">
                            {clienteArchivos.archivos.map((a, i) => (
                              <a
                                key={i}
                                href={a.url}
                                target="_blank"
                                rel="noreferrer"
                                className="list-group-item list-group-item-action"
                              >
                                <i className="bi bi-file-earmark-pdf-fill text-danger me-2"></i>
                                {a.nombre}
                              </a>
                            ))}
                          </div>
                        )
                      ) : (
                        <>
                          {formEdicion.archivos?.map((a, i) => (
                            <div key={i} className="list-group-item d-flex justify-content-between">
                              {a.nombre}

                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => {
                                  setFormEdicion({
                                    ...formEdicion,
                                    archivos: formEdicion.archivos.filter((_, idx) => idx !== i)
                                  });
                                }}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          ))}

                          <input
                            type="file"
                            multiple
                            className="form-control mt-2"
                            onChange={(e) => {
                              const nuevos = Array.from(e.target.files).map(f => ({
                                nombre: f.name,
                                file: f
                              }));

                              setFormEdicion({
                                ...formEdicion,
                                archivos: [...formEdicion.archivos, ...nuevos]
                              });
                            }}
                          />
                        </>
                      )}

                    </div>
                  </div>

                </div>

                {/* FOOTER */}
                <div className="modal-footer">

                  {!modoEdicion ? (
                    <button
                      className="btn btn-warning"
                      onClick={() => {
                        setModoEdicion(true);
                        setFormEdicion(clienteArchivos);
                      }}
                    >
                      Modificar
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => setModoEdicion(false)}
                      >
                        Cancelar
                      </button>

                      <button
                        className="btn btn-success"
                        onClick={guardarCambiosCliente}
                      >
                        Guardar Cambios
                      </button>
                    </>
                  )}

                  <button
                    className="btn btn-danger"
                    onClick={eliminarCliente}
                  >
                    Eliminar
                  </button>

                  <button
                    className="btn btn-dark"
                    onClick={() => setClienteArchivos(null)}
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
  );
}