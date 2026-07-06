import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/ProfileForm";
import { ApiKeySettings } from "@/components/ApiKeySettings";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, date_of_birth, weight_kg, height_cm, ai_provider, ai_api_key")
    .eq("id", user.id)
    .maybeSingle();

  // Mask the key — only show last 4 chars so user knows one is saved without exposing it
  const maskedKey = profile?.ai_api_key
    ? `${"." .repeat(Math.max(0, profile.ai_api_key.length - 4))}${profile.ai_api_key.slice(-4)}`
    : null;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-3xl font-bold text-white">Profile settings</h1>
      <ProfileForm
        initialData={{
          fullName: profile?.full_name ?? "",
          dateOfBirth: profile?.date_of_birth ?? "",
          weightKg: profile?.weight_kg?.toString() ?? "",
          heightCm: profile?.height_cm?.toString() ?? "",
        }}
      />
      <div className="pt-2">
        <h2 className="mb-4 text-xl font-bold text-white">AI settings</h2>
        <ApiKeySettings
          initialProvider={(profile?.ai_provider as "gemini" | "openai" | "anthropic" | null) ?? null}
          initialKeyMasked={maskedKey}
        />
      </div>
    </main>
  );
}
