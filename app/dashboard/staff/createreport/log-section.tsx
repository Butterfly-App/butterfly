"use client";
import { useState } from "react";
import ClientForm from "./client-form";
import LogForm from "./log-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type ClientSectionProps = {
  clients: { id: string; name: string }[];
  allLogs: { creator: string; created_at: string; client_id: string }[];
};

export default function ClientSection({ clients = [], allLogs = [] }: ClientSectionProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  // Find the selected client to display the name
  const selectedClient = clients.find(c => c.id === selectedClientId);
  
  // Filter logs for the selected client
  const clientLogs = selectedClientId
    ? allLogs.filter(log => log.client_id === selectedClientId)
    : [];

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
            <CardTitle>Select Logs for {selectedClient.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <LogForm logs={clientLogs} />
          </CardContent>
        </Card>
      )}
    </>
  );
}