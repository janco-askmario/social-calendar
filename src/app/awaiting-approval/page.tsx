import { AuthShell } from "@/components/AuthShell";
import { SignOutLink } from "@/components/SignOutLink";

export default function AwaitingApprovalPage() {
  return (
    <AuthShell title="Awaiting approval" subtitle="You're almost in.">
      <div className="rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-3">
        Your account has been created but is awaiting admin approval. Once an admin approves your
        account you&apos;ll be able to access the shared calendar.
      </div>
      <div className="mt-6">
        <SignOutLink />
      </div>
    </AuthShell>
  );
}
