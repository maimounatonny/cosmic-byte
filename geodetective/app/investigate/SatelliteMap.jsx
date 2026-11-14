
"use client";

import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
  WMSTileLayer,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const NASA_WMS_URL =
  "https://gibs.earthdata.nasa.gov/wms/epsg3857/best/wms.cgi";

const satelliteLayers = {
  "Land Changes": {
    layer: "MODIS_Terra_CorrectedReflectance_TrueColor",
    format: "image/jpeg",
    description: "MODIS Terra – True Color",
  },

  Deforestation: {
    layer: "MODIS_Terra_NDVI_8Day",
    format: "image/png",
    description: "MODIS Terra – Vegetation Index (NDVI)",
  },

  "Water Bodies": {
    layer: "MODIS_Terra_CorrectedReflectance_Bands721",
    format: "image/jpeg",
    description: "MODIS Terra – False Color",
  },

  "Urban Growth": {
    layer: "VIIRS_SNPP_DayNightBand_ENCC",
    format: "image/png",
    description: "VIIRS – Nighttime Lights",
  },

  "Climate Patterns": {
    layer: "MODIS_Terra_Land_Surface_Temp_Day",
    format: "image/png",
    description: "MODIS Terra – Land Surface Temperature",
  },

  "Natural Disasters": {
    layer: "MODIS_Fires_All",
    format: "image/png",
    description: "MODIS – Active Fire Locations",
  },
};

function MapUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 7, {
      duration: 1.5,
    });
  }, [center, map]);

  return null;
}

export default function SatelliteMap({
  location,
  category,
}) {
  const [observationDate, setObservationDate] =
    useState("2024-01-01");

  const today = new Date().toISOString().split("T")[0];

  const selectedLayer =
    satelliteLayers[category] ||
    satelliteLayers["Land Changes"];

  const center = location?.coordinates
    ? [
        location.coordinates[1],
        location.coordinates[0],
      ]
    : [20, 0];

  return (
    <div style={{ width: "100%" }}>

      {/* Satellite controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px",
          padding: "12px",
          background: "#101d32",
          border: "1px solid #263c57",
          borderRadius: "10px",
        }}
      >
        <div>
          <div
            style={{
              color: "#69d5ff",
              fontSize: "11px",
              fontWeight: "700",
              marginBottom: "5px",
              letterSpacing: "1px",
            }}
          >
            NASA DATASET
          </div>

          <strong
            style={{
              color: "#ffffff",
              fontSize: "12px",
            }}
          >
            {selectedLayer.description}
          </strong>
        </div>

        <div>
          <label
            htmlFor="observation-date"
            style={{
              display: "block",
              color: "#a8bad0",
              fontSize: "11px",
              marginBottom: "5px",
            }}
          >
            Observation Date
          </label>

          <input
            id="observation-date"
            type="date"
            value={observationDate}
            max={today}
            onChange={(e) =>
              setObservationDate(e.target.value)
            }
            style={{
              padding: "7px",
              borderRadius: "6px",
              border: "1px solid #36516f",
              background: "#172b45",
              color: "#ffffff",
              colorScheme: "dark",
              fontSize: "12px",
            }}
          />
        </div>
      </div>

      {/* Interactive map */}
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
          zIndex: 1,
        }}
      >
        <MapUpdater center={center} />

        {/* Base map */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* NASA satellite imagery */}
        <WMSTileLayer
          key={`${selectedLayer.layer}-${observationDate}`}
          url={NASA_WMS_URL}
          layers={selectedLayer.layer}
          format={selectedLayer.format}
          transparent={false}
          version="1.1.1"
          params={{
            time: observationDate,
          }}
          opacity={0.85}
        />

        {/* Selected location */}
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

      <p
        style={{
          color: "#8da5bf",
          fontSize: "11px",
          marginTop: "9px",
        }}
      >
        Satellite imagery provided by NASA GIBS.
        Select a date to explore available observations.
      </p>

    </div>
  );
}
