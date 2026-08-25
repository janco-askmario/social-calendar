import { AuthShell } from "@/components/AuthShell";
import { SignupForm } from "@/components/SignupForm";

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" subtitle="An admin will need to approve you before you can access the calendar.">
      <SignupForm />
    </AuthShell>
  );
}
