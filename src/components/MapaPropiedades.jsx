import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaMapMarkerAlt } from "react-icons/fa";

// Opcional: ícono rojo personalizado
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const MapaPropiedades = ({ propiedades }) => {
  const centro = propiedades[0]?.ubicacionGeo || { lat: -28.5, lng: -65.78 };

  return (
    <MapContainer
      center={[centro.lat, centro.lng]}
      zoom={12}
      style={{ width: "100%", height: "500px", marginTop: "1rem" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {propiedades
        .filter(p => p.ubicacionGeo?.lat && p.ubicacionGeo?.lng)
        .map((prop) => (
          <Marker
            key={prop.id}
            position={[prop.ubicacionGeo.lat, prop.ubicacionGeo.lng]}
            icon={redIcon}
          >
            <Popup>
              <strong>{prop.titulo}</strong>
              <br />
              {prop.direccion?.calle}, {prop.direccion?.localidad}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default MapaPropiedades;
