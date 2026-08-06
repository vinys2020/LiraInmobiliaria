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
  deleteDoc,
  where,
  setDoc,
  getDoc
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from "firebase/storage";
import { db } from "../config/firebase";
import CardSeleccionPropiedad from "../components/CardSeleccionPropiedad";
import ClienteModal from "../components/ClienteModal";
import LiquidacionModal from "../components/LiquidacionModal";
import CobranzaModal from "../components/CobranzaModal";
import ContratoModal from "../components/ContratoModal";
import RecibosInquilinoModal from "../components/RecibosInquilinoModal";
import RecibosLiquidacionModal from "../components/RecibosLiquidacionModal";
import TablaContratos from "../components/TablaContratos";
import toast from "react-hot-toast";
import CalculadoraAlquiler from "../components/CalculadoraAlquiler";
import IndicesAlquiler from "../components/IndicesAlquiler";



import "./CustomerDashboard.css";



export default function CustomerDashboard() {



  const [openRow, setOpenRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [contratos, setContratos] = useState([]);
  const [searchContrato, setSearchContrato] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [mostrarRecibos, setMostrarRecibos] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formEdicion, setFormEdicion] = useState(null);
  const [liqEditando, setLiqEditando] = useState(null);
  const [liqForm, setLiqForm] = useState(null);
  const [pagoEditando, setPagoEditando] = useState(null);
  const [pagoForm, setPagoForm] = useState(null);
  const [eliminandoContrato, setEliminandoContrato] = useState(null);
  const [creandoContrato, setCreandoContrato] = useState(false);
  const [cantidadProximosPeriodos, setCantidadProximosPeriodos] = useState(0);
  const [modoLocador, setModoLocador] = useState("existente");
  const [modoLocatario, setModoLocatario] = useState("existente");
  const [clientes, setClientes] = useState([]);


  const verRecibosPropietario = (contrato) => {

    setContratoRecibosLiquidacion(contrato);

    setMostrarRecibos(true);

  };



  const [mostrarRecibosInquilino, setMostrarRecibosInquilino] = useState(false);
  const [contratoRecibosInquilino, setContratoRecibosInquilino] = useState(null);
  const [contratoRecibosLiquidacion, setContratoRecibosLiquidacion] = useState(null);

  const verRecibosInquilino = (contrato) => {
    setContratoRecibosInquilino(contrato);
    setMostrarRecibosInquilino(true);
  };

  const [mostrarCaja, setMostrarCaja] = useState(false);
  const [contratoCaja, setContratoCaja] = useState(null);

  const facturarPago = (contrato) => {
    setContratoCaja(contrato);
    setMostrarCaja(true);
  };

  const [mostrarCobranza, setMostrarCobranza] = useState(false);
  const [contratoCobranza, setContratoCobranza] = useState(null);

  const cobrarAlquiler = (contrato) => {
    setContratoCobranza(contrato);
    setMostrarCobranza(true);
  };

  const storage = getStorage();
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);



  const [formData, setFormData] = useState({

    // LOCADOR
    locador: "",
    locadorDni: "",
    locadorCuil: "",
    locadorEmail: "",
    locadorTelefono1: "",
    locadorTelefono2: "",
    comisionInmobiliaria: "",
    locadorArchivos: [],

    // LOCATARIO
    locatario: "",
    locatarioDni: "",
    locatarioCuil: "",
    locatarioEmail: "",
    locatarioTelefono1: "",
    locatarioTelefono2: "",
    locatarioArchivos: [],
    deposito: "",




    // GARANTE
    garanteNombre: "",
    garanteDni: "",
    garanteCuil: "",
    garanteEmail: "",
    garanteTelefono1: "",
    garanteTelefono2: "",
    garanteArchivos: [],

    // GARANTE 2

    garante2Nombre: "",
    garante2Dni: "",
    garante2Cuil: "",
    garante2Email: "",
    garante2Telefono1: "",
    garante2Telefono2: "",
    garante2Archivos: [],

    // CONTRATO
    fechaInicio: "",
    fechaFin: "",
    precioMensual: "",
    moneda: "ARS",

    // CONFIGURACIÓN FINANCIERA
    indiceActualizacion: "IPC",
    periodoActualizacion: 6,
    cantidadPeriodos: 1,


    // INTERES MORA
    interesMoraDiario: "",

    // PLAZO DE PAGO
    plazoPagoDesde: "",
    plazoPagoHasta: "",

    // TEXTO CONTRACTUAL
    detalles: "",
    acuerdos: "",
    clausulas: "",
    observaciones: "",

    // ARCHIVO CONTRATO
    archivo: null,
    archivoUrl: null,

    // EDICIÓN
    contratoId: null,

    locadorId: null,
    locatarioId: null,
    garanteId: null,
    garante2Id: null,

  });



  useEffect(() => {
    document.body.classList.add("customer-dashboard-body");
    return () => {
      document.body.classList.remove("customer-dashboard-body");
    };
  }, []);

  // 👇 AGREGAR AQUÍ
  useEffect(() => {
    cargarCantidadProximosPeriodos();
  }, []);

const cargarCantidadProximosPeriodos = async () => {

  try {

    const hoy = new Date();

    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

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
          // TIENE QUE SER LA CUOTA INMEDIATAMENTE
          // SIGUIENTE
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
          // FECHA DEL CAMBIO
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
          // GUARDAR CAMBIO
          // ==========================================

          resultados.push({

            ...pagoActual,

            contrato,

            periodoActual:
              periodoActual,

            proximoPeriodo:
              periodoSiguiente,

            cuotaCambio:
              cuotaSiguiente,

            fechaCambio,

            pagoCambio:
              pagoSiguiente

          });

        }

      }
    );


    // ==========================================
    // FILTRAR EXACTAMENTE IGUAL QUE
    // pagosFiltrados DE ProximosPeriodos
    // ==========================================

    const resultadosFiltrados =
      resultados.filter((pago) => {

        if (!pago.fechaCambio) {
          return false;
        }

        const fecha =
          pago.fechaCambio;

        const coincideFecha =
          fecha.getMonth() + 1 ===
            mesActual &&
          fecha.getFullYear() ===
            anioActual;

        return coincideFecha;

      });


    // ==========================================
    // CANTIDAD FINAL
    // ==========================================

    const cantidad =
      resultadosFiltrados.length;


    setCantidadProximosPeriodos(
      cantidad
    );


    console.log(
      "CANTIDAD EXACTA DE PRÓXIMOS PERÍODOS:",
      cantidad
    );


    console.log(
      "CAMBIOS ESTE MES:",
      resultadosFiltrados
    );


  } catch (error) {

    console.error(
      "Error obteniendo próximos períodos:",
      error
    );

    setCantidadProximosPeriodos(0);

  }

};

  useEffect(() => {

    const cargarClientes = async () => {

      try {

        const snap = await getDocs(
          collection(db, "Clientes")
        );

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setClientes(data);

      } catch (error) {

        console.error(error);

      }

    };

    cargarClientes();

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


  let contratosFiltrados = contratos.filter((c) => {

    const texto = searchContrato.toLowerCase();

    const coincideBusqueda =
      c.propiedadTitulo?.toLowerCase().includes(texto) ||
      c.locador?.toLowerCase().includes(texto) ||
      c.locatario?.toLowerCase().includes(texto) ||
      c.propiedadDireccion?.calle?.toLowerCase().includes(texto) ||
      c.propiedadDireccion?.localidad?.toLowerCase().includes(texto) ||
      c.propiedadDireccion?.provincia?.toLowerCase().includes(texto) ||
      c.propiedadDireccion?.codigoPostal?.toLowerCase().includes(texto);

    const coincideEstado =
      filtroEstado === "todos" ||
      (filtroEstado === "porVencer"
        ? (c.estado || "").toLowerCase() === "activo"
        : c.estado === filtroEstado);

    return coincideBusqueda && coincideEstado;

  });


  if (filtroEstado === "porVencer") {

    contratosFiltrados.sort((a, b) => {

      const fechaA =
        a.fechaFin?.toDate
          ? a.fechaFin.toDate()
          : new Date(a.fechaFin);

      const fechaB =
        b.fechaFin?.toDate
          ? b.fechaFin.toDate()
          : new Date(b.fechaFin);

      return fechaA - fechaB;

    });

  }





  useEffect(() => {
    fetchContratos();
  }, []);

  const eliminarCarpetaStorage = async (ruta) => {
    const folderRef = ref(storage, ruta);

    const lista = await listAll(folderRef);

    // borrar archivos
    for (const item of lista.items) {
      await deleteObject(item);
    }

    // borrar subcarpetas (recursivo)
    for (const folder of lista.prefixes) {
      await eliminarCarpetaStorage(folder.fullPath);
    }
  };

  const abrirCliente = async (tipo, contrato) => {

    try {

      let clienteId = null;

      // ============================================
      // OBTENER ID CLIENTE
      // ============================================

      if (tipo === "locador") {
        clienteId = contrato.locadorId;
      }

      if (tipo === "locatario") {
        clienteId = contrato.locatarioId;
      }

      if (tipo === "garante") {
        clienteId = contrato.garanteId;
      }
      if (tipo === "garante2") {
        clienteId = contrato.garante2Id;
      }

      if (!clienteId) {

        toast.error("Cliente no encontrado");

        return;
      }

      // ============================================
      // TRAER CLIENTE
      // ============================================

      const clienteRef = doc(
        db,
        "Clientes",
        clienteId
      );

      const clienteSnap = await getDoc(
        clienteRef
      );

      if (!clienteSnap.exists()) {

        toast.error("El cliente no existe");

        return;
      }

      const clienteData = clienteSnap.data();

      // ============================================
      // TRAER LIQUIDACIONES
      // ============================================

      let liquidaciones = [];

      if (tipo === "locador") {

        const liquidacionesQuery = query(

          collection(db, "Liquidaciones"),

          where("locadorId", "==", clienteId),

          orderBy("anio", "desc"),

          orderBy("mes", "desc")
        );

        const liquidacionesSnap = await getDocs(liquidacionesQuery);

        liquidaciones = await Promise.all(
          liquidacionesSnap.docs.map(async (documento) => {

            const liq = {
              id: documento.id,
              ...documento.data(),
            };

            if (liq.contratoId) {

              const contratoSnap = await getDoc(
                doc(db, "Contratos", liq.contratoId)
              );

              if (contratoSnap.exists()) {

                const contrato = contratoSnap.data();

                const porcentaje = Number(
                  contrato.comisionInmobiliaria || 0
                );

                liq.montoComision =
                  Number(liq.montoCobrado || 0) *
                  porcentaje / 100;
              }
            }

            return liq;
          })
        );
      }

      // ============================================
      // TRAER PAGOS
      // ============================================

      let pagos = [];

      if (tipo === "locatario") {

        const pagosQuery = query(

          collection(db, "Pagos"),

          where("clienteId", "==", clienteId),

          orderBy("anio", "desc"),

          orderBy("mes", "desc")
        );

        const pagosSnap = await getDocs(
          pagosQuery
        );

        pagos = pagosSnap.docs.map((doc) => ({

          id: doc.id,

          ...doc.data(),

        }));
      }

      // ============================================
      // SET CLIENTE
      // ============================================

      setClienteSeleccionado({



        id: clienteSnap.id,

        tipo:
          tipo === "locador"
            ? "Locador"
            : tipo === "locatario"
              ? "Locatario"
              : "Garante",

        nombre:
          clienteData.nombre || "",

        dni:
          clienteData.dni || "",

        email:
          clienteData.email || "",

        telefono1:
          clienteData.telefono1 ||
          contrato.locadorTelefono1 ||
          contrato.locatarioTelefono1 ||
          contrato.garanteTelefono1 ||
          "",

        telefono2:
          clienteData.telefono2 ||
          contrato.locadorTelefono2 ||
          contrato.locatarioTelefono2 ||
          contrato.garanteTelefono2 ||
          "",

        comisionInmobiliaria:
          clienteData.comisionInmobiliaria || "",


        deposito:
          clienteData.deposito || "",


        observaciones:
          clienteData.observaciones || "",

        estado:
          clienteData.estado || false,

        imagenPerfil:
          clienteData.imagenPerfil || "",

        roles:
          clienteData.roles || [],

        archivos:
          clienteData.archivos || [],

        liquidaciones,

        pagos,
      });

      setShowClienteModal(true);

    } catch (error) {

      console.error(
        "Error abriendo cliente:",
        error
      );

      toast.error(
        "Error cargando información del cliente"
      );
    }
  };

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

      // LOCADOR
      locador: "",
      locadorDni: "",
      locadorCuil: "",
      locadorEmail: "",
      locadorTelefono1: "",
      locadorTelefono2: "",
      comisionInmobiliaria: "",
      locadorArchivos: [],

      // LOCATARIO
      locatario: "",
      locatarioDni: "",
      locatarioCuil: "",
      locatarioEmail: "",
      locatarioTelefono1: "",
      locatarioTelefono2: "",
      locatarioArchivos: [],
      deposito: "",

      // GARANTE
      garanteNombre: "",
      garanteDni: "",
      garanteCuil: "",
      garanteEmail: "",
      garanteTelefono1: "",
      garanteTelefono2: "",
      garanteArchivos: [],

      // GARANTE 2
      garante2Nombre: "",
      garante2Dni: "",
      garante2Cuil: "",
      garante2Email: "",
      garante2Telefono1: "",
      garante2Telefono2: "",
      garante2Archivos: [],

      // CONTRATO
      fechaInicio: "",
      fechaFin: "",
      precioMensual: "",
      moneda: "ARS",

      // CONFIGURACIÓN FINANCIERA

      periodoActualizacion: 6,
      indiceActualizacion: "IPC",
      cantidadPeriodos: 1,

      interesMoraDiario: "",

      // PLAZO DE PAGO
      plazoPagoDesde: "",
      plazoPagoHasta: "",

      // TEXTO CONTRACTUAL
      detalles: "",
      acuerdos: "",
      clausulas: "",
      observaciones: "",

      // ARCHIVO
      archivo: null,
      archivoUrl: null,

      // EDICIÓN
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

        const direccionCompleta = `
        ${p.direccion?.calle || ""}
        ${p.direccion?.localidad || ""}
        ${p.direccion?.provincia || ""}
        ${p.direccion?.codigoPostal || ""}
      `;

        const campos = [
          p.titulo,
          p.direccion?.calle,
          p.direccion?.localidad,
          p.direccion?.provincia,
          p.direccion?.codigoPostal,
          direccionCompleta
        ];

        return campos.some(
          (campo) =>
            campo &&
            normalizeFull(campo).includes(searchNormalized)
        );
      });

      setSearchResults(resultados);

    } catch (error) {
      console.error("Error buscando propiedades:", error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const crearFechaLocal = (fechaString) => {
    if (!fechaString) return null;

    const [anio, mes, dia] = fechaString.split("-").map(Number);

    return new Date(
        anio,
        mes - 1,
        dia,
        12,
        0,
        0,
        0
    );
};


  const handleSaveContract = async () => {

    if (!selectedProperty) return;



    try {
      setCreandoContrato(true);

      // =====================================================
      // VALIDACIONES
      // =====================================================

      if (
        !formData.locador ||
        !formData.locatario ||
        !formData.fechaInicio ||
        !formData.fechaFin
      ) {
        toast.error("Completá los campos obligatorios");
        return;
      }

      // =====================================================
      // FECHAS
      // =====================================================

const fechaInicio = crearFechaLocal(formData.fechaInicio);
const fechaFin = crearFechaLocal(formData.fechaFin);

      if (fechaInicio > fechaFin) {
        toast.error("La fecha de inicio no puede ser mayor a la fecha fin");
        return;
      }

      // =====================================================
      // PDF CONTRATO
      // =====================================================

      let archivoUrl = formData.archivoUrl || null;

      if (formData.archivo) {

        const storageRef = ref(
          storage,
          `contratos/${selectedProperty.id}/${Date.now()}-${formData.archivo.name}`
        );

        await uploadBytes(storageRef, formData.archivo);

        archivoUrl = await getDownloadURL(storageRef);
      }

      // =====================================================
      // SUBIR ARCHIVOS
      // =====================================================

      const subirArchivos = async (files, carpeta) => {

        if (!files || files.length === 0) return [];

        return await Promise.all(

          files.map(async (file) => {

            const fileRef = ref(
              storage,
              `contratos/${selectedProperty.id}/${carpeta}/${Date.now()}-${file.name}`
            );

            await uploadBytes(fileRef, file);

            const url = await getDownloadURL(fileRef);

            return {
              nombre: file.name,
              url
            };

          })
        );
      };

      const locadorArchivos = formData.contratoId
        ? (formData.locadorArchivos || [])
        : await subirArchivos(
          formData.locadorArchivos,
          "locador"
        );

      const locatarioArchivos = formData.contratoId
        ? (formData.locatarioArchivos || [])
        : await subirArchivos(
          formData.locatarioArchivos,
          "locatario"
        );

      const garanteArchivos = formData.contratoId
        ? (formData.garanteArchivos || [])
        : await subirArchivos(
          formData.garanteArchivos,
          "garante"
        );

      const garante2Archivos = formData.contratoId
        ? (formData.garante2Archivos || [])
        : await subirArchivos(
          formData.garante2Archivos,
          "garante2"
        );



      // =====================================================
      // CLIENTES
      // =====================================================

      let locadorRef;
      let locatarioRef;
      let garanteRef;
      let garante2Ref;

      if (!formData.contratoId) {

        // CREAR CLIENTES SOLO CUANDO ES UN CONTRATO NUEVO
        // LOCADOR
        if (formData.locadorId) {

          const clienteExistente = clientes.find(
            c => c.id === formData.locadorId
          );

          locadorRef = await addDoc(
            collection(db, "Clientes"),
            {
              nombre: clienteExistente.nombre || "",
              dni: clienteExistente.dni || "",
              cuil: clienteExistente.cuil || "",
              email: clienteExistente.email || "",
              telefono1: clienteExistente.telefono1 || "",
              telefono2: clienteExistente.telefono2 || "",
              comisionInmobiliaria: clienteExistente.comisionInmobiliaria || "",
              archivos: clienteExistente.archivos || [],
              estado: clienteExistente.estado ?? true,
              imagenPerfil: clienteExistente.imagenPerfil || "",
              observaciones: clienteExistente.observaciones || "",

              roles: ["locador"],

              // opcional
              clienteOrigenId: clienteExistente.id,

              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }
          );

        } else {

          locadorRef = await addDoc(
            collection(db, "Clientes"),
            {
              nombre: formData.locador || "",
              dni: formData.locadorDni || "",
              cuil: formData.locadorCuil || "",
              email: formData.locadorEmail || "",
              telefono1: formData.locadorTelefono1 || "",
              telefono2: formData.locadorTelefono2 || "",
              comisionInmobiliaria: formData.comisionInmobiliaria || "",
              archivos: locadorArchivos,
              estado: true,
              imagenPerfil: "",
              observaciones: "",
              roles: ["locador"],
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }
          );

        }

        locatarioRef = await addDoc(
          collection(db, "Clientes"),
          {
            nombre: formData.locatario || "",
            dni: formData.locatarioDni || "",
            cuil: formData.locatarioCuil || "",
            email: formData.locatarioEmail || "",
            telefono1: formData.locatarioTelefono1 || "",
            telefono2: formData.locatarioTelefono2 || "",
            deposito: formData.deposito || "",
            archivos: locatarioArchivos,
            estado: true,
            imagenPerfil: "",
            observaciones: "",
            roles: ["locatario"],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );

        garanteRef = await addDoc(
          collection(db, "Clientes"),
          {
            nombre: formData.garanteNombre || "",
            dni: formData.garanteDni || "",
            cuil: formData.garanteCuil || "",
            email: formData.garanteEmail || "",
            telefono1: formData.garanteTelefono1 || "",
            telefono2: formData.garanteTelefono2 || "",
            archivos: garanteArchivos,
            estado: true,
            imagenPerfil: "",
            observaciones: "",
            roles: ["garante"],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );

        garante2Ref = await addDoc(
          collection(db, "Clientes"),
          {
            nombre: formData.garante2Nombre || "",
            dni: formData.garante2Dni || "",
            cuil: formData.garante2Cuil || "",
            email: formData.garante2Email || "",
            telefono1: formData.garante2Telefono1 || "",
            telefono2: formData.garante2Telefono2 || "",
            archivos: garante2Archivos,
            estado: true,
            imagenPerfil: "",
            observaciones: "",
            roles: ["garante"],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }
        );

      } else {

        // EDITANDO CONTRATO
        // NO CREAR CLIENTES NUEVOS

        const contratoActual = contratos.find(
          c => c.id === formData.contratoId
        );

        locadorRef = {
          id: contratoActual.locadorId
        };

        locatarioRef = {
          id: contratoActual.locatarioId
        };

        garanteRef = {
          id: contratoActual.garanteId
        };

        garante2Ref = contratoActual.garante2Id
          ? { id: contratoActual.garante2Id }
          : null;
      }
      // =====================================================
      // DATOS CONTRATO
      // =====================================================

      const contratoData = {

        // =================================================
        // PROPIEDAD
        // =================================================

        propiedadId: selectedProperty.id,

        propiedadTitulo: selectedProperty.titulo,

        propiedadImagen:
          selectedProperty.imagenes?.length > 0
            ? selectedProperty.imagenes[0]
            : null,

        propiedadDireccion: selectedProperty.direccion || {},

        // =================================================
        // CLIENTES
        // =================================================

        locadorId: locadorRef?.id || null,
        locatarioId: locatarioRef?.id || null,
        garanteId: garanteRef?.id || null,
        garante2Id: garante2Ref?.id || null,       // LOCADOR
        // =================================================

        locador: formData.locador || "",
        locadorDni: formData.locadorDni || "",
        locadorCuil: formData.locadorCuil || "",
        locadorEmail: formData.locadorEmail || "",

        locadorTelefono1: formData.locadorTelefono1 || "",
        locadorTelefono2: formData.locadorTelefono2 || "",
        comisionInmobiliaria: formData.comisionInmobiliaria || "",

        locadorArchivos,

        // =================================================
        // LOCATARIO
        // =================================================

        locatario: formData.locatario || "",
        locatarioDni: formData.locatarioDni || "",
        locatarioCuil: formData.locatarioCuil || "",
        locatarioEmail: formData.locatarioEmail || "",

        locatarioTelefono1: formData.locatarioTelefono1 || "",
        locatarioTelefono2: formData.locatarioTelefono2 || "",
        deposito: formData.deposito || "",

        locatarioArchivos,

        // =================================================
        // GARANTE
        // =================================================

        garante: formData.garanteNombre || "",
        garanteDni: formData.garanteDni || "",
        garanteCuil: formData.garanteCuil || "",
        garanteEmail: formData.garanteEmail || "",

        garanteTelefono1: formData.garanteTelefono1 || "",
        garanteTelefono2: formData.garanteTelefono2 || "",

        garanteArchivos,

        // GARANTE 2
        garante2: formData.garante2Nombre || "",
        garante2Dni: formData.garante2Dni || "",
        garante2Cuil: formData.garante2Cuil || "",
        garante2Email: formData.garante2Email || "",
        garante2Telefono1: formData.garante2Telefono1 || "",
        garante2Telefono2: formData.garante2Telefono2 || "",
        garante2Archivos: garante2Archivos || [],

        // =================================================
        // FECHAS
        // =================================================

        fechaInicio,
        fechaFin,

        // =================================================
        // FINANCIERO
        // =================================================
        precioMensual: Number(formData.precioMensual || 0),

        periodoActualizacion: Number(
          formData.periodoActualizacion || 6
        ),
        indiceActualizacion:
          formData.indiceActualizacion || "IPC",

        cantidadPeriodos: Number(
          formData.cantidadPeriodos || 1
        ),

        plazoPagoDesde: Number(
          formData.plazoPagoDesde || 1
        ),

        plazoPagoHasta: Number(
          formData.plazoPagoHasta || 10
        ),

        interesMoraDiario: Number(
          formData.interesMoraDiario || 0
        ),

        moneda: formData.moneda || "ARS",

        // =================================================
        // TEXTO
        // =================================================

        detalles: formData.detalles || "",
        acuerdos: formData.acuerdos || "",
        clausulas: formData.clausulas || "",
        observaciones: formData.observaciones || "",

        // =================================================
        // ARCHIVO
        // =================================================

        archivoUrl,

        // =================================================
        // ESTADO
        // =================================================

        estado: "activo",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // =====================================================
      // CREAR CONTRATO
      // =====================================================

      let contratoRef;

      if (formData.contratoId) {

        Object.entries(contratoData).forEach(([key, value]) => {
          if (value === undefined) {
            console.log("❌ UNDEFINED:", key);
          }
        });

        const {
          createdAt,
          ...contratoDataLimpio
        } = contratoData;

        await updateDoc(
          doc(db, "Contratos", formData.contratoId),
          {
            ...contratoDataLimpio,
            updatedAt: serverTimestamp(),
          }
        );

        contratoRef = {
          id: formData.contratoId
        };

      } else {

        contratoRef = await addDoc(
          collection(db, "Contratos"),
          contratoData
        );

      }

      // =====================================================
      // GENERAR PAGOS Y LIQUIDACIONES
      // =====================================================

      if (!formData.contratoId) {

        let fechaPeriodo = new Date(fechaInicio);

        fechaPeriodo.setDate(1);
        fechaPeriodo.setHours(12, 0, 0, 0);

        let montoActual = Number(formData.precioMensual || 0);

        const mesesAumento = Number(
          formData.periodoActualizacion
        );


        const porcentajeAumento = Number(
          formData.porcentajeIncremento || 0
        );

        let periodoNumero = 1;

        let mesesTranscurridos = 0;

        const totalCuotas =
          (fechaFin.getFullYear() - fechaInicio.getFullYear()) * 12 +
          (fechaFin.getMonth() - fechaInicio.getMonth()) + 1;

        while (fechaPeriodo <= fechaFin) {

          // =================================================
          // AUMENTO AUTOMÁTICO
          // =================================================

          if (
            mesesAumento > 0 &&
            mesesTranscurridos > 0 &&
            mesesTranscurridos % mesesAumento === 0
          ) {

            montoActual =
              montoActual +
              (montoActual * porcentajeAumento / 100);

            periodoNumero++;
          }
          // =================================================
          // VENCIMIENTO
          // =================================================

          const fechaVencimiento = new Date(
            fechaPeriodo.getFullYear(),
            fechaPeriodo.getMonth(),
            Number(formData.plazoPagoHasta || 10),
            12,
            0,
            0
          );

          // =================================================
          // PAGO
          // =================================================

          const pagoRef = await addDoc(
            collection(db, "Pagos"),
            {

              contratoId: contratoRef.id,

              propiedadId: selectedProperty.id,

              propiedadTitulo: selectedProperty.titulo,

              propiedadDireccion: {
                calle: selectedProperty?.direccion?.calle || "",
                localidad: selectedProperty?.direccion?.localidad || "",
                provincia: selectedProperty?.direccion?.provincia || "",
              },
              clienteId: locatarioRef.id,

              clienteNombre: formData.locatario,

              clienteCuil: formData.locatarioCuil || "",


              locadorId: locadorRef.id,

              locadorNombre: formData.locador,

              locadorCuil: formData.locadorCuil || "",

              tipo: "alquiler",




              periodoNumero,
              numeroCuota: mesesTranscurridos + 1,
              totalCuotas,

              mes: fechaPeriodo.getMonth() + 1,

              anio: fechaPeriodo.getFullYear(),

              montoBase: montoActual,

              montoFinal: montoActual,

              porcentajeAplicado:
                mesesTranscurridos > 0
                  ? porcentajeAumento
                  : 0,

              fechaVencimiento,

              fechaPago: null,

              diasRetraso: 0,

              interesGenerado: 0,

              moneda: formData.moneda || "ARS",

              estado: "pendiente",

              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }
          );

          // =================================================
          // LIQUIDACIÓN
          // =================================================

          await addDoc(
            collection(db, "Liquidaciones"),
            {

              contratoId: contratoRef.id,



              pagoId: pagoRef.id,

              propiedadId: selectedProperty.id,

              propiedadTitulo: selectedProperty.titulo,

              propiedadDireccion: {
                calle: selectedProperty?.direccion?.calle || "",
                localidad: selectedProperty?.direccion?.localidad || "",
                provincia: selectedProperty?.direccion?.provincia || "",
              },

              locadorId: locadorRef.id,

              locadorNombre: formData.locador,

              locatarioId: locatarioRef.id,

              locatarioNombre: formData.locatario,



              periodoNumero,
              numeroCuota: mesesTranscurridos + 1,
              totalCuotas,


              mes: fechaPeriodo.getMonth() + 1,

              anio: fechaPeriodo.getFullYear(),

              montoCobrado: montoActual,

              porcentajeComision: 0,

              montoComision: 0,

              montoLiquidado: montoActual,

              moneda: formData.moneda || "ARS",

              fechaLiquidacion: null,

              estado: "pendiente",

              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }
          );

          // =================================================
          // SIGUIENTE MES
          // =================================================

          fechaPeriodo = new Date(
            fechaPeriodo.getFullYear(),
            fechaPeriodo.getMonth() + 1,
            1,
            12,
            0,
            0
          );

          mesesTranscurridos++;
        }
      }


      // =====================================================
      // RECARGAR
      // =====================================================

      await fetchContratos();

      toast.success(
        "Contrato creado correctamente"
      );

      // =====================================================
      // RESET
      // =====================================================

      setShowModal(false);

      setSelectedProperty(null);

      setFormData({

        locador: "",
        locadorDni: "",
        locadorCuil: "",
        locadorEmail: "",

        locadorTelefono1: "",
        locadorTelefono2: "",
        comisionInmobiliaria: "",

        locadorArchivos: [],

        locatario: "",
        locatarioDni: "",
        locatarioCuil: "",
        locatarioEmail: "",

        locatarioTelefono1: "",
        locatarioTelefono2: "",
        deposito: "",

        locatarioArchivos: [],

        garanteNombre: "",
        garanteDni: "",
        garanteCuil: "",
        garanteEmail: "",

        garanteTelefono1: "",
        garanteTelefono2: "",

        garanteArchivos: [],

        garante2Nombre: "",
        garante2Dni: "",
        garante2Cuil: "",
        garante2Email: "",
        garante2Telefono1: "",
        garante2Telefono2: "",
        garante2Archivos: [],

        fechaInicio: "",
        fechaFin: "",

        precioMensual: "",

        periodoActualizacion: "",

        porcentajeAumento: "",

        plazoPagoDesde: 1,

        plazoPagoHasta: 10,

        interesMoraDiaria: "",

        moneda: "ARS",

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
    } finally {
      setCreandoContrato(false);
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

        locadorId: contrato.locadorId || null,
        locatarioId: contrato.locatarioId || null,
        garanteId: contrato.garanteId || null,
        garante2Id: contrato.garante2Id || null,

        // ==========================
        // LOCADOR
        // ==========================
        locador: contrato.locador || "",
        locadorDni: contrato.locadorDni || "",
        locadorCuil: contrato.locadorCuil || "",
        locadorEmail: contrato.locadorEmail || "",
        locadorTelefono1: contrato.locadorTelefono1 || "",
        locadorTelefono2: contrato.locadorTelefono2 || "",
        comisionInmobiliaria: contrato.comisionInmobiliaria || "",
        locadorArchivos: contrato.locadorArchivos || [],

        // ==========================
        // LOCATARIO
        // ==========================
        locatario: contrato.locatario || "",
        locatarioDni: contrato.locatarioDni || "",
        locatarioCuil: contrato.locatarioCuil || "",
        locatarioEmail: contrato.locatarioEmail || "",
        locatarioTelefono1: contrato.locatarioTelefono1 || "",
        locatarioTelefono2: contrato.locatarioTelefono2 || "",
        locatarioArchivos: contrato.locatarioArchivos || [],
        deposito: contrato.deposito || "",

        // ==========================
        // GARANTE
        // ==========================
        garanteNombre: contrato.garante || "",
        garanteDni: contrato.garanteDni || "",
        garanteCuil: contrato.garanteCuil || "",
        garanteEmail: contrato.garanteEmail || "",
        garanteTelefono1: contrato.garanteTelefono1 || "",
        garanteTelefono2: contrato.garanteTelefono2 || "",
        garanteArchivos: contrato.garanteArchivos || [],

        // GARANTE 2
        garante2Nombre: contrato.garante2 || "",
        garante2Dni: contrato.garante2Dni || "",
        garante2Cuil: contrato.garante2Cuil || "",
        garante2Email: contrato.garante2Email || "",
        garante2Telefono1: contrato.garante2Telefono1 || "",
        garante2Telefono2: contrato.garante2Telefono2 || "",
        garante2Archivos: contrato.garante2Archivos || [],

        // ==========================
        // FECHAS
        // ==========================
        fechaInicio,
        fechaFin,

        // ==========================
        // FINANCIERO
        // ==========================
        precioMensual: contrato.precioMensual || "",
        periodoActualizacion: contrato.periodoActualizacion || "",
        indiceActualizacion: contrato.indiceActualizacion || "IPC",
        cantidadPeriodos: contrato.cantidadPeriodos || 1,

        plazoPagoDesde: contrato.plazoPagoDesde || 1,
        plazoPagoHasta: contrato.plazoPagoHasta || 10,

        interesMoraDiario: contrato.interesMoraDiario || "",

        moneda: contrato.moneda || "ARS",

        // ==========================
        // TEXTO
        // ==========================
        detalles: contrato.detalles || "",
        acuerdos: contrato.acuerdos || "",
        clausulas: contrato.clausulas || "",
        observaciones: contrato.observaciones || "",

        // ==========================
        // ARCHIVO CONTRATO
        // ==========================
        archivo: null,
        archivoUrl: contrato.archivoUrl || null,
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

        const direccionTexto = [
          data.propiedadDireccion?.calle,
          data.propiedadDireccion?.localidad,
          data.propiedadDireccion?.provincia
        ]
          .filter(Boolean)
          .join(" - ");

        return {
          id: doc.id,
          ...data,

          // 🔴 dirección lista para usar
          direccion: direccionTexto || "No registrada",

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

    const numero = Number(value || 0);

    if (moneda === "USD") {

      return `U$S ${numero.toLocaleString(
        "es-AR",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;
    }

    return new Intl.NumberFormat(
      "es-AR",
      {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(numero);
  };



  const eliminarContrato = (contrato) => {

    toast((t) => (
      <div>
        <p className="mb-2">
          ¿Seguro que querés eliminar este contrato?
        </p>

        <div className="d-flex gap-2 justify-content-end">

          <button
            className="btn btn-sm btn-secondary"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancelar
          </button>

          <button
            className="btn btn-sm btn-danger"
            onClick={async () => {
              toast.dismiss(t.id);

              try {

                setEliminandoContrato(contrato.id);

                // PAGOS
                const pagosSnap = await getDocs(
                  query(
                    collection(db, "Pagos"),
                    where("contratoId", "==", contrato.id)
                  )
                );

                for (const pagoDoc of pagosSnap.docs) {
                  await deleteDoc(doc(db, "Pagos", pagoDoc.id));
                }

                // LIQUIDACIONES
                const liqSnap = await getDocs(
                  query(
                    collection(db, "Liquidaciones"),
                    where("contratoId", "==", contrato.id)
                  )
                );

                for (const liqDoc of liqSnap.docs) {
                  await deleteDoc(doc(db, "Liquidaciones", liqDoc.id));
                }

                // ARCHIVOS
                if (contrato.archivos?.length) {
                  for (const archivo of contrato.archivos) {
                    try {
                      if (archivo.url) {
                        const fileRef = ref(storage, archivo.url);
                        await deleteObject(fileRef);
                      }
                    } catch (e) {
                      console.warn("No se pudo borrar archivo:", e);
                    }
                  }
                }

                // PDF PRINCIPAL
                if (contrato.archivoUrl) {
                  try {
                    const fileRef = ref(storage, contrato.archivoUrl);
                    await deleteObject(fileRef);
                  } catch (e) {
                    console.warn("No se pudo borrar PDF:", e);
                  }
                }

                // 🔥 NUEVO: borra toda la carpeta del contrato
                await eliminarCarpetaStorage(`contratos/${contrato.id}`);

                // CONTRATO
                await deleteDoc(doc(db, "Contratos", contrato.id));

                toast.success("Contrato eliminado correctamente ✅");

                await fetchContratos();

              } catch (error) {
                console.error("Error eliminando contrato:", error);
                toast.error("Error al eliminar el contrato");
              } finally {
                setEliminandoContrato(null);
              }
            }}
          >
            Eliminar
          </button>

        </div>
      </div>
    ), {
      duration: Infinity,
    });
  };


  const [formCobranza, setFormCobranza] = useState({
    totalCobrado: contratoCobranza?.precioMensual || 0,
  });

  const [formLiquidacion, setFormLiquidacion] = useState({
    totalLiquidacion: contratoCaja?.precioMensual || 0,
    comision: 10
  });






  return (




    <article className="container-fluid py-4 px-3 px-md-4 px-lg-5">

      <div className="row g-3 row-cols-2 row-cols-md-3 row-cols-lg-6 row-cols-xl-6 mb-4">

        <div className="col">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
            <div className="bg-primary" style={{ height: "5px" }}></div>
            <div className="card-body text-center py-4">
              <i className="bi bi-house-door-fill text-primary fs-2 mb-2"></i>
              <p className="text-uppercase text-secondary fw-semibold small mb-1">
                Casa Propia
              </p>
              <h4 className="fw-bold text-dark mb-2">36,89%</h4>
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
                Julio 2026
              </span>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
            <div className="bg-success" style={{ height: "5px" }}></div>
            <div className="card-body text-center py-4">
              <i className="bi bi-graph-up-arrow text-success fs-2 mb-2"></i>
              <p className="text-uppercase text-secondary fw-semibold small mb-1">
                IPC
              </p>
              <h4 className="fw-bold text-dark mb-2">33,20%</h4>
              <span className="badge bg-success-subtle text-success rounded-pill px-3 py-2">
                Mayo 2026
              </span>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
            <div className="bg-warning" style={{ height: "5px" }}></div>
            <div className="card-body text-center py-4">
              <i className="bi bi-building text-warning fs-2 mb-2"></i>
              <p className="text-uppercase text-secondary fw-semibold small mb-1">
                CÁC
              </p>
              <h4 className="fw-bold text-dark mb-2">26,08%</h4>
              <span className="badge bg-warning-subtle text-dark rounded-pill px-3 py-2">
                Abril 2026
              </span>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
            <div className="bg-info" style={{ height: "5px" }}></div>
            <div className="card-body text-center py-4">
              <i className="bi bi-bank text-info fs-2 mb-2"></i>
              <p className="text-uppercase text-secondary fw-semibold small mb-1">
                UVA
              </p>
              <h4 className="fw-bold text-dark mb-2">32,77%</h4>
              <span className="badge bg-info-subtle text-info rounded-pill px-3 py-2">
                Julio 2026
              </span>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
            <div className="bg-danger" style={{ height: "5px" }}></div>
            <div className="card-body text-center py-4">
              <i className="bi bi-bar-chart-fill text-danger fs-2 mb-2"></i>
              <p className="text-uppercase text-secondary fw-semibold small mb-1">
                CER
              </p>
              <h4 className="fw-bold text-dark mb-2">32,80%</h4>
              <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-2">
                Julio 2026
              </span>
            </div>
          </div>
        </div>

        <div className="col">
          <div className="card border-0 shadow-sm rounded-4 h-100 overflow-hidden">
            <div className="bg-dark" style={{ height: "5px" }}></div>
            <div className="card-body text-center py-4">
              <i className="bi bi-calculator-fill text-dark fs-2 mb-2"></i>
              <p className="text-uppercase text-secondary fw-semibold small mb-1">
                ICL
              </p>
              <h4 className="fw-bold text-dark mb-2">32,02%</h4>
              <span className="badge bg-dark-subtle text-dark rounded-pill px-3 py-2">
                Junio 2026
              </span>
            </div>
          </div>
        </div>

      </div>



      <CalculadoraAlquiler />

      <article className="container py-4">
        <div className="row g-4 justify-content-center ">

          <div className="col-12 col-sm-6 col-lg-4 col-xl-4">
            <a
              href="/estado"
              className="text-decoration-none hvr-grow d-block h-100"
            >
              <div className="card border-0 shadow-sm h-100 text-center">
                <div className="card-body d-flex align-items-center justify-content-center gap-3">

                  <div>
                    <img
                      src="https://res.cloudinary.com/dxdnsblj6/image/upload/v1773354181/estado_de_caja_l6kb95.png"
                      alt="Estado de Caja"
                      width="40"
                    />
                  </div>

                  <div>
                    <div className="fw-semibold">
                      Estado de Caja
                    </div>
                  </div>

                </div>
              </div>
            </a>
          </div>

          <div className="col-12 col-sm-6 col-lg-4 col-xl-4">
            <a
              href="/reporte-morosos"
              className="hvr-grow d-block h-100 text-decoration-none"
            >
              <div className="card border-0 shadow-sm h-100 text-center">

                <div className="card-body d-flex align-items-center justify-content-center gap-3">

                  <img
                    src="https://res.cloudinary.com/dxdnsblj6/image/upload/v1773354181/reporte_morosos_wgk4vy.png"
                    alt="Reporte Morosos"
                    width="40"
                  />

                  <div className="fw-semibold">
                    Reporte de Morosos
                  </div>

                </div>

              </div>
            </a>
          </div>






          {/* PROPIETARIOS */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-4">
            <a
              href="/propietarios"
              className="text-decoration-none hvr-grow d-block h-100"
            >
              <div className="card border-0 shadow-sm h-100 text-center">
                <div className="card-body d-flex align-items-center justify-content-center gap-3">

                  <i
                    className="bi bi-person-fill"
                    style={{
                      fontSize: "2rem",
                      color: "#198754",
                    }}
                  ></i>

                  <div>
                    <div className="fw-semibold">
                      Propietarios
                    </div>
                  </div>

                </div>
              </div>
            </a>
          </div>

          {/* INQUILINOS */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-4">
            <a
              href="/inquilinos"
              className="text-decoration-none hvr-grow d-block h-100"
            >
              <div className="card border-0 shadow-sm h-100 text-center">
                <div className="card-body d-flex align-items-center justify-content-center gap-3">

                  <i
                    className="bi bi-people-fill"
                    style={{
                      fontSize: "2rem",
                      color: "#0d6efd",

                    }}
                  ></i>

                  <div>
                    <div className="fw-semibold">
                      Inquilinos
                    </div>
                  </div>

                </div>
              </div>
            </a>
          </div>
          {/* GARANTES */}
          <div className="col-12 col-sm-6 col-lg-4 col-xl-4">
            <a
              href="/garantes"
              className="text-decoration-none hvr-grow d-block h-100"
            >
              <div className="card border-0 shadow-sm h-100 text-center">
                <div className="card-body d-flex align-items-center justify-content-center gap-3">

                  <i
                    className="bi bi-shield-check"
                    style={{
                      fontSize: "2rem",
                      color: "#0d6efd",
                    }}
                  ></i>

                  <div className="fw-semibold">
                    Garantes
                  </div>

                </div>
              </div>
            </a>
          </div>

          <div className="col-12 col-sm-6 col-lg-4 col-xl-4">

            <a
              href="/proximos-periodos"
              className="text-decoration-none hvr-grow d-block h-100"
            >

              <div className="card border-0 shadow-sm h-100 text-center">

                <div className="card-body d-flex align-items-center justify-content-center gap-3">

                  <img
                    src="https://res.cloudinary.com/dxdnsblj6/image/upload/v1773354181/cambio_de_periodo_kwg1zs.png"
                    alt="Cambio de Período"
                    width="40"
                  />

                  <div className="fw-semibold">

                    Próximos Períodos

                    <span className="badge bg-danger ms-2">
                      {cantidadProximosPeriodos}
                    </span>

                  </div>

                </div>

              </div>

            </a>

          </div>


        </div>
      </article>

      <div className="row justify-content-center">
        <div className="col-12 ">
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




            {/* ARTICULO DE FILTROS */}
            <div className="col-12">
              <div className="border-0 shadow-sm mb-2">

                <div className="card-body">

                  <div className="row g-2">

                    <div className="col-6 col-md-4">
                      <button
                        className={`btn w-100 ${filtroEstado === "todos" ? "btn-primary" : "btn-outline-primary"}`}
                        onClick={() => setFiltroEstado("todos")}
                      >
                        <i className="bi bi-grid me-1"></i>
                        Todos
                      </button>
                    </div>

                    <div className="col-6 col-md-4">
                      <button
                        className={`btn w-100 ${filtroEstado === "activo" ? "btn-success" : "btn-outline-success"}`}
                        onClick={() => setFiltroEstado("activo")}
                      >
                        <i className="bi bi-check-circle me-1"></i>
                        Activos
                      </button>
                    </div>

                    <div className="col-6 col-md-4">
                      <button
                        className={`btn w-100 ${filtroEstado === "porVencer" ? "btn-warning" : "btn-outline-warning"}`}
                        onClick={() => setFiltroEstado("porVencer")}
                      >
                        <i className="bi bi-clock-history me-1"></i>
                        Por vencer
                      </button>
                    </div>

                    <div className="col-6 col-md-6">
                      <button
                        className={`btn w-100 ${filtroEstado === "Rescindido" ? "btn-danger" : "btn-outline-danger"}`}
                        onClick={() => setFiltroEstado("Rescindido")}
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        Rescindidos
                      </button>
                    </div>

                    <div className="col-6 col-md-6">
                      <button
                        className={`btn w-100 ${filtroEstado === "Finalizado" ? "btn-dark" : "btn-outline-dark"}`}
                        onClick={() => setFiltroEstado("Finalizado")}
                      >
                        <i className="bi bi-flag me-1"></i>
                        Finalizados
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            </div>

            {/* BUSCADOR */}
            <div className="col-md-12 py-3">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por propiedad, locador, locatario o dirección..."
                  value={searchContrato}
                  onChange={(e) => setSearchContrato(e.target.value)}
                />
              </div>
            </div>


            <TablaContratos
              contratosFiltrados={contratosFiltrados}
              openRow={openRow}

              clientes={clientes}

              toggleRow={toggleRow}
              abrirCliente={abrirCliente}
              verRecibosInquilino={verRecibosInquilino}
              cobrarAlquiler={cobrarAlquiler}
              verRecibosPropietario={verRecibosPropietario}
              facturarPago={facturarPago}
              getContractStatus={getContractStatus}
              formatCurrency={formatCurrency}
              handleEditContract={handleEditContract}
              handleFileUpload={handleFileUpload}
              eliminarContrato={eliminarContrato}
              eliminandoContrato={eliminandoContrato}

            />

            <ContratoModal

              showModal={showModal}
              setShowModal={setShowModal}

              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}

              handleSearch={handleSearch}

              loadingSearch={loadingSearch}
              searchResults={searchResults}

              selectedProperty={selectedProperty}
              setSelectedProperty={setSelectedProperty}

              handleBackToSearch={handleBackToSearch}

              formData={formData}
              setFormData={setFormData}

              handleSaveContract={handleSaveContract}
              creandoContrato={creandoContrato}

              CardSeleccionPropiedad={CardSeleccionPropiedad}

              modoLocador={modoLocador}
              setModoLocador={setModoLocador}
              modoLocatario={modoLocatario}
              setModoLocatario={setModoLocatario}

              clientes={clientes}   // 👈 AGREGAR ESTO

            />

            {/* ====================================================== */}
            {/* MODAL CLIENTE */}
            {/* ====================================================== */}

            <ClienteModal

              showClienteModal={showClienteModal}
              setShowClienteModal={setShowClienteModal}

              clienteSeleccionado={clienteSeleccionado}
              setClienteSeleccionado={setClienteSeleccionado}

              modoEdicion={modoEdicion}
              setModoEdicion={setModoEdicion}

              formEdicion={formEdicion}
              setFormEdicion={setFormEdicion}

              liqEditando={liqEditando}
              setLiqEditando={setLiqEditando}

              liqForm={liqForm}
              setLiqForm={setLiqForm}

              pagoEditando={pagoEditando}
              setPagoEditando={setPagoEditando}

              pagoForm={pagoForm}
              setPagoForm={setPagoForm}

              formatCurrency={formatCurrency}

            />

            <RecibosLiquidacionModal
              mostrarRecibos={mostrarRecibos}
              setMostrarRecibos={setMostrarRecibos}
              contratoRecibosLiquidacion={contratoRecibosLiquidacion}
            />


            <RecibosInquilinoModal
              mostrarRecibosInquilino={mostrarRecibosInquilino}
              setMostrarRecibosInquilino={setMostrarRecibosInquilino}
              contratoRecibosInquilino={contratoRecibosInquilino}
            />

            <LiquidacionModal
              mostrarCaja={mostrarCaja}
              setMostrarCaja={setMostrarCaja}
              contratoCaja={contratoCaja}
              formLiquidacion={formLiquidacion}
              setFormLiquidacion={setFormLiquidacion}
            />

            <CobranzaModal

              mostrarCobranza={mostrarCobranza}
              setMostrarCobranza={setMostrarCobranza}

              contratoCobranza={contratoCobranza}

              formCobranza={formCobranza}
              setFormCobranza={setFormCobranza}

            />










          </div>
        </div>
      </div>
    </article>




  );
}
