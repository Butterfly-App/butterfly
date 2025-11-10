"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GoalCardProps {
  id: string;
  title: string;
  status: "in_progress" | "completed";
  onStatusChange?: (id: string, status: "in_progress" | "completed") => void;
  onDelete?: (id: string) => void;
}

export function GoalCard({ id, title, status, onStatusChange, onDelete }: GoalCardProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-medium">{title}</h3>
          <p className={cn(
            "text-sm",
            status === "completed" ? "text-green-600" : "text-blue-600"
          )}>
            {status === "completed" ? "Completed" : "In Progress"}
          </p>
        </div>
        <div className="space-x-2">
          {onStatusChange && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(id, status === "completed" ? "in_progress" : "completed")}
            >
              {status === "completed" ? "Mark In Progress" : "Mark Complete"}
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(id)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}