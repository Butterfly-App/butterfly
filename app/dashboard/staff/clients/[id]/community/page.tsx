'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ClientLandmarksMap from '@/components/maps/ClientLandmarksMap';

type Params = Promise<{ id: string }>;

export default async function CommunityPage({ params }: { params: Params }) {
  const { id } = await params; // Next 15: params is a Promise

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch this client's logs that have any location info
  const { data: logs, error } = await supabase
    .from('log_notes')
    .select('id, created_at, latitude, longitude, place_name, place_address, content')
    .eq('client_id', id)
    .or('latitude.not.is.null,longitude.not.is.null,place_name.not.is.null,place_address.not.is.null')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`${error.code} ${error.message}`);
  }

  const items = (logs ?? []).filter(
    (l) =>
      (typeof l.latitude === 'number' && !Number.isNaN(l.latitude) &&
       typeof l.longitude === 'number' && !Number.isNaN(l.longitude)) ||
      (l.place_name && String(l.place_name).trim() !== '') ||
      (l.place_address && String(l.place_address).trim() !== '')
  );

  // Points for the map (coords only)
  const points = items
    .filter(
      (l) =>
        typeof l.latitude === 'number' &&
        !Number.isNaN(l.latitude) &&
        typeof l.longitude === 'number' &&
        !Number.isNaN(l.longitude)
    )
    .map((l) => ({
      id: l.id as string,
      lat: Number(l.latitude),
      lng: Number(l.longitude),
      label:
        (l.place_name && String(l.place_name).trim()) ||
        (l.place_address && String(l.place_address).trim()) ||
        `(${Number(l.latitude).toFixed(5)}, ${Number(l.longitude).toFixed(5)})`,
      date: l.created_at as string,
    }));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Community & Landmarks</h2>

      {/* Interactive map with all coordinates */}
      {points.length > 0 ? (
        <div className="rounded-2xl border dark:border-zinc-800 overflow-hidden">
          <ClientLandmarksMap points={points} />
        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          No map points yet. Add a log with coordinates to plot landmarks here.
        </div>
      )}

      {/* List of landmarks (coords or place text) */}
      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((l) => {
            const hasCoords =
              typeof l.latitude === 'number' &&
              !Number.isNaN(l.latitude) &&
              typeof l.longitude === 'number' &&
              !Number.isNaN(l.longitude);

            const hasPlace =
              (l.place_name && String(l.place_name).trim() !== '') ||
              (l.place_address && String(l.place_address).trim() !== '');

            const label = hasPlace
              ? [l.place_name ?? '', l.place_address ?? ''].filter(Boolean).join(' — ')
              : hasCoords
              ? `(${Number(l.latitude).toFixed(5)}, ${Number(l.longitude).toFixed(5)})`
              : 'Unnamed location';

            const href = hasCoords
              ? `https://www.google.com/maps?q=${encodeURIComponent(`${l.latitude},${l.longitude}`)}`
              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  [l.place_name ?? '', l.place_address ?? ''].filter(Boolean).join(' ')
                )}`;

            return (
              <li
                key={l.id}
                className="rounded-xl border bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-zinc-700 dark:text-zinc-300">
                    <span className="mr-2">📍</span>
                    <span className="font-medium">{label}</span>
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {new Date(l.created_at as string).toLocaleString()}
                  </div>
                </div>

                {l.content ? (
                  <p className="mt-2 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {l.content}
                  </p>
                ) : null}

                <div className="mt-3">
                  <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm underline decoration-dotted underline-offset-4 hover:decoration-solid"
                  >
                    View on map
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
