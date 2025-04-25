import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Map = () => {
  const navigate = useNavigate();
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setCoords({ latitude: lat, longitude: lng });
      },
    });

    return coords ? (
      <Marker position={[coords.latitude, coords.longitude]}>
        <Popup>
          Selected Location: {coords.latitude}, {coords.longitude}
        </Popup>
      </Marker>
    ) : null;
  };

  const handleSubmit = async () => {
    if (!coords) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/getall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coords),
      });

      if (!response.ok) throw new Error('Failed to fetch data');

      const result = await response.json();
      navigate('/result', { state: { result: result.data } });
    } catch (error) {
      setError("Error fetching data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Select Location on Map</h1>

      <div className="mb-4" style={{ height: '400px', width: '100%' }}>
        <MapContainer
          center={[51.5023, -0.0262]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </div>

      {coords && (
        <div className="mb-4">
          <p>Latitude: {coords.latitude}</p>
          <p>Longitude: {coords.longitude}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-blue-600 text-white rounded"
        disabled={!coords || loading}
      >
        {loading ? "Loading..." : "Check Feasibility"}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );
};

export default Map;
