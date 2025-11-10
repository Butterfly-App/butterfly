"use client";

import { useState } from "react";
import Link from "next/link";
import type { ClientWithGuardian } from "@/lib/types/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, User } from "lucide-react";

interface ClientListProps {
  clients: ClientWithGuardian[];
  basePath: string; // "/dashboard/staff" or "/dashboard/admin"
}

export function ClientList({ clients, basePath }: ClientListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.first_name.toLowerCase().includes(searchLower) ||
      client.last_name.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button asChild>
          <Link href={`${basePath}/clients/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Guardian</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-zinc-500">
                  {searchTerm
                    ? "No clients found matching your search."
                    : "No clients yet. Add your first client to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-zinc-400" />
                      <span>
                        {client.first_name} {client.last_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {client.email && (
                        <div className="text-zinc-900 dark:text-zinc-100">
                          {client.email}
                        </div>
                      )}
                      {client.phone && (
                        <div className="text-zinc-500">{client.phone}</div>
                      )}
                      {!client.email && !client.phone && (
                        <span className="text-zinc-400">No contact info</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.guardian?.email || (
                      <span className="text-zinc-400">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {client.date_of_birth
                      ? new Date(client.date_of_birth).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`${basePath}/clients/${client.id}/about`}>

                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
