import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email("Captura un correo valido"),
  password: z.string().min(1, "Captura tu contrasena")
});

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const result = loginSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      { message: "Datos de acceso invalidos." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: result.data.email.toLowerCase() }
  });

  if (!user || !user.active) {
    return NextResponse.json(
      { message: "Correo o contrasena incorrectos." },
      { status: 401 }
    );
  }

  const passwordMatches = await verifyPassword(
    result.data.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    return NextResponse.json(
      { message: "Correo o contrasena incorrectos." },
      { status: 401 }
    );
  }

  await createSession(user.id);

  return NextResponse.json({ ok: true });
}
