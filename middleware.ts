import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Basic ")) {
    return new NextResponse("Authentification requise", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Espace administrateur"',
      },
    });
  }

  const encodedCredentials = authorization.split(" ")[1];
  const credentials = atob(encodedCredentials);
  const separator = credentials.indexOf(":");

  const username = credentials.slice(0, separator);
  const password = credentials.slice(separator + 1);

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return new NextResponse("Identifiants incorrects", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Espace administrateur"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
