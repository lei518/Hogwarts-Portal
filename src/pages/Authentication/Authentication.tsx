import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";

// The dedicated Authentication screen "Begin Journey" leads to. Its only
// job is offering the two entry points into the (separate) Sign In /
// Create Account pages - it holds no auth logic of its own.
export function Authentication() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 py-16">
      <Card className="w-full max-w-sm p-8 text-center">
        <div className="flex justify-center mb-6">
          <PageHeader title="Enter Hogwarts" description="Sign in to continue your story, or create an account to begin one." icon={GraduationCap} />
        </div>

        <div className="flex flex-col gap-4">
          <Button variant="primary" className="w-full" onClick={() => navigate("/sign-in")}>
            Sign In
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => navigate("/create-account")}>
            Create Account
          </Button>
        </div>
      </Card>
    </div>
  );
}
