"use client";

import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const authBaseUrl =
  `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/auth`;
export const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  plugins: [emailOTPClient()],
});

export async function sendEmailOtp(email: string) {
  return authRequest("/email-otp/send-verification-otp", {
    email,
    type: "sign-in",
  });
}

export async function signInWithEmailOtp({
  email,
  otp,
  name,
}: {
  email: string;
  otp: string;
  name?: string;
}) {
  return authRequest("/sign-in/email-otp", {
    email,
    otp,
    name,
  });
}

export async function signOut() {
  return authRequest("/sign-out", {});
}

async function authRequest(path: string, body: unknown) {
  const response = await fetch(`${authBaseUrl}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(parseAuthError(text));
  }

  return response.json() as Promise<unknown>;
}

function parseAuthError(text: string) {
  if (!text) {
    return "Authentication request failed.";
  }

  try {
    const payload = JSON.parse(text) as { message?: string };
    return payload.message ?? text;
  } catch {
    return text;
  }
}
