"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-muted shadow-sm transition hover:text-ink"
      aria-label="Cerrar sesion"
      title="Cerrar sesion"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
