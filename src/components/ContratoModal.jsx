import React from "react";

export default function ContratoModal({

    showModal,
    setShowModal,

    searchTerm,
    setSearchTerm,

    handleSearch,

    loadingSearch,
    searchResults,

    selectedProperty,
    setSelectedProperty,

    modoLocador,
    setModoLocador,
    modoLocatario,
    setModoLocatario,
    clientes,


    handleBackToSearch,

    formData,
    setFormData,

    handleSaveContract,
    creandoContrato,

    CardSeleccionPropiedad

}) {

    if (!showModal) return null;


    return (
        <>
            {/* BACKDROP */}
            <div
                className="modal-backdrop fade show"
                onClick={() => setShowModal(false)}
            ></div>

            {/* MODAL */}
            <div className="modal d-block" tabIndex="-1">
                <div className="modal-dialog modal-xl modal-dialog-centered">
                    <div className="modal-content">

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

                                                            <div className="col-12 mt-4">
                                                                <div className="border rounded-4 p-4 bg-light">

                                                                    <div className="d-flex align-items-center justify-content-between mb-4">

                                                                        <div>
                                                                            <h5 className="fw-bold mb-1 text-success">
                                                                                Datos del Locador
                                                                            </h5>

                                                                            <div className="small text-muted">
                                                                                Información y documentación del propietario
                                                                            </div>
                                                                        </div>

                                                                        <div
                                                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                                                            style={{
                                                                                width: "45px",
                                                                                height: "45px",
                                                                                backgroundColor: "rgba(25,135,84,0.1)"
                                                                            }}
                                                                        >
                                                                            <i className="bi bi-person-badge-fill text-success"></i>
                                                                        </div>

                                                                    </div>

                                                                    <div className="row g-3">

                                                                        {/* TIPO DE LOCADOR */}

                                                                        <div className="col-12">

                                                                            <label className="form-label fw-bold">
                                                                                Locador
                                                                            </label>

                                                                            <div className="btn-group w-100">

                                                                                <button
                                                                                    type="button"
                                                                                    className={`btn ${modoLocador === "existente"
                                                                                            ? "btn-success"
                                                                                            : "btn-outline-success"
                                                                                        }`}
                                                                                    onClick={() => setModoLocador("existente")}
                                                                                >
                                                                                    Usar Existente
                                                                                </button>

                                                                                <button
                                                                                    type="button"
                                                                                    className={`btn ${modoLocador === "nuevo"
                                                                                            ? "btn-success"
                                                                                            : "btn-outline-success"
                                                                                        }`}
                                                                                    onClick={() => {

                                                                                        setModoLocador("nuevo");

                                                                                        setFormData({
                                                                                            ...formData,

                                                                                            locadorId: "",

                                                                                            locador: "",
                                                                                            locadorDni: "",
                                                                                            locadorCuil: "",
                                                                                            locadorEmail: "",
                                                                                            locadorTelefono1: "",
                                                                                            locadorTelefono2: "",
                                                                                            comisionInmobiliaria: "",
                                                                                        });
                                                                                    }}
                                                                                >
                                                                                    Crear Nuevo
                                                                                </button>

                                                                            </div>

                                                                        </div>

                                                                        {modoLocador === "existente" && (

                                                                            <div className="col-12">

                                                                                <label className="form-label">
                                                                                    Seleccionar Locador
                                                                                </label>

                                                                                <select
                                                                                    className="form-select"
                                                                                    value={formData.locadorId || ""}
                                                                                    onChange={(e) => {

                                                                                        const locador = clientes.find(
                                                                                            (c) => c.id === e.target.value
                                                                                        );

                                                                                        if (!locador) return;

                                                                                        setFormData({
                                                                                            ...formData,

                                                                                            locadorId: locador.id,

                                                                                            locador: locador.nombre || "",
                                                                                            locadorDni: locador.dni || "",
                                                                                            locadorCuil: locador.cuil || "",
                                                                                            locadorEmail: locador.email || "",
                                                                                            locadorTelefono1: locador.telefono1 || "",
                                                                                            locadorTelefono2: locador.telefono2 || "",
                                                                                            comisionInmobiliaria: locador.comisionInmobiliaria || ""

                                                                                        });
                                                                                    }}
                                                                                >
                                                                                    <option value="">
                                                                                        Seleccionar locador...
                                                                                    </option>

                                                                                    {clientes
                                                                                        .filter(
                                                                                            (c) =>
                                                                                                Array.isArray(c.roles) &&
                                                                                                c.roles.includes("locador")
                                                                                        )
                                                                                        .sort((a, b) =>
                                                                                            (a.nombre || "").localeCompare(
                                                                                                b.nombre || "",
                                                                                                "es",
                                                                                                { sensitivity: "base" }
                                                                                            )
                                                                                        )
                                                                                        .map((locador) => (
                                                                                            <option
                                                                                                key={locador.id}
                                                                                                value={locador.id}
                                                                                            >
                                                                                                {locador.nombre}
                                                                                                {locador.dni
                                                                                                    ? ` - DNI ${locador.dni}`
                                                                                                    : ""}
                                                                                            </option>
                                                                                        ))}
                                                                                </select>

                                                                            </div>

                                                                        )}
                                                                        <div className="col-md-4">
                                                                            <label className="form-label">Nombre y Apellido</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                disabled={modoLocador === "existente"}
                                                                                value={formData.locador}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        locador: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">DNI</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                disabled={modoLocador === "existente"}
                                                                                value={formData.locadorDni}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        locadorDni: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">CUIL</label>

                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                placeholder="20-12345678-3"
                                                                                disabled={modoLocador === "existente"}
                                                                                value={formData.locadorCuil || ""}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        locadorCuil: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">Email</label>

                                                                            <input
                                                                                type="email"
                                                                                className="form-control"
                                                                                disabled={modoLocador === "existente"}
                                                                                value={formData.locadorEmail || ""}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        locadorEmail: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">Teléfono 1</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                disabled={modoLocador === "existente"}
                                                                                value={formData.locadorTelefono1 || ""}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        locadorTelefono1: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">Teléfono 2</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                disabled={modoLocador === "existente"}
                                                                                value={formData.locadorTelefono2 || ""}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        locadorTelefono2: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>
                                                                        {/* COMISIÓN INMOBILIARIA */}
                                                                        <div className="col-md-4">
                                                                            <label className="form-label">
                                                                                Comisión Inmobiliaria
                                                                            </label>

                                                                            <div className="input-group">
                                                                                <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    step="0.01"
                                                                                    className="form-control"
                                                                                    value={formData.comisionInmobiliaria || ""}
                                                                                    onChange={(e) =>
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            comisionInmobiliaria: e.target.value
                                                                                        })
                                                                                    }
                                                                                    onWheel={(e) => e.currentTarget.blur()}
                                                                                />

                                                                                <span className="input-group-text">
                                                                                    %
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="col-12">

                                                                            <div className="border rounded-4 p-3 bg-white">

                                                                                <div className="fw-semibold mb-3">
                                                                                    Documentación Locador
                                                                                </div>

                                                                                <input
                                                                                    type="file"
                                                                                    multiple
                                                                                    disabled={modoLocador === "existente"}
                                                                                    className="form-control"
                                                                                    onChange={(e) =>
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            locadorArchivos: Array.from(e.target.files)
                                                                                        })
                                                                                    }
                                                                                />

                                                                                {formData.locadorArchivos?.length > 0 && (
                                                                                    <div className="mt-3">

                                                                                        {formData.locadorArchivos.map((file, index) => (
                                                                                            <div
                                                                                                key={index}
                                                                                                className="small text-secondary mb-1"
                                                                                            >
                                                                                                📄 {file.name}
                                                                                            </div>
                                                                                        ))}

                                                                                    </div>
                                                                                )}

                                                                            </div>

                                                                        </div>

                                                                    </div>

                                                                </div>
                                                            </div>


                                                            {/* TIPO DE LOCATARIO */}

                                                            <div className="col-12">

                                                                <label className="form-label fw-bold">
                                                                    Locatario
                                                                </label>

                                                                <div className="btn-group w-100">

                                                                    <button
                                                                        type="button"
                                                                        className={`btn ${modoLocatario === "existente"
                                                                                ? "btn-success"
                                                                                : "btn-outline-success"
                                                                            }`}
                                                                        onClick={() => setModoLocatario("existente")}
                                                                    >
                                                                        Usar Existente
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        className={`btn ${modoLocatario === "nuevo"
                                                                                ? "btn-success"
                                                                                : "btn-outline-success"
                                                                            }`}
                                                                        onClick={() => {

                                                                            setModoLocatario("nuevo");

                                                                            setFormData({
                                                                                ...formData,

                                                                                locatarioId: "",

                                                                                locatario: "",
                                                                                locatarioDni: "",
                                                                                locatarioCuil: "",
                                                                                locatarioEmail: "",
                                                                                locatarioTelefono1: "",
                                                                                locatarioTelefono2: "",
                                                                                deposito: "",

                                                                                locatarioArchivos: [],
                                                                            });
                                                                        }}
                                                                    >
                                                                        Crear Nuevo
                                                                    </button>

                                                                </div>

                                                            </div>

                                                            {modoLocatario === "existente" && (

                                                                <div className="col-12">

                                                                    <label className="form-label">
                                                                        Seleccionar Locatario
                                                                    </label>

                                                                    <select
                                                                        className="form-select"
                                                                        value={formData.locatarioId || ""}
                                                                        onChange={(e) => {

                                                                            const locatario = clientes.find(
                                                                                (c) => c.id === e.target.value
                                                                            );

                                                                            if (!locatario) return;

                                                                            setFormData({
                                                                                ...formData,

                                                                                locatarioId: locatario.id,

                                                                                locatario: locatario.nombre || "",
                                                                                locatarioDni: locatario.dni || "",
                                                                                locatarioCuil: locatario.cuil || "",
                                                                                locatarioEmail: locatario.email || "",
                                                                                locatarioTelefono1: locatario.telefono1 || "",
                                                                                locatarioTelefono2: locatario.telefono2 || "",
                                                                                deposito: locatario.deposito || "",
                                                                                locatarioArchivos: locatario.archivos || [],
                                                                            });
                                                                        }}
                                                                    >
                                                                        <option value="">
                                                                            Seleccionar locatario...
                                                                        </option>

                                                                        {clientes
                                                                            .filter(
                                                                                (c) =>
                                                                                    Array.isArray(c.roles) &&
                                                                                    c.roles.includes("locatario")
                                                                            )
                                                                            .sort((a, b) =>
                                                                                (a.nombre || "").localeCompare(
                                                                                    b.nombre || "",
                                                                                    "es",
                                                                                    { sensitivity: "base" }
                                                                                )
                                                                            )
                                                                            .map((locatario) => (
                                                                                <option
                                                                                    key={locatario.id}
                                                                                    value={locatario.id}
                                                                                >
                                                                                    {locatario.nombre}
                                                                                    {locatario.dni
                                                                                        ? ` - DNI ${locatario.dni}`
                                                                                        : ""}
                                                                                </option>
                                                                            ))}
                                                                    </select>

                                                                </div>

                                                            )}

                                                            <div className="col-md-4">
                                                                <label className="form-label">Nombre y Apellido</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    disabled={modoLocatario === "existente"}
                                                                    value={formData.locatario}
                                                                    onChange={(e) =>
                                                                        setFormData({
                                                                            ...formData,
                                                                            locatario: e.target.value
                                                                        })
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="col-md-4">
                                                                <label className="form-label">DNI</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    disabled={modoLocatario === "existente"}
                                                                    value={formData.locatarioDni}
                                                                    onChange={(e) =>
                                                                        setFormData({
                                                                            ...formData,
                                                                            locatarioDni: e.target.value
                                                                        })
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="col-md-4">
                                                                <label className="form-label">CUIL</label>

                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    placeholder="20-12345678-3"
                                                                    disabled={modoLocatario === "existente"}
                                                                    value={formData.locatarioCuil || ""}
                                                                    onChange={(e) =>
                                                                        setFormData({
                                                                            ...formData,
                                                                            locatarioCuil: e.target.value
                                                                        })
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="col-md-4">
                                                                <label className="form-label">Email</label>

                                                                <input
                                                                    type="email"
                                                                    className="form-control"
                                                                    disabled={modoLocatario === "existente"}
                                                                    value={formData.locatarioEmail || ""}
                                                                    onChange={(e) =>
                                                                        setFormData({
                                                                            ...formData,
                                                                            locatarioEmail: e.target.value
                                                                        })
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="col-md-4">
                                                                <label className="form-label">Teléfono 1</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    disabled={modoLocatario === "existente"}
                                                                    value={formData.locatarioTelefono1 || ""}
                                                                    onChange={(e) =>
                                                                        setFormData({
                                                                            ...formData,
                                                                            locatarioTelefono1: e.target.value
                                                                        })
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="col-md-4">
                                                                <label className="form-label">Teléfono 2</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    disabled={modoLocatario === "existente"}
                                                                    value={formData.locatarioTelefono2 || ""}
                                                                    onChange={(e) =>
                                                                        setFormData({
                                                                            ...formData,
                                                                            locatarioTelefono2: e.target.value
                                                                        })
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="col-md-4">
                                                                <label className="form-label">
                                                                    Depósito de Garantía
                                                                </label>

                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    className="form-control"
                                                                    disabled={modoLocatario === "existente"}
                                                                    value={formData.deposito || ""}
                                                                    onChange={(e) =>
                                                                        setFormData({
                                                                            ...formData,
                                                                            deposito: Number(e.target.value) || ""
                                                                        })
                                                                    }
                                                                    onWheel={(e) => e.currentTarget.blur()}
                                                                />
                                                            </div>

                                                            <div className="col-12">

                                                                <div className="border rounded-4 p-3 bg-white">

                                                                    <div className="fw-semibold mb-3">
                                                                        Documentación Locatario
                                                                    </div>

                                                                    <input
                                                                        type="file"
                                                                        multiple
                                                                        disabled={modoLocatario === "existente"}
                                                                        className="form-control"
                                                                        onChange={(e) =>
                                                                            setFormData({
                                                                                ...formData,
                                                                                locatarioArchivos: Array.from(
                                                                                    e.target.files
                                                                                )
                                                                            })
                                                                        }
                                                                    />

                                                                    {formData.locatarioArchivos?.length > 0 && (
                                                                        <div className="mt-3">

                                                                            {formData.locatarioArchivos.map(
                                                                                (file, index) => (
                                                                                    <div
                                                                                        key={index}
                                                                                        className="small text-secondary mb-1"
                                                                                    >
                                                                                        📄 {file.nombre || file.name}
                                                                                    </div>
                                                                                )
                                                                            )}

                                                                        </div>
                                                                    )}

                                                                </div>

                                                            </div>


                                                            <div className="col-12 mt-4">
                                                                <div
                                                                    className="border rounded-4 p-4"
                                                                    style={{
                                                                        backgroundColor: "#faf7ff",
                                                                        borderColor: "#cdb4ff"
                                                                    }}
                                                                >

                                                                    <div className="d-flex align-items-center justify-content-between mb-4">

                                                                        <div>
                                                                            <h5
                                                                                className="fw-bold mb-1"
                                                                                style={{ color: "#7b2cbf" }}
                                                                            >
                                                                                Datos del Garante 1
                                                                            </h5>

                                                                            <div className="small text-muted">
                                                                                Información y documentación del primer garante del contrato
                                                                            </div>
                                                                        </div>

                                                                        <div
                                                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                                                            style={{
                                                                                width: "45px",
                                                                                height: "45px",
                                                                                backgroundColor: "rgba(123,44,191,0.12)"
                                                                            }}
                                                                        >
                                                                            <i
                                                                                className="bi bi-shield-check"
                                                                                style={{
                                                                                    color: "#7b2cbf",
                                                                                    fontSize: "1.2rem"
                                                                                }}
                                                                            ></i>
                                                                        </div>

                                                                    </div>

                                                                    <div className="row g-3">

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">Nombre y Apellido</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                value={formData.garanteNombre}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        garanteNombre: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">DNI</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                value={formData.garanteDni}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        garanteDni: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">CUIL</label>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="20-12345678-3"
                                                                                className="form-control"
                                                                                value={formData.garanteCuil}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        garanteCuil: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">Email</label>

                                                                            <input
                                                                                type="email"
                                                                                className="form-control"
                                                                                value={formData.garanteEmail || ""}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        garanteEmail: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">Teléfono 1</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                value={formData.garanteTelefono1 || ""}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        garanteTelefono1: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">Teléfono 2</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                value={formData.garanteTelefono2 || ""}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        garanteTelefono2: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-12">

                                                                            <div
                                                                                className="border rounded-4 p-3"
                                                                                style={{
                                                                                    backgroundColor: "#ffffff",
                                                                                    borderStyle: "dashed",
                                                                                    borderColor: "#cdb4ff"
                                                                                }}
                                                                            >

                                                                                <div
                                                                                    className="fw-semibold mb-3"
                                                                                    style={{ color: "#070707" }}
                                                                                >
                                                                                    Documentación Garante
                                                                                </div>

                                                                                <input
                                                                                    type="file"
                                                                                    multiple
                                                                                    className="form-control"
                                                                                    onChange={(e) =>
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            garanteArchivos: Array.from(e.target.files)
                                                                                        })
                                                                                    }
                                                                                />

                                                                                {formData.garanteArchivos?.length > 0 && (
                                                                                    <div className="mt-3">

                                                                                        {formData.garanteArchivos.map((file, index) => (
                                                                                            <div
                                                                                                key={index}
                                                                                                className="small mb-1"
                                                                                                style={{ color: "#6c757d" }}
                                                                                            >
                                                                                                📄 {file.name}
                                                                                            </div>
                                                                                        ))}

                                                                                    </div>
                                                                                )}

                                                                            </div>

                                                                        </div>

                                                                    </div>

                                                                </div>
                                                            </div>

                                                            <div className="col-12 mt-4">
                                                                <div
                                                                    className="border rounded-4 p-4"
                                                                    style={{
                                                                        backgroundColor: "#faf7ff",
                                                                        borderColor: "#cdb4ff"
                                                                    }}
                                                                >

                                                                    <div className="d-flex align-items-center justify-content-between mb-4">

                                                                        <div>
                                                                            <h5
                                                                                className="fw-bold mb-1"
                                                                                style={{ color: "#7b2cbf" }}
                                                                            >
                                                                                Datos del Garante 2
                                                                            </h5>

                                                                            <div className="small text-muted">
                                                                                Información y documentación del segundo garante del contrato
                                                                            </div>
                                                                        </div>

                                                                        <div
                                                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                                                            style={{
                                                                                width: "45px",
                                                                                height: "45px",
                                                                                backgroundColor: "rgba(123,44,191,0.12)"
                                                                            }}
                                                                        >
                                                                            <i
                                                                                className="bi bi-shield-check"
                                                                                style={{
                                                                                    color: "#7b2cbf",
                                                                                    fontSize: "1.2rem"
                                                                                }}
                                                                            ></i>
                                                                        </div>

                                                                    </div>

                                                                    <div className="row g-3">

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">Nombre y Apellido</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                value={formData.garante2Nombre}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        garante2Nombre: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">DNI</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                value={formData.garante2Dni}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        garante2Dni: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">CUIL</label>
                                                                            <input
                                                                                type="text"
                                                                                placeholder="20-12345678-3"
                                                                                className="form-control"
                                                                                value={formData.garante2Cuil}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        garante2Cuil: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">Email</label>

                                                                            <input
                                                                                type="email"
                                                                                className="form-control"
                                                                                value={formData.garante2Email || ""}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        garante2Email: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">Teléfono 1</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                value={formData.garante2Telefono1 || ""}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        garante2Telefono1: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">Teléfono 2</label>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control"
                                                                                value={formData.garante2Telefono2 || ""}
                                                                                onChange={(e) =>
                                                                                    setFormData({
                                                                                        ...formData,
                                                                                        garante2Telefono2: e.target.value
                                                                                    })
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div className="col-12">

                                                                            <div
                                                                                className="border rounded-4 p-3"
                                                                                style={{
                                                                                    backgroundColor: "#ffffff",
                                                                                    borderStyle: "dashed",
                                                                                    borderColor: "#cdb4ff"
                                                                                }}
                                                                            >

                                                                                <div
                                                                                    className="fw-semibold mb-3"
                                                                                    style={{ color: "#070707" }}
                                                                                >
                                                                                    Documentación Garante
                                                                                </div>

                                                                                <input
                                                                                    type="file"
                                                                                    multiple
                                                                                    className="form-control"
                                                                                    onChange={(e) =>
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            garante2Archivos: Array.from(e.target.files)
                                                                                        })
                                                                                    }
                                                                                />

                                                                                {formData.garante2Archivos?.length > 0 && (
                                                                                    <div className="mt-3">

                                                                                        {formData.garante2Archivos.map((file, index) => (
                                                                                            <div
                                                                                                key={index}
                                                                                                className="small mb-1"
                                                                                                style={{ color: "#6c757d" }}
                                                                                            >
                                                                                                📄 {file.name}
                                                                                            </div>
                                                                                        ))}

                                                                                    </div>
                                                                                )}

                                                                            </div>

                                                                        </div>

                                                                    </div>

                                                                </div>
                                                            </div>


                                                            <div className="col-12 mt-4">
                                                                <div className="border rounded-4 p-4 bg-light">

                                                                    <h5 className="fw-bold mb-4">
                                                                        Configuración Financiera
                                                                    </h5>

                                                                    <div className="row g-3">


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

                                                                        {/* PERIODO DE ACTUALIZACIÓN */}

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">
                                                                                Actualización Cada
                                                                            </label>

                                                                            <div className="input-group">
                                                                                <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    className="form-control"
                                                                                    value={formData.periodoActualizacion || ""}
                                                                                    style={{
                                                                                        MozAppearance: "textfield",
                                                                                        appearance: "textfield"
                                                                                    }}
                                                                                    onWheel={(e) => e.currentTarget.blur()}
                                                                                    onChange={(e) => {

                                                                                        const nuevoPeriodo = Number(e.target.value);

                                                                                        let cantidadPeriodos = 0;

                                                                                        if (
                                                                                            formData.fechaInicio &&
                                                                                            formData.fechaFin &&
                                                                                            nuevoPeriodo > 0
                                                                                        ) {

                                                                                            const inicio = new Date(formData.fechaInicio);
                                                                                            const fin = new Date(formData.fechaFin);

                                                                                            const mesesTotales =
                                                                                                (fin.getFullYear() - inicio.getFullYear()) * 12 +
                                                                                                (fin.getMonth() - inicio.getMonth());

                                                                                            cantidadPeriodos = Math.ceil(
                                                                                                mesesTotales / nuevoPeriodo
                                                                                            );
                                                                                        }

                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            periodoActualizacion: e.target.value,
                                                                                            cantidadPeriodos
                                                                                        });
                                                                                    }}
                                                                                />

                                                                                <span className="input-group-text">
                                                                                    Meses
                                                                                </span>
                                                                            </div>
                                                                        </div>

                                                                        <div className="col-md-4">
                                                                            <label className="form-label d-block">
                                                                                Tipo de Actualización
                                                                            </label>

                                                                            <div className="btn-group w-100">
                                                                                {["IPC", "ICL", "OTRO"].map((tipo) => (
                                                                                    <button
                                                                                        key={tipo}
                                                                                        type="button"
                                                                                        className={`btn ${formData.indiceActualizacion === tipo
                                                                                                ? "btn-primary"
                                                                                                : "btn-outline-primary"
                                                                                            }`}
                                                                                        onClick={() =>
                                                                                            setFormData({
                                                                                                ...formData,
                                                                                                indiceActualizacion: tipo,
                                                                                            })
                                                                                        }
                                                                                    >
                                                                                        {tipo}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        {/* CANTIDAD DE PERIODOS */}

                                                                        <div className="col-md-4">
                                                                            <label className="form-label">
                                                                                Cantidad de Períodos
                                                                            </label>

                                                                            <input
                                                                                type="number"
                                                                                className="form-control bg-light"
                                                                                readOnly
                                                                                value={formData.cantidadPeriodos || 0}
                                                                            />
                                                                        </div>

                                                                        {/* PLAZO DE PAGO */}

                                                                        <div className="col-md-6">
                                                                            <label className="form-label">
                                                                                Plazo de Pago
                                                                            </label>

                                                                            <div className="d-flex align-items-center gap-2">

                                                                                <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    max="31"
                                                                                    className="form-control"
                                                                                    placeholder="Desde"
                                                                                    value={formData.plazoPagoDesde || ""}
                                                                                    onChange={(e) =>
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            plazoPagoDesde: e.target.value
                                                                                        })
                                                                                    }
                                                                                    onWheel={(e) => e.currentTarget.blur()}
                                                                                />

                                                                                <span>
                                                                                    al
                                                                                </span>

                                                                                <input
                                                                                    type="number"
                                                                                    min="1"
                                                                                    max="31"
                                                                                    className="form-control"
                                                                                    placeholder="Hasta"
                                                                                    value={formData.plazoPagoHasta || ""}
                                                                                    onChange={(e) =>
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            plazoPagoHasta: e.target.value
                                                                                        })
                                                                                    }
                                                                                    onWheel={(e) => e.currentTarget.blur()}
                                                                                />

                                                                            </div>
                                                                        </div>

                                                                        {/* INTERÉS POR MORA */}

                                                                        <div className="col-md-6">
                                                                            <label className="form-label">
                                                                                Interés por Mora Diario
                                                                            </label>

                                                                            <div className="input-group">

                                                                                <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    step="0.1"
                                                                                    className="form-control"
                                                                                    value={formData.interesMoraDiario || ""}
                                                                                    onChange={(e) =>
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            interesMoraDiario: e.target.value
                                                                                        })
                                                                                    }
                                                                                    onWheel={(e) => e.currentTarget.blur()}
                                                                                />

                                                                                <span className="input-group-text">
                                                                                    % por día
                                                                                </span>

                                                                            </div>
                                                                        </div>


                                                                        <div className="col-md-12">
                                                                            <label className="form-label">Precio Mensual</label>

                                                                            <div className="input-group">
                                                                                <span className="input-group-text">$</span>

                                                                                <input
                                                                                    type="number"
                                                                                    className="form-control"
                                                                                    placeholder="Ej: 180000"
                                                                                    value={formData.precioMensual}
                                                                                    style={{
                                                                                        MozAppearance: "textfield",
                                                                                        appearance: "textfield"
                                                                                    }}
                                                                                    onWheel={(e) => e.currentTarget.blur()}
                                                                                    onChange={(e) =>
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            precioMensual: e.target.value
                                                                                        })
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                    </div>

                                                                </div>
                                                            </div>




                                                            <div className="col-12 mt-4">

                                                                <div
                                                                    className="border rounded-4 p-4"
                                                                    style={{
                                                                        backgroundColor: "#f8f9fa",
                                                                        borderColor: "#dee2e6"
                                                                    }}
                                                                >

                                                                    {/* HEADER */}

                                                                    <div className="d-flex align-items-center justify-content-between mb-4">

                                                                        <div>
                                                                            <h5 className="fw-bold mb-1 text-dark">
                                                                                Información Contractual
                                                                            </h5>

                                                                            <div className="small text-muted">
                                                                                Detalles, acuerdos, cláusulas y observaciones del contrato
                                                                            </div>
                                                                        </div>

                                                                        <div
                                                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                                                            style={{
                                                                                width: "45px",
                                                                                height: "45px",
                                                                                backgroundColor: "rgba(33,37,41,0.08)"
                                                                            }}
                                                                        >
                                                                            <i
                                                                                className="bi bi-file-earmark-text"
                                                                                style={{
                                                                                    color: "#212529",
                                                                                    fontSize: "1.2rem"
                                                                                }}
                                                                            ></i>
                                                                        </div>

                                                                    </div>

                                                                    {/* FORMULARIO */}

                                                                    <div className="row g-4">

                                                                        {/* DETALLES */}

                                                                        <div className="col-md-12">

                                                                            <div className="border rounded-4 p-3 bg-white h-100">

                                                                                <label className="form-label fw-semibold">
                                                                                    Detalles Contractuales
                                                                                </label>

                                                                                <textarea
                                                                                    className="form-control"
                                                                                    rows="4"
                                                                                    placeholder="Escriba aquí los detalles generales del contrato..."
                                                                                    value={formData.detalles}
                                                                                    onChange={(e) =>
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            detalles: e.target.value
                                                                                        })
                                                                                    }
                                                                                ></textarea>

                                                                            </div>

                                                                        </div>

                                                                        {/* ACUERDOS */}

                                                                        <div className="col-md-6">

                                                                            <div className="border rounded-4 p-3 bg-white h-100">

                                                                                <label className="form-label fw-semibold">
                                                                                    Acuerdos
                                                                                </label>

                                                                                <textarea
                                                                                    className="form-control"
                                                                                    rows="5"
                                                                                    placeholder="Escriba los acuerdos establecidos..."
                                                                                    value={formData.acuerdos}
                                                                                    onChange={(e) =>
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            acuerdos: e.target.value
                                                                                        })
                                                                                    }
                                                                                ></textarea>

                                                                            </div>

                                                                        </div>

                                                                        {/* CLÁUSULAS */}

                                                                        <div className="col-md-6">

                                                                            <div className="border rounded-4 p-3 bg-white h-100">

                                                                                <label className="form-label fw-semibold">
                                                                                    Cláusulas
                                                                                </label>

                                                                                <textarea
                                                                                    className="form-control"
                                                                                    rows="5"
                                                                                    placeholder="Escriba las cláusulas del contrato..."
                                                                                    value={formData.clausulas}
                                                                                    onChange={(e) =>
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            clausulas: e.target.value
                                                                                        })
                                                                                    }
                                                                                ></textarea>

                                                                            </div>

                                                                        </div>

                                                                        {/* OBSERVACIONES */}

                                                                        <div className="col-md-12">

                                                                            <div className="border rounded-4 p-3 bg-white">

                                                                                <label className="form-label fw-semibold">
                                                                                    Observaciones
                                                                                </label>

                                                                                <textarea
                                                                                    className="form-control"
                                                                                    rows="4"
                                                                                    placeholder="Observaciones internas o adicionales..."
                                                                                    value={formData.observaciones}
                                                                                    onChange={(e) =>
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            observaciones: e.target.value
                                                                                        })
                                                                                    }
                                                                                ></textarea>

                                                                            </div>

                                                                        </div>

                                                                    </div>

                                                                </div>

                                                            </div>

                                                            <div className="col-12 mt-4">

                                                                <div
                                                                    className="border rounded-4 p-4"
                                                                    style={{
                                                                        backgroundColor: "#f8f9fa",
                                                                        borderColor: "#dee2e6"
                                                                    }}
                                                                >

                                                                    {/* HEADER */}

                                                                    <div className="d-flex align-items-center justify-content-between mb-4">

                                                                        <div>
                                                                            <h5 className="fw-bold mb-1 text-dark">
                                                                                Contrato Digital
                                                                            </h5>

                                                                            <div className="small text-muted">
                                                                                Adjunte el documento oficial del contrato en formato PDF
                                                                            </div>
                                                                        </div>

                                                                        <div
                                                                            className="rounded-circle d-flex align-items-center justify-content-center"
                                                                            style={{
                                                                                width: "45px",
                                                                                height: "45px",
                                                                                backgroundColor: "rgba(220,53,69,0.08)"
                                                                            }}
                                                                        >
                                                                            <i
                                                                                className="bi bi-file-earmark-pdf-fill"
                                                                                style={{
                                                                                    color: "#dc3545",
                                                                                    fontSize: "1.2rem"
                                                                                }}
                                                                            ></i>
                                                                        </div>

                                                                    </div>

                                                                    {/* CONTENIDO */}

                                                                    <div
                                                                        className="border rounded-4 p-4 bg-white"
                                                                        style={{
                                                                            borderStyle: "dashed"
                                                                        }}
                                                                    >

                                                                        <label className="fw-semibold form-label mb-3">
                                                                            <i className="bi bi-paperclip me-2 text-dark"></i>
                                                                            Subir Contrato (PDF)
                                                                        </label>

                                                                        {formData.archivoUrl && !formData.archivo ? (

                                                                            // Si ya hay un PDF subido y no seleccionaste uno nuevo

                                                                            <div className="d-flex align-items-center flex-wrap gap-2">

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
                                                                                            setFormData({
                                                                                                ...formData,
                                                                                                archivo: e.target.files[0]
                                                                                            })
                                                                                        }
                                                                                    />
                                                                                </label>

                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-outline-danger btn-sm"
                                                                                    onClick={() =>
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            archivoUrl: "",
                                                                                            archivo: null
                                                                                        })
                                                                                    }
                                                                                >
                                                                                    <i className="bi bi-trash"></i>
                                                                                </button>

                                                                            </div>

                                                                        ) : formData.archivo ? (

                                                                            // Si seleccionaste un archivo nuevo

                                                                            <div className="d-flex align-items-center flex-wrap gap-2">

                                                                                <div
                                                                                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 border bg-light"
                                                                                >

                                                                                    <i className="bi bi-file-earmark-pdf text-danger"></i>

                                                                                    <span className="small text-success fw-semibold">
                                                                                        {formData.archivo.name}
                                                                                    </span>

                                                                                </div>

                                                                                <button
                                                                                    className="btn btn-outline-secondary btn-sm"
                                                                                    onClick={() =>
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            archivo: null
                                                                                        })
                                                                                    }
                                                                                >
                                                                                    <i className="bi bi-x-circle me-1"></i>
                                                                                    Quitar
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
                                                                                        setFormData({
                                                                                            ...formData,
                                                                                            archivo: e.target.files[0]
                                                                                        })
                                                                                    }
                                                                                />

                                                                            </label>

                                                                        )}

                                                                    </div>

                                                                </div>

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
                                                        disabled={creandoContrato}
                                                    >
                                                        {creandoContrato ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm me-2" />
                                                                Creando...
                                                            </>
                                                        ) : (
                                                            "Guardar Contrato"
                                                        )}
                                                    </button>
                                                )}
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}