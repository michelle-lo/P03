"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default Leaflet marker icons in Next
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function CoffeeMap({ entries }) {
  const withCoords = entries.filter((e) => e.lat && e.lng);

  if (withCoords.length === 0) {
    return (
      <div className="map-placeholder">
        Add entries with valid locations to see them on the map.
      </div>
    );
  }

  const center = [withCoords[0].lat, withCoords[0].lng];

  return (
    <div className="map-wrapper">
        <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: "100vh", width: "100%", borderRadius: "12px" }}
        >

        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {withCoords.map((entry) => (
          <Marker key={entry.id} position={[entry.lat, entry.lng]}>
            <Popup>
              <strong>{entry.drink_name}</strong>
              <br />
              {entry.location_name}
              <br />
              {entry.rating && <>⭐ {entry.rating}/5</>}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
