"use client";
import { useState } from "react";
import ClientForm from "../createreport/client-form";

type ClientSectionProps = {
  clients: { id: string; name: string }[];
};

export default function ClientSection({ clients = [] }: ClientSectionProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  // Find the selected client to display the name
  const selectedClient = clients.find(c => c.id === selectedClientId);
  

  const handleClientSelect = (clientName: string) => {
    const client = clients.find(c => c.name === clientName);
    setSelectedClientId(client?.id || null);
  };

  return (
    <>
      <ClientForm 
        clientnames={clients.map(c => ({ name: c.name }))} 
        onClientSelect={handleClientSelect} 
        
      />
    </>
  );
}