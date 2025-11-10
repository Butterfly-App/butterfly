import { login } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50 text-zinc-900 dark:from-sky-950 dark:via-sky-900 dark:to-sky-950 dark:text-zinc-100">
      {/* Top bar (simple, matches landing) */}
      <header className="sticky top-0 z-10 border-b border-sky-200/60 bg-white/70 backdrop-blur-sm dark:border-sky-800/50 dark:bg-sky-950/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <span className="text-sm font-semibold">🦋</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Butterfly</span>
          </Link>
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm text-sky-700 hover:bg-sky-100 dark:text-sky-300 dark:hover:bg-sky-900/40"
          >
            Home
          </Link>
        </div>
      </header>

      {/* Centered card */}
      <div className="mx-auto flex max-w-6xl items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-sky-200 bg-white/80 p-8 shadow-sm backdrop-blur-sm dark:border-sky-800 dark:bg-sky-950/40">
          <div className="text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-sm">
              <span className="text-xl">🦋</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Welcome back
            </p>
          </div>

          {params?.error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-300">
              {params.error}
            </div>
          )}

          <form className="mt-6 space-y-5">
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
                  className="mt-1 block w-full rounded-md border border-sky-200/70 bg-white/70 px-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm outline-none ring-1 ring-transparent focus:border-sky-400 focus:ring-sky-300 dark:border-sky-800/50 dark:bg-sky-950/30 dark:text-zinc-100"
                  placeholder="you@example.com"
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
                  autoComplete="current-password"
                  required
                  className="mt-1 block w-full rounded-md border border-sky-200/70 bg-white/70 px-3 py-2 text-zinc-900 placeholder-zinc-400 shadow-sm outline-none ring-1 ring-transparent focus:border-sky-400 focus:ring-sky-300 dark:border-sky-800/50 dark:bg-sky-950/30 dark:text-zinc-100"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-1">
              <Button formAction={login} className="w-full bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400">
                Sign in
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">
                Do not have an account?{" "}
              </span>
              <Link
                href="/signup"
                className="font-medium text-sky-700 hover:underline dark:text-sky-300"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Subtle footer */}
      <footer className="border-t border-sky-200/60 bg-white/60 py-6 text-sm dark:border-sky-800/50 dark:bg-sky-950/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
          <span className="text-zinc-600 dark:text-zinc-400">
            © {new Date().getFullYear()} Butterfly
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
