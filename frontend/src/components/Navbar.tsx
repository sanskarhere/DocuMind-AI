import { Moon, Sun, LogOut, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function Navbar() {
  const { theme, toggle } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("documind_token");
    window.location.href = "/login.html";
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Brain className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-bold tracking-tight">
              DocuMind <span className="text-primary">AI</span>
            </h1>
            <p className="text-[11px] text-muted-foreground hidden sm:block">
              Chat with your documents
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
