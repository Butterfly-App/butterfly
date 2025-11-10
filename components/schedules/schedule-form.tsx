"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createSchedule, getAllUsers, getStaffUsers } from "@/app/schedules/actions";
import { format } from "date-fns";

interface ScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultStart?: Date;
  defaultEnd?: Date;
}

interface User {
  id: string;
  email: string;
  role: string;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
  guardian: {
    id: string;
    full_name: string;
  }
}

export function ScheduleForm({
  open,
  onOpenChange,
  defaultStart,
  defaultEnd,
}: ScheduleFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isAllUsers, setIsAllUsers] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [assignedStaffId, setAssignedStaffId] = useState<string>("");
  const [users, setUsers] = useState<Client[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load users and staff when component mounts
  useEffect(() => {
    async function loadUsers() {
      const result = await getAllUsers();
      if (result.data) {
        setUsers(result.data);
      }
    }
    async function loadStaffUsers() {
      const result = await getStaffUsers();
      if (result.data) {
        setStaffUsers(result.data);
      }
    }
    loadUsers();
    loadStaffUsers();
  }, []);

  // Set default dates when provided
  useEffect(() => {
    if (defaultStart) {
      setStartTime(format(defaultStart, "yyyy-MM-dd'T'HH:mm"));
    }
    if (defaultEnd) {
      setEndTime(format(defaultEnd, "yyyy-MM-dd'T'HH:mm"));
    }
  }, [defaultStart, defaultEnd]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!title || !startTime || !endTime) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (!isAllUsers && selectedUsers.length === 0) {
      setError("Please select at least one participant");
      setLoading(false);
      return;
    }

    const result = await createSchedule({
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      is_all_users: isAllUsers,
      participant_ids: isAllUsers ? [] : selectedUsers,
      assigned_staff_id: assignedStaffId || undefined,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      // Reset form
      setTitle("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setIsAllUsers(true);
      setSelectedUsers([]);
      setAssignedStaffId("");
      setLoading(false);
      onOpenChange(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Schedule Event</DialogTitle>
          <DialogDescription>
            Create a new schedule event for users and guardians
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description"
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time *</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="assignedStaff">Assigned Staff / Admin</Label>
            <select
              id="assignedStaff"
              value={assignedStaffId}
              onChange={(e) => setAssignedStaffId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="">None (Optional)</option>
              {staffUsers.map((staff) => (
                <option key={staff.id} value={staff.id}>
                  {staff.email} ({staff.role})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select the staff member responsible for this schedule
            </p>
          </div>

          <div>
            <Label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAllUsers}
                onChange={(e) => setIsAllUsers(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Assign to all users</span>
            </Label>
          </div>

          {!isAllUsers && (
            <div>
              <Label>Select Participants</Label>
              <div className="mt-2 border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                {users.length === 0 ? (
                  <p className="text-sm text-gray-500">No users available</p>
                ) : (
                  users.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">
                        {user.first_name}{" "}{user.last_name} {" "}
                        <span className="text-gray-500">Guardian: {user.guardian.full_name}</span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
