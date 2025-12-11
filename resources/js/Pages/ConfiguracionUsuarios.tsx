import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";
import {
    UserPlus,
    Pencil,
    Trash2,
    Key,
    Power,
    ShieldCheck,
    User,
    Shield,
} from "lucide-react";
import { toast } from "sonner";

interface User {
    id: number;
    name: string;
    email: string;
    role: "admin" | "vendedor";
    active: boolean;
    permissions: string[] | null;
    created_at: string;
}

interface Props {
    users: User[];
}

export default function Usuarios({ users }: Props) {
    // Estados para modales
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    // --- FORMULARIOS ---
    const [createForm, setCreateForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "vendedor" as "admin" | "vendedor",
    });

    const [editForm, setEditForm] = useState({
        name: "",
        email: "",
        role: "vendedor" as "admin" | "vendedor",
    });

    const [passwordForm, setPasswordForm] = useState({
        password: "",
        password_confirmation: "",
    });

    const [permissionsForm, setPermissionsForm] = useState<string[]>([]);

    const availablePermissions = [
        { value: "inicio", label: "Inicio" },
        { value: "vender", label: "Vender" },
        { value: "productos", label: "Productos" },
        { value: "clientes", label: "Clientes" },
        { value: "caja", label: "Caja" },
        { value: "reportes", label: "Reportes" },
        { value: "configuracion", label: "Configuración" },
    ];

    // --- HANDLERS (Lógica Original Mantenida) ---

    const handleCreateUser = (e: React.FormEvent) => {
        e.preventDefault();
        router.post("/configuracion/usuarios", createForm, {
            onSuccess: () => {
                setIsCreateOpen(false);
                setCreateForm({
                    name: "",
                    email: "",
                    password: "",
                    role: "vendedor",
                });
                toast.success("Usuario creado correctamente");
            },
            onError: (errors) =>
                toast.error(Object.values(errors)[0] as string),
        });
    };

    const handleEditUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        router.put(`/configuracion/usuarios/${selectedUser.id}`, editForm, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedUser(null);
                toast.success("Usuario actualizado");
            },
            onError: (errors) =>
                toast.error(Object.values(errors)[0] as string),
        });
    };

    const handleUpdatePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        router.put(
            `/configuracion/usuarios/${selectedUser.id}/password`,
            passwordForm,
            {
                onSuccess: () => {
                    setIsPasswordOpen(false);
                    setSelectedUser(null);
                    setPasswordForm({
                        password: "",
                        password_confirmation: "",
                    });
                    toast.success("Contraseña actualizada");
                },
                onError: (errors) =>
                    toast.error(Object.values(errors)[0] as string),
            }
        );
    };

    const handleToggleActive = (user: User) => {
        router.patch(
            `/configuracion/usuarios/${user.id}/toggle-active`,
            {},
            {
                onSuccess: () =>
                    toast.success(
                        `Usuario ${!user.active ? "activado" : "desactivado"}`
                    ),
                onError: (errors) =>
                    toast.error(Object.values(errors)[0] as string),
            }
        );
    };

    const handleDeleteUser = (userId: number) => {
        router.delete(`/configuracion/usuarios/${userId}`, {
            onSuccess: () => toast.success("Usuario eliminado"),
            onError: (errors) =>
                toast.error(Object.values(errors)[0] as string),
        });
    };

    // --- APERTURA DE MODALES ---
    const openEditDialog = (user: User) => {
        setSelectedUser(user);
        setEditForm({ name: user.name, email: user.email, role: user.role });
        setIsEditOpen(true);
    };

    const openPasswordDialog = (user: User) => {
        setSelectedUser(user);
        setPasswordForm({ password: "", password_confirmation: "" });
        setIsPasswordOpen(true);
    };

    const openPermissionsDialog = (user: User) => {
        setSelectedUser(user);
        setPermissionsForm(user.permissions || []);
        setIsPermissionsOpen(true);
    };

    const handleUpdatePermissions = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        router.put(
            `/configuracion/usuarios/${selectedUser.id}/permissions`,
            { permissions: permissionsForm },
            {
                onSuccess: () => {
                    setIsPermissionsOpen(false);
                    setSelectedUser(null);
                    toast.success("Permisos actualizados");
                },
                onError: (errors) =>
                    toast.error(Object.values(errors)[0] as string),
            }
        );
    };

    const togglePermission = (permission: string) => {
        setPermissionsForm((prev) =>
            prev.includes(permission)
                ? prev.filter((p) => p !== permission)
                : [...prev, permission]
        );
    };

    return (
        <MainLayout>
            <Head title="Empleados y Permisos" />

            <div className="flex-1 flex flex-col h-full bg-background">
                <Header
                    title="Empleados y Permisos"
                    subtitle="Controla quién accede a tu sistema y qué puede hacer."
                />

                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                        <Card className="border shadow-sm">
                            <CardHeader className="border-b bg-card pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle>
                                            Lista de Empleados
                                        </CardTitle>
                                        <CardDescription>
                                            {users.length}{" "}
                                            {users.length !== 1
                                                ? "usuarios registrados"
                                                : "usuario registrado"}
                                        </CardDescription>
                                    </div>
                                    <Dialog
                                        open={isCreateOpen}
                                        onOpenChange={setIsCreateOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button className="gap-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all duration-200 hover:scale-105">
                                                <UserPlus className="w-6 h-6" />
                                                Nuevo Usuario
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Crear Nuevo Usuario
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Agrega un nuevo empleado al
                                                    sistema
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="create-name">
                                                        Nombre Completo
                                                    </Label>
                                                    <Input
                                                        id="create-name"
                                                        value={createForm.name}
                                                        onChange={(e) =>
                                                            setCreateForm({
                                                                ...createForm,
                                                                name: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="Ej: Juan Pérez"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="create-email">
                                                        Correo Electrónico
                                                    </Label>
                                                    <Input
                                                        id="create-email"
                                                        type="email"
                                                        value={createForm.email}
                                                        onChange={(e) =>
                                                            setCreateForm({
                                                                ...createForm,
                                                                email: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="correo@ejemplo.com"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="create-password">
                                                        Contraseña
                                                    </Label>
                                                    <Input
                                                        id="create-password"
                                                        type="password"
                                                        value={
                                                            createForm.password
                                                        }
                                                        onChange={(e) =>
                                                            setCreateForm({
                                                                ...createForm,
                                                                password:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="Mínimo 8 caracteres"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="create-rol">
                                                        Rol del Usuario
                                                    </Label>
                                                    <Select
                                                        value={createForm.role}
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            setCreateForm({
                                                                ...createForm,
                                                                role: value as
                                                                    | "admin"
                                                                    | "vendedor",
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger id="create-rol">
                                                            <SelectValue placeholder="Seleccionar rol" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="admin">
                                                                <div className="flex items-center gap-2">
                                                                    <Shield className="w-4 h-4" />{" "}
                                                                    Administrador
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="vendedor">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="w-4 h-4" />{" "}
                                                                    Cajero/Vendedor
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button
                                                    onClick={handleCreateUser}
                                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Crear Usuario
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                                            <TableHead className="pl-6">
                                                Nombre
                                            </TableHead>
                                            <TableHead>Correo</TableHead>
                                            <TableHead>Rol</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right pr-6">
                                                Opciones
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="text-center py-10 text-muted-foreground"
                                                >
                                                    No hay usuarios registrados
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            users.map((user) => (
                                                <TableRow
                                                    key={user.id}
                                                    className="hover:bg-muted/50 transition-colors"
                                                >
                                                    <TableCell className="font-medium pl-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold text-sm">
                                                                {user.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>
                                                            <span className="text-foreground">
                                                                {user.name}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {user.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.role ===
                                                        "admin" ? (
                                                            <Badge className="bg-purple-500 hover:bg-purple-600 shadow-none">
                                                                <ShieldCheck className="w-3 h-3 mr-1" />{" "}
                                                                Administrador
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="secondary"
                                                                className="bg-muted text-foreground border-border hover:bg-accent shadow-none"
                                                            >
                                                                <User className="w-3 h-3 mr-1" />{" "}
                                                                Cajero
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {user.active ? (
                                                            <Badge className="bg-green-500 hover:bg-green-600 shadow-none">
                                                                Activo
                                                            </Badge>
                                                        ) : (
                                                            <Badge
                                                                variant="destructive"
                                                                className="shadow-none"
                                                            >
                                                                Inactivo
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() =>
                                                                    openEditDialog(
                                                                        user
                                                                    )
                                                                }
                                                                title="Editar usuario"
                                                            >
                                                                <Pencil className="w-4 h-4 text-blue-600" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() =>
                                                                    openPasswordDialog(
                                                                        user
                                                                    )
                                                                }
                                                                title="Cambiar contraseña"
                                                            >
                                                                <Key className="w-4 h-4 text-amber-600" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() =>
                                                                    openPermissionsDialog(
                                                                        user
                                                                    )
                                                                }
                                                                title="Gestionar permisos"
                                                            >
                                                                <Shield className="w-4 h-4 text-purple-600" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() =>
                                                                    handleToggleActive(
                                                                        user
                                                                    )
                                                                }
                                                                title={
                                                                    user.active
                                                                        ? "Desactivar"
                                                                        : "Activar"
                                                                }
                                                            >
                                                                <Power
                                                                    className={`w-4 h-4 ${
                                                                        user.active
                                                                            ? "text-green-500"
                                                                            : "text-gray-400"
                                                                    }`}
                                                                />
                                                            </Button>

                                                            <AlertDialog>
                                                                <AlertDialogTrigger
                                                                    asChild
                                                                >
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="h-8 w-8 p-0"
                                                                        title="Eliminar usuario"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>
                                                                            ¿Eliminar
                                                                            usuario?
                                                                        </AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            Estás
                                                                            a
                                                                            punto
                                                                            de
                                                                            eliminar
                                                                            a{" "}
                                                                            <strong>
                                                                                {
                                                                                    user.name
                                                                                }
                                                                            </strong>
                                                                            .
                                                                            Esta
                                                                            acción
                                                                            es
                                                                            irreversible.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>
                                                                            Cancelar
                                                                        </AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() =>
                                                                                handleDeleteUser(
                                                                                    user.id
                                                                                )
                                                                            }
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Eliminar
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>

                        {/* Dialog Editar - resto de diálogos sin cambios */}
                        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Editar Usuario</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Nombre</Label>
                                        <Input
                                            value={editForm.name}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    name: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Correo</Label>
                                        <Input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) =>
                                                setEditForm({
                                                    ...editForm,
                                                    email: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Rol</Label>
                                        <Select
                                            value={editForm.role}
                                            onValueChange={(val: any) =>
                                                setEditForm({
                                                    ...editForm,
                                                    role: val,
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="admin">
                                                    Administrador
                                                </SelectItem>
                                                <SelectItem value="vendedor">
                                                    Cajero
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        onClick={handleEditUser}
                                        className="w-full bg-blue-600"
                                    >
                                        Guardar Cambios
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog
                            open={isPasswordOpen}
                            onOpenChange={setIsPasswordOpen}
                        >
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Cambiar Contraseña
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Nueva Contraseña</Label>
                                        <Input
                                            type="password"
                                            value={passwordForm.password}
                                            onChange={(e) =>
                                                setPasswordForm({
                                                    ...passwordForm,
                                                    password: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Confirmar</Label>
                                        <Input
                                            type="password"
                                            value={
                                                passwordForm.password_confirmation
                                            }
                                            onChange={(e) =>
                                                setPasswordForm({
                                                    ...passwordForm,
                                                    password_confirmation:
                                                        e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <Button
                                        onClick={handleUpdatePassword}
                                        className="w-full bg-orange-600 hover:bg-orange-700"
                                    >
                                        Actualizar
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Dialog
                            open={isPermissionsOpen}
                            onOpenChange={setIsPermissionsOpen}
                        >
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>
                                        Permisos de Acceso
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="bg-muted p-4 rounded-lg space-y-2 max-h-60 overflow-y-auto">
                                        {availablePermissions.map((perm) => (
                                            <div
                                                key={perm.value}
                                                className="flex items-center space-x-3"
                                            >
                                                <input
                                                    type="checkbox"
                                                    id={`perm-${perm.value}`}
                                                    checked={permissionsForm.includes(
                                                        perm.value
                                                    )}
                                                    onChange={() =>
                                                        togglePermission(
                                                            perm.value
                                                        )
                                                    }
                                                    className="rounded border-gray-300 text-blue-600 w-4 h-4"
                                                />
                                                <label
                                                    htmlFor={`perm-${perm.value}`}
                                                    className="text-sm font-medium cursor-pointer select-none"
                                                >
                                                    {perm.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    <Button
                                        onClick={handleUpdatePermissions}
                                        className="w-full bg-blue-600"
                                    >
                                        Guardar Permisos
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}
