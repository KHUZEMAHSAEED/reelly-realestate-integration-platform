import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { ReellyProject, Currency } from '../types';
import { formatPrice, formatPriceCompact } from '../services/api';
import { MapPin, ArrowRight, Maximize2 } from 'lucide-react';

interface MapViewProps {
  projects: ReellyProject[];
  selectedProject: ReellyProject | null;
  hoveredProjectId?: string | number | null;
  scrollWheelZoom?: boolean;
  onSelectProject: (p: ReellyProject) => void;
  onOpenDetails: (p: ReellyProject) => void;
  currency: Currency;
}

// Controller to smoothly pan & zoom when selected project changes
const MapFlyTo: React.FC<{ selectedProject: ReellyProject | null }> = ({ selectedProject }) => {
  const map = useMap();
  useEffect(() => {
    if (map.getContainer().clientWidth === 0) return;
    if (selectedProject && selectedProject.latitude && selectedProject.longitude) {
      map.flyTo([selectedProject.latitude, selectedProject.longitude], 14, {
        duration: 1.2
      });
    }
  }, [selectedProject, map]);
  return null;
};

// Keeps Leaflet's internal size in sync when the container is shown/resized (e.g. mobile map toggle)
const MapResizeSync: React.FC<{ onBecameVisible: () => void }> = ({ onBecameVisible }) => {
  const map = useMap();
  useEffect(() => {
    const container = map.getContainer();
    let wasHidden = container.clientWidth === 0;
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
      const hidden = container.clientWidth === 0;
      // Bounds fitted while hidden (0x0) are meaningless, so re-frame once the map is shown
      if (wasHidden && !hidden) onBecameVisible();
      wasHidden = hidden;
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map, onBecameVisible]);
  return null;
};

// Reports zoom so markers can collapse to dots when the city view gets crowded
const ZoomWatcher: React.FC<{ onZoom: (z: number) => void }> = ({ onZoom }) => {
  const map = useMapEvents({
    zoomend: () => onZoom(map.getZoom()),
    moveend: () => onZoom(map.getZoom()),
    // Non-animated resets (e.g. re-fit right after the map is unhidden) only emit these
    zoom: () => onZoom(map.getZoom()),
    viewreset: () => onZoom(map.getZoom())
  });
  useEffect(() => onZoom(map.getZoom()), [map, onZoom]);
  return null;
};

const DOT_ZOOM_THRESHOLD = 12;

// Controller to fit all visible markers dynamically
const MapBoundsUpdater: React.FC<{ projects: ReellyProject[]; autoFitCount: number }> = ({ projects, autoFitCount }) => {
  const map = useMap();
  const hasInitialized = useRef(false);

  useEffect(() => {
    const validCoords = projects
      .filter(p => p.latitude && p.longitude)
      .map(p => [p.latitude, p.longitude] as [number, number]);

    // A hidden (0x0) map can't compute meaningful bounds; MapResizeSync re-triggers once it's shown
    if (map.getContainer().clientWidth === 0) return;

    if (validCoords.length > 0 && (!hasInitialized.current || autoFitCount > 0)) {
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 14,
        duration: 1.0
      });
      hasInitialized.current = true;
    }
  }, [projects, autoFitCount, map]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  projects,
  selectedProject,
  hoveredProjectId,
  scrollWheelZoom = false,
  onSelectProject,
  onOpenDetails,
  currency
}) => {
  const [autoFitTrigger, setAutoFitTrigger] = React.useState(0);
  const [zoom, setZoom] = React.useState(12);
  const refitAll = React.useCallback(() => setAutoFitTrigger(prev => prev + 1), []);
  const showDots = zoom < DOT_ZOOM_THRESHOLD && projects.length > 12;
  const defaultCenter: [number, number] = [25.18, 55.27];

  const createCustomIcon = (project: ReellyProject, isSelected: boolean, isHovered: boolean) => {
    if (showDots && !isSelected && !isHovered) {
      return L.divIcon({
        className: 'luxury-gold-marker',
        html: '<div class="marker-dot"></div>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
        popupAnchor: [0, -8]
      });
    }
    const formattedPrice = formatPriceCompact(project.price_from, currency);
    return L.divIcon({
      className: 'luxury-gold-marker',
      html: `
        <div class="marker-pin-inner tabular-nums${isHovered ? ' is-hovered' : ''}" style="
          background: ${isSelected ? 'linear-gradient(135deg, #fff 0%, #e5c583 100%)' : 'linear-gradient(135deg, #dfba73 0%, #c5a059 100%)'};
          box-shadow: ${isSelected ? '0 0 20px #e5c583, 0 6px 20px rgba(0,0,0,0.8)' : '0 4px 12px rgba(0,0,0,0.6)'};
          transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
        ">
          ${formattedPrice}
        </div>
      `,
      iconSize: [84, 32],
      iconAnchor: [42, 32],
      popupAnchor: [0, -36]
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* Floating Map Re-center / Fit Control */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 500,
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => setAutoFitTrigger(prev => prev + 1)}
          className="btn-secondary"
          style={{
            padding: '8px 14px',
            fontSize: '12px',
            background: 'rgba(18, 22, 34, 0.92)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
            border: '1px solid var(--border-gold)'
          }}
          title="Frame all properties in viewport"
          aria-label="Frame all properties in viewport"
        >
          <Maximize2 size={13} color="var(--gold-light)" />
          <span>Frame All ({projects.length})</span>
        </button>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={12}
        scrollWheelZoom={scrollWheelZoom} // Off in split view to avoid scroll-trapping; on in full map view
        style={{ width: '100%', height: '100%', zIndex: 10 }}
      >
        <MapFlyTo selectedProject={selectedProject} />
        <MapBoundsUpdater projects={projects} autoFitCount={autoFitTrigger} />
        <MapResizeSync onBecameVisible={refitAll} />
        <ZoomWatcher onZoom={setZoom} />

        {/* Esri Dark Gray Canvas: keyless dark basemap + label overlay */}
        <TileLayer
          attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxNativeZoom={16}
          maxZoom={19}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
          maxNativeZoom={16}
          maxZoom={19}
        />

        {projects.map((p) => {
          if (!p.latitude || !p.longitude) return null;
          const isSelected = selectedProject?.id === p.id;
          const isHovered = hoveredProjectId === p.id;

          return (
            <Marker
              key={p.id}
              position={[p.latitude, p.longitude]}
              icon={createCustomIcon(p, isSelected, isHovered)}
              zIndexOffset={isSelected || isHovered ? 1000 : 0}
              eventHandlers={{
                click: () => onSelectProject(p)
              }}
            >
              <Popup>
                <div style={{ width: '250px', overflow: 'hidden', borderRadius: '10px' }}>
                  <img
                    src={p.photos?.[0]?.url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80'}
                    alt={p.name || 'Luxury Property'}
                    style={{ width: '100%', height: '130px', objectFit: 'cover' }}
                  />
                  <div style={{ padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: 'var(--gold-light)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {p.developer?.name || 'Exclusive Developer'}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                      {p.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                      <MapPin size={11} color="var(--gold-light)" />
                      <span>{p.district ? `${p.district}, ${p.region}` : p.region}</span>
                    </div>

                    <div style={{
                      marginTop: '10px',
                      paddingTop: '8px',
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <div>
                        <div style={{ fontSize: '9px', color: '#888' }}>FROM</div>
                        <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--gold-light)' }}>
                          {formatPrice(p.price_from, currency)}
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenDetails(p)}
                        className="btn-gold"
                        style={{ padding: '5px 10px', fontSize: '11px' }}
                        aria-label={`Open dossier for ${p.name}`}
                      >
                        Dossier <ArrowRight size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
