import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

export default function MapaRota({ coordenadas, horarios }) {
  if (!coordenadas || coordenadas.length === 0 || !horarios) return null;

  const bounds = L.latLngBounds(coordenadas.map(p => [p.lat, p.lng]));

  return (
    <MapContainer
      bounds={bounds}
      style={{ height: '400px', width: '100%', marginTop: '2rem' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Polyline positions={coordenadas.map(p => [p.lat, p.lng])} color="#0c6a37" />

      {coordenadas.map((p, i) => (
        <Marker key={i} position={[p.lat, p.lng]}>
          <Popup>
            <strong>Parada {i + 1}</strong><br />
            {horarios[i] ? (
              <>
                <strong>{horarios[i].local}</strong><br />
                Horário: {horarios[i].hora}
              </>
            ) : (
              "Informação de horário indisponível"
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
