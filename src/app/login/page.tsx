import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth/session";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-panel">
        <div className="mb-6">
          <span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-600 text-sm font-black text-white">
            CE
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-ink">
            CEACET Control Escolar
          </h1>
          <p className="mt-2 text-sm text-muted">
            Acceso administrativo para control escolar, pagos y expedientes.
          </p>
        </div>
        <LoginForm />
      </section>
    </div>
  );
}
