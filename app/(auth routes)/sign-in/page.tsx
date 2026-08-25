"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/lib/store/authStore";
import { login } from "@/lib/api/clientApi";
import css from "./SignInPage.module.css";
import axios from "axios";

export default function Login() {
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const userData = await login({ email, password });
      setUser(userData);
      window.location.href = "/profile";
      router.refresh();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          setError("Invalid email or password.");
        } else {
          setError(
            error.response?.data?.message ||
              "Something went wrong. Please try again.",
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={css.mainContent}>
      <form onSubmit={handleSubmit} className={css.form}>
        <h1 className={css.formTitle}>Sign in</h1>

        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            className={css.input}
            required
            disabled={loading}
          />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            className={css.input}
            required
            disabled={loading}
          />
        </div>

        <div className={css.actions}>
          <button type="submit" className={css.submitButton} disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </button>
        </div>

        {error && <p className={css.error}>{error}</p>}
      </form>
    </main>
  );
}
