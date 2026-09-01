"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from "@repo/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

type ActionResult = { error: string } | { error?: undefined };

// Signup/login/logout call the API with a plain fetch (not Eden) so we have
// direct access to the raw Set-Cookie header and can forward the session
// token to the browser via next/headers — Eden's wrapped response doesn't
// expose that.
async function forwardSessionCookie(response: Response) {
  const setCookie = response.headers.getSetCookie().find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!setCookie) return;

  const token = setCookie.split(";")[0]?.split("=")[1];
  if (!token) return;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function signupAction(input: {
  email: string;
  password: string;
  username: string;
}): Promise<ActionResult> {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();
  if (!response.ok) {
    return { error: data.error ?? "Gagal mendaftar" };
  }

  await forwardSessionCookie(response);
  redirect("/dashboard");
}

export async function loginAction(input: { email: string; password: string }): Promise<ActionResult> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();
  if (!response.ok) {
    return { error: data.error ?? "Gagal masuk" };
  }

  await forwardSessionCookie(response);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: { cookie: `${SESSION_COOKIE_NAME}=${token}` },
    });
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
