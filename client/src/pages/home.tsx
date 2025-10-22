import { useLocation } from "wouter";
import { EmptyState } from "@/components/empty-state";

export default function Home() {
  const [, navigate] = useLocation();

  return (
    <div className="h-full flex items-center justify-center">
      <EmptyState
        title="Welcome to Chord Chart Library"
        description="Create, edit, and manage your song chord charts. Start by creating a new song or selecting one from the library."
        actionLabel="Create New Song"
        onAction={() => navigate("/new")}
      />
    </div>
  );
}
