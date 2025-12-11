import { useState } from "react";
import { Header } from "@/Components/Header";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Avatar, AvatarFallback } from "@/Components/ui/avatar";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { Save, Shield, User as UserIcon, AlertTriangle } from "lucide-react";
import { useToast } from "@/Hooks/use-toast";
import MainLayout from "@/Layouts/MainLayout";
import { Head, usePage, useForm, router } from "@inertiajs/react";

// Definimos la estructura de los props que vienen de Inertia
interface UserProps {
    id: number;
    name: string;
    email: string;
    role: string;
    permissions: string[] | null;
}

interface PageProps {
    auth: {
        user: UserProps;
    };
}

export default function Perfil() {
    const { toast } = useToast();
    // 1. Obtenemos el usuario real logueado
    const user = usePage<any>().props.auth.user;

    // Formulario para datos básicos del perfil
    const {
        data: profileData,
        setData: setProfileData,
        put: updateProfile,
        processing: profileProcessing,
        errors: profileErrors,
    } = useForm({
        name: user.name,
        email: user.email,
    });

    // Formulario para contraseña (solo administradores)
    const {
        data: passwordData,
        setData: setPasswordData,
        put: updatePassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPasswordForm,
    } = useForm({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
    });

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();

        updateProfile("/perfil", {
            preserveScroll: true,
            onSuccess: () => {
                toast({
                    title: "✓ Perfil actualizado",
                    description: "Tus datos se han guardado correctamente.",
                });
            },
            onError: (errors) => {
                toast({
                    variant: "destructive",
                    title: "Error al actualizar perfil",
                    description:
                        errors.email ||
                        errors.name ||
                        "Ocurrió un error inesperado",
                });
            },
        });
    };

    const handleSavePassword = (e: React.FormEvent) => {
        e.preventDefault();

        // Verificación adicional en el frontend
        if (user.role !== "admin") {
            toast({
                variant: "destructive",
                title: "Acceso denegado",
                description: "Los vendedores no pueden cambiar su contraseña.",
            });
            return;
        }

        if (
            passwordData.new_password !== passwordData.new_password_confirmation
        ) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Las contraseñas no coinciden.",
            });
            return;
        }

        updatePassword("/perfil/password", {
            preserveScroll: true,
            onSuccess: () => {
                resetPasswordForm();
                toast({
                    title: "✓ Contraseña actualizada",
                    description: "Tu contraseña se ha cambiado correctamente.",
                });
            },
            onError: (errors) => {
                toast({
                    variant: "destructive",
                    title: "Error al cambiar contraseña",
                    description:
                        errors.current_password ||
                        errors.new_password ||
                        "Ocurrió un error",
                });
            },
        });
    };

    return (
        <MainLayout>
            <Head title="Mi Perfil" />
            <div className="flex flex-col min-h-screen">
                <Header
                    title="Mi Perfil"
                    subtitle="Gestiona tu información personal"
                />

                <main className="flex-1 p-6">
                    <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
                        {/* COLUMNA IZQUIERDA: Tarjeta de Identidad */}
                        <div className="md:col-span-1 space-y-6">
                            <Card>
                                <CardHeader className="text-center">
                                    <div className="flex justify-center mb-4">
                                        {/* Usamos las iniciales porque no hay columna 'avatar' en BD todavía */}
                                        <Avatar className="w-24 h-24">
                                            <AvatarFallback className="text-3xl bg-primary text-primary-foreground font-bold">
                                                {user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <CardTitle>{user.name}</CardTitle>
                                    <CardDescription className="uppercase font-mono text-xs mt-1">
                                        {user.role}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                                            <Shield className="w-4 h-4 text-primary" />
                                            <div className="text-sm">
                                                <p className="font-medium">
                                                    Nivel de Acceso
                                                </p>
                                                <p className="text-muted-foreground capitalize">
                                                    {user.role === "admin"
                                                        ? "Administrador"
                                                        : "Vendedor"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Mostrar permisos si existen (Array cast en User.php) */}
                                        {user.permissions &&
                                            user.permissions.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-semibold text-muted-foreground">
                                                        Permisos activos:
                                                    </p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.permissions.map(
                                                            (perm: string) => (
                                                                <Badge
                                                                    key={perm}
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    {perm}
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* COLUMNA DERECHA: Formulario de Edición */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Formulario de Información Básica */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información de Cuenta</CardTitle>
                                    <CardDescription>
                                        {user.role === "admin"
                                            ? "Actualiza tus datos básicos"
                                            : "Visualiza tu información de cuenta"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form
                                        onSubmit={handleSaveProfile}
                                        className="space-y-4"
                                    >
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="nombre">
                                                    Nombre completo
                                                </Label>
                                                <Input
                                                    id="nombre"
                                                    value={profileData.name}
                                                    onChange={(e) =>
                                                        setProfileData(
                                                            "name",
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={
                                                        user.role !== "admin"
                                                    }
                                                    className={
                                                        user.role !== "admin"
                                                            ? "bg-muted text-muted-foreground"
                                                            : ""
                                                    }
                                                />
                                                {profileErrors.name && (
                                                    <p className="text-sm text-destructive">
                                                        {profileErrors.name}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">
                                                    Correo electrónico
                                                </Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) =>
                                                        setProfileData(
                                                            "email",
                                                            e.target.value
                                                        )
                                                    }
                                                    disabled={
                                                        user.role !== "admin"
                                                    }
                                                    className={
                                                        user.role !== "admin"
                                                            ? "bg-muted text-muted-foreground"
                                                            : ""
                                                    }
                                                />
                                                {profileErrors.email && (
                                                    <p className="text-sm text-destructive">
                                                        {profileErrors.email}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Rol del Sistema</Label>
                                            <Input
                                                value={
                                                    user.role === "admin"
                                                        ? "Administrador"
                                                        : "Vendedor"
                                                }
                                                disabled
                                                className="bg-muted text-muted-foreground font-semibold"
                                            />
                                            <p className="text-[0.8rem] text-muted-foreground">
                                                * Contacte a un administrador
                                                para cambiar su rol o permisos.
                                            </p>
                                        </div>

                                        {user.role !== "admin" && (
                                            <Alert
                                                variant="default"
                                                className="border-blue-200 bg-blue-50"
                                            >
                                                <AlertTriangle className="h-4 w-4 text-blue-600" />
                                                <AlertDescription className="text-blue-800">
                                                    Como vendedor, tu
                                                    información de perfil es de
                                                    solo lectura. Contacta a un
                                                    administrador si necesitas
                                                    modificar tus datos.
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {user.role === "admin" && (
                                            <div className="flex justify-end pt-4">
                                                <Button
                                                    type="submit"
                                                    size="lg"
                                                    className="gap-2"
                                                    disabled={profileProcessing}
                                                >
                                                    <Save className="w-4 h-4" />
                                                    {profileProcessing
                                                        ? "Guardando..."
                                                        : "Guardar cambios"}
                                                </Button>
                                            </div>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Formulario de Contraseña (Solo para Administradores) */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="w-5 h-5" /> Seguridad
                                    </CardTitle>
                                    <CardDescription>
                                        Cambiar contraseña de acceso
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {user.role !== "admin" ? (
                                        <Alert
                                            variant="default"
                                            className="border-amber-200 bg-amber-50"
                                        >
                                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                                            <AlertDescription className="text-amber-800">
                                                Como vendedor, no puedes cambiar
                                                tu contraseña. Por favor,
                                                contacta a un administrador si
                                                necesitas modificarla.
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <form
                                            onSubmit={handleSavePassword}
                                            className="space-y-4"
                                        >
                                            <div className="space-y-2">
                                                <Label htmlFor="current-password">
                                                    Contraseña actual
                                                </Label>
                                                <Input
                                                    id="current-password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={
                                                        passwordData.current_password
                                                    }
                                                    onChange={(e) =>
                                                        setPasswordData(
                                                            "current_password",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                                {passwordErrors.current_password && (
                                                    <p className="text-sm text-destructive">
                                                        {
                                                            passwordErrors.current_password
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="new-password">
                                                        Nueva contraseña
                                                    </Label>
                                                    <Input
                                                        id="new-password"
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={
                                                            passwordData.new_password
                                                        }
                                                        onChange={(e) =>
                                                            setPasswordData(
                                                                "new_password",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="confirm-password">
                                                        Confirmar contraseña
                                                    </Label>
                                                    <Input
                                                        id="confirm-password"
                                                        type="password"
                                                        placeholder="••••••••"
                                                        value={
                                                            passwordData.new_password_confirmation
                                                        }
                                                        onChange={(e) =>
                                                            setPasswordData(
                                                                "new_password_confirmation",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            {passwordErrors.new_password && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        passwordErrors.new_password
                                                    }
                                                </p>
                                            )}

                                            <div className="flex justify-end pt-4">
                                                <Button
                                                    type="submit"
                                                    size="lg"
                                                    className="gap-2"
                                                    disabled={
                                                        passwordProcessing
                                                    }
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    {passwordProcessing
                                                        ? "Actualizando..."
                                                        : "Cambiar contraseña"}
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}
