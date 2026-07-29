import { Bell, Search } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentUser } from "@/lib/auth/session";

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-line bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-brand-600">
            CEACET Control Escolar
          </p>
          <h1 className="truncate text-lg font-bold text-ink sm:text-xl">
            Administración académica y financiera
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="hidden h-10 w-72 items-center gap-2 rounded-lg border border-line bg-white px-3 text-sm text-muted shadow-sm md:flex">
            <Search className="h-4 w-4" aria-hidden="true" />
            <input
              className="w-full bg-transparent outline-none"
              placeholder="Buscar alumno, CURP o grupo"
              aria-label="Buscar en el sistema"
            />
          </label>
          <button
            className="focus-ring grid h-10 w-10 place-items-center rounded-lg border border-line bg-white text-muted shadow-sm transition hover:text-ink"
            aria-label="Ver notificaciones"
          >
            <Bell className="h-4 w-4" aria-hidden="true" />
          </button>
          {user ? (
            <div className="hidden min-w-0 text-right sm:block">
              <p className="truncate text-xs font-bold text-ink">{user.name}</p>
              <p className="truncate text-xs text-muted">{user.role}</p>
            </div>
          ) : null}
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
