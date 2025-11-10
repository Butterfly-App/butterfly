"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DOMAINS = [
  "physical",
  "material",
  "emotional",
  "personal development",
  "self-determination",
  "rights",
  "social inclusion",
  "interpersonal relations",
];

const REASONS = [
  "Left program",
  "Ill/hospitalized",
  "Crisis/challenge",
  "Guardian directive",
  "Time specific",
  "Home instability",
  "Person not committed to goal",
  "Guardian/family responsibility not met",
  "Person's current skills do not match",
  "Individual's financial constraints",
  "Staffing/manpower shortages",
  "Other",
];

interface CreateGoalDialogProps {
  clientId: string;
  onGoalCreate: (
    clientId: string,
    title: string,
    domain: string,
    initialSubgoal: {
      description: string;
      met?: boolean;
      reason?: string;
      otherReason?: string;
    }
  ) => Promise<void>;
}

export function CreateGoalDialog({ clientId, onGoalCreate }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState(DOMAINS[0]);
  const [subgoalDescription, setSubgoalDescription] = useState("");
  const [isMet, setIsMet] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [otherReason, setOtherReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subgoalDescription.trim()) {
      return;
    }
    
    await onGoalCreate(
      clientId,
      title.trim(),
      domain,
      {
        description: subgoalDescription.trim(),
        met: isMet,
        reason: reason === "Other" ? undefined : reason,
        otherReason: reason === "Other" ? otherReason : undefined
      }
    );

    // Reset form
    setTitle("");
    setSubgoalDescription("");
    setIsMet(false);
    setReason(REASONS[0]);
    setOtherReason("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Goal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter goal title"
                required
              />
            </div>

            <div>
              <Label htmlFor="domain">Domain</Label>
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="subgoal">Initial Subgoal</Label>
              <Input
                id="subgoal"
                value={subgoalDescription}
                onChange={(e) => setSubgoalDescription(e.target.value)}
                placeholder="Enter subgoal description"
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="met"
                checked={isMet}
                onChange={(e) => setIsMet(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="met">Subgoal Completed</Label>
            </div>

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {reason === "Other" && (
              <div>
                <Label htmlFor="otherReason">Other Reason</Label>
                <Input
                  id="otherReason"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Specify other reason"
                  required
                />
              </div>
            )}
          </div>
          <Button type="submit">Create Goal</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}