import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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
      center={[centro.lat, centro.lng]}
      zoom={12}
      scrollWheelZoom={false} // desactiva zoom con scroll
      style={{ width: "100%", height: "450px", borderRadius: "10px", overflow: "hidden" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
            >
              <Popup>
                <div style={{ textDecoration: "none", color: "inherit", maxWidth: "250px" }}>
                  {/* Cuadrícula de máximo 2 imágenes */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "4px",
                      marginBottom: "5px"
                    }}
                  >
                    {prop.imagenes && prop.imagenes.length > 0
                      ? prop.imagenes.slice(0, 2).map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt={`${prop.titulo} ${index + 1}`}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "3px"
                          }}
                        />
                      ))
                      : (
                        <img
                          src="/images/placeholder.png"
                          alt="Placeholder"
                          style={{
                            width: "100%",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "3px"
                          }}
                        />
                      )
                    }
                  </div>

                  {/* Texto de la propiedad */}
                  <strong>{prop.titulo}</strong>
                  <br />
                  {prop.direccion?.calle}, {prop.direccion?.localidad}
                  <br />
                  <strong>Propiedad:</strong> {prop.propiedadEn === "venta" ? "En Venta" : prop.propiedadEn === "alquiler" ? "En Alquiler" : "Disponible"}
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
