"use client";
import { useState } from "react";

type ClientFormProps = {
  clientnames: { name: string }[];
  onClientSelect: (clientName: string) => void;
};

export default function ClientForm({ clientnames, onClientSelect }: ClientFormProps) {
  const [selectedClient, setSelectedClient] = useState("");

  const handleClientSelect = (clientName: string) => {
    setSelectedClient(clientName);
    onClientSelect(clientName); 
  };

  return (
    <div className="w-full mt-8">
      <h2 className="text-xl font-semibold mb-4">Client List</h2>
      <form className="space-y-2">
        {(!clientnames || clientnames.length === 0) && (
          <p className="text-sm text-zinc-600">No clients available.</p>
        )}
        {clientnames?.map((client) => (
          <div key={client.name} className="flex items-center space-x-2">
            <input
              type="radio"
              id={client.name}
              name="client"
              value={client.name}
              checked={selectedClient === client.name}
              onChange={() => handleClientSelect(client.name)}
              className="h-4 w-4 text-blue-600"
            />
            <label
              htmlFor={client.name}
              className="text-zinc-600 dark:text-zinc-400"
            >
              {client.name}
            </label>
          </div>
        ))}
      </form>
      {selectedClient && (
        <p className="mt-4">Selected client: {selectedClient}</p>
      )}
    </div>
  );
}