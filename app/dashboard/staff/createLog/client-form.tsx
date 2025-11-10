"use client";
import { useState } from "react";
import ClientForm from "../createreport/client-form";
import LogForm from "./log-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
      {selectedClient && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Create Log for {selectedClient.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <LogForm clientName={selectedClient.name} clientID={selectedClient.id}/>
          </CardContent>
        </Card>
      )}
    </>
  );
}