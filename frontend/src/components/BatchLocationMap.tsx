import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface DistrictLocation { name: string; region: 'Sindh' | 'Punjab'; lat: number; lng: number; }
interface Props { districts: DistrictLocation[]; selectedDistrict: string; onSelectDistrict: (name: string) => void; }

/** A district picker. It uses exactly the same district coordinates as the existing API. */
export default function BatchLocationMap({ districts, selectedDistrict, onSelectDistrict }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const selectRef = useRef(onSelectDistrict);
  useEffect(() => { selectRef.current = onSelectDistrict; }, [onSelectDistrict]);

  useEffect(() => {
    if (!container.current) return;
    const map = L.map(container.current, { center: [27.5, 69.5], zoom: 9, scrollWheelZoom: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    mapRef.current = map;
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(container.current);
    return () => { observer.disconnect(); map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const group = L.layerGroup().addTo(map);
    districts.forEach(district => {
      const selected = district.name === selectedDistrict;
      const marker = L.marker([district.lat, district.lng], {
        title: `Select ${district.name}`,
        alt: `${district.name}, ${district.region}`,
        zIndexOffset: selected ? 1000 : 0,
        icon: L.divIcon({
          className: '',
          html: `<span style="display:block;width:30px;height:38px;filter:drop-shadow(0 3px 3px #164b3028)"><svg width="30" height="38" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg"><path d="M15 36S2 23 2 15a13 13 0 0 1 26 0c0 8-13 21-13 21Z" fill="${selected ? '#236e47' : '#a5bfa7'}" stroke="white" stroke-width="2"/><circle cx="15" cy="14" r="4.5" fill="white"/></svg></span>`,
          iconSize: [30, 38], iconAnchor: [15, 36], tooltipAnchor: [0, -32],
        }),
      }).addTo(group);
      const label = document.createElement('span');
      label.textContent = `${district.name}, ${district.region}`;
      marker.bindTooltip(label, { direction: 'top' });
      marker.on('click', () => selectRef.current(district.name));
    });
    const selected = districts.find(district => district.name === selectedDistrict);
    if (selected) map.setView([selected.lat, selected.lng], 9);
    return () => { group.remove(); };
  }, [districts, selectedDistrict]);

  return <div ref={container} className="relative z-0 h-[280px] w-full rounded-xl sm:h-[310px]" role="region" aria-label="District location map. Choose a district with the selector above or select a map marker." />;
}
