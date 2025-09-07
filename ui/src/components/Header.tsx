import { ConnectButton } from "@mysten/dapp-kit";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Stabilize theme to prevent flicker
  const isDark = mounted ? (resolvedTheme ?? theme) === "dark" : false;
  const connectRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b will-change-auto">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/">
            <h1 className="text-2xl font-bold tracking-tighter">TAMAGOSUI</h1>
          </Link>
          <nav className="hidden sm:flex items-center gap-2 text-sm">
            <Link
              to="/"
              className={`px-2 py-1 rounded ${
                location.pathname === "/" ? "bg-muted" : "hover:bg-muted"
              }`}
            >
              Home
            </Link>
            <Link
              to="/marketplace"
              className={`px-2 py-1 rounded ${
                location.pathname === "/marketplace" ? "bg-muted" : "hover:bg-muted"
              }`}
            >
              Marketplace
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Button
            variant="outline"
            size="lg"
            aria-label="Toggle theme"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="!px-4 gap-2 rounded-[12px] border border-border bg-background hover:bg-background/80 text-foreground font-mono font-bold leading-none flex-shrink-0"
            style={{ height: "50px", width: "auto", minWidth: "50px" }}
            title={isDark ? "Switch to light" : "Switch to dark"}
            disabled={!mounted}
          >
            {mounted && isDark ? (
              <SunIcon className="size-4 text-muted-foreground" />
            ) : (
              <MoonIcon className="size-4 text-muted-foreground" />
            )}
          </Button>
          <div ref={connectRef} className="contents flex-shrink-0">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
