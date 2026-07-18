import { LoaderCircle, SearchX } from "lucide-react";

export function LoadingState({ label = "Loading stays…" }: { label?: string }) {
  return (
    <div className="state-view">
      <LoaderCircle className="spin" size={30} />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="state-view empty-state">
      <SearchX size={36} />
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
