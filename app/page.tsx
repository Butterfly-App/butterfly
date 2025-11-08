import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/signout-button";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user?.id)
  // get auth user (avoid destructuring into `data` twice)
  const { data: authData } = await supabase.auth.getUser();
  const authUser = authData?.user ?? null;

  const profileRes = authUser ? 
    await supabase
      .from('profiles')
      .select('role')
      .eq('id', authUser.id)
      .single()
    : { data: null, error: null };
  const role = profileRes.data?.role ?? null;


  const canSeeCreateReport =
    !!user && (role === "staff");


  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex w-full items-center justify-between">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {user.email}
              </span>
              <SignOutButton />
            </div>
          ) : (
            <div className="flex gap-2">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            {user
              ? `Welcome, ${user.email}!`
              : "Next.js with Supabase Auth"}
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {user
              ? "You are successfully signed in. You can now start using the app."
              : "Sign in or create a new account to get started."}
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://supabase.com/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Supabase Docs
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Next.js Docs
          </a>

          {user && canSeeCreateReport && (
            <Link href="/createreport">
              <Button>Create Report</Button>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}
