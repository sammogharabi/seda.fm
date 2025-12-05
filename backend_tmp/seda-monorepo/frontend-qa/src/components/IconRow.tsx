import { Music2, Lock } from "lucide-react";

export function IconRow() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl shadow-card bg-white">
      <Music2 className="h-6 w-6" />
      <Lock className="h-6 w-6" />
      <span className="text-sm">Icons & Tailwind are wired up.</span>
    </div>
  );
}