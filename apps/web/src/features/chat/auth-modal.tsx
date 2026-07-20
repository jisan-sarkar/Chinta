"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Check, Loader2, Mail, X } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  appUrl,
  authClient,
  sendEmailOtp,
  signInWithEmailOtp,
} from "@/lib/auth-client";

export type AuthModalMode = "login" | "signup";

type AuthStep = "email" | "code" | "profile" | "complete";

export function AuthModal({
  open,
  mode,
  onOpenChange,
  onAuthenticated,
  initialError,
}: {
  open: boolean;
  mode: AuthModalMode;
  onOpenChange: (open: boolean) => void;
  onAuthenticated: () => Promise<void> | void;
  initialError?: string | undefined;
}) {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const title = getTitle(mode, step);

  useEffect(() => {
    if (open && initialError) {
      queueMicrotask(() => {
        setStep("email");
        setError(initialError);
      });
    }
  }, [initialError, open]);

  function resetState() {
    setStep("email");
    setEmail("");
    setOtp("");
    setName("");
    setError(undefined);
    setIsSubmitting(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);

    if (!nextOpen) {
      resetState();
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setIsSubmitting(true);

    try {
      await sendEmailOtp(email.trim());
      setStep("code");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCodeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);

    if (mode === "signup") {
      setStep("profile");
      return;
    }

    await completeEmailSignIn();
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await completeEmailSignIn();
  }

  async function completeEmailSignIn() {
    setError(undefined);
    setIsSubmitting(true);

    try {
      const displayName = name.trim() || email.trim().split("@")[0];
      await signInWithEmailOtp({
        email: email.trim(),
        otp: otp.trim(),
        ...(displayName ? { name: displayName } : {}),
      });
      await onAuthenticated();
      setStep("complete");
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setError(undefined);
    setIsSubmitting(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: appUrl,
        errorCallbackURL: appUrl,
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/55 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed inset-x-3 bottom-3 z-50 max-h-[min(42rem,calc(100dvh-1.5rem))] overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xl outline-none sm:inset-auto sm:left-1/2 sm:top-1/2 sm:w-[min(24rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-6">
          <div className="flex justify-end">
            <Dialog.Close asChild>
              <Button size="icon" aria-label="Close auth" className="rounded-xl">
                <X size={17} />
              </Button>
            </Dialog.Close>
          </div>

          <Dialog.Title className="text-center text-2xl font-medium tracking-normal">
            {title}
          </Dialog.Title>

          {step === "email" ? (
            <EmailStep
              mode={mode}
              email={email}
              error={error}
              isSubmitting={isSubmitting}
              onEmailChange={setEmail}
              onSubmit={handleEmailSubmit}
              onGoogleSignIn={handleGoogleSignIn}
            />
          ) : null}

          {step === "code" ? (
            <CodeStep
              email={email}
              otp={otp}
              error={error}
              isSubmitting={isSubmitting}
              onOtpChange={setOtp}
              onResend={() => void sendEmailOtp(email.trim())}
              onSubmit={handleCodeSubmit}
            />
          ) : null}

          {step === "profile" ? (
            <ProfileStep
              name={name}
              error={error}
              isSubmitting={isSubmitting}
              onNameChange={setName}
              onSubmit={handleProfileSubmit}
            />
          ) : null}

          {step === "complete" ? (
            <CompleteStep onContinue={() => handleOpenChange(false)} />
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function EmailStep({
  mode,
  email,
  error,
  isSubmitting,
  onEmailChange,
  onSubmit,
  onGoogleSignIn,
}: {
  mode: AuthModalMode;
  email: string;
  error: string | undefined;
  isSubmitting: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn: () => void;
}) {
  return (
    <>
      <Dialog.Description className="mx-auto mt-4 max-w-[18rem] text-center text-sm leading-6 text-[var(--muted-foreground)]">
        {mode === "signup"
          ? "Create an account to save chats, settings, and connected providers."
          : "Log in to continue with your saved chats, settings, and providers."}
      </Dialog.Description>

      <div className="mt-8 space-y-3">
        <Button
          type="button"
          variant="outline"
          disabled={isSubmitting}
          onClick={onGoogleSignIn}
          className="h-12 w-full rounded-full bg-transparent"
        >
          <span className="grid size-5 place-items-center font-semibold text-blue-500">
            G
          </span>
          Continue with Google
        </Button>
      </div>

      <div className="my-7 flex items-center gap-4 text-xs uppercase text-[var(--muted-foreground)]">
        <div className="h-px flex-1 bg-[var(--border)]" />
        or
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="sr-only" htmlFor="auth-email">
          Email address
        </label>
        <div className="relative">
          <Mail
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
            size={17}
          />
          <Input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="Email address"
            className="h-12 rounded-full pl-11"
          />
        </div>
        <AuthError message={error} />
        <SubmitButton label="Continue" isSubmitting={isSubmitting} />
      </form>
    </>
  );
}

function CodeStep({
  email,
  otp,
  error,
  isSubmitting,
  onOtpChange,
  onResend,
  onSubmit,
}: {
  email: string;
  otp: string;
  error: string | undefined;
  isSubmitting: boolean;
  onOtpChange: (otp: string) => void;
  onResend: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="mt-5 space-y-5" onSubmit={onSubmit}>
      <Dialog.Description className="text-center text-sm leading-6 text-[var(--muted-foreground)]">
        Enter the verification code we just sent to{" "}
        <span className="text-[var(--foreground)]">{email}</span>
      </Dialog.Description>
      <label className="block text-sm font-medium" htmlFor="auth-code">
        Code
      </label>
      <Input
        id="auth-code"
        inputMode="numeric"
        autoComplete="one-time-code"
        required
        minLength={6}
        maxLength={6}
        value={otp}
        onChange={(event) => onOtpChange(event.target.value.replace(/\D/g, ""))}
        placeholder="012345"
        className="h-12 rounded-full text-center text-lg tracking-[0.2em]"
      />
      <AuthError message={error} />
      <SubmitButton label="Continue" isSubmitting={isSubmitting} />
      <Button
        type="button"
        variant="ghost"
        disabled={isSubmitting}
        onClick={onResend}
        className="mx-auto flex rounded-full"
      >
        Resend email
      </Button>
    </form>
  );
}

function ProfileStep({
  name,
  error,
  isSubmitting,
  onNameChange,
  onSubmit,
}: {
  name: string;
  error: string | undefined;
  isSubmitting: boolean;
  onNameChange: (name: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <Dialog.Description className="text-center text-sm leading-6 text-[var(--muted-foreground)]">
        This helps personalize your Chinta workspace.
      </Dialog.Description>
      <Input
        required
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        placeholder="Full name"
        className="h-12 rounded-full"
      />
      <AuthError message={error} />
      <SubmitButton label="Finish creating account" isSubmitting={isSubmitting} />
    </form>
  );
}

function CompleteStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="mt-8 text-center">
      <div className="mx-auto grid size-9 place-items-center rounded-full bg-[var(--foreground)] text-[var(--background)]">
        <Check size={21} />
      </div>
      <Dialog.Description className="mx-auto mt-8 max-w-[18rem] text-sm leading-6 text-[var(--muted-foreground)]">
        You are all set. Your chats and provider settings can now be saved to
        your account.
      </Dialog.Description>
      <Button
        type="button"
        variant="primary"
        onClick={onContinue}
        className="mt-6 h-12 w-full rounded-full"
      >
        Continue
      </Button>
    </div>
  );
}

function SubmitButton({
  label,
  isSubmitting,
}: {
  label: string;
  isSubmitting: boolean;
}) {
  return (
    <Button
      type="submit"
      variant="primary"
      disabled={isSubmitting}
      className="h-12 w-full rounded-full"
    >
      {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : null}
      {label}
    </Button>
  );
}

function AuthError({ message }: { message: string | undefined }) {
  if (!message) {
    return null;
  }

  return <p className="text-center text-sm text-red-500">{message}</p>;
}

function getTitle(mode: AuthModalMode, step: AuthStep) {
  if (step === "code") {
    return "Check your inbox";
  }

  if (step === "profile") {
    return "Tell us about you";
  }

  if (step === "complete") {
    return "You're all set";
  }

  return mode === "signup" ? "Create your account" : "Log in or sign up";
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Authentication failed.";
}
