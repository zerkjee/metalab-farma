"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui";

const fieldCls = (hasError: boolean) =>
  `w-full rounded-xl border bg-surface-card px-4 py-3 text-sm text-ink placeholder-ink-muted outline-none transition-all ${
    hasError
      ? "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20"
      : "border-line-default focus:border-brand focus:ring-2 focus:ring-brand/30"
  }`;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl") ?? "/";
  // Bloqueia open redirect: só aceita paths relativos que começam com /
  const callbackUrl =
    rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/";
  const { data: session, status: sessionStatus } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (sessionStatus === "authenticated" && session) {
      router.replace(callbackUrl);
    }
  }, [sessionStatus, session, router, callbackUrl]);

  if (sessionStatus === "authenticated") return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const result = await signIn("credentials", {
      email,
      senha: password,
      redirect: false,
    });

    if (result?.error) {
      setStatus("error");
      setErrorMsg("Email ou senha inválidos. Verifique e tente novamente.");
      return;
    }

    setStatus("success");
    router.replace(callbackUrl);
    router.refresh();
  }

  const loading = status === "loading";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink-secondary">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          placeholder="seu@email.com"
          aria-invalid={status === "error" || undefined}
          aria-describedby={status === "error" ? "login-error" : undefined}
          className={fieldCls(status === "error")}
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-ink-secondary">
          Senha
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Mínimo 6 caracteres"
            aria-invalid={status === "error" || undefined}
            aria-describedby={status === "error" ? "login-error" : undefined}
            className={`${fieldCls(status === "error")} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted transition-colors hover:text-ink-secondary"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {status === "error" && (
        <div
          id="login-error"
          className="rounded-xl border border-danger/20 bg-danger-subtle px-4 py-3 text-xs text-danger"
        >
          {errorMsg}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        size="lg"
        style={{ width: "100%" }}
      >
        {loading ? "Entrando..." : "Entrar"}
      </Button>

      <p className="text-center text-xs text-ink-muted">
        Não tem conta?{" "}
        <Link
          href="/registro"
          className="font-semibold text-link hover:underline"
        >
          Criar conta grátis
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-page px-5 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-7 text-center">
          <Link href="/" className="inline-block">
            <Image
              src="/brand/metalab-mark.png"
              alt="MetaLab"
              width={48}
              height={48}
              className="mx-auto mb-3 h-12 w-12"
            />
          </Link>
          <h1 className="font-display text-2xl text-navy">
            Entrar na sua conta
          </h1>
        </div>

        <div className="rounded-2xl border border-line bg-surface-card p-6 shadow-sm sm:p-8">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
