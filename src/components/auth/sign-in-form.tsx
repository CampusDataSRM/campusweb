"use client";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  ScanLine,
  UserRound,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";

import { PhoneSignIn } from "@/components/auth/phone-sign-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBrowseAsGuest, useSignIn } from "@/hooks/use-auth-actions";
import { SignInError } from "@/lib/auth/sign-in-error";
import { notify } from "@/lib/toast";
import styles from "./sign-in.module.css";

interface FormValues {
  username: string;
  password: string;
}

export function SignInForm() {
  const id = useId();
  useEffect(() => {
    if (window.location.hash === "#session-revoked") {
      notify.info("You were signed out from another device.", {
        id: "session-revoked",
        duration: 10000,
      });
      window.history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }, []);
  const [phoneLogin, setPhoneLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const signIn = useSignIn();
  const browseAsGuest = useBrowseAsGuest();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { username: "", password: "" } });
  const pending = signIn.isPending;
  const serverError =
    signIn.error instanceof SignInError
      ? signIn.error.message
      : signIn.error
        ? "Sign-in didn't go through. Please try again."
        : null;

  return (
    <div className={styles.signIn}>
      <div className={styles.panelHeading}>
        <h2>{phoneLogin ? "Your phone is your pass." : "Welcome in."}</h2>
        <p>
          {phoneLogin
            ? "Scan. Approve. You’re in."
            : "Your clubs and events, all in one place."}
        </p>
      </div>
      <div className={styles.methods} role="group" aria-label="Sign-in method">
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          aria-pressed={!phoneLogin}
          onClick={() => setPhoneLogin(false)}
          className={styles.method}
        >
          <UserRound aria-hidden /> Your account
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          aria-pressed={phoneLogin}
          onClick={() => setPhoneLogin(true)}
          className={styles.method}
        >
          <ScanLine aria-hidden /> Log in with phone
        </Button>
      </div>
      {phoneLogin ? (
        <PhoneSignIn onClose={() => setPhoneLogin(false)} />
      ) : (
        <form
          noValidate
          aria-label="Account sign in"
          aria-busy={pending}
          onSubmit={handleSubmit((values) => signIn.mutate(values))}
          className={styles.form}
        >
          <div className={styles.field}>
            <Label htmlFor={`${id}-username`}>Username</Label>
            <div className={styles.inputWrap}>
              <UserRound aria-hidden className={styles.inputIcon} />
              <Input
                id={`${id}-username`}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                placeholder="Your username"
                disabled={pending}
                aria-invalid={!!errors.username}
                aria-describedby={
                  errors.username
                    ? `${id}-username-error`
                    : `${id}-account-hint`
                }
                className={styles.input}
                {...register("username", {
                  validate: (value) =>
                    value.trim().length > 0 || "Enter your username.",
                })}
              />
            </div>
            {errors.username ? (
              <p
                id={`${id}-username-error`}
                className={styles.fieldError}
                role="alert"
              >
                {errors.username.message}
              </p>
            ) : (
              <p id={`${id}-account-hint`} className={styles.fieldHint}>
                Use the username linked to your account.
              </p>
            )}
          </div>
          <div className={styles.field}>
            <Label htmlFor={`${id}-password`}>Password</Label>
            <div className={styles.inputWrap}>
              <LockKeyhole aria-hidden className={styles.inputIcon} />
              <Input
                id={`${id}-password`}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Your account password"
                disabled={pending}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? `${id}-password-error` : undefined
                }
                className={styles.passwordInput}
                {...register("password", {
                  validate: (value) =>
                    value.length > 0 || "Enter your password.",
                })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-touch"
                disabled={pending}
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className={styles.passwordToggle}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            {errors.password && (
              <p
                id={`${id}-password-error`}
                className={styles.fieldError}
                role="alert"
              >
                {errors.password.message}
              </p>
            )}
          </div>
          {serverError && (
            <p role="alert" className={styles.serverError}>
              {serverError}
            </p>
          )}
          <Button
            type="submit"
            size="touch"
            disabled={pending}
            className={styles.submit}
          >
            {pending ? (
              <>
                <Loader2 className="animate-spin" aria-hidden /> Signing in…
              </>
            ) : (
              <>
                Let me in <ArrowRight aria-hidden />
              </>
            )}
          </Button>
          <p className={styles.privacy}>
            <LockKeyhole aria-hidden size={12} /> Your password is never saved.
          </p>
        </form>
      )}
      <div className={styles.guestArea}>
        <Button
          type="button"
          variant="ghost"
          disabled={pending}
          onClick={() => void browseAsGuest()}
          className={styles.guestButton}
        >
          <span>
            Just taking a look?
            <small>Explore events &amp; clubs without signing in.</small>
          </span>
          <ArrowRight aria-hidden />
        </Button>
      </div>
    </div>
  );
}
