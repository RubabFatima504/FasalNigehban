import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface MapMarkerData {
  label: string;
  lat: number;
  lng: number;
  risk: RiskLevel;
  /** Optional extra line shown in the popup (e.g. batch count, value saved) */
  detail?: string;
}

const RISK_COLOR: Record<RiskLevel, string> = {
  HIGH: '#b91c1c',
  MEDIUM: '#d97706',
  LOW: '#1e6b45',
};

/** Known district coordinates used across the app — keep in sync with district names in screen data. */
export const DISTRICT_COORDS: Record<string, [number, number]> = {
  'Mirpurkhas': [25.5265, 69.0113],
  'Mirpurkhas, Sindh': [25.5265, 69.0113],
  'Hyderabad': [25.396, 68.3578],
  'Hyderabad, Sindh': [25.396, 68.3578],
  'Tando Allahyar': [25.4569, 68.7128],
  'Matiari': [25.5947, 68.4372],
  'Larkana': [27.559, 68.212],
  'Larkana, Sindh': [27.559, 68.212],
  'Sukkur': [27.7052, 68.8574],
  'Sukkur, Sindh': [27.7052, 68.8574],
  'Jacobabad': [28.2769, 68.4514],
  'Nawabshah': [26.2442, 68.41],
  'Badin': [24.656, 68.8378],
  'Thatta': [24.7461, 67.9243],
  'Lahore': [31.5497, 74.3436],
  'Lahore, Punjab': [31.5497, 74.3436],
  'Multan': [30.1575, 71.5249],
  'Faisalabad': [31.418, 73.079],
  'Sargodha': [32.0836, 72.6711],
};

/**
 * Escapes text before it's interpolated into Leaflet popup HTML. Marker
 * labels/details come from batch data that will eventually arrive from a
 * live backend, so this can't be trusted as safe HTML by default.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function riskDivIcon(risk: RiskLevel) {
  const color = RISK_COLOR[risk];
  return L.divIcon({
    className: '',
    html: `
      <span style="position:relative;display:block;width:16px;height:16px;">
        <span style="position:absolute;inset:-6px;border-radius:9999px;background:${color};opacity:0.15;"></span>
        <span style="position:absolute;inset:2px;border-radius:9999px;background:${color};"></span>
        <span style="position:absolute;inset:5.5px;border-radius:9999px;background:white;"></span>
      </span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
}

interface Props {
  markers: MapMarkerData[];
  height?: number;
  /** Map center; defaults to a view centered over Sindh/Punjab */
  center?: [number, number];
  zoom?: number;
}

export default function BatchMap({ markers, height = 260, center = [27.5, 69.5], zoom = 6 }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    // Leaflet must remeasure after the sidebar or map container changes size.
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-center the map whenever center/zoom props change (e.g. user picks a different district).
  useEffect(() => {
    mapRef.current?.setView(center, zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], zoom]);

  // Sync markers whenever the data changes, without re-creating the map.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const layerGroup = L.layerGroup().addTo(map);

    markers.forEach(m => {
      const marker = L.marker([m.lat, m.lng], { icon: riskDivIcon(m.risk) }).addTo(layerGroup);
      const safeLabel = escapeHtml(m.label);
      const detail = m.detail
        ? `<div style="color:#78716c;margin-top:2px;">${escapeHtml(m.detail)}</div>`
        : '';
      marker.bindPopup(
        `<div style="font-family:'DM Sans',sans-serif;font-size:12.5px;min-width:120px;">
          <div style="font-weight:600;color:#1c1917;">${safeLabel}</div>
          <div style="color:${RISK_COLOR[m.risk]};font-weight:600;font-size:11px;letter-spacing:.03em;margin-top:2px;">${m.risk} RISK</div>
          ${detail}
        </div>`
      );
    });

    return () => {
      layerGroup.remove();
    };
  }, [markers]);

  return (
    <div className="relative" style={{ height }}>
      <div ref={containerRef} className="w-full h-full rounded-lg overflow-hidden" style={{ zIndex: 0 }} />
      <div className="absolute bottom-3 left-3 flex gap-3 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg border border-stone-200 z-[400]">
        {(['HIGH', 'MEDIUM', 'LOW'] as const).map(r => (
          <div key={r} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: RISK_COLOR[r] }} />
            <span className="text-xs text-stone-400">{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

