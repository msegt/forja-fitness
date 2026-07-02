import { OnboardingWizard } from "@/components/OnboardingWizard";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-4">
        <h1 className="text-3xl font-bold text-slate-100">Onboarding</h1>
        <p className="text-slate-300">Answer a few quick questions and Forja will build your first four-week programme.</p>
        <OnboardingWizard />
      </div>
    </main>
  );
}
