"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

type Subgoal = {
  id: string;
  title: string;
  status: 'met' | 'not_met';
  reason?: string;
  other_reason?: string;
};

const REASONS = [
  'Left program',
  'Ill/hospitalized',
  'Crisis/challenge',
  'Guardian directive',
  'Time specific',
  'Home instability',
  'Person not committed to goal',
  'Guardian/family responsibility not met',
  'Person\'s current skills do not match',
  'Individual\'s financial constraints',
  'Staffing/manpower shortages',
  'Other'
] as const;

export function SubgoalDialog({ 
  goalId, 
  subgoal,
  onUpdate 
}: { 
  goalId: string;
  subgoal: Subgoal;
  onUpdate: (formData: FormData) => void;
}) {
  return (
    <form
      action={onUpdate}
      className="space-y-4"
    >
      <input type="hidden" name="goalId" value={goalId} />
      <input type="hidden" name="subgoalId" value={subgoal.id} />
      
      <div className="space-y-2">
        <Label>Status</Label>
        <select
          name="status"
          defaultValue={subgoal.status}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="met">Met</option>
          <option value="not_met">Not Met</option>
        </select>
      </div>

      <div className="space-y-2" id="reasonContainer">
        <Label>Reason (if not met)</Label>
        <select
          name="reason"
          defaultValue={subgoal.reason || ""}
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="">Select reason...</option>
          {REASONS.map((reason) => (
            <option key={reason} value={reason}>
              {reason}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2" id="otherReasonContainer">
        <Label>Other Reason</Label>
        <Input
          name="otherReason"
          defaultValue={subgoal.other_reason || ""}
          placeholder="Specify other reason"
        />
      </div>

      <Button type="submit">
        Update Status
      </Button>
    </form>
  );
}