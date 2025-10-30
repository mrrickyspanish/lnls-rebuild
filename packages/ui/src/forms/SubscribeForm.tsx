"use client";

import { useState } from "react";

export type SubscribeFormProps = {
  actionUrl?: string;
};

export const SubscribeForm = ({ actionUrl = "/api/subscribe" }: SubscribeFormProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      setMessage("Please enter an email.");
      setStatus("error");
      return;
    }

    try {
      setStatus("loading");
      setMessage("");
      const response = await fetch(actionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        throw new Error("Unable to subscribe");
      }
      setStatus("success");
      setMessage("Thanks for joining the Lake Show newsletter!");
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-2xl border border-slateBase/60 bg-charcoal/80 p-6">
      <label className="text-sm uppercase text-metaGray">Stay in the loop</label>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="flex-1 rounded-full border border-slateBase/60 bg-slateBase px-4 py-3 text-offWhite placeholder:text-metaGray focus:border-neonPurple focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-neonPurple px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slateBase transition hover:bg-neonGold"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Joining..." : "Subscribe"}
        </button>
      </div>
      {message ? (
        <p className={`text-xs ${status === "error" ? "text-neonGold" : "text-neonPurple"}`}>{message}</p>
      ) : null}
    </form>
  );
};
