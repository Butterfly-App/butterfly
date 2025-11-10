'use client';

import { useEffect, useRef, useState } from 'react';

type Point = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  date?: string;
};

export default function ClientLandmarksMap({ points }: { points: Point[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState<boolean>(false);

  // Load Leaflet CSS/JS from CDN (no npm install needed)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasCss = document.querySelector('link[data-leaflet-css]');
    const hasJs = (window as any).L;

    const addCss = () =>
      new Promise<void>((resolve) => {
        if (hasCss) return resolve();
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.setAttribute('data-leaflet-css', 'true');
        document.head.appendChild(link);
        link.onload = () => resolve();
      });

    const addJs = () =>
      new Promise<void>((resolve) => {
        if (hasJs) return resolve();
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = () => resolve();
        document.body.appendChild(script);
      });

    (async () => {
      await addCss();
      await addJs();
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || points.length === 0) return;
    const L: any = (window as any).L; // <— no type import; avoid build error

    // Create map
    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: true,
    });

    // OSM tiles
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    });
    tiles.addTo(map);

    // Add markers
    const markers: any[] = [];
    points.forEach((p) => {
      const m = L.circleMarker([p.lat, p.lng], {
        radius: 7,
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.7,
      })
        .bindPopup(
          `<div style="font-size:12px;">
            <div><strong>${escapeHtml(p.label)}</strong></div>
            ${p.date ? `<div style="opacity:.7;">${new Date(p.date).toLocaleString()}</div>` : ''}
            <div style="margin-top:4px;">
              <a href="https://www.google.com/maps?q=${p.lat},${p.lng}" target="_blank" rel="noreferrer">Open in Maps</a>
            </div>
          </div>`
        )
        .addTo(map);
      markers.push(m);
    });

    // Fit bounds nicely
    if (markers.length === 1) {
      map.setView(markers[0].getLatLng(), 14);
    } else {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.2));
    }

    return () => {
      map.remove();
    };
  }, [ready, points]);

  return (
    <div
      ref={mapRef}
      className="h-80 w-full bg-zinc-100 dark:bg-zinc-800"
    />
  );
}

function escapeHtml(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
