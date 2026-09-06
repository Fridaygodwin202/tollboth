"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setStatus(error ? error.message : "Signed in.");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setStatus("Signed out.");
  }

  return (
    <main>
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Sign in</button>
      </form>
      <button onClick={handleSignOut} type="button">
        Sign out
      </button>
      {status && <p role="status">{status}</p>}
    </main>
  );
}
