import { signup } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-white p-8 shadow-sm dark:bg-zinc-900 dark:border-zinc-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Sign Up</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Create a new account
          </p>
        </div>
        {params.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {params.error}
          </div>
        )}
        <form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-zinc-700 dark:bg-zinc-800"
              />
            </div>
          </div>

          <div>
            <Button formAction={signup} className="w-full">
              Sign Up
            </Button>
          </div>

          <div className="text-center text-sm">
            <span className="text-zinc-600 dark:text-zinc-400">
              Already have an account?{" "}
            </span>
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
