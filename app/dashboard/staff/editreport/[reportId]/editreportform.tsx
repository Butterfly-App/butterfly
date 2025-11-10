"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { reports } from "@/app/dashboard/staff/viewreport/reportform";

type EditReportFormProps = {
  report: reports; // from reportform.tsx (id, title, document_url, client_id)
  clients: { id: string; name: string }[];
};

export default function EditReportForm({ report, clients }: EditReportFormProps) {
  const router = useRouter();
  const supabase = createClient();

  // Pre-fill the form state with the report's data
  const [title, setTitle] = useState(report.title);
  const [clientId, setClientId] = useState(report.client_id);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateReport = async () => {
    setIsLoading(true);

    const { error } = await supabase
      .from("reports")
      .update({
        title: title, 
        client_id: clientId, 
      })
      .eq("id", report.id); 

    if (error) {
      console.error("Error updating report:", error.message);
    } else {

      router.refresh(); 
      router.push("/dashboard/staff/viewreports");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="title">Report Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="client">Client</Label>
        <Select
          value={clientId}
          onValueChange={(value) => setClientId(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Document</Label>
        <p className="text-sm text-gray-500">{report.document_url.split('/').pop()}</p>
        <p className="text-xs text-gray-400">(File cannot be changed. To change the file, delete and re-upload.)</p>
      </div>

      <Button onClick={handleUpdateReport} disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}