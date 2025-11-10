"use client";

import { useState } from "react";
import { ProfileData, updateUserProfile } from "@/app/dashboard/staff/actions";
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

interface ViewProfileDialogProps {
  profile: ProfileData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewProfileDialog({
  profile,
  open,
  onOpenChange,
}: ViewProfileDialogProps) {
  const router = useRouter();
  const [isViewing, setIsViewing] = useState(false);

  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            User Profile
          </DialogTitle>
          <DialogDescription>
            {isViewing
              ? "Update profile information below"
              : "View and manage profile details"}
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
            <Input
              id="role"
              value={profile.role}
              disabled
              className="bg-zinc-100 dark:bg-zinc-800 capitalize"
            />
          </div>
        </div>
          

        <DialogFooter>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
