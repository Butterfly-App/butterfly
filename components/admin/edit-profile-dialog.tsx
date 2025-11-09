"use client";

import { useState } from "react";
import { ProfileData, updateUserProfileAsAdmin } from "@/app/dashboard/admin/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

interface EditProfileDialogProps {
  profile: ProfileData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({
  profile,
  open,
  onOpenChange,
}: EditProfileDialogProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    phone: profile.phone || "",
    address: profile.address || "",
    role: profile.role as "user" | "guardian" | "staff" | "admin",
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateUserProfileAsAdmin(profile.user_id, formData);

      if (result.success) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      address: profile.address || "",
      role: profile.role as "user" | "guardian" | "staff" | "admin",
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update profile information and role"
              : "View and manage user details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile.email}
              disabled
              className="bg-zinc-100 dark:bg-zinc-800"
            />
            <p className="text-xs text-zinc-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            {isEditing ? (
              <select
                id="role"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value as "user" | "guardian" | "staff" | "admin" })
                }
                className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-zinc-950 dark:focus-visible:ring-zinc-300"
              >
                <option value="user">User</option>
                <option value="guardian">Guardian</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            ) : (
              <Input
                id="role"
                value={profile.role}
                disabled
                className="bg-zinc-100 dark:bg-zinc-800 capitalize"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              disabled={!isEditing}
              placeholder="Enter address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <Label className="text-xs text-zinc-500">Created</Label>
              <p className="text-sm">{formatDate(profile.created_at)}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-zinc-500">Last Updated</Label>
              <p className="text-sm">{formatDate(profile.updated_at)}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
