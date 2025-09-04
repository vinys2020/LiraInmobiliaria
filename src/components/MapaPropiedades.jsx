import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Ícono rojo personalizado
const redIcon = new L.Icon({
  iconUrl:
    "https://res.cloudinary.com/dcggcw8df/image/upload/v1755536958/frspnqfnboytx8czwyuu.png",
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
                <a
                  href={`https://www.google.com/maps?q=${latNum},${lngNum}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <strong>{prop.titulo}</strong>
                  <br />
                  {prop.direccion?.calle}, {prop.direccion?.localidad}
                  <br />
                  Latitud: {coords.lat} <br />
                  Longitud: {coords.lng}
                  <br />
                  <span style={{ color: "#007bff" }}>Ver en Google Maps</span>
                </a>
              </Popup>
            </Marker>
          );
        })}
    </MapContainer>
  );
};

export default MapaPropiedades;
