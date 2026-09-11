import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";


// Ícono rojo personalizado
const redIcon = new L.Icon({
  iconUrl:
    "https://res.cloudinary.com/dxdnsblj6/image/upload/v1761174284/liramapasicono_xoeqtp.png",
  iconSize: [50, 51],
  iconAnchor: [25, 51], // ajusta para que apunte correctamente
  popupAnchor: [1, -34],
});

const FullscreenControl = () => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const FullscreenButton = L.Control.extend({
      options: {
        position: "bottomright",
      },

      onAdd: function () {
        const button = L.DomUtil.create(
          "button",
          "leaflet-control-fullscreen"
        );

        button.type = "button";
        button.title = "Pantalla completa";

button.innerHTML = `
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 3H5C3.89543 3 3 3.89543 3 5V8"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M16 3H19C20.1046 3 21 3.89543 21 5V8"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M8 21H5C3.89543 21 3 20.1046 3 19V16"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
    <path
      d="M16 21H19C20.1046 21 21 20.1046 21 19V16"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
    />
  </svg>
`;

        L.DomEvent.disableClickPropagation(button);

        L.DomEvent.on(button, "click", () => {
          if (!document.fullscreenElement) {
            container.requestFullscreen?.();
          } else {
            document.exitFullscreen?.();
          }
        });

        return button;
      },
    });

    const control = new FullscreenButton();
    map.addControl(control);

    return () => {
      map.removeControl(control);
    };
  }, [map]);

  return null;
};

const offsetLat = 0.04; // Ajustá este valor para mover más o menos





// Función para formatear lat/lng
const formatLatLng = (lat, lng) => {
  const latSuffix = lat < 0 ? "S" : "N";
  const lngSuffix = lng < 0 ? "O" : "E";
  return {
    lat: `${Math.abs(lat)}° ${latSuffix}`,
    lng: `${Math.abs(lng)}° ${lngSuffix}`,
  };
};

const MapaPropiedades = ({ propiedades }) => {

  const centro = propiedades[0]?.ubicacionGeo
    ? {
      lat: Number(propiedades[0].ubicacionGeo.lat),
      lng: Number(propiedades[0].ubicacionGeo.lng),
    }
    : { lat: -28.4997754, lng: -65.7877561 }; // fallback con decimales completos



  return (
    <MapContainer
      center={[centro.lat + offsetLat, centro.lng]}
      zoom={13}
      scrollWheelZoom={false} // desactiva zoom con scroll
      style={{
        width: "100%",
        height: "clamp(500px, 70vh, 850px)", // 👈 mobile 500 / desktop más grande
        overflow: "hidden",
        borderRadius: "0 0 10px 10px",
      }}
    >

      <FullscreenControl />
<TileLayer
  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
  attribution="&copy; Esri"
  maxZoom={19}
/>



      {propiedades
        .filter((p) => p.ubicacionGeo?.lat && p.ubicacionGeo?.lng)
        .map((prop) => {
          const latNum = Number(prop.ubicacionGeo.lat);
          const lngNum = Number(prop.ubicacionGeo.lng);
          const coords = formatLatLng(latNum, lngNum);



          return (
            <Marker
              key={prop.id}
              position={[latNum, lngNum]}
              icon={redIcon}
              eventHandlers={
                prop.id === "NT1pYJz3ggG9OyGdDxsg"
                  ? {
                    add: (e) => {
                      e.target.openPopup(); // 👈 se abre como si hicieran click
                    },
                  }
                  : undefined
              }
            >



              <Popup>
                <div style={{ textDecoration: "none", color: "inherit", maxWidth: "250px" }}>
                  {/* Cuadrícula de máximo 2 imágenes */}
                  <div style={{ marginBottom: "6px" }}>
                    {prop.imagenes && prop.imagenes.length > 0 ? (
                      prop.imagenes.length === 1 ? (
                        // 🟢 1 imagen → ocupa todo
                        <img
                          src={prop.imagenes[0]}
                          alt={prop.titulo}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "4px",
                          }}
                        />
                      ) : prop.imagenes.length === 3 ? (
                        // 🟡 3 imágenes → 2 arriba + 1 abajo full
                        <>
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(2, 1fr)",
                              gap: "4px",
                              marginBottom: "4px",
                            }}
                          >
                            {prop.imagenes.slice(0, 2).map((img, index) => (
                              <img
                                key={index}
                                src={img}
                                alt={`${prop.titulo} ${index + 1}`}
                                loading="lazy"
                                style={{
                                  width: "100%",
                                  height: "80px",
                                  objectFit: "cover",
                                  borderRadius: "3px",
                                }}
                              />
                            ))}
                          </div>

                          <img
                            src={prop.imagenes[2]}
                            alt={`${prop.titulo} 3`}
                            loading="lazy"
                            style={{
                              width: "100%",
                              height: "80px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                        </>
                      ) : (
                        // 🔵 2 o 4 imágenes → grilla normal
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "4px",
                          }}
                        >
                          {prop.imagenes.slice(0, 4).map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`${prop.titulo} ${index + 1}`}
                              loading="lazy"
                              style={{
                                width: "100%",
                                height: "80px",
                                objectFit: "cover",
                                borderRadius: "3px",
                              }}
                            />
                          ))}
                        </div>
                      )
                    ) : (
                      // ⚪ SIN imágenes → placeholder
                      <img
                        src="/images/placeholder.png"
                        alt="Placeholder"
                        style={{
                          width: "100%",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    )}
                  </div>



                  {/* Texto de la propiedad */}
                  <strong>{prop.titulo}</strong>
                  <br />
                  {prop.direccion?.calle}, {prop.direccion?.localidad}
                  <br />
                  <strong>Propiedad:</strong>{" "}
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#fff",
                      backgroundColor:
                        prop.propiedadEn === "venta"
                          ? "#1e88e5"      // azul venta
                          : prop.propiedadEn === "alquiler"
                            ? "#43a047"      // 🔴 rojo alquilada
                            : "#d32f2f",     // 🟢 verde disponible
                    }}
                  >
                    {prop.propiedadEn === "venta"
                      ? "En Venta"
                      : prop.propiedadEn === "alquiler"
                        ? "En Alquiler"
                        : "Alquilada"}
                  </span>

                  <br />
                  <a
                    href={`/detalle-propiedad/${prop.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007bff", display: "block", marginTop: "5px" }}
                  >
                    Ver Detalle de la Propiedad
                  </a>

                  {/* Links */}
                  <a
                    href={`https://www.google.com/maps?q=${latNum},${lngNum}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#007bff", display: "block", marginTop: "5px" }}
                  >
                    Ver en Google Maps
                  </a>

                </div>
              </Popup>




            </Marker>
          );
        })}
    </MapContainer>
  );
};

export default MapaPropiedades;
