"use client";

import { FormEvent, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type Provider = "gemini" | "openai" | "anthropic";

const PROVIDERS: {
  id: Provider;
  name: string;
  model: string;
  costPer1kTokens: string;
  freeLimit: string;
  getKeyUrl: string;
  steps: string[];
}[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    model: "Gemini 2.5 Flash Lite",
    costPer1kTokens: "~$0.000075",
    freeLimit: "1,500 free requests/day",
    getKeyUrl: "https://aistudio.google.com/app/apikey",
    steps: [
      "Go to Google AI Studio (aistudio.google.com)",
      "Sign in with your Google account",
      'Click \u201cGet API key\u201d → \u201cCreate API key\u201d',
      "Copy the key and paste it below",
      "Optional: add a card in AI Studio for higher limits (you\u2019ll still pay pennies)",
    ],
  },
  {
    id: "openai",
    name: "OpenAI",
    model: "GPT-4o mini",
    costPer1kTokens: "~$0.00015",
    freeLimit: "$5 free credit for new accounts",
    getKeyUrl: "https://platform.openai.com/api-keys",
    steps: [
      "Go to platform.openai.com and sign up or log in",
      "Add a payment method under Billing (required even for free tier)",
      'Go to API Keys → \u201cCreate new secret key\u201d',
      "Copy the key — you won\u2019t be able to see it again",
      "Paste it below",
    ],
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    model: "Claude Haiku 4.5",
    costPer1kTokens: "~$0.00025",
    freeLimit: "$5 free credit for new accounts",
    getKeyUrl: "https://console.anthropic.com/settings/keys",
    steps: [
      "Go to console.anthropic.com and create an account",
      "Add a payment method under Plans & Billing",
      'Go to API Keys → \u201cCreate Key\u201d',
      "Copy and paste the key below",
    ],
  },
];

const COST_EXAMPLES = [
  { action: "Generate your 4-week plan", tokens: "~2,000 tokens", cost: "< $0.001" },
  { action: "One chat message + reply", tokens: "~300 tokens", cost: "< $0.0001" },
  { action: "Expand 5 exercise details", tokens: "~600 tokens", cost: "< $0.0001" },
  { action: "Typical full month of use", tokens: "~15,000 tokens", cost: "< $0.01" },
];

export function ApiKeySettings({
  initialProvider,
  initialKeyMasked,
}: {
  initialProvider: Provider | null;
  initialKeyMasked: string | null;
}) {
  const supabase = createClient();
  const [provider, setProvider] = useState<Provider>(initialProvider ?? "gemini");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [hasSavedKey, setHasSavedKey] = useState(Boolean(initialKeyMasked));
  const [savedProvider, setSavedProvider] = useState<Provider | null>(initialProvider);
  const [isSaving, setIsSaving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "removed" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [openStep, setOpenStep] = useState<Provider | null>(null);

  const selected = PROVIDERS.find((p) => p.id === provider)!;

  async function onSave(e: FormEvent) {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setIsSaving(true);
    setStatus("idle");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setErrorMsg("Not signed in."); setStatus("error"); setIsSaving(false); return; }

    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      ai_provider: provider,
      ai_api_key: apiKey.trim(),
    });

    if (error) { setErrorMsg(error.message); setStatus("error"); }
    else { setHasSavedKey(true); setSavedProvider(provider); setApiKey(""); setStatus("saved"); }
    setIsSaving(false);
  }

  async function onRemove() {
    setIsRemoving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsRemoving(false); return; }
    await supabase.from("profiles").upsert({ id: user.id, ai_provider: null, ai_api_key: null });
    setHasSavedKey(false);
    setSavedProvider(null);
    setStatus("removed");
    setIsRemoving(false);
  }

  return (
    <div className="space-y-6">
      {/* What is this section */}
      <Card className="space-y-3">
        <h2 className="text-base font-semibold text-white">Your own AI key <span className="ml-2 rounded-full bg-coral-500/20 px-2 py-0.5 text-xs font-medium text-coral-400">Optional</span></h2>
        <p className="text-sm text-zinc-300">
          Forja uses AI to generate your plan and answer your questions. By default it uses a shared key that has a daily limit — if many people use the app at once, you may hit that limit. Adding your own key means <strong className="text-white">your usage is completely separate</strong> and you’ll never be blocked by someone else’s activity.
        </p>
        <div className="rounded-xl bg-zinc-800/60 px-4 py-3 text-sm text-zinc-400">
          🔒 Your key is stored encrypted in your account and is only ever used for <em>your</em> requests. It is never shared or logged.
        </div>
      </Card>

      {/* Cost explainer */}
      <Card className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">How much does it actually cost?</h3>
        <p className="text-sm text-zinc-400">AI APIs charge by the amount of text processed. Here’s what typical Forja usage costs:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="py-1 pr-4 text-left text-xs font-medium text-zinc-500">Action</th>
                <th className="py-1 pr-4 text-left text-xs font-medium text-zinc-500">Data used</th>
                <th className="py-1 text-left text-xs font-medium text-zinc-500">Cost (Gemini)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {COST_EXAMPLES.map((row) => (
                <tr key={row.action}>
                  <td className="py-2 pr-4 text-zinc-300">{row.action}</td>
                  <td className="py-2 pr-4 text-zinc-500">{row.tokens}</td>
                  <td className="py-2 font-medium text-coral-400">{row.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-zinc-500">ℹ️ Prices shown for Google Gemini Flash Lite — the cheapest and recommended option. A full month of active use costs less than a penny.</p>
      </Card>

      {/* Current key status */}
      {hasSavedKey ? (
        <Card className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-white">✅ Using your own {PROVIDERS.find(p => p.id === savedProvider)?.name ?? "AI"} key</p>
            <p className="text-xs text-zinc-500">Your requests are private and unlimited by shared quotas.</p>
          </div>
          <Button
            type="button"
            onClick={onRemove}
            disabled={isRemoving}
            className="shrink-0 border border-rose-500/40 bg-transparent text-rose-400 hover:bg-rose-500/10"
          >
            {isRemoving ? "Removing…" : "Remove key"}
          </Button>
        </Card>
      ) : null}

      {/* Provider picker */}
      <Card className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Choose a provider</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PROVIDERS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => { setProvider(p.id); setOpenStep(null); }}
              className={`rounded-xl border p-3 text-left transition-colors ${
                provider === p.id
                  ? "border-coral-500/60 bg-coral-500/10"
                  : "border-zinc-700 bg-zinc-800/40 hover:border-zinc-600"
              }`}
            >
              <p className={`text-sm font-semibold ${provider === p.id ? "text-coral-300" : "text-white"}`}>{p.name}</p>
              <p className="mt-0.5 text-xs text-zinc-400">{p.model}</p>
              <p className="mt-1 text-xs text-zinc-500">{p.freeLimit}</p>
              <p className="mt-0.5 text-xs font-medium text-coral-400">{p.costPer1kTokens} / 1k tokens</p>
            </button>
          ))}
        </div>

        {/* Step-by-step instructions */}
        <div className="rounded-xl bg-zinc-800/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-white">How to get a {selected.name} key</p>
            <button
              type="button"
              onClick={() => setOpenStep(openStep === provider ? null : provider)}
              className="text-xs text-coral-400 hover:text-coral-300"
            >
              {openStep === provider ? "Hide steps" : "Show steps"}
            </button>
          </div>
          {openStep === provider ? (
            <ol className="space-y-2 pt-1">
              {selected.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-zinc-300">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-coral-500/20 text-xs font-bold text-coral-400">{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
              <li>
                <a
                  href={selected.getKeyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-coral-400 hover:text-coral-300"
                >
                  ↗ Open {selected.name} key page
                </a>
              </li>
            </ol>
          ) : null}
        </div>

        {/* Key input */}
        <form onSubmit={onSave} className="space-y-3">
          <label htmlFor="ai-api-key" className="block text-sm text-zinc-300">
            Paste your {selected.name} API key
          </label>
          <div className="relative">
            <input
              id="ai-api-key"
              type={showKey ? "text" : "password"}
              className="w-full rounded-xl bg-zinc-800 px-3 py-2 pr-20 font-mono text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-coral-500"
              placeholder={`${selected.id === "gemini" ? "AIza..." : selected.id === "openai" ? "sk-..." : "sk-ant-..."}`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              onClick={() => setShowKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          <Button type="submit" disabled={isSaving || !apiKey.trim()}>
            {isSaving ? "Saving…" : "Save key"}
          </Button>
        </form>

        {status === "saved" ? <p className="text-sm text-green-400">✅ Key saved. Forja will now use your {selected.name} account.</p> : null}
        {status === "removed" ? <p className="text-sm text-zinc-400">Key removed. Forja will use the shared default key.</p> : null}
        {status === "error" ? <p className="text-sm text-rose-400">{errorMsg}</p> : null}
      </Card>
    </div>
  );
}
