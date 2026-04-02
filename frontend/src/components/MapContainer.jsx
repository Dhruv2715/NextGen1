import React, { useEffect, useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default marker icon missing issue in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored icons
const createIcon = (color) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = createIcon('red');
const blueIcon = createIcon('blue');

// Component to handle auto-centering when markers change
const MapBoundsFitter = ({ markers, center }) => {
  const map = useMap();

  useEffect(() => {
    if (markers.length === 0) {
      if (center) map.setView(center, 4);
      return;
    }

    const bounds = L.latLngBounds(markers.filter(m => m.location?.lat).map(m => [m.location.lat, m.location.lng]));
    
    if (bounds.isValid()) {
        if(markers.length === 1) {
             map.setView(bounds.getCenter(), 12);
        } else {
             map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
  }, [markers, map, center]);

  return null;
};

const MapContainer = ({ markers = [], defaultCenter = { lat: 39.8283, lng: -98.5795 } }) => {
  return (
    <div className="w-full h-full relative isolate" style={{ zIndex: 0 }}>
      {/* Container must have height for Leaflet to render */}
      <LeafletMap 
        center={defaultCenter} 
        zoom={4} 
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBoundsFitter markers={markers} center={defaultCenter} />

        {markers.map((markerUser) => {
          if (!markerUser.location || !markerUser.location.lat) return null;
          
          return (
            <Marker
              key={markerUser._id || markerUser.id}
              position={[markerUser.location.lat, markerUser.location.lng]}
              icon={markerUser.role === 'candidate' ? blueIcon : redIcon}
            >
              <Popup>
                <div className="p-1 min-w-[150px]">
                  <div className="flex items-center gap-3 border-b border-gray-200 pb-2 mb-2">
                    {markerUser.profileImageUrl && markerUser.profileImageUrl.length > 3 ? (
                      <img src={markerUser.profileImageUrl} alt="profile" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                        {markerUser.name ? markerUser.name.charAt(0) : 'U'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-gray-900 m-0 leading-tight">{markerUser.name}</h3>
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">
                        {markerUser.role}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </LeafletMap>
    </div>
  );
};

export default React.memo(MapContainer);
