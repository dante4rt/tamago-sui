import { ConnectButton } from "@mysten/dapp-kit";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = (resolvedTheme ?? theme) === "dark";
  const connectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const root = connectRef.current;
      if (!root) return;
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [mounted, resolvedTheme]);

  return (
    <header className="fixed top-0 left-0 right-0 z-10 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <h1 className="text-2xl font-bold tracking-tighter">TAMAGOSUI</h1>
        <div className="flex items-center gap-2">
          {mounted && (
            <Button
              variant="outline"
              size="lg"
              aria-label="Toggle theme"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className="!px-4 gap-2 rounded-[12px] border border-border bg-background hover:bg-background/80 text-foreground font-mono font-bold leading-none"
              style={{ height: "50px" }}
              title={isDark ? "Switch to light" : "Switch to dark"}
            >
              {isDark ? (
                <SunIcon className="size-4 text-muted-foreground" />
              ) : (
                <MoonIcon className="size-4 text-muted-foreground" />
              )}
            </Button>
          )}
          <div ref={connectRef} className="contents">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}
