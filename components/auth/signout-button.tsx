"use client";

import { signout } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <Button
      variant="outline"
      onClick={async () => {
        await signout();
      }}
    >
      Sign Out
    </Button>
  );
}
