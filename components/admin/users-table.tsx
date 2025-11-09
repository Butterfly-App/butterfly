"use client";

import { useState } from "react";
import { ProfileData } from "@/app/dashboard/admin/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditProfileDialog } from "./edit-profile-dialog";

interface UsersTableProps {
  profiles: ProfileData[];
}

export function UsersTable({ profiles }: UsersTableProps) {
  const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEditClick = (profile: ProfileData) => {
    setSelectedProfile(profile);
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const userProfiles = profiles.filter((p) => p.role === "user");
  const guardianProfiles = profiles.filter((p) => p.role === "guardian");
  const staffProfiles = profiles.filter((p) => p.role === "staff");
  const adminProfiles = profiles.filter((p) => p.role === "admin");

  const renderTable = (roleProfiles: ProfileData[], title: string, description: string) => {
    if (roleProfiles.length === 0) {
      return null;
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description} ({roleProfiles.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roleProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="font-medium">
                      {profile.full_name || "Not set"}
                    </TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>{profile.phone || "Not set"}</TableCell>
                    <TableCell>{formatDate(profile.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClick(profile)}
                      >
                        View / Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Users Section */}
        {renderTable(userProfiles, "Users", "Service recipients")}

        {/* Guardians Section */}
        {renderTable(guardianProfiles, "Guardians", "Caretakers and family members")}

        {/* Staff Section */}
        {renderTable(staffProfiles, "Staff", "Service providers")}

        {/* Admins Section */}
        {renderTable(adminProfiles, "Administrators", "System administrators")}

        {profiles.length === 0 && (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
                No users found in the system.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedProfile && (
        <EditProfileDialog
          profile={selectedProfile}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </>
  );
}
