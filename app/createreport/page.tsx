import { createClient } from "@/lib/supabase/server";


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
      console.error('Error fetching client names:', error);
    }


  
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">Create Report Page</h1>
        <p className="mt-2 mb-6">Choose a client.</p>
        <div className="w-full mt-8">
          <h2 className="text-xl font-semibold mb-4">Client List</h2>
          <ul className="space-y-2">
            {clientnames?.map((client) => (
              <li key={client.name} className="text-zinc-600 dark:text-zinc-400">
                {client.name}
              </li>
            ))}
          </ul>
        </div>

        {/* ...rest of existing code... */}
      </main>
    </div>

  );
}