import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import React, { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { geocodeAPI } from "../services/api";

// Configurar íconos desde public/
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
});

const MapaModal = ({ estacion, onClose }) => {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoords = async () => {
      try {
          const res = await geocodeAPI.geocode(
          estacion.ubicacion
        );
        const data = await res.data;

        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setCoords([parseFloat(lat), parseFloat(lon)]);
        }
      } catch (error) {
        console.error("Error obteniendo coordenadas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoords();
  }, [estacion]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 animate-fade-up">
      <div className="bg-white rounded-2xl shadow-xl w-11/12 md:w-3/4 lg:w-1/2 overflow-hidden transform animate-scaleIn">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-green-600 text-white px-4 py-3">
          <h2 className="text-lg font-semibold">📍 Ubicación de la estación</h2>
          <button
            onClick={onClose}
            className="text-white font-bold text-xl hover:text-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {loading ? (
            // Skeleton loader
            <div className="animate-pulse">
              <div className="h-10 w-3/4 bg-gray-300 rounded mb-4"></div>
              <div className="h-64 w-full bg-gray-300 rounded-lg"></div>
            </div>
          ) : coords ? (
            <MapContainer
              center={coords}
              zoom={15}
              style={{ height: "400px", width: "100%" }}
              className="rounded-xl border border-gray-200 shadow-md"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={coords}>
                <Popup>
                  <strong>{estacion.ubicacion}</strong>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p className="text-center text-gray-500">No se pudo cargar el mapa</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default MapaModal;
