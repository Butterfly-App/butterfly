import { getClientById, getGuardians } from "@/app/dashboard/clients/actions";
import { ClientForm } from "@/components/clients/client-form";
import { notFound } from "next/navigation";

export default async function EditClientPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    const [client, guardians] = await Promise.all([
      getClientById(params.id),
      getGuardians(),
    ]);

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Client</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-2">
            Update client information for {client.first_name} {client.last_name}
          </p>
        </div>

        <div className="rounded-lg border bg-white dark:bg-zinc-950 p-6">
          <ClientForm
            client={client}
            guardians={guardians}
            basePath="/dashboard/staff"
          />
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
