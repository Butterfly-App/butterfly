'use client';

import { useRef, useState } from 'react';
import { Autocomplete, useLoadScript } from '@react-google-maps/api';

const libs: ("places")[] = ["places"];

export function AddressPicker() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: libs,
  });

  const acRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // hidden fields
  const nameRef = useRef<HTMLInputElement>(null);
  const addrRef = useRef<HTMLInputElement>(null);
  const latRef  = useRef<HTMLInputElement>(null);
  const lngRef  = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<string | null>(null);

  if (loadError) return <div className="text-sm text-red-600">Failed to load Google API</div>;
  if (!isLoaded)  return <div className="text-sm text-zinc-500">Loading map tools…</div>;

  const onLoad = (ac: google.maps.places.Autocomplete) => {
    acRef.current = ac;
    // Limit returned fields for performance
    ac.setFields(['geometry', 'name', 'formatted_address']);
  };

  const onPlaceChanged = () => {
    const ac = acRef.current;
    if (!ac) return;
    const place = ac.getPlace();
    const formatted = place.formatted_address || inputRef.current?.value || '';
    const name = place.name || '';
    const geo = place.geometry?.location;

    // write hidden fields
    if (nameRef.current) nameRef.current.value = name;
    if (addrRef.current) addrRef.current.value = formatted;

    if (geo) {
      const lat = geo.lat();
      const lng = geo.lng();
      if (latRef.current) latRef.current.value = String(lat);
      if (lngRef.current) lngRef.current.value = String(lng);
      setStatus(`Selected: ${name || 'Place'} @ ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } else {
      // No geometry returned (rare). Clear coords.
      if (latRef.current) latRef.current.value = '';
      if (lngRef.current) lngRef.current.value = '';
      setStatus('Selected address has no geometry—try picking a suggested result.');
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Place (autocomplete)</label>
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <input
          ref={inputRef}
          placeholder="Start typing an address or place…"
          className="w-full rounded-lg border border-zinc-300 bg-white p-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </Autocomplete>

      {/* Hidden fields submitted with the form */}
      <input ref={nameRef} name="place_name" type="hidden" />
      <input ref={addrRef} name="place_address" type="hidden" />
      <input ref={latRef}  name="latitude" type="hidden" />
      <input ref={lngRef}  name="longitude" type="hidden" />

      {status && <p className="text-xs text-zinc-600 dark:text-zinc-400">{status}</p>}
    </div>
  );
}
