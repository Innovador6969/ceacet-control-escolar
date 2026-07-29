"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Mail } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password")
      })
    });

    setIsLoading(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      setError(payload?.message ?? "No fue posible iniciar sesion.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="space-y-2">
        <span className="text-sm font-semibold text-ink">Correo</span>
        <span className="flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-3">
          <Mail className="h-4 w-4 text-muted" aria-hidden="true" />
          <input
            name="email"
            type="email"
            required
            defaultValue="admin@ceacet.test"
            className="w-full bg-transparent text-sm outline-none"
          />
        </span>
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-ink">Contrasena</span>
        <span className="flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-3">
          <LockKeyhole className="h-4 w-4 text-muted" aria-hidden="true" />
          <input
            name="password"
            type="password"
            required
            defaultValue="Admin123!"
            className="w-full bg-transparent text-sm outline-none"
          />
        </span>
      </label>
      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isLoading}
        className="focus-ring h-11 w-full rounded-lg bg-brand-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoading ? "Ingresando..." : "Entrar al sistema"}
      </button>
    </form>
  );
}
