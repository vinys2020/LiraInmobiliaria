import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  query,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../config/firebase";
import CardSeleccionPropiedad from "../components/CardSeleccionPropiedad";
import toast from "react-hot-toast";


import "./CustomerDashboard.css";

export default function CustomerDashboard() {

  const [openRow, setOpenRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [contratos, setContratos] = useState([]);

  const storage = getStorage();


  const [formData, setFormData] = useState({
    locador: "",
    locadorDni: "",
    locadorTelefono: "",
    locatario: "",
    locatarioDni: "",
    locatarioTelefono: "",
    garanteNombre: "",
    garanteDni: "",
    garanteTelefono: "",
    fechaInicio: "",
    fechaFin: "",
    precioMensual: "",
    detalles: "",
    acuerdos: "",
    clausulas: "",
    observaciones: "",
    archivo: null,
  });



  useEffect(() => {
    document.body.classList.add("customer-dashboard-body");
    return () => {
      document.body.classList.remove("customer-dashboard-body");
    };
  }, []);

  const normalizeFull = (str) =>
    str
      ?.toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();


  const getContractStatus = (fechaFinStr) => {
    if (!fechaFinStr) return { color: "bg-secondary", porcentaje: 0 };

    // Parsear dd/mm/yyyy a Date
    const [dia, mes, anio] = fechaFinStr.split("/").map(Number);
    const fin = new Date(anio, mes - 1, dia); // mes -1 porque Date usa 0-11
    const hoy = new Date();

    // Diferencia en meses aproximada
    let mesesRestantes = (fin.getFullYear() - hoy.getFullYear()) * 12 + (fin.getMonth() - hoy.getMonth());

    // Asegurar que no sea negativo
    mesesRestantes = Math.max(0, mesesRestantes);

    if (mesesRestantes <= 6) {
      return { color: "bg-danger", porcentaje: 33 };
    } else if (mesesRestantes <= 24) {
      return { color: "bg-warning", porcentaje: 66 };
    } else {
      return { color: "bg-success", porcentaje: 100 };
    }
  };




  useEffect(() => {
    fetchContratos();
  }, []);


  const handleFileUpload = async (e, contratoId) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const storageRef = ref(storage, `contratos/${contratoId}/${file.name}`);

      await uploadBytes(storageRef, file);

      const downloadURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "Contratos", contratoId), {
        archivoUrl: downloadURL,
        updatedAt: serverTimestamp(),
      });

      toast.success("PDF subido correctamente ✅");
      await fetchContratos();

    } catch (error) {
      console.error("Error subiendo archivo:", error);
      toast.error("Error al subir el archivo");
    }
  };



  const toggleRow = (index) => {
    setOpenRow(openRow === index ? null : index);

  };

  const handleBackToSearch = () => {
    // Verifico si hay algún dato completado para preguntar
    const hasData =
      selectedProperty ||
      Object.values(formData).some(value => value && value !== "");
  
    if (hasData) {
      const confirmBack = window.confirm(
        "¿Estás seguro que querés volver? Se eliminará lo completado."
      );
  
      if (!confirmBack) return;
    }
  
    // Resetear propiedad seleccionada y formulario
    setSelectedProperty(null);
    setFormData({
      locador: "",
      locadorDni: "",
      locadorTelefono: "",
      locatario: "",
      locatarioDni: "",
      locatarioTelefono: "",
      garanteNombre: "",
      garanteDni: "",
      garanteTelefono: "",
      fechaInicio: "",
      fechaFin: "",
      precioMensual: "",
      detalles: "",
      acuerdos: "",
      clausulas: "",
      observaciones: "",
      archivo: null,
      archivoUrl: null,
      contratoId: null,
    });
  
    // Cerrar modal si está abierto
    setShowModal(false);
  };
  


  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoadingSearch(true);

      const querySnapshot = await getDocs(collection(db, "Propiedades"));

      const props = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const searchNormalized = normalizeFull(searchTerm);

      const resultados = props.filter((p) => {
        const campos = [
          p.titulo,
          p.direccion?.calle,
          p.direccion?.localidad,
          p.direccion?.provincia,
          p.direccion?.codigoPostal,
        ];

        return campos.some(
          (campo) =>
            campo &&
            normalizeFull(campo).includes(searchNormalized)
        );
      });

      setSearchResults(resultados);
      setLoadingSearch(false);

    } catch (error) {
      console.error("Error buscando propiedades:", error);
      setLoadingSearch(false);
    }
  };


  const handleSaveContract = async () => {
    if (!selectedProperty) return;
  
    try {
      // Validación básica
      if (
        !formData.locador ||
        !formData.locatario ||
        !formData.fechaInicio ||
        !formData.fechaFin
      ) {
        toast.error("Completá los campos obligatorios");
        return;
      }
  
      let archivoUrl = formData.archivoUrl || null;
  
      // Subir PDF si hay archivo seleccionado
      if (formData.archivo) {
        const storageRef = ref(
          storage,
          `contratos/${selectedProperty.id}/${formData.archivo.name}`
        );
        await uploadBytes(storageRef, formData.archivo);
        archivoUrl = await getDownloadURL(storageRef);
      }
  
      // Verifico si es edición o creación
      if (formData.contratoId) {
        // ACTUALIZAR contrato existente
        const contratoRef = doc(db, "Contratos", formData.contratoId);
        await updateDoc(contratoRef, {
          propiedadId: selectedProperty.id,
          propiedadTitulo: selectedProperty.titulo,
          propiedadImagen:
            selectedProperty.imagenes?.length > 0
              ? selectedProperty.imagenes[0]
              : null,
  
          locador: formData.locador,
          locadorDni: formData.locadorDni,
          locadorTelefono: formData.locadorTelefono,
  
          locatario: formData.locatario,
          locatarioDni: formData.locatarioDni,
          locatarioTelefono: formData.locatarioTelefono,
  
          garante: formData.garanteNombre,
          garanteDni: formData.garanteDni,
          garanteTelefono: formData.garanteTelefono,
  
          fechaInicio: new Date(formData.fechaInicio),
          fechaFin: new Date(formData.fechaFin),
  
          precioMensual: Number(formData.precioMensual),
  
          estado: "activo",
  
          detalles: formData.detalles,
          acuerdos: formData.acuerdos,
          clausulas: formData.clausulas,
          observaciones: formData.observaciones,
  
          archivoUrl,
          updatedAt: serverTimestamp(),
        });
  
        // Actualizar estado local
        setContratos(prev =>
          prev.map(c =>
            c.id === formData.contratoId
              ? {
                  ...c,
                  propiedadId: selectedProperty.id,
                  propiedadTitulo: selectedProperty.titulo,
                  propiedadImagen:
                    selectedProperty.imagenes?.length > 0
                      ? selectedProperty.imagenes[0]
                      : null,
                  locador: formData.locador,
                  locadorDni: formData.locadorDni,
                  locadorTelefono: formData.locadorTelefono,
                  locatario: formData.locatario,
                  locatarioDni: formData.locatarioDni,
                  locatarioTelefono: formData.locatarioTelefono,
                  garante: formData.garanteNombre,
                  garanteDni: formData.garanteDni,
                  garanteTelefono: formData.garanteTelefono,
                  fechaInicio: new Date(formData.fechaInicio),
                  fechaFin: new Date(formData.fechaFin),
                  precioMensual: Number(formData.precioMensual),
                  detalles: formData.detalles,
                  acuerdos: formData.acuerdos,
                  clausulas: formData.clausulas,
                  observaciones: formData.observaciones,
                  archivoUrl,
                  inicio: new Date(formData.fechaInicio).toLocaleDateString("es-AR"),
                  fin: new Date(formData.fechaFin).toLocaleDateString("es-AR"),
                }
              : c
          )
        );
  
        toast.success("Contrato actualizado correctamente");
      } else {
        // CREAR nuevo contrato
        const docRef = await addDoc(collection(db, "Contratos"), {
          propiedadId: selectedProperty.id,
          propiedadTitulo: selectedProperty.titulo,
          propiedadImagen:
            selectedProperty.imagenes?.length > 0
              ? selectedProperty.imagenes[0]
              : null,

          propiedadDireccion: selectedProperty.direccion || {}, // <-- agregar esto

  
          locador: formData.locador,
          locadorDni: formData.locadorDni,
          locadorTelefono: formData.locadorTelefono,
  
          locatario: formData.locatario,
          locatarioDni: formData.locatarioDni,
          locatarioTelefono: formData.locatarioTelefono,
  
          garante: formData.garanteNombre,
          garanteDni: formData.garanteDni,
          garanteTelefono: formData.garanteTelefono,
  
          fechaInicio: new Date(formData.fechaInicio),
          fechaFin: new Date(formData.fechaFin),
  
          precioMensual: Number(formData.precioMensual),
  
          estado: "activo",
  
          detalles: formData.detalles,
          acuerdos: formData.acuerdos,
          clausulas: formData.clausulas,
          observaciones: formData.observaciones,
  
          archivoUrl,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
  
        // **Actualizar estado local para que aparezca inmediatamente**
        setContratos(prev => [
          {
            id: docRef.id,
            propiedadId: selectedProperty.id,
            propiedadTitulo: selectedProperty.titulo,
            propiedadImagen:
              selectedProperty.imagenes?.length > 0
                ? selectedProperty.imagenes[0]
                : null,
  
            locador: formData.locador,
            locadorDni: formData.locadorDni,
            locadorTelefono: formData.locadorTelefono,
  
            locatario: formData.locatario,
            locatarioDni: formData.locatarioDni,
            locatarioTelefono: formData.locatarioTelefono,
  
            garante: formData.garanteNombre,
            garanteDni: formData.garanteDni,
            garanteTelefono: formData.garanteTelefono,
  
            fechaInicio: new Date(formData.fechaInicio),
            fechaFin: new Date(formData.fechaFin),
  
            precioMensual: Number(formData.precioMensual),
  
            estado: "activo",
  
            detalles: formData.detalles,
            acuerdos: formData.acuerdos,
            clausulas: formData.clausulas,
            observaciones: formData.observaciones,
  
            archivoUrl,
            inicio: new Date(formData.fechaInicio).toLocaleDateString("es-AR"),
            fin: new Date(formData.fechaFin).toLocaleDateString("es-AR"),
          },
          ...contratos
        ]);
  
        toast.success("Contrato guardado correctamente");
      }
  
      // Resetear modal y formulario
      setShowModal(false);
      setSelectedProperty(null);
      setFormData({
        locador: "",
        locadorDni: "",
        locadorTelefono: "",
        locatario: "",
        locatarioDni: "",
        locatarioTelefono: "",
        garanteNombre: "",
        garanteDni: "",
        garanteTelefono: "",
        fechaInicio: "",
        fechaFin: "",
        precioMensual: "",
        detalles: "",
        acuerdos: "",
        clausulas: "",
        observaciones: "",
        archivo: null,
        archivoUrl: null,
        contratoId: null,
      });
  
    } catch (error) {
      console.error("Error guardando contrato:", error);
      toast.error("Hubo un error al guardar el contrato");
    }
  };
  

  const handleEditContract = async (contrato) => {
    try {
      // Busco la propiedad completa en Firestore
      const propDoc = await getDocs(collection(db, "Propiedades"));
      const propiedadData = propDoc.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .find(p => p.id === contrato.propiedadId);
  
      // Si no existe, usar los datos mínimos del contrato
      const propiedad = propiedadData || {
        id: contrato.propiedadId,
        titulo: contrato.propiedadTitulo,
        imagenes: contrato.propiedadImagen ? [contrato.propiedadImagen] : [],
        direccion: { calle: "", localidad: "" },
      };
  
      setSelectedProperty(propiedad);
  
      const fechaInicio = contrato.fechaInicio?.toDate
        ? contrato.fechaInicio.toDate().toISOString().split("T")[0]
        : new Date(contrato.fechaInicio).toISOString().split("T")[0] || "";
  
      const fechaFin = contrato.fechaFin?.toDate
        ? contrato.fechaFin.toDate().toISOString().split("T")[0]
        : new Date(contrato.fechaFin).toISOString().split("T")[0] || "";
  
      // Aquí usamos **precio y moneda del contrato**, no de la propiedad
      setFormData({
        contratoId: contrato.id,
        locador: contrato.locador || "",
        locadorDni: contrato.locadorDni || "",
        locadorTelefono: contrato.locadorTelefono || "",
        locatario: contrato.locatario || "",
        locatarioDni: contrato.locatarioDni || "",
        locatarioTelefono: contrato.locatarioTelefono || "",
        garanteNombre: contrato.garante || "",
        garanteDni: contrato.garanteDni || "",
        garanteTelefono: contrato.garanteTelefono || "",
        fechaInicio,
        fechaFin,
        precioMensual: contrato.precioMensual || "", // <-- así coincide con tu state y tu input
        moneda: contrato.moneda || "ARS", // <--- moneda del contrato
        detalles: contrato.detalles || "",
        acuerdos: contrato.acuerdos || "",
        clausulas: contrato.clausulas || "",
        observaciones: contrato.observaciones || "",
        archivo: null, // <-- siempre null porque no seleccionaste un nuevo archivo
        archivoUrl: contrato.archivoUrl || null, // <-- aquí guardás la URL existente
      });
  
      setShowModal(true);
    } catch (error) {
      console.error("Error cargando propiedad para editar contrato:", error);
      toast.error("No se pudo cargar la propiedad del contrato");
    }
  };
  
  
  
  



  const fetchContratos = async () => {
    try {
      const q = query(
        collection(db, "Contratos"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      const lista = snapshot.docs.map((doc) => {
        const data = doc.data();

        return {
          id: doc.id,
          ...data,
          inicio: data.fechaInicio?.toDate().toLocaleDateString("es-AR"),
          fin: data.fechaFin?.toDate().toLocaleDateString("es-AR"),
        };
      });

      setContratos(lista);

    } catch (error) {
      console.error("Error cargando contratos:", error);
    }
  };

  const formatCurrency = (value, moneda = "ARS") => {
    if (!value) return moneda === "USD" ? "U$S 0" : "$ 0";
  
    if (moneda === "USD") {
      // Para dólares, agregamos U$S y usamos toLocaleString para separar miles
      return `U$S ${Number(value).toLocaleString("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`;
    } else {
      // Para pesos argentinos
      return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
      }).format(Number(value));
    }
  };
  


  const eliminarContrato = async (contrato) => {
    const confirmar = window.confirm(
      "¿Seguro que querés eliminar este contrato? Esta acción no se puede deshacer."
    );

    if (!confirmar) return;

    try {

      if (contrato.archivoUrl) {
        const fileRef = ref(storage, contrato.archivoUrl);
        await deleteObject(fileRef);
      }

      await deleteDoc(doc(db, "Contratos", contrato.id));

      toast.success("Contrato eliminado correctamente ✅");

      await fetchContratos();

    } catch (error) {
      console.error("Error eliminando contrato:", error);
      toast.error("Error al eliminar el contrato");
    }
  };









  return (
    <div className="container-fluid min-vh-100 bg-light p-5">

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">Gestión de Contratos</h2>
          <p className="text-muted">
            Administración de propiedades y clientes.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          + Nuevo Contrato
        </button>

      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body p-0">

          <div className="table-responsive">
            <table className="table align-middle mb-0">

              <thead className="table-light">
                <tr>
                  <th>Propiedad</th>
                  <th>Locador</th>
                  <th>Locatario</th>
                  <th>Estado</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Mensual</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {contratos.map((c, index) => (
                  <React.Fragment key={c.id}>

                    {/* FILA PRINCIPAL */}
                    <tr>
                      <td>
                        <div className="d-flex align-items-center gap-3">

                          {/* Imagen */}
                          <img
                            src={c.propiedadImagen || "/images/placeholder.png"}
                            alt={c.propiedadTitulo}
                            style={{
                              width: "70px",
                              height: "55px",
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                          />

                          {/* Info */}
                          <div>
                            <strong>{c.propiedadTitulo}</strong>
                            <div className="small text-muted">
                              ID: #{c.propiedadId}
                            </div>
                          </div>

                        </div>
                      </td>

                      <td>{c.locador?.split(" ")[0] || ""}</td>
                      <td>{c.locatario?.split(" ")[0] || ""}</td>

                      <td>
                        <span className="badge bg-success">
                          {c.estado}
                        </span>
                      </td>
                      <td>{c.inicio}</td>
                      <td style={{ minWidth: "120px" }}>
                        <div className="small mb-1">{c.fin}</div>


                        {(() => {
                          const status = getContractStatus(c.fin);
                          return (
                            <div className="progress" style={{ height: "6px" }}>
                              <div
                                className={`progress-bar ${status.color}`}
                                role="progressbar"
                                style={{ width: `${status.porcentaje}%` }}
                              />
                            </div>
                          );
                        })()}
                      </td>
                      <td>
                        <span className="fw-semibold text-success">
                          {formatCurrency(c.precioMensual)}
                        </span>
                      </td>

                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => toggleRow(index)}
                        >
                          {openRow === index ? "Cerrar" : "Ver"}
                        </button>
                        <button
  className="btn btn-sm btn-outline-warning me-2"
  onClick={() => handleEditContract(c)}
>
  Modificar
</button>


                      </td>
                    </tr>

                    {/* FILA EXPANDIBLE */}
                    {openRow === index && (
                      <tr className="expand-row">
                        <td colSpan="8">
                          <div className="p-4 bg-light border-top rounded-3">

                            <div className="row g-4">

                              {/* LOCADOR */}
                              <div className="col-md-4">
                                <h6 className="fw-semibold text-dark mb-2">
                                  <i className="bi bi-person-badge me-2 text-primary"></i>
                                  Locador
                                </h6>
                                <p className="text-muted small mb-1">Nombre: {c.locador || "No registrado"}</p>
                                <p className="text-muted small mb-1">DNI: {c.locadorDni || "No registrado"}</p>
                                <p className="text-muted small mb-0">Teléfono: {c.locadorTelefono || "No registrado"}</p>
                              </div>

                              {/* LOCATARIO */}
                              <div className="col-md-4">
                                <h6 className="fw-semibold text-dark mb-2">
                                  <i className="bi bi-person-badge me-2 text-success"></i>
                                  Locatario
                                </h6>
                                <p className="text-muted small mb-1">Nombre: {c.locatario || "No registrado"}</p>
                                <p className="text-muted small mb-1">DNI: {c.locatarioDni || "No registrado"}</p>
                                <p className="text-muted small mb-0">Teléfono: {c.locatarioTelefono || "No registrado"}</p>
                              </div>

                              {/* GARANTE */}
                              <div className="col-md-4">
                                <h6 className="fw-semibold text-dark mb-2">
                                  <i className="bi bi-shield-check me-2 text-warning"></i>
                                  Garante
                                </h6>
                                <p className="text-muted small mb-1">Nombre: {c.garante || "No registrado"}</p>
                                <p className="text-muted small mb-1">DNI: {c.garanteDni || "No registrado"}</p>
                                <p className="text-muted small mb-0">Teléfono: {c.garanteTelefono || "No registrado"}</p>
                              </div>

                              {/* DETALLES CONTRACTUALES */}
                              <div className="col-md-4">
                                <h6 className="fw-semibold text-dark mb-2">
                                  <i className="bi bi-journal-text me-2 text-primary"></i>
                                  Detalles Contractuales
                                </h6>
                                <p className="text-muted small mb-0">{c.detalles || "Sin detalles registrados"}</p>
                              </div>

                              {/* ACUERDOS */}
                              <div className="col-md-6">
                                <h6 className="fw-semibold text-dark mb-2">
                                  <i className="bi bi-card-checklist me-2 text-success"></i>
                                  Acuerdos
                                </h6>
                                <p className="text-muted small mb-0">{c.acuerdos || "Sin acuerdos registrados"}</p>
                              </div>

                              {/* CLÁUSULAS */}
                              <div className="col-md-4">
                                <h6 className="fw-semibold text-dark mb-2">
                                  <i className="bi bi-file-earmark-text me-2 text-secondary"></i>
                                  Cláusulas
                                </h6>
                                <p className="text-muted small mb-0">{c.clausulas || "Sin cláusulas registradas"}</p>
                              </div>

                              {/* OBSERVACIONES */}
                              <div className="col-md-4">
                                <h6 className="fw-semibold text-dark mb-2">
                                  <i className="bi bi-chat-left-text me-2 text-warning"></i>
                                  Observaciones
                                </h6>
                                <p className="text-muted small mb-0">{c.observaciones || "Sin observaciones"}</p>
                              </div>

                              {/* ARCHIVO */}
                              <div className="col-12 mt-3">
                                <h6 className="fw-semibold text-dark mb-3">
                                  <i className="bi bi-paperclip me-2 text-dark"></i>
                                  Archivo del Contrato
                                </h6>

                                {c.archivoUrl ? (
                                  <div className="d-flex gap-2 align-items-center">
                                    <a
                                      href={c.archivoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-outline-dark btn-sm"
                                    >
                                      <i className="bi bi-file-earmark-pdf me-1"></i>
                                      Ver PDF
                                    </a>
                                  </div>
                                ) : (
                                  <div>
                                    <label className="btn btn-outline-primary btn-sm mb-0">
                                      <i className="bi bi-upload me-1"></i>
                                      Importar PDF
                                      <input
                                        type="file"
                                        accept="application/pdf"
                                        hidden
                                        onChange={(e) => handleFileUpload(e, c.id)}
                                      />
                                    </label>
                                    <div className="small text-muted mt-2">No hay archivo cargado</div>
                                  </div>
                                )}
                              </div>

                              {/* BOTÓN ELIMINAR */}
                              <div className="col-12 mt-4 pt-3 border-top d-flex justify-content-end">
                                <button
                                  className="btn btn-outline-danger btn-sm px-3"
                                  onClick={() => eliminarContrato(c)}
                                >
                                  <i className="bi bi-trash me-1"></i>
                                  Eliminar Contrato
                                </button>
                              </div>

                            </div>

                          </div>
                        </td>
                      </tr>
                    )}




                  </React.Fragment>
                ))}

              </tbody>

            </table>
          </div>





        </div>




      </div>

      {showModal && (
        <>
          {/* BACKDROP */}
          <div
            className="modal-backdrop fade show"
            onClick={() => setShowModal(false)}
          ></div>

          {/* MODAL */}
          <div className="modal d-block" tabIndex="-1"  // <--- clic afuera llama la función
>
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content">

                <div className="modal-header">
                  <h5 className="modal-title">Nuevo Contrato</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>

                <div className="modal-body">

                  {/* PASO 1 - BUSCAR PROPIEDAD */}
                  {!selectedProperty && (
                    <>
                      <h6>Buscar Propiedad</h6>

                      <div className="input-group mb-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Buscar por título, calle, localidad o provincia..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        <button
                          className="btn btn-outline-primary"
                          onClick={handleSearch}
                        >
                          Buscar
                        </button>
                      </div>

                      <div className="row">

                        {loadingSearch ? (
                          <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status"></div>
                            <p className="mt-2">Buscando propiedades...</p>
                          </div>
                        ) : searchResults.length === 0 ? (
                          <div className="alert alert-warning text-center">
                            No se encontraron propiedades.
                          </div>
                        ) : (
                          searchResults.map((prop) => (
                            <div className="col-md-6 col-lg-4 mb-3" key={prop.id}>
                              <CardSeleccionPropiedad
                                propiedad={prop}
                                onSelect={(p) => {
                                  setSelectedProperty(p);
                          
                                  // Llenar el formData con los datos de la propiedad
                                  setFormData((prev) => ({
                                    ...prev,
                                    precioMensual: p.precioMensual || "", // Trae el precio de la propiedad
                                    moneda: p.moneda || "ARS",           // Trae la moneda (ARS o USD)
                                  }));
                          
                                  // Opcional: si querés autocompletar otros campos, también se puede
                                }}
                              />
                            </div>
                          ))
                          


                        )}

                      </div>
                    </>
                  )}


                  {/* PASO 2 - FORMULARIO */}
                  {selectedProperty && (
                    <>


                      <div className="alert alert-success p-3 d-flex align-items-center justify-content-between flex-wrap gap-3">

                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={
                              selectedProperty.imagenes?.length > 0
                                ? selectedProperty.imagenes[0]
                                : "/images/placeholder.png"
                            }
                            alt={selectedProperty.titulo}
                            style={{
                              width: "90px",
                              height: "70px",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />

                          <div>
                            <div className="fw-bold">
                              {selectedProperty.titulo}
                            </div>

                            {/* ID agregado */}
                            <div className="small text-secondary">
                              ID: #{selectedProperty.id}
                            </div>

                            <div className="small text-muted">
  {selectedProperty.direccion?.calle || "Sin calle"},{" "}
  {selectedProperty.direccion?.localidad || "Sin localidad"}
</div>

<div className="fw-semibold text-success">
  {selectedProperty.precio ? (
    <div>
      {selectedProperty.moneda === "U$S"
        ? `U$S ${Number(selectedProperty.precio).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
        : `ARS $ ${Number(selectedProperty.precio).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
    </div>
  ) : (
    "Consultar precio"
  )}
</div>









                          </div>
                        </div>

                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={handleBackToSearch}
                        >
                          Cambiar
                        </button>

                      </div>



                      <div className="row g-3">

                        <div className="col-md-6">
                          <label className="form-label">Locador</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.locador}
                            onChange={(e) =>
                              setFormData({ ...formData, locador: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">DNI Locador</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.locadorDni}
                            onChange={(e) =>
                              setFormData({ ...formData, locadorDni: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Teléfono Locador</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.locadorTelefono}
                            onChange={(e) =>
                              setFormData({ ...formData, locadorTelefono: e.target.value })
                            }
                          />
                        </div>


                        <div className="col-md-6">
                          <label className="form-label">Locatario</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.locatario}
                            onChange={(e) =>
                              setFormData({ ...formData, locatario: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">DNI Locatario</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.locatarioDni}
                            onChange={(e) =>
                              setFormData({ ...formData, locatarioDni: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Teléfono Locatario</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.locatarioTelefono}
                            onChange={(e) =>
                              setFormData({ ...formData, locatarioTelefono: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">Garante</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.garanteNombre}
                            onChange={(e) =>
                              setFormData({ ...formData, garanteNombre: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">DNI Garante</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.garanteDni}
                            onChange={(e) =>
                              setFormData({ ...formData, garanteDni: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">Teléfono Garante</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.garanteTelefono}
                            onChange={(e) =>
                              setFormData({ ...formData, garanteTelefono: e.target.value })
                            }
                          />
                        </div>



                        <div className="col-md-6">
                          <label className="form-label">Fecha Inicio</label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.fechaInicio}
                            onChange={(e) =>
                              setFormData({ ...formData, fechaInicio: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Fecha Fin</label>
                          <input
                            type="date"
                            className="form-control"
                            value={formData.fechaFin}
                            onChange={(e) =>
                              setFormData({ ...formData, fechaFin: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Precio Mensual</label>
                          <div className="input-group">
                            <span className="input-group-text">$</span>
                            <input
                              type="number"
                              className="form-control"
                              placeholder="Ej: 180000"
                              value={formData.precioMensual}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  precioMensual: e.target.value
                                })
                              }
                            />
                          </div>
                        </div>


                        <div className="col-md-12">
                          <label className="form-label">Detalles Contractuales</label>
                          <textarea
                            className="form-control"
                            rows="2"
                            value={formData.detalles}
                            onChange={(e) =>
                              setFormData({ ...formData, detalles: e.target.value })
                            }
                          ></textarea>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Acuerdos</label>
                          <textarea
                            className="form-control"
                            rows="2"
                            value={formData.acuerdos}
                            onChange={(e) =>
                              setFormData({ ...formData, acuerdos: e.target.value })
                            }
                          ></textarea>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label">Cláusulas</label>
                          <textarea
                            className="form-control"
                            rows="2"
                            value={formData.clausulas}
                            onChange={(e) =>
                              setFormData({ ...formData, clausulas: e.target.value })
                            }
                          ></textarea>
                        </div>

                        <div className="col-md-12">
                          <label className="form-label">Observaciones</label>
                          <textarea
                            className="form-control"
                            rows="2"
                            value={formData.observaciones}
                            onChange={(e) =>
                              setFormData({ ...formData, observaciones: e.target.value })
                            }
                          ></textarea>
                        </div>

                        <div className="col-12 mt-3">
  <label className="fw-semibold form-label mb-2">
    <i className="bi bi-paperclip me-2 text-dark"></i>
    Subir Contrato (PDF)
  </label>

  {formData.archivoUrl && !formData.archivo ? (
    // Si ya hay un PDF subido y no seleccionaste uno nuevo
    <div className="d-flex align-items-center gap-2">
      <a
        href={formData.archivoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline-dark btn-sm"
      >
        <i className="bi bi-file-earmark-pdf me-1"></i>
        Ver PDF
      </a>

      <label className="btn btn-outline-primary btn-sm mb-0">
        <i className="bi bi-upload me-1"></i>
        Reemplazar PDF
        <input
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) =>
            setFormData({ ...formData, archivo: e.target.files[0] })
          }
        />
      </label>
    </div>
  ) : formData.archivo ? (
    // Si seleccionaste un archivo nuevo
    <div className="d-flex align-items-center gap-2">
      <span className="small text-success">{formData.archivo.name}</span>
      <button
        className="btn btn-outline-secondary btn-sm"
        onClick={() => setFormData({ ...formData, archivo: null })}
      >
        <i className="bi bi-x-circle me-1"></i> Quitar
      </button>
    </div>
  ) : (
    // Si no hay archivo ni URL
    <label className="btn btn-outline-primary btn-sm mb-0">
      <i className="bi bi-upload me-1"></i>
      Importar PDF
      <input
        type="file"
        accept="application/pdf"
        hidden
        onChange={(e) =>
          setFormData({ ...formData, archivo: e.target.files[0] })
        }
      />
    </label>
  )}
</div>



                      </div>
                    </>
                  )}

                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>

                  {selectedProperty && (
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveContract}
                    >
                      Guardar Contrato
                    </button>

                  )}
                </div>

              </div>
            </div>
          </div>
        </>
      )}






    </div>




  );
}
