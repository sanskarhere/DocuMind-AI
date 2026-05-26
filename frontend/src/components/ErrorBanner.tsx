import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1">{message}</p>
      <Button
        variant="ghost"
        size="icon"
        onClick={onDismiss}
        className="h-6 w-6 text-destructive hover:bg-destructive/20 hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
