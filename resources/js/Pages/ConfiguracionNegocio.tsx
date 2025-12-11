import { useState, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
// import { useSidebarContext } from "@/Contexts/SidebarContext"; // No necesario con el Header estándar
import { Header } from "@/Components/Header"; // ✅ Header Estándar
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Building, Upload, Image as ImageIcon, Save } from "lucide-react";
import { toast } from "sonner";

interface BusinessSetting {
    id: number;
    business_name: string;
    tax_id: string | null;
    address: string | null;
    phone: string | null;
    email: string | null;
    logo_path: string | null;
}

interface Props {
    settings: BusinessSetting;
}

export default function ConfiguracionNegocio({ settings }: Props) {
    // const { toggleSidebar } = useSidebarContext(); // Eliminado para limpieza
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        business_name: settings.business_name || "",
        tax_id: settings.tax_id || "",
        address: settings.address || "",
        phone: settings.phone || "",
        email: settings.email || "",
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(
        settings.logo_path ? `/storage/${settings.logo_path}` : null
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.put("/configuracion/negocio", formData, {
            onSuccess: () => {
                toast.success("Configuración actualizada correctamente");
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError as string);
            },
        });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validar tipo
        if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
            toast.error("Solo se permiten imágenes JPG, JPEG o PNG");
            return;
        }

        // Validar tamaño (2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("La imagen no debe superar 2MB");
            return;
        }

        // Preview local
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Subir al servidor inmediatamente
        const formDataLogo = new FormData();
        formDataLogo.append("logo", file);

        router.post("/configuracion/negocio/logo", formDataLogo, {
            onSuccess: () => {
                toast.success("Logo actualizado correctamente");
                router.reload({ only: ["settings"] });
            },
            onError: (errors) => {
                const firstError = Object.values(errors)[0];
                toast.error(firstError as string);
                // Revertir preview si falla
                setLogoPreview(
                    settings.logo_path ? `/storage/${settings.logo_path}` : null
                );
            },
        });
    };

    return (
        <MainLayout>
            <Head title="Datos del Negocio" />

            {/* CONTENEDOR PRINCIPAL: Flex vertical y fondo gris suave */}
            <div className="flex-1 flex flex-col h-full bg-background">
                {/* 1. HEADER ESTÁNDAR */}
                <Header
                    title="Datos del Negocio"
                    subtitle="Configura tu logo y los datos que verán tus clientes en el ticket."
                />

                {/* 2. CONTENIDO SCROLLEABLE */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* COLUMNA IZQUIERDA: FORMULARIO */}
                            <div className="lg:col-span-2 space-y-6">
                                <Card className="border shadow-sm">
                                    <CardHeader className="border-b bg-card pb-4">
                                        <div className="flex items-center gap-3 text-blue-600 mb-1">
                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                <Building className="w-5 h-5" />
                                            </div>
                                            <CardTitle className="text-lg text-foreground">
                                                Información General
                                            </CardTitle>
                                        </div>
                                        <CardDescription>
                                            Estos datos son públicos en tus
                                            comprobantes.
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="pt-6">
                                        <form
                                            onSubmit={handleSubmit}
                                            className="space-y-5"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <Label htmlFor="business_name">
                                                        Nombre del Negocio *
                                                    </Label>
                                                    <Input
                                                        id="business_name"
                                                        value={
                                                            formData.business_name
                                                        }
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                business_name:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="Ej: Kiosco El Rincón"
                                                        required
                                                        className="bg-muted/50"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="tax_id">
                                                        CUIT / RUT
                                                    </Label>
                                                    <Input
                                                        id="tax_id"
                                                        value={formData.tax_id}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                tax_id: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="Ej: 20-12345678-9"
                                                        className="bg-muted/50"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="address">
                                                    Dirección Comercial
                                                </Label>
                                                <Textarea
                                                    id="address"
                                                    value={formData.address}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            address:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Ej: Av. Libertador 1234, Local 5"
                                                    rows={3}
                                                    className="bg-muted/50 resize-none"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">
                                                        Teléfono / WhatsApp
                                                    </Label>
                                                    <Input
                                                        id="phone"
                                                        value={formData.phone}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                phone: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="+54 11 ..."
                                                        className="bg-muted/50"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor="email">
                                                        Correo Electrónico
                                                    </Label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={(e) =>
                                                            setFormData({
                                                                ...formData,
                                                                email: e.target
                                                                    .value,
                                                            })
                                                        }
                                                        placeholder="contacto@negocio.com"
                                                        className="bg-muted/50"
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-4 flex justify-end">
                                                <Button
                                                    type="submit"
                                                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-md gap-3 transition-all duration-200 hover:scale-105"
                                                >
                                                    <Save className="w-6 h-6" />
                                                    Guardar Cambios
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* COLUMNA DERECHA: LOGO */}
                            <div className="lg:col-span-1">
                                <Card className="border shadow-sm h-full">
                                    <CardHeader className="border-b bg-card pb-4">
                                        <div className="flex items-center gap-3 text-purple-600 mb-1">
                                            <div className="p-2 bg-purple-50 rounded-lg">
                                                <ImageIcon className="w-5 h-5" />
                                            </div>
                                            <CardTitle className="text-lg text-foreground">
                                                Logo
                                            </CardTitle>
                                        </div>
                                        <CardDescription>
                                            Visible en ticket y sistema.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pt-6 flex flex-col items-center space-y-6">
                                        {/* Área de Preview */}
                                        <div
                                            className="relative group w-full aspect-square max-w-[250px] bg-muted rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden hover:border-ring transition-colors cursor-pointer"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            {logoPreview ? (
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo actual"
                                                    className="w-full h-full object-contain p-4"
                                                />
                                            ) : (
                                                <div className="text-center p-6 text-muted-foreground">
                                                    <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                    <p className="text-sm font-medium">
                                                        Clic para subir imagen
                                                    </p>
                                                    <p className="text-xs mt-1">
                                                        PNG, JPG (Máx 2MB)
                                                    </p>
                                                </div>
                                            )}

                                            {/* Overlay al hacer hover */}
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <p className="text-white font-medium flex items-center gap-2">
                                                    <Upload className="w-4 h-4" />{" "}
                                                    Cambiar
                                                </p>
                                            </div>
                                        </div>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png"
                                            onChange={handleLogoChange}
                                            className="hidden"
                                        />

                                        <div className="w-full">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full border-border hover:bg-accent"
                                                onClick={() =>
                                                    fileInputRef.current?.click()
                                                }
                                            >
                                                Seleccionar Archivo
                                            </Button>
                                            <p className="text-xs text-muted-foreground text-center mt-3">
                                                Recomendado: Formato cuadrado
                                                (500x500px)
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}
