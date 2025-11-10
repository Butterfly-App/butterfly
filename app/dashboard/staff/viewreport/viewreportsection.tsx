"use client";
import { useState } from "react";
import ClientForm from "@/app/dashboard/staff/createreport/client-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ReportForm, {type reports} from "./reportform";

type ReportSectionProps = {
  clientData: { id: string; name: string }[];
  allReportData: reports[];
};

export default function ViewReportSection({ clientData = [], allReportData = [] }: ReportSectionProps) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  
  // Find the selected client to display the name
  const selectedClient = clientData.find(c => c.id === selectedClientId);
  
  // Filter reports for the selected client
  const clientReports = selectedClientId
    ? allReportData.filter(report => report.client_id === selectedClientId)
    : [];

  const handleClientSelect = (clientName: string) => {
    const client = clientData.find(c => c.name === clientName);
    setSelectedClientId(client?.id || null);
  };

  return (
    <>
      <ClientForm 
        clientnames={clientData.map(c => ({ name: c.name }))} 
        onClientSelect={handleClientSelect} 
      />
      {selectedClient && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Select a Report for {selectedClient.name}</CardTitle>
          </CardHeader>
          <CardContent>
                <ReportForm clientReports={clientReports} />
          </CardContent>
        </Card>
      )}
    </>
  );
}