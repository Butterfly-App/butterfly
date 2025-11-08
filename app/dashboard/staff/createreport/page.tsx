import { createClient } from "@/lib/supabase/server";
import ClientForm from "./client-form";


export default async function CreateReportPage() {

  const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // get list of all clients
    const { data: clientnames, error } = await supabase
      .from('clients')
      .select('name')
    
    if (error) {
      console.error('Error fetching clients:', error);
    }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Create Report Page</h1>
        <p className="mt-2 mb-6">Choose a client.</p>
        <ClientForm clientnames={clientnames || []} />
      </main>
    </div>
  );
}