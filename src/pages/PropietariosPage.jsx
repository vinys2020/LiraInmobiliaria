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


import { getAuth } from "firebase/auth";

const auth = getAuth();

export default function PropietariosPage() {

  const [busqueda, setBusqueda] = useState("");
  const [propietarios, setPropietarios] = useState([]);
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
            c.roles.includes("locador")
        );

      // Eliminar duplicados
      const propietariosUnicos = [];
      const vistos = new Set();

      data.forEach((cliente) => {

        const clave =
          cliente.dni?.trim() ||
          cliente.cuil?.trim() ||
          cliente.nombre?.trim().toLowerCase();

        if (!vistos.has(clave)) {
          vistos.add(clave);
          propietariosUnicos.push(cliente);
        }

      });

      propietariosUnicos.sort((a, b) =>
        (a.nombre || "").localeCompare(
          b.nombre || "",
          "es",
          { sensitivity: "base" }
        )
      );

      setPropietarios(propietariosUnicos);
      setLoading(false);

    });

    return () => unsub();

  }, []);

  const guardarCambiosCliente = async () => {
    try {

      let archivosFinales = [];

      // Archivos que ya existían
      const archivosExistentes =
        formEdicion.archivos.filter(
          (a) => a.url
        );

      archivosFinales = [...archivosExistentes];

      // Archivos nuevos
      const archivosNuevos =
        formEdicion.archivos.filter(
          (a) => a.file
        );

      for (const archivo of archivosNuevos) {

        const storageRef = ref(
          storage,
          `clientes/${clienteArchivos.id}/${Date.now()}-${archivo.nombre}`
        );

        await uploadBytes(
          storageRef,
          archivo.file
        );

        const url =
          await getDownloadURL(storageRef);

        archivosFinales.push({
          nombre: archivo.nombre,
          url,
          createdAt: new Date(),
        });
      }

      await updateDoc(
        doc(db, "Clientes", clienteArchivos.id),
        {
          nombre: formEdicion.nombre,
          dni: formEdicion.dni,
          cuil: formEdicion.cuil,
          email: formEdicion.email,
          telefono1: formEdicion.telefono1,
          telefono2: formEdicion.telefono2,
          observaciones: formEdicion.observaciones,
          imagenPerfil: formEdicion.imagenPerfil,
          estado: formEdicion.estado,

          // 👇 IMPORTANTE
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
      alert("Error al eliminar cliente");
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

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
        }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            style={{
              width: "4rem",
              height: "4rem",
            }}
          />
          <p className="mt-3 fw-semibold">
            Cargando información...
          </p>
        </div>
      </div>
    );
  }

  const propietariosFiltrados = propietarios.filter((cliente) => {
    const texto = busqueda.toLowerCase().trim();

    return (
      cliente.nombre?.toLowerCase().includes(texto) ||
      cliente.dni?.toLowerCase().includes(texto) ||
      cliente.cuil?.toLowerCase().includes(texto) ||
      cliente.email?.toLowerCase().includes(texto) ||
      cliente.telefono1?.toLowerCase().includes(texto)
    );
  });

  return (
    <div
      className="container-fluid py-5"
      style={{
        maxWidth: 1300,
        marginTop: 80,
      }}
    >
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold">
          <i className="bi bi-house-fill me-2"></i>
          Propietarios
        </h2>

        <p className="text-muted mb-0">
          Total registrados: {propietarios.length}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border"></div>
        </div>
      ) : (
        <div className="card shadow border-0">
          <div className="card-body">

            <div className="row mb-3">
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

              <div className="col-md-6 text-end">
                <span className="badge bg-primary fs-6">
                  Resultados: {propietariosFiltrados.length}
                </span>
              </div>
            </div>

            <div className="table-responsive">

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

                  {propietarios.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center"
                      >
                        No hay propietarios registrados
                      </td>
                    </tr>
                  ) : (
                    propietariosFiltrados.map((cliente) => (<tr key={cliente.id}>

                      <td>

                        {cliente.imagenPerfil ? (
                          <img
                            src={cliente.imagenPerfil}
                            alt=""
                            width="50"
                            height="50"
                            className="rounded-circle object-fit-cover"
                          />
                        ) : (
                          <div
                            className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: 50,
                              height: 50,
                            }}
                          >
                            <i className="bi bi-person-fill"></i>
                          </div>
                        )}

                      </td>

                      <td className="fw-semibold">
                        {cliente.nombre || "-"}
                      </td>

                      <td>{cliente.dni || "-"}</td>

                      <td>{cliente.email || "-"}</td>

                      <td>{cliente.telefono1 || "-"}</td>

                      <td>

                        <span
                          className={`badge ${cliente.estado
                            ? "bg-success"
                            : "bg-danger"
                            }`}
                        >
                          {cliente.estado
                            ? "Activo"
                            : "Inactivo"}
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
                          onClick={() =>
                            setClienteArchivos(cliente)
                          }
                        >
                          <i className="bi bi-eye-fill me-1"></i>
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
        </div>
      )}

      {/* MODAL */}
      {clienteArchivos && (
        <>
          <div className="modal-backdrop fade show"></div>

          <div className="modal d-block">
            <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">

              <div className="modal-content">

                <div className="modal-header">

                  <h5 className="modal-title">
                    <i className="bi bi-person-vcard-fill me-2"></i>
                    {modoEdicion
                      ? `Editar Cliente - ${clienteArchivos.nombre}`
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

                <div className="modal-body">

                  {/* DATOS */}
                  <div className="card mb-4 border-0 shadow-sm">

                    <div className="card-header bg-dark text-white">
                      Datos del Propietario
                    </div>

                    <div className="card-body">
                      <div className="text-center mb-4">

                        {clienteArchivos.imagenPerfil ? (

                          <img
                            src={clienteArchivos.imagenPerfil}
                            alt={clienteArchivos.nombre}
                            className="rounded-circle border shadow-sm"
                            style={{
                              width: "120px",
                              height: "120px",
                              objectFit: "cover"
                            }}
                          />

                        ) : (

                          <div
                            className="bg-secondary text-white rounded-circle d-inline-flex align-items-center justify-content-center"
                            style={{
                              width: "120px",
                              height: "120px",
                              fontSize: "40px"
                            }}
                          >
                            <i className="bi bi-person-fill"></i>
                          </div>

                        )}

                      </div>

                      <div className="row g-3">
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

                        <div className="col-md-6">
                          <strong>Estado:</strong><br />

                          <span
                            className={`badge ${clienteArchivos.estado
                              ? "bg-success"
                              : "bg-danger"
                              }`}
                          >
                            {clienteArchivos.estado
                              ? "Activo"
                              : "Inactivo"}
                          </span>
                        </div>

                        <div className="col-md-6">
                          <strong>Roles:</strong><br />

                          {clienteArchivos.roles?.length > 0
                            ? clienteArchivos.roles.map((rol, i) => (
                              <span
                                key={i}
                                className="badge bg-primary me-1"
                              >
                                {rol}
                              </span>
                            ))
                            : "-"}
                        </div>

                        <div className="col-md-6">
                          <strong>Creado:</strong><br />
                          {formatFecha(clienteArchivos.createdAt)}
                        </div>

                        <div className="col-md-6">
                          <strong>Actualizado:</strong><br />
                          {formatFecha(clienteArchivos.updatedAt)}
                        </div>

                        <div className="col-12">
                          <strong>Observaciones:</strong>

                          {modoEdicion ? (
                            <textarea
                              rows="4"
                              className="form-control mt-2"
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
                              {clienteArchivos.observaciones ||
                                "Sin observaciones"}
                            </div>
                          )}
                        </div>

                      </div>

                    </div>

                  </div>

                  {/* ARCHIVOS */}
                  <div className="card border-0 shadow-sm">

                    <div className="card-header bg-primary text-white">
                      Archivos Adjuntos
                    </div>

                    <div className="card-body">

                      {!modoEdicion ? (

                        !clienteArchivos.archivos?.length ? (

                          <div className="alert alert-warning mb-0">
                            Este propietario no posee archivos cargados.
                          </div>

                        ) : (

                          <div className="list-group">

                            {clienteArchivos.archivos.map((archivo, index) => (

                              <a
                                key={index}
                                href={archivo.url}
                                target="_blank"
                                rel="noreferrer"
                                className="list-group-item list-group-item-action"
                              >
                                <div className="d-flex justify-content-between align-items-center">

                                  <div>
                                    <i className="bi bi-file-earmark-pdf-fill text-danger me-2"></i>
                                    {archivo.nombre}
                                  </div>

                                  <small className="text-muted">
                                    {formatFecha(archivo.createdAt)}
                                  </small>

                                </div>
                              </a>

                            ))}

                          </div>

                        )

                      ) : (

                        <>
                          {formEdicion.archivos?.length > 0 && (

                            <div className="list-group mb-3">

                              {formEdicion.archivos.map((archivo, index) => (

                                <div
                                  key={index}
                                  className="list-group-item"
                                >
                                  <div className="d-flex justify-content-between align-items-center">

                                    <div>
                                      <i className="bi bi-file-earmark-pdf-fill text-danger me-2"></i>
                                      {archivo.nombre}
                                    </div>

                                    <button
                                      type="button"
                                      className="btn btn-sm btn-danger"
                                      onClick={() => {

                                        const nuevosArchivos =
                                          formEdicion.archivos.filter(
                                            (_, i) => i !== index
                                          );

                                        setFormEdicion({
                                          ...formEdicion,
                                          archivos: nuevosArchivos,
                                        });

                                      }}
                                    >
                                      <i className="bi bi-trash-fill"></i>
                                    </button>

                                  </div>
                                </div>

                              ))}

                            </div>

                          )}

                          <div className="border rounded p-3 bg-light">

                            <label className="form-label fw-bold">
                              Agregar archivos
                            </label>

                            <input
                              type="file"
                              multiple
                              className="form-control"
                              onChange={(e) => {

                                const nuevosArchivos = Array.from(
                                  e.target.files || []
                                ).map((file) => ({
                                  nombre: file.name,
                                  file,
                                }));

                                setFormEdicion({
                                  ...formEdicion,
                                  archivos: [
                                    ...(formEdicion.archivos || []),
                                    ...nuevosArchivos,
                                  ],
                                });

                              }}
                            />

                          </div>
                        </>

                      )}

                    </div>

                  </div>

                </div>

                <div className="modal-footer">

                  {!modoEdicion ? (

                    <button
                      className="btn btn-warning"
                      onClick={() => {
                        setModoEdicion(true);

                        setFormEdicion({
                          nombre: clienteArchivos.nombre || "",
                          dni: clienteArchivos.dni || "",
                          cuil: clienteArchivos.cuil || "",
                          email: clienteArchivos.email || "",
                          telefono1: clienteArchivos.telefono1 || "",
                          telefono2: clienteArchivos.telefono2 || "",
                          observaciones: clienteArchivos.observaciones || "",
                          imagenPerfil: clienteArchivos.imagenPerfil || "",
                          estado: clienteArchivos.estado ?? true,
                          roles: clienteArchivos.roles || [],
                          archivos: clienteArchivos.archivos || [],
                        });
                      }}
                    >
                      <i className="bi bi-pencil-fill me-2"></i>
                      Modificar
                    </button>

                  ) : (

                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setModoEdicion(false);
                        }}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        Cancelar
                      </button>

                      <button
                        className="btn btn-success"
                        onClick={guardarCambiosCliente}
                      >
                        <i className="bi bi-check-circle-fill me-2"></i>
                        Guardar Cambios
                      </button>
                    </>

                  )}

                  <button
                    className="btn btn-danger me-auto"
                    onClick={eliminarCliente}
                  >
                    <i className="bi bi-trash-fill me-2"></i>
                    Eliminar Cliente
                  </button>

                  <button
                    className="btn btn-outline-dark"
                    onClick={() => {
                      setModoEdicion(false);
                      setClienteArchivos(null);
                    }}
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