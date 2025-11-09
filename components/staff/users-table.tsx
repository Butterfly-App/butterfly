"use client";

import { useState } from "react";
import { ProfileData } from "@/app/dashboard/staff/actions";
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

  return (
    <>
      <div className="space-y-6">
        {/* Users Section */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Disabled individuals receiving services ({userProfiles.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userProfiles.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No users found.
              </p>
            ) : (
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
                    {userProfiles.map((profile) => (
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
            )}
          </CardContent>
        </Card>

        {/* Guardians Section */}
        <Card>
          <CardHeader>
            <CardTitle>Guardians</CardTitle>
            <CardDescription>
              Caretakers and family members ({guardianProfiles.length} total)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {guardianProfiles.length === 0 ? (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No guardians found.
              </p>
            ) : (
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
                    {guardianProfiles.map((profile) => (
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
            )}
          </CardContent>
        </Card>
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
