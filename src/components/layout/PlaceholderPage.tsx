import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";

interface PlaceholderPageProps {
  title: string;
  phase: string;
}

export function PlaceholderPage({ title, phase }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl md:text-5xl text-gold-bright font-display mb-3">
        {title}
      </h1>
      <p className="text-parchment-dim max-w-md">
        This part of the castle is still being built. It arrives in {phase}.
      </p>
      <Button variant="secondary" className="mt-8" onClick={() => navigate("/")}>
        Back to the entrance
      </Button>
    </div>
  );
}
