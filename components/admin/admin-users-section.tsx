"use client";

import { useEffect, useState } from "react";
import { getAllUsers, ProfileData } from "@/app/dashboard/admin/actions";
import { UsersTable } from "./users-table";
import { CreateUserDialog } from "./create-user-dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export function AdminUsersSection() {
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const fetchProfiles = async () => {
    try {
      const result = await getAllUsers();
      setProfiles(result);
    } catch (error) {
      console.error("Failed to fetch profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleCreateSuccess = () => {
    // Refetch profiles after successful creation
    setLoading(true);
    fetchProfiles();
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-600 dark:text-zinc-400">Loading users...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      <UsersTable profiles={profiles} />

      <CreateUserDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
}
