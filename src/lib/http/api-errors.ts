import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ApiErrorOptions = {
  fallback: string;
  notFoundMessages?: string[];
  conflictIncludes?: string[];
};

export function apiErrorResponse(error: unknown, options: ApiErrorOptions) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: "Revisa los campos marcados.", issues: error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  if (error instanceof Error) {
    if (options.notFoundMessages?.includes(error.message)) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }

    if (options.conflictIncludes?.some((fragment) => error.message.includes(fragment))) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: options.fallback }, { status: 500 });
}
