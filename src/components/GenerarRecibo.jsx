import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import reciboLogo from "../assets/reciboLogo.png";


import { storage, db } from "../config/firebase";

import {
    ref,
    uploadBytes,
    getDownloadURL,
} from "firebase/storage";

import {
    doc as firestoreDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

const GenerarRecibo = (pago, formatCurrency) => {

    const p = pago;

    const observaciones =
        (p.observaciones ?? "").toString().trim() ||
        (p.notas ?? "").toString().trim() ||
        "";

    const isValid = (v) =>
        v !== undefined &&
        v !== null &&
        v !== "" &&
        v !== "-";

    // =========================
    // CLIENTE (PROPIETARIO)
    // =========================
    const clienteNombre =
        isValid(p.clienteNombre)
            ? p.clienteNombre
            : isValid(p.locadorNombre)
                ? p.locadorNombre
                : isValid(p.propietarioNombre)
                    ? p.propietarioNombre
                    : "Cliente sin nombre";

    // =========================
    // INQUILINO
    // =========================
    const locatarioNombre =
        isValid(p.locatarioNombre)
            ? p.locatarioNombre
            : isValid(p.inquilinoNombre)
                ? p.inquilinoNombre
                : isValid(p.nombreInquilino)
                    ? p.nombreInquilino
                    : isValid(p.inquilino?.nombre)
                        ? p.inquilino.nombre
                        : "Inquilino sin nombre";

    // =========================
    // LOCADOR (EXTRA SEGURO)
    // =========================
    const locadorNombre =
        isValid(p.locadorNombre)
            ? p.locadorNombre
            : isValid(p.propietarioNombre)
                ? p.propietarioNombre
                : "Propietario sin nombre";



    // ✅ DETECTA TIPO Y CAMBIA EL TEXTO
    const esLiquidacion = p.tipo === "liquidacion";

    const textoFinal = esLiquidacion
        ? `SE REGISTRA LA LIQUIDACIÓN...`
        : `POR MANDATO DEL LOCADOR RECIBÍ...`;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // =====================================================
    // BORDE GENERAL
    // =====================================================

    doc.setDrawColor(180);

    doc.rect(5, 5, 200, 287);

    // =====================================================
    // DOCUMENTO NO VALIDO
    // =====================================================

    doc.setFillColor(240, 240, 240);

    doc.rect(10, 10, 190, 10, "F");

    doc.setFontSize(10);

    doc.setTextColor(120);

    doc.text(
        "DOCUMENTO NO VALIDO COMO COMPROBANTE ELECTRONICO",
        pageWidth / 2,
        16,
        { align: "center" }
    );

    // =====================================================
    // CONTENEDOR ENCABEZADO
    // =====================================================

    doc.setDrawColor(180);

    doc.rect(10, 25, 190, 48);

    // =====================================================
    // CUADRO X CENTRADO
    // =====================================================

    doc.rect(92, 25, 26, 26);

    doc.setFontSize(26);

    doc.setTextColor(50);

    doc.text(
        "X",
        105,
        38,
        {
            align: "center"
        }
    );

    doc.setFontSize(8);

    doc.text(
        "ORIGINAL",
        105,
        45,
        {
            align: "center"
        }
    );

    // =====================================================
    // LINEAS VERTICALES
    // =====================================================

    doc.setDrawColor(200);

    // izquierda de X
    doc.line(
        92,
        25,
        92,
        73
    );

    // derecha de X
    doc.line(
        118,
        25,
        118,
        73
    );

    // =====================================================
    // LOGO
    // =====================================================

    const imgWidth = 49;

    const imgProps =
        doc.getImageProperties(reciboLogo);

    const imgHeight =
        (imgProps.height * imgWidth) /
        imgProps.width;

    doc.addImage(
        reciboLogo,
        "PNG",
        10,
        25,
        imgWidth,
        imgHeight
    );

    // =====================================================
    // TITULO
    // =====================================================

    doc.setFontSize(24);

    doc.setTextColor(40);

    doc.text(
        "RECIBO",
        185,
        38,
        {
            align: "right"
        }
    );

    // =====================================================
    // DATOS DERECHA
    // =====================================================

    doc.setFontSize(11);

    doc.setTextColor(0);

    doc.text(
        "Tipo:",
        140,
        48
    );

    doc.text(
        "A",
        160,
        48
    );
    doc.text(
        "Fecha:",
        140,
        55
    );

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        p.fechaCobro
            ? new Date(
                p.fechaCobro?.seconds
                    ? p.fechaCobro.seconds * 1000
                    : p.fechaCobro
            ).toLocaleDateString("es-AR")
            : "-",
        157,
        55
    );

    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        "Periodo:",
        140,
        62
    );

    doc.text(
        `#${p.periodoNumero || "-"}`,
        157,
        62
    );

    // =====================================================
    // NUMERO RECIBO
    // =====================================================

    doc.text(
        "Recibo:",
        140,
        69
    );

    doc.text(
        p.numeroRecibo || "-",
        157,
        69
    );

    // =====================================================
    // CLIENTES
    // =====================================================

    doc.setDrawColor(200);

    doc.rect(10, 78, 190, 40);

    // INQUILINO
    doc.setFont("helvetica", "normal");
    doc.text("Inquilino:", 14, 88);

    doc.setFont("helvetica", "bold");
    doc.text(locatarioNombre, 38, 88);

    // CLIENTE
    doc.setFont("helvetica", "normal");
    doc.text("Cliente:", 14, 104);

    doc.setFont("helvetica", "bold");
    doc.text(clienteNombre, 38, 104);

    // =====================================================
    // DIRECCION
    // =====================================================

    doc.setFont("helvetica", "normal");

    doc.text(
        "Dirección:",
        110,
        88
    );

    doc.setFont("helvetica", "bold");

    doc.text(
        `${p.propiedadDireccion?.calle || p.propiedadTitulo || "-"}, ${p.propiedadDireccion?.localidad || "-"
        }, ${p.propiedadDireccion?.provincia || "-"
        }`,
        132,
        88,
        {
            maxWidth: 55
        }
    );

    doc.setFont("helvetica", "normal");



    // =====================================================
    // TABLA
    // =====================================================


    // =====================================================
    // FECHA DEL COBRO
    // =====================================================

    const fechaPeriodo = p.fechaCobro
        ? new Date(
            p.fechaCobro?.seconds
                ? p.fechaCobro.seconds * 1000
                : p.fechaCobro
        ).toLocaleDateString("es-AR")
        : "-";

    // =====================================================
    // TEXTO CUOTA
    // =====================================================

    const meses = [
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
    ];

    const descripcionCuota =
        `Alquiler Cuota ${p.numeroCuota || "-"} de ${p.totalCuotas || "-"} - ${meses[(p.mes || 1) - 1]}/${p.anio || ""} - Periodo #${p.periodoNumero || "-"}`;

    // =====================================================
    // TABLA
    // =====================================================

    autoTable(doc, {

        startY: 120,

        margin: {
            left: 10,
            right: 10,
        },

        tableWidth: "auto",

        theme: "grid",

        styles: {

            fontSize: 8.5,

            cellPadding: 2.5,

            lineColor: [210, 210, 210],

            lineWidth: 0.2,

            valign: "middle",
        },

        headStyles: {

            fillColor: [220, 220, 220],

            textColor: 40,

            fontStyle: 9.5,

            halign: "center",

            lineColor: [0, 0, 0],

            lineWidth: 0.3,
        },

        bodyStyles: {

            textColor: 20,
        },

        footStyles: {

            fillColor: [240, 240, 240],

            textColor: 0,

            fontStyle: "bold",

            fontSize: 10,
        },

        columnStyles: {

            // FECHA
            0: {
                cellWidth: 18,
                halign: "center",
            },

            // DESCRIPCION
            1: {
                cellWidth: 40,
            },

            // MONTO
            2: {
                cellWidth: 30,
                halign: "right",
            },

            // SERVICIOS
            3: {
                cellWidth: 23,
                halign: "right",
            },

            // INTERES
            4: {
                cellWidth: 23,
                halign: "right",
            },

            // ADMINISTRACION
            5: {
                cellWidth: 26,
                halign: "right",
            },

            // TOTAL
            6: {
                cellWidth: 30,
                halign: "right",
            },
        },

        head: [[

            "Fecha",

            "Descripción",

            "Monto",

            "Servicios",

            "Punitorios",

            "Administración",

            "Total"
        ]],

        body: [[

            fechaPeriodo,

            descripcionCuota,

            formatCurrency(
                p.montoBase || 0
            ),

            formatCurrency(
                p.servicios || 0
            ),

            formatCurrency(
                p.interesGenerado || 0
            ),
            formatCurrency(
                p.administracion ?? p.montoComision ?? 0
            ),
            formatCurrency(
                p.montoFinal || 0
            )

        ]],

        foot: [[

            "",

            "TOTAL",

            "",

            "",

            "",

            "",

            formatCurrency(
                p.montoFinal || 0
            )

        ]],
    });
    // =====================================================
    // TEXTO RECIBI
    // =====================================================

    const finalY =
        doc.lastAutoTable?.finalY ||
        doc.previousAutoTable?.finalY ||
        150;

    // =====================================================
    // RESUMEN MONTOS DERECHA
    // =====================================================

    doc.line(
        132,
        finalY + 18,
        190,
        finalY + 18
    );

    // LINEA ABAJO DE SALDO DEUDOR
    doc.line(
        132,
        finalY + 28,
        190,
        finalY + 28
    );

    // TITULOS
    doc.setFontSize(9);

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "Monto a Abonar",
        136,
        finalY + 7
    );

    doc.text(
        "TOTAL ABONADO",
        136,
        finalY + 15
    );

    doc.text(
        "Saldo Deudor",
        136,
        finalY + 25
    );

    // VALORES
    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        formatCurrency(
            p.montoFinal || 0
        ),
        186,
        finalY + 7,
        {
            align: "right"
        }
    );

    doc.text(
        formatCurrency(
            p.montoFinal || 0
        ),
        186,
        finalY + 15,
        {
            align: "right"
        }
    );

    doc.text(
        formatCurrency(0),
        186,
        finalY + 25,
        {
            align: "right"
        }
    );

    // =====================================================
    // OBSERVACIONES (ORIGINAL)
    // =====================================================

    const observacionesOriginalY = finalY + 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    doc.text("OBSERVACIONES:", 14, observacionesOriginalY);

    doc.setDrawColor(180);

    doc.rect(
        14,
        observacionesOriginalY + 2,
        182,
        10
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);

    doc.text(
        observaciones.trim() !== ""
            ? observaciones
            : "Sin observaciones.",
        16,
        observacionesOriginalY + 5,
        {
            maxWidth: 176,
        }
    );

    // =====================================================
    // TEXTO ABAJO DE LA LINEA (ORIGINAL)
    // =====================================================

    const textoFinalOriginalY = finalY + 35;

    doc.setFontSize(8);

    doc.text(
        `POR MANDATO DEL LOCADOR RECIBÍ DEL LOCATARIO LA SUMA DE ${formatCurrency(
            p.montoFinal || 0
        )} (${p.montoLetras || ""}) POR EL ALQUILER DE UNA PROPIEDAD QUE OCUPA EN LA CALLE ${p.propiedadDireccion?.calle || "-"}, Dpto: ${p.propiedadDireccion?.departamento || "-"}, U.F.: ${p.propiedadDireccion?.unidadFuncional || "-"}.`,
        14,
        textoFinalOriginalY,
        {
            maxWidth: 176,
            align: "justify"
        }
    );

    // =====================================================
    // LINEA DE CORTE (ORIGINAL)
    // =====================================================

    const corteOriginalY = finalY + 42;

    doc.setDrawColor(140);

    doc.setLineDashPattern([2, 2], 0);

    doc.line(
        10,
        corteOriginalY,
        200,
        corteOriginalY
    );

    doc.setLineDashPattern([], 0);
    // =====================================================
    // DUPLICADO
    // =====================================================

    const resumenY = corteOriginalY + 6;
    // BORDE
    doc.setDrawColor(180);
    doc.rect(
        10,
        resumenY,
        190,
        80  // Aumenté la altura para dar más espacio
    );

    // =====================================================
    // TITULO
    // =====================================================

    doc.setFontSize(8);

    doc.setFont(
        "helvetica",
        "bold"
    );


    // CONTENEDOR TITULO
    doc.setDrawColor(180);

    doc.rect(
        10,
        resumenY,
        190,
        8
    );

    // TITULO
    doc.text(
        "RECIBO POR CUENTA Y ORDEN DE TERCEROS",
        pageWidth / 2,
        resumenY + 5,
        {
            align: "center"
        }
    );

    // =====================================================
    // DATOS SUPERIORES
    // =====================================================

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");

    doc.text(
        `Fecha: ${p.fechaCobro
            ? new Date(
                p.fechaCobro?.seconds
                    ? p.fechaCobro.seconds * 1000
                    : p.fechaCobro
            ).toLocaleDateString("es-AR")
            : "-"
        }`,
        14,
        resumenY + 10
    );

    doc.text(
        `Recibo: ${p.numeroRecibo || "-"}`,
        78,
        resumenY + 10
    );

    doc.text(
        `Periodo: #${p.periodoNumero || "-"}`,
        145,
        resumenY + 10
    );


    doc.text(
        "Tipo: A",
        175,
        resumenY + 10
    );

    // =====================================================
    // CLIENTES
    // =====================================================
    doc.setFont("helvetica", "normal");

    doc.text(
        "Cliente:",
        14,
        resumenY + 16
    );

    doc.setFont("helvetica", "bold");

    doc.text(
        clienteNombre,
        38,
        resumenY + 16
    );

    doc.setFont("helvetica", "normal");

    doc.text(
        "Inquilino:",
        110,
        resumenY + 16
    );

    doc.setFont("helvetica", "bold");

    doc.text(
        locatarioNombre,
        130,
        resumenY + 16
    );

    // =====================================================
    // DIRECCION
    // =====================================================

    doc.setFont("helvetica", "normal");
    doc.text("Dirección:", 14, resumenY + 24);

    doc.setFont("helvetica", "bold");
    doc.text(
        `${p.propiedadDireccion?.calle || "-"}, ${p.propiedadDireccion?.localidad || "-"
        }, ${p.propiedadDireccion?.provincia || "-"}`,
        36,
        resumenY + 24,
        { maxWidth: 145 }
    );



    // =====================================================
    // TABLA DUPLICADA
    // =====================================================

    autoTable(doc, {

        startY: resumenY + 30,

        margin: {
            left: 10,
            right: 10,
        },

        tableWidth: "auto",

        theme: "grid",

        styles: {

            fontSize: 8.5,

            cellPadding: 2.5,

            lineColor: [210, 210, 210],

            lineWidth: 0.2,

            valign: "middle",
        },

        headStyles: {

            fillColor: [220, 220, 220],

            textColor: 40,

            fontStyle: 9.5,

            halign: "center",

            lineColor: [0, 0, 0],

            lineWidth: 0.3,
        },

        bodyStyles: {

            textColor: 20,
        },

        footStyles: {

            fillColor: [240, 240, 240],

            textColor: 0,

            fontStyle: "bold",

            fontSize: 10,
        },

        columnStyles: {

            // FECHA
            0: {
                cellWidth: 18,
                halign: "center",
            },

            // DESCRIPCION
            1: {
                cellWidth: 40,
            },

            // MONTO
            2: {
                cellWidth: 30,
                halign: "right",
            },

            // SERVICIOS
            3: {
                cellWidth: 23,
                halign: "right",
            },

            // INTERES
            4: {
                cellWidth: 23,
                halign: "right",
            },

            // ADMINISTRACION
            5: {
                cellWidth: 26,
                halign: "right",
            },

            // TOTAL
            6: {
                cellWidth: 30,
                halign: "right",
            },
        },

        head: [[

            "Fecha",

            "Descripción",

            "Monto",

            "Servicios",

            "Punitorios",

            "Administración",

            "Total"
        ]],

        body: [[

            fechaPeriodo,

            descripcionCuota,

            formatCurrency(
                p.montoBase || 0
            ),

            formatCurrency(
                p.servicios || 0
            ),

            formatCurrency(
                p.interesGenerado || 0
            ),

            formatCurrency(
                p.administracion ?? p.montoComision ?? 0
            ),

            formatCurrency(
                p.montoFinal || 0
            )

        ]],

        foot: [[

            "",

            "TOTAL",

            "",

            "",

            "",

            "",

            formatCurrency(
                p.montoFinal || 0
            )

        ]],
    });
    // =====================================================
    // RESUMEN DERECHA
    // =====================================================

    const finalDuplicadoY =
        doc.lastAutoTable.finalY;

    // ALTURA PERSONALIZADA
    const resumenMontosY =
        finalDuplicadoY + 8;

    // LINEAS
    doc.line(
        132,
        resumenMontosY + 7,
        190,
        resumenMontosY + 7
    );

    doc.line(
        132,
        resumenMontosY + 14,
        190,
        resumenMontosY + 14
    );

    // TITULOS
    doc.setFontSize(8);

    doc.setFont(
        "helvetica",
        "bold"
    );

    doc.text(
        "Monto a Abonar",
        136,
        resumenMontosY
    );

    doc.text(
        "TOTAL ABONADO",
        136,
        resumenMontosY + 7
    );

    doc.text(
        "Saldo Deudor",
        136,
        resumenMontosY + 14
    );

    // VALORES
    doc.setFont(
        "helvetica",
        "normal"
    );

    doc.text(
        formatCurrency(
            pago.montoFinal || 0
        ),
        186,
        resumenMontosY,
        {
            align: "right"
        }
    );

    doc.text(
        formatCurrency(
            p.montoFinal || 0
        ),
        186,
        resumenMontosY + 7,
        {
            align: "right"
        }
    );

    doc.text(
        formatCurrency(0),
        186,
        resumenMontosY + 14,
        {
            align: "right"
        }
    );

    // =====================================================
    // OBSERVACIONES
    // =====================================================

    const observacionesY = finalDuplicadoY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);

    doc.text("OBSERVACIONES:", 14, observacionesY);

    doc.setDrawColor(180);

    doc.rect(
        14,
        observacionesY + 2,
        182,
        10
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);


    doc.text(
        observaciones.trim() !== ""
            ? observaciones
            : "Sin observaciones.",
        16,
        observacionesY + 5,
        {
            maxWidth: 176,
        }
    );

    // =====================================================
    // TEXTO FINAL
    // =====================================================

    const textoFinalY = observacionesY + 18;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    doc.text(
        `POR MANDATO DEL LOCADOR RECIBÍ DEL LOCATARIO LA SUMA DE ${formatCurrency(
            p.montoFinal || 0
        )} POR EL ALQUILER DE UNA PROPIEDAD UBICADA EN ${p.propiedadDireccion?.calle || "-"
        }.`,
        14,
        textoFinalY,
        {
            maxWidth: 176,
            align: "justify",
        }
    );


    // =====================================================
    // GUARDAR
    // =====================================================
    // =====================================================
    // GENERAR PDF BLOB
    // =====================================================

    const pdfBlob = doc.output("blob");

    // =====================================================
    // NOMBRE ARCHIVO
    // =====================================================

    const nombreArchivo =
        `Recibo-${p.numeroRecibo || p.periodoNumero}.pdf`;

    // =====================================================
    // REFERENCIA STORAGE
    // =====================================================

    const storageRef = ref(
        storage,
        `recibos/${nombreArchivo}`
    );

    // =====================================================
    // SUBIR PDF
    // =====================================================

    uploadBytes(storageRef, pdfBlob)

        .then(async () => {

            // =====================================================
            // URL PDF
            // =====================================================

            const pdfUrl =
                await getDownloadURL(storageRef);

            // =====================================================
            // GUARDAR EN FIRESTORE
            // =====================================================

            await setDoc(
                firestoreDoc(
                    db,
                    "Recibos",
                    p.id || Date.now().toString()
                ),
                {
                    ...p,

                    pdfUrl: pdfUrl,

                    nombreArchivo,

                    createdAt: serverTimestamp(),
                },
                {
                    merge: true,
                }
            );

            // =====================================================
            // DESCARGAR LOCAL
            // =====================================================

            doc.save(nombreArchivo);

            console.log(
                "✅ PDF SUBIDO Y GUARDADO"
            );

        })

        .catch((error) => {

            console.error(
                "❌ ERROR SUBIENDO PDF:",
                error
            );

        });
};

export default GenerarRecibo;