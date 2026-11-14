
"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 7, {
      duration: 1.5,
    });
  }, [center, map]);

  return null;
}

export default function SatelliteMap({ location }) {
  // Coordinates are stored as [longitude, latitude].
  // Leaflet expects [latitude, longitude].
  const center = location?.coordinates
    ? [
        location.coordinates[1],
        location.coordinates[0],
      ]
    : [20, 0];

  return (
    <MapContainer
      center={center}
      zoom={location ? 7 : 2}
      minZoom={2}
      maxZoom={9}
      scrollWheelZoom={true}
      style={{
        height: "290px",
        width: "100%",
        borderRadius: "10px",
      }}
    >
      <MapUpdater center={center} />

      {/* Regular map layer */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* NASA satellite imagery */}
      <TileLayer
        attribution='Imagery provided by <a href="https://www.earthdata.nasa.gov/">NASA GIBS</a>'
        url="https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/2024-01-01/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg"
        minZoom={0}
        maxZoom={9}
        opacity={1}
      />

      {/* Selected location marker */}
      {location && (
        <CircleMarker
          center={center}
          radius={8}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#59c8f2",
            fillOpacity: 1,
            weight: 3,
          }}
        >
          <Popup>
            <strong>{location.label}</strong>
          </Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
