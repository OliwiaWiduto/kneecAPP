import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100dvh-3.25rem)] max-w-md flex-col justify-center px-5 py-16 sm:px-8">
      <p className="text-xs uppercase tracking-[0.3em] text-fluoro">Keep the run</p>
      <h1 className="mt-3 font-display text-4xl uppercase leading-none text-bone">
        Sign in
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-bone/70">
        Put the streak against your name. Guest XP on this device merges in when you create or
        sign into an account.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}
