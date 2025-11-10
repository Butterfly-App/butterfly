"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Client = {
  id: string;
  name: string;
};

export function ClientSelect({ clients }: { clients: Client[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentClientId = searchParams.get("clientId");

  const handleClientChange = (clientId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (clientId) {
      params.set("clientId", clientId);
    } else {
      params.delete("clientId");
    }
    router.push(`/dashboard/staff/goals?${params.toString()}`);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Select Client</label>
      <select
        className="w-full rounded-md border border-gray-300 p-2"
        value={currentClientId || ""}
        onChange={(e) => handleClientChange(e.target.value)}
      >
        <option value="">Select a client...</option>
        {clients?.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>
    </div>
  );
}