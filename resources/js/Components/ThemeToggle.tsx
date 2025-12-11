import { Moon, Sun } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { useTheme } from "@/Hooks/use-theme";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative rounded-full transition-colors hover:bg-accent"
            aria-label={
                theme === "dark"
                    ? "Cambiar a modo claro"
                    : "Cambiar a modo oscuro"
            }
        >
            {/* Icono del Sol - visible en modo oscuro */}
            <Sun
                className={`h-5 w-5 transition-all ${
                    theme === "dark"
                        ? "rotate-0 scale-100"
                        : "rotate-90 scale-0"
                }`}
            />

            {/* Icono de la Luna - visible en modo claro */}
            <Moon
                className={`absolute h-5 w-5 transition-all ${
                    theme === "dark"
                        ? "rotate-90 scale-0"
                        : "rotate-0 scale-100"
                }`}
            />
        </Button>
    );
}
