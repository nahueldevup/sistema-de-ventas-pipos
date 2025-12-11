import { useState } from "react";
import { router, Head, Link, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Moon,
    Sun,
    AlertCircle,
    Info,
} from "lucide-react";
import { useTheme } from "@/Hooks/use-theme";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const { theme, toggleTheme } = useTheme();

    // Obtener errores de Inertia
    const { errors } = usePage().props as { errors: Record<string, string> };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        router.post("/login", {
            email,
            password,
        });
    };

    return (
        <>
            <Head title="Login" />
            <div className="min-h-screen flex relative">
                {/* Theme Toggle - Visible en ambas vistas */}
                <button
                    onClick={toggleTheme}
                    className="absolute top-4 right-4 z-50 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border hover:bg-accent transition-colors"
                    aria-label={
                        theme === "dark"
                            ? "Cambiar a modo claro"
                            : "Cambiar a modo oscuro"
                    }
                >
                    {theme === "dark" ? (
                        <Sun className="w-5 h-5 text-foreground" />
                    ) : (
                        <Moon className="w-5 h-5 text-foreground" />
                    )}
                </button>

                {/* Left side - Branding */}
                <div className="hidden lg:flex lg:w-1/2 bg-[#3B9FF3] dark:bg-[#1a4b76] relative overflow-hidden items-center justify-center">
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 z-0 opacity-20 dark:opacity-10"
                        style={{
                            backgroundImage: "url('/billetes-fondo.svg')",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                        }}
                    />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col items-center justify-center w-full p-12 text-white">
                        <div className="mb-8 relative flex items-center justify-center">
                            {/* Circle background */}
                            <div className="absolute w-80 h-80 bg-white/20 backdrop-blur-sm rounded-full" />

                            <img
                                src="/pipos-caja-login.svg"
                                alt="Pipos el Pollo"
                                className="w-64 h-64 object-contain relative z-10 drop-shadow-2xl transform transition-transform duration-300 hover:scale-105"
                            />
                        </div>
                        <h1 className="text-4xl font-bold mb-4 text-center drop-shadow-lg">
                            Bienvenido a Pipos
                        </h1>
                        <p className="text-xl text-center opacity-90 drop-shadow-md font-medium">
                            Tu sistema de POS venta
                        </p>
                        <div className="mt-8 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 max-w-md">
                            <p className="text-lg text-center font-medium drop-shadow-md">
                                ¡Comienza tu jornada con eficiencia y control
                                total de tus ventas!
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right side - Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
                    <div className="w-full max-w-md">
                        {/* Mobile logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <img
                                src="/pipos-caja-login.svg"
                                alt="Pipos el Pollo"
                                className="w-32 h-32 object-contain"
                            />
                        </div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold mb-2 text-foreground">
                                Bienvenido de nuevo
                            </h2>
                            <p className="text-muted-foreground">
                                Ingresa tus credenciales para continuar
                            </p>
                        </div>

                        {/* Mensaje de error */}
                        {errors.email && (
                            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                                <p className="text-sm text-destructive font-medium">
                                    {errors.email}
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="flex items-center gap-2 text-foreground"
                                >
                                    <Mail className="w-4 h-4" />
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="tu@correo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="flex items-center gap-2 text-foreground"
                                >
                                    <Lock className="w-4 h-4" />
                                    Contraseña
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                        className="h-12 pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-success hover:bg-success/90 text-success-foreground font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                ENTRAR
                            </Button>

                            <div className="text-center pt-4">
                                <span className="text-muted-foreground">
                                    ¿No tienes cuenta?{" "}
                                </span>
                                <Link
                                    href="/register"
                                    className="text-primary font-semibold hover:text-primary/80 hover:underline transition-colors"
                                >
                                    REGISTRARME
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal de contraseña olvidada */}
            <Dialog open={showForgotModal} onOpenChange={setShowForgotModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-500" />
                            Recuperar Contraseña
                        </DialogTitle>
                        <DialogDescription className="pt-4 text-base">
                            Para restablecer tu contraseña, contacta al
                            administrador del sistema.
                            <br />
                            <br />
                            El administrador puede cambiar tu contraseña desde
                            la sección <strong>
                                "Empleados y Permisos"
                            </strong>{" "}
                            en Configuración.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="pt-4">
                        <Button
                            onClick={() => setShowForgotModal(false)}
                            className="w-full"
                        >
                            Entendido
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
