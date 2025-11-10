"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Client, CreateClientInput } from "@/lib/types/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClientUser, updateClient } from "@/app/dashboard/clients/actions";
import { Loader2 } from "lucide-react";

interface ClientFormProps {
  client?: Client;
  guardians: Array<{ user_id: string; users: { id: string; email: string; full_name: string; } }>;
  basePath: string;
}

export function ClientForm({ client, guardians, basePath }: ClientFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const guardianId = formData.get("guardian_id") as string;

    const input: CreateClientInput = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      date_of_birth: (formData.get("date_of_birth") as string) || undefined,
      gender: (formData.get("gender") as string) || undefined,
      phone: (formData.get("phone") as string) || undefined,
      email: (formData.get("email") as string) || undefined,
      address: (formData.get("address") as string) || undefined,
      medical_conditions: (formData.get("medical_conditions") as string) || undefined,
      allergies: (formData.get("allergies") as string) || undefined,
      medications: (formData.get("medications") as string) || undefined,
      emergency_contact_name: (formData.get("emergency_contact_name") as string) || undefined,
      emergency_contact_phone: (formData.get("emergency_contact_phone") as string) || undefined,
      emergency_contact_relationship: (formData.get("emergency_contact_relationship") as string) || undefined,
      notes: (formData.get("notes") as string) || undefined,
      guardian_id: guardianId === "none" ? undefined : guardianId,
    };

    try {
      if (client) {
        await updateClient({ id: client.id, ...input });
      } else {
        await createClientUser(input);
      }
      router.push(`${basePath}/clients`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>

          <div className="space-y-2">
            <Label htmlFor="first_name">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="first_name"
              name="first_name"
              defaultValue={client?.first_name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="last_name"
              name="last_name"
              defaultValue={client?.last_name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              name="date_of_birth"
              type="date"
              defaultValue={client?.date_of_birth}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Input
              id="gender"
              name="gender"
              defaultValue={client?.gender}
              placeholder="e.g., Male, Female, Other"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guardian_id">Assigned Guardian</Label>
            <Select name="guardian_id" defaultValue={client?.guardian_id || "none"}>
              <SelectTrigger>
                <SelectValue placeholder="Select a guardian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No guardian assigned</SelectItem>
                {guardians.map((guardian) => (
                  <SelectItem key={guardian.user_id} value={guardian.user_id}>
                    {guardian.users.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={client?.email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={client?.phone}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              name="address"
              defaultValue={client?.address}
              rows={3}
            />
          </div>
        </div>

        {/* Medical Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Medical Information</h3>

          <div className="space-y-2">
            <Label htmlFor="medical_conditions">Medical Conditions</Label>
            <Textarea
              id="medical_conditions"
              name="medical_conditions"
              defaultValue={client?.medical_conditions}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              name="allergies"
              defaultValue={client?.allergies}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medications">Current Medications</Label>
            <Textarea
              id="medications"
              name="medications"
              defaultValue={client?.medications}
              rows={3}
            />
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Emergency Contact</h3>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Contact Name</Label>
            <Input
              id="emergency_contact_name"
              name="emergency_contact_name"
              defaultValue={client?.emergency_contact_name}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
            <Input
              id="emergency_contact_phone"
              name="emergency_contact_phone"
              type="tel"
              defaultValue={client?.emergency_contact_phone}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_relationship">Relationship</Label>
            <Input
              id="emergency_contact_relationship"
              name="emergency_contact_relationship"
              defaultValue={client?.emergency_contact_relationship}
              placeholder="e.g., Parent, Sibling, Spouse"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          defaultValue={client?.notes}
          rows={4}
          placeholder="Any additional information about the client..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {client ? "Update Client" : "Create Client"}
        </Button>
      </div>
    </form>
  );
}
