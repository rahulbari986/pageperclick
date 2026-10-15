"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Eye, EyeOff, User, ArrowRight } from "lucide-react";
import { toast } from "sonner";

// Normal background Three.js particle field
const ThreeParticleField = dynamic(
  () =>
    import("@/components/admin/ThreeParticleField").then(
      (m) => m.ThreeParticleField
    ),
  { ssr: false }
);

interface AdminPasscodeGateProps {
  onSuccess: () => void;
}

export function AdminPasscodeGate({ onSuccess }: AdminPasscodeGateProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const usernameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    usernameInputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      setIsError(true);
      setErrorMessage("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    setIsError(false);

    try {
      const res = await fetch("/api/v1/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: trimmedUser,
          password: trimmedPass,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsError(false);
        setErrorMessage("");

        const expiresAt =
          data.expiresAt || Date.now() + (rememberMe ? 12 : 1) * 3600 * 1000;
        const deviceIp = data.ip || "127.0.0.1";

        try {
          if (data.token) {
            sessionStorage.setItem("admin_token", data.token);
          }
          sessionStorage.setItem("admin_passcode_auth", "authenticated");
          sessionStorage.setItem("admin_username", trimmedUser);
          sessionStorage.setItem("admin_session_expires_at", expiresAt.toString());
          sessionStorage.setItem("admin_session_remember_me", rememberMe ? "true" : "false");
          sessionStorage.setItem("admin_session_ip", deviceIp);

          if (rememberMe) {
            if (data.token) localStorage.setItem("admin_token", data.token);
            localStorage.setItem("admin_passcode_auth", "authenticated");
            localStorage.setItem("admin_username", trimmedUser);
            localStorage.setItem("admin_session_expires_at", expiresAt.toString());
            localStorage.setItem("admin_session_remember_me", "true");
            localStorage.setItem("admin_session_ip", deviceIp);
          } else {
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_passcode_auth");
            localStorage.removeItem("admin_username");
            localStorage.removeItem("admin_session_expires_at");
            localStorage.removeItem("admin_session_remember_me");
            localStorage.removeItem("admin_session_ip");
          }
        } catch {
          // ignore
        }

        toast.success(
          rememberMe
            ? "Access granted. Active for 12 hours (Remember Me enabled)."
            : "Access granted. Active for 1 hour (Auto-lockout enabled)."
        );

        setTimeout(() => {
          onSuccess();
        }, 350);
      } else {
        setIsLoading(false);
        setIsError(true);
        const msg = data.error || "Invalid username or password";
        setErrorMessage(msg);
        toast.error(msg);
        setPassword("");
        passwordInputRef.current?.focus();
      }
    } catch {
      setIsLoading(false);
      setIsError(true);
      setErrorMessage("Network error during authentication.");
      toast.error("Network error during authentication.");
    }
  };

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-background flex flex-col justify-between selection:bg-primary/30 selection:text-white">
      {/* Normal background (Three.js particle canvas + ambient orbs) */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
        <ThreeParticleField
          className="w-full h-full"
          particleCount={200}
          primaryColor="#9333ea"
          accentColor="#c026d3"
          showRing={false}
        />
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1]">
        <div className="absolute top-10 left-1/4 w-[420px] h-[420px] bg-primary/15 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-accent/15 rounded-full blur-[150px]" />
      </div>

      {/* Top Header matching exact position and container as entire project */}
      <header className="relative z-10 w-full">
        <div className="container mx-auto px-6 md:px-4 py-5 md:py-10 flex items-center justify-between">
          <div className="relative w-fit flex flex-col">
            <Link href="/" className="inline-block cursor-pointer">
              <motion.img
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 350, damping: 15 }}
                src="/header.png"
                alt="Page Per Click Logo"
                className="inline-block mt-0 md:mt-4 w-28 h-20 md:w-40 md:h-20 object-contain cursor-pointer"
              />
            </Link>
            <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground/80 tracking-widest uppercase mt-0.5 sm:mt-1">
              ADMIN WORKSPACE
            </span>
          </div>
        </div>
      </header>

      {/* Centered Small Card — positioned in center, slightly upper */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-16 sm:pb-24 -mt-6 sm:-mt-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={
            isError
              ? { opacity: 1, scale: 1, y: 0, x: [-8, 8, -6, 6, -3, 3, 0] }
              : { opacity: 1, scale: 1, y: 0, x: 0 }
          }
          transition={{ duration: isError ? 0.4 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[340px] sm:max-w-[360px] p-5 sm:p-6 bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl relative text-center -translate-y-4 sm:-translate-y-6"
        >
          {/* Compact Top Icon Badge */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-purple-600 to-accent flex items-center justify-center text-white shadow-md mx-auto mb-3">
            <Lock className="w-5 h-5" />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-foreground font-heading tracking-tight">
            Admin Access
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
            Enter your credentials to continue
          </p>

          {/* Clean Small Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-left">
            {/* Username Input */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Username
              </label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 text-muted-foreground/70 absolute left-3 pointer-events-none" />
                <input
                  ref={usernameInputRef}
                  type="text"
                  autoComplete="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (isError) setIsError(false);
                  }}
                  className={`w-full h-9 pl-9 pr-3 text-xs sm:text-sm bg-background/50 border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all ${
                    isError
                      ? "border-destructive focus:ring-destructive/40"
                      : "border-border/50 focus:border-primary focus:ring-primary/40"
                  }`}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-muted-foreground/70 absolute left-3 pointer-events-none" />
                <input
                  ref={passwordInputRef}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (isError) setIsError(false);
                  }}
                  className={`w-full h-9 pl-9 pr-9 text-xs sm:text-sm bg-background/50 border rounded-xl text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-all ${
                    isError
                      ? "border-destructive focus:ring-destructive/40"
                      : "border-border/50 focus:border-primary focus:ring-primary/40"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {isError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="text-[11px] text-destructive font-medium pt-0.5"
                >
                  {errorMessage || "Invalid username or password"}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full h-9 sm:h-10 mt-1 rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer inside card: Remember me checkbox + session duration indicator */}
          <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
            <label
              className="flex items-center gap-2 cursor-pointer select-none group"
              title={rememberMe ? "Active for 12 hours on this device IP" : "Auto-locks after 1 hour on this device IP"}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border border-border/70 bg-background/50 accent-primary text-primary focus:ring-1 focus:ring-primary/40 cursor-pointer transition-all"
              />
              <span className="text-[11px] text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                Remember me
              </span>
            </label>
            <span
              className="text-[10px] text-muted-foreground/70 transition-colors"
              title={rememberMe ? "Session active for 12 hours" : "Session locks after 1 hour"}
            >
              {rememberMe ? "12 hrs active" : "1 hr active"}
            </span>
          </div>
        </motion.div>
      </main>

      {/* Clean bottom footer */}
      <footer className="relative z-10 py-3 text-center text-[11px] text-muted-foreground/60">
        Page Per Click Secure Admin Workspace
      </footer>
    </div>
  );
}
