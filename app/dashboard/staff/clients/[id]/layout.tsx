import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { fetchClient } from './actions';
import { ClientTabs } from './ClientTabs';
import { StaffNavbar } from '@/components/staff/staff-navbar';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

function getInitials(first?: string | null, last?: string | null) {
  const a = (first ?? "").trim();
  const b = (last ?? "").trim();
  if (a || b) return `${a.charAt(0)}${b.charAt(0)}`.toUpperCase();
  return "??";
}

function displayName(client: {
  first_name?: string | null;
  last_name?: string | null;
  preferred_name?: string | null;
  full_name?: string | null;
}) {
  // prefer more “human” fields if you have them
  return (
    client.preferred_name ||
    client.full_name ||
    [client.first_name, client.last_name].filter(Boolean).join(" ") ||
    "Unnamed Client"
  );
}



export default async function ClientLayout({
  children,
  params,
}: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;      // Next 15: params is a Promise
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const client = await fetchClient(id);

  return (
    <div className="space-y-6">
      <StaffNavbar />
      <div className="px-6">
<header className="mb-6">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-4">
      <div className="relative">
        <Avatar className="size-16 ring-2 ring-zinc-200 dark:ring-zinc-800">
          <AvatarImage
            src={
              // try common fields; adjust to your schema
              client.photo_url ||
              client.avatar_url ||
              client.profile_photo ||
              undefined
            }
            alt={`${client.first_name ?? ""} ${client.last_name ?? ""}`}
          />
          <AvatarFallback className="text-base font-medium">
            {getInitials(client.first_name, client.last_name)}
          </AvatarFallback>
        </Avatar>
        {/* optional online dot */}
        {/* <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" /> */}
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-semibold leading-tight">
          {displayName(client)}
        </h1>
        <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
          {(client.email || "—")}
          {client.phone ? ` · ${client.phone}` : ""}
          {client.date_of_birth
            ? ` · ${new Date(client.date_of_birth).toLocaleDateString()}`
            : ""}
        </p>
        {client.address && (
          <p className="mt-0.5 text-sm text-zinc-600 dark:text-zinc-400">
            {client.address}
          </p>
        )}
      </div>
    </div>

    <div className="flex gap-2">
      <Button variant="outline" size="sm">Message</Button>
      <Button size="sm">Edit profile</Button>
    </div>
  </div>
</header>


        <ClientTabs id={client.id} />

        <section className="grid gap-6 md:grid-cols-3">
          <aside className="rounded-lg border p-4 md:col-span-1">
            {/* left menu (static MVP) */}
            <ul className="space-y-2 text-sm">
              <li className="font-medium text-zinc-900 dark:text-zinc-100">My Story</li>
              <li className="text-zinc-600 dark:text-zinc-400">Profile</li>
              <li className="text-zinc-600 dark:text-zinc-400">What I care about</li>
              <li className="text-zinc-600 dark:text-zinc-400">Learning</li>
              <li className="text-zinc-600 dark:text-zinc-400">Interests</li>
              <li className="text-zinc-600 dark:text-zinc-400">Relationships</li>
            </ul>
          </aside>

          <div className="rounded-lg border p-6 md:col-span-2">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
