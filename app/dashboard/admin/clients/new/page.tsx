import { getGuardians } from "@/app/dashboard/clients/actions";
import { ClientForm } from "@/components/clients/client-form";

export default async function NewClientPage() {
  const guardians = await getGuardians();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Client</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-2">
          Create a new client profile
        </p>
      </div>

      <div className="rounded-lg border bg-white dark:bg-zinc-950 p-6">
        <ClientForm guardians={guardians} basePath="/dashboard/admin" />
      </div>
    </div>
  );
}
