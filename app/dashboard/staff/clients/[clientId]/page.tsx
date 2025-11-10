import { createClient } from "@/lib/supabase/server";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { GoalsManager } from "@/components/goals/goals-manager";

export default async function ClientProfilePage({
  params: { clientId },
}: {
  params: { clientId: string };
}) {
  const supabase = await createClient();

  // Fetch client details
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  // Fetch goals with their subgoals
  const { data: goals } = await supabase
    .from("goals")
    .select(`
      id,
      category,
      title,
      domain,
      subgoals,
      completion,
      created_at
    `)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  if (!client) {
    return <div>Client not found</div>;
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{client.name}</h1>
        <p className="text-muted-foreground">{client.email}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          {/* Add other tabs as needed */}
        </TabsList>

        <TabsContent value="profile">
          <Card className="p-6">
            {/* Add profile content here */}
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            {/* Add profile fields */}
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Goals Management</h2>
            <GoalsManager clientId={clientId} initialGoals={goals || []} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}