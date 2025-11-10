import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth/roles-server";

export const metadata = {
  title: "Butterfly — Turning daily notes into meaning",
  description:
    "A gentle platform that turns everyday support notes into clear stories and insight, so people with disabilities are seen beyond paperwork.",
};

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If user is logged in, redirect to their role-specific dashboard
  if (user) {
    const role = await getUserRole();
    if (role === "admin") redirect("/dashboard/admin");
    if (role === "staff") redirect("/dashboard/staff");
    if (role === "guardian") redirect("/dashboard/guardian");
    if (role === "user") redirect("/dashboard/user");
    // fallback just in case
    redirect("/dashboard/staff");
  }

  // Public landing page (no auth required)
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-sky-100 to-sky-50 text-zinc-900 dark:from-sky-950 dark:via-sky-900 dark:to-sky-950 dark:text-zinc-100">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-sky-200/60 bg-white/70 backdrop-blur-sm dark:border-sky-800/50 dark:bg-sky-950/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <span className="text-sm font-semibold">🦋</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Butterfly</span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/#story"
              className="rounded-md px-3 py-2 text-sm text-sky-700 hover:bg-sky-100 dark:text-sky-300 dark:hover:bg-sky-900/40"
            >
              Story
            </Link>
            <Link
              href="/#features"
              className="rounded-md px-3 py-2 text-sm text-sky-700 hover:bg-sky-100 dark:text-sky-300 dark:hover:bg-sky-900/40"
            >
              Features
            </Link>
            <Link
              href="/#impact"
              className="rounded-md px-3 py-2 text-sm text-sky-700 hover:bg-sky-100 dark:text-sky-300 dark:hover:bg-sky-900/40"
            >
              Impact
            </Link>

            <Link
              href="/login"
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              Log in
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-200/60 via-transparent to-transparent blur-2xl dark:from-sky-700/20" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-3xl font-bold leading-tight sm:text-5xl">
              Turning daily notes into meaning<span className="text-sky-600">.</span>
            </h1>
            <p className="mt-4 text-lg text-zinc-700 dark:text-zinc-300">
              We take everyday support notes and shape them into clear stories and gentle insight.
              People are seen for who they are, not just the paperwork.
            </p>

            <div className="mt-6 text-sm text-sky-800/80 dark:text-sky-200/80">
              No account needed to view this page.
            </div>
          </div>

          {/* Simple visual */}
          <div className="rounded-2xl border border-sky-200 bg-white/60 p-6 shadow-sm backdrop-blur-sm dark:border-sky-800 dark:bg-sky-950/40">
            <div className="mb-4 text-sm font-medium text-sky-700 dark:text-sky-300">
              How it works
            </div>
            <ul className="space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
              <li className="flex gap-3">
                <span className="mt-1 inline-flex size-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">1</span>
                Staff write simple daily notes.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex size-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">2</span>
                Butterfly organizes them into timelines and maps of places that matter.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-flex size-6 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300">3</span>
                Teams see patterns and progress without extra work.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="story" className="mx-auto max-w-6xl px-4 py-12">
        <div className="rounded-2xl border border-sky-200 bg-white/70 p-6 shadow-sm dark:border-sky-800 dark:bg-sky-950/40">
          <h2 className="text-xl font-semibold">Why it matters</h2>
          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            Behind every note is a person with routines, joy, tough days, and growth.
            We help teams notice what is meaningful and share it with care.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 pb-12">
        <div className="grid gap-6 md:grid-cols-3">
          <Feature
            title="Notes that make sense"
            desc="Searchable logs with times, places, and a clear history of edits."
            icon="🗒️"
          />
          <Feature
            title="Places on a map"
            desc="See favorite spots and community activity at a glance."
            icon="🗺️"
          />
          <Feature
            title="Simple sharing"
            desc="Turn updates into clear summaries when you need them."
            icon="✨"
          />
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-2xl border border-sky-200 bg-white/70 p-6 shadow-sm dark:border-sky-800 dark:bg-sky-950/40">
          <h3 className="text-lg font-semibold">Our promise</h3>
          <p className="mt-3 text-zinc-700 dark:text-zinc-300">
            Make documentation lighter, teamwork clearer, and each person more visible.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-400 dark:bg-sky-500 dark:hover:bg-sky-400"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-sky-300 bg-white/70 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/40"
            >
              Sign up
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sky-200/60 bg-white/60 py-6 text-sm dark:border-sky-800/50 dark:bg-sky-950/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
          <span className="text-zinc-600 dark:text-zinc-400">© {new Date().getFullYear()} Butterfly</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">
              Privacy
            </Link>
            <Link href="/terms" className="text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Feature({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="rounded-2xl border border-sky-200 bg-white/70 p-5 shadow-sm transition hover:shadow-md dark:border-sky-800 dark:bg-sky-950/40">
      <div className="mb-3 text-2xl">{icon}</div>
      <div className="text-base font-semibold">{title}</div>
      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{desc}</p>
    </div>
  );
}
