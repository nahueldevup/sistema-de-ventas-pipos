import { useState, useRef } from "react";
import { Header } from "@/Components/Header";
import { Button } from "@/Components/ui/button";
import {
    ArrowUpCircle,
    ArrowDownCircle,
    Wallet,
    Landmark,
    Calculator,
    TrendingUp,
    Save,
    Printer,
    History,
    Trash2,
    CalendarClock,
    CreditCard,
    Eye,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/Components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Badge } from "@/Components/ui/badge";
import MainLayout from "@/Layouts/MainLayout";
import { Head, router } from "@inertiajs/react";
import { useToast } from "@/Hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { ReporteCaja, ReporteCajaData } from "@/Components/ReporteCaja";
import { useReactToPrint } from "react-to-print";
import axios from "axios";

// --- Interfaces ---
interface Movement {
    id: number;
    amount: number;
    description: string;
    type: "ingreso" | "egreso";
    created_at: string;
    user: { name: string };
}

interface CashCount {
    id: number;
    expected_cash: number;
    counted_cash: number;
    difference: number;
    created_at: string;
    user: { name: string };
    notes?: string;
}

interface Summary {
    sales_cash: number;
    sales_digital: number;
    manual_incomes: number;
    manual_expenses: number;
    expected_cash: number;
    total_sales_day: number;
}

interface Props {
    movements: Movement[];
    summary: Summary;
    history: CashCount[];
}

// --- Componente Tarjeta ---
function StatCard({ title, value, icon: Icon, colorClass, subtext }: any) {
    return (
        <div className="bg-card p-6 rounded-xl border shadow-sm flex items-start justify-between transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-default">
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                    {title}
                </p>
                <h3 className={`text-2xl font-bold ${colorClass}`}>
                    $ {Number(value).toFixed(2)}
                </h3>
                {subtext && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {subtext}
                    </p>
                )}
            </div>
            <div
                className={`p-3 rounded-lg transition-transform duration-200 hover:scale-110 ${
                    colorClass
                        .replace("text-", "bg-")
                        .replace("600", "100 dark:bg-") +
                    " dark:" +
                    colorClass.replace("600", "900/20")
                }`}
            >
                <Icon className={`w-6 h-6 ${colorClass}`} />
            </div>
        </div>
    );
}

export default function Caja({ movements, summary, history }: Props) {
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isCierreOpen, setIsCierreOpen] = useState(false);
    const [isReporteOpen, setIsReporteOpen] = useState(false);
    const [movementType, setMovementType] = useState<"ingreso" | "egreso">(
        "ingreso"
    );
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedMovementId, setSelectedMovementId] = useState<number | null>(
        null
    );

    const [formData, setFormData] = useState({ amount: "", description: "" });
    const [arqueoData, setArqueoData] = useState({
        counted_cash: "",
        notes: "",
    });

    const [liveSummary, setLiveSummary] = useState<Summary>(
        summary || {
            sales_cash: 0,
            sales_digital: 0,
            manual_incomes: 0,
            manual_expenses: 0,
            expected_cash: 0,
            total_sales_day: 0,
        }
    );

    const reporteRef = useRef<HTMLDivElement>(null);

    const handleSaveMovement = () => {
        if (!formData.amount || !formData.description) return;
        router.post(
            "/caja",
            { ...formData, type: movementType },
            {
                onSuccess: () => {
                    toast({
                        title:
                            movementType === "ingreso"
                                ? "Ingreso registrado"
                                : "Egreso registrado",
                        className:
                            movementType === "ingreso"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white",
                    });
                    setIsDialogOpen(false);
                    setFormData({ amount: "", description: "" });
                },
            }
        );
    };

    const handleSaveCierre = () => {
        if (!arqueoData.counted_cash) {
            toast({
                title: "Ingrese el monto contado",
                variant: "destructive",
            });
            return;
        }

        router.post("/caja/cierre", arqueoData, {
            onSuccess: () => {
                toast({
                    title: "Cierre guardado correctamente",
                    className: "bg-blue-600 text-white",
                });
                setIsCierreOpen(false);
                setArqueoData({ counted_cash: "", notes: "" });
            },
        });
    };

    const handleDelete = (id: number) => {
        setSelectedMovementId(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = () => {
        if (selectedMovementId) {
            router.delete(`/caja/${selectedMovementId}`, {
                onSuccess: () => {
                    toast({ title: "Movimiento eliminado" });
                    setIsDeleteDialogOpen(false);
                    setSelectedMovementId(null);
                },
            });
        }
    };

    const handleOpenCierre = async () => {
        try {
            const response = await axios.get("/caja/cierre");
            if (response.data && typeof response.data === "object") {
                setLiveSummary(response.data);
                setIsCierreOpen(true);
            }
        } catch (error) {
            toast({
                title: "Error al actualizar datos",
                variant: "destructive",
            });
            setIsCierreOpen(true);
        }
    };

    const difference =
        Number(arqueoData.counted_cash || 0) - liveSummary.expected_cash;

    // Preparar datos para el reporte
    const reporteData: ReporteCajaData = {
        fecha: new Date().toLocaleString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }),
        usuario: "Usuario Actual", // Esto debería venir de auth
        sales_cash: liveSummary.sales_cash,
        sales_digital: liveSummary.sales_digital,
        manual_incomes: liveSummary.manual_incomes,
        manual_expenses: liveSummary.manual_expenses,
        expected_cash: liveSummary.expected_cash,
        counted_cash: Number(arqueoData.counted_cash || 0),
        difference: difference,
        notes: arqueoData.notes,
        movements: movements,
    };

    // Configurar el hook de impresión
    const handlePrint = useReactToPrint({
        contentRef: reporteRef,
        documentTitle: `Reporte-Caja-${new Date().toLocaleDateString()}`,
        onAfterPrint: () => console.log("Impresión finalizada"),
        onPrintError: (error) => console.error("Error al imprimir:", error),
    });

    // Función para ejecutar la impresión
    const triggerPrint = () => {
        if (!reporteRef.current) {
            console.error("El contenido del reporte no está disponible");
            toast({
                title: "Error",
                description: "El reporte no está listo para imprimir",
                variant: "destructive",
            });
            return;
        }
        handlePrint();
    };

    return (
        <MainLayout>
            <Head title="Caja" />
            <div className="flex-1 flex flex-col h-full bg-background">
                <Header
                    title="Caja"
                    subtitle="Gestión de efectivo, gastos y cierres de caja."
                />

                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* TARJETAS SUPERIORES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="En Cajón (Efectivo)"
                                value={liveSummary.expected_cash}
                                icon={Wallet}
                                colorClass="text-emerald-600"
                                subtext="Ventas Efec. + Ingresos - Egresos"
                            />
                            <StatCard
                                title="Bancos (Digital)"
                                value={liveSummary.sales_digital}
                                icon={Landmark}
                                colorClass="text-blue-600"
                                subtext="Transferencias y Tarjetas"
                            />
                            <StatCard
                                title="Venta Total del Día"
                                value={liveSummary.total_sales_day}
                                icon={TrendingUp}
                                colorClass="text-indigo-600"
                                subtext="Suma de todos los métodos"
                            />
                            <StatCard
                                title="Gastos / Retiros"
                                value={liveSummary.manual_expenses}
                                icon={ArrowDownCircle}
                                colorClass="text-rose-600"
                                subtext="Salidas manuales de caja"
                            />
                        </div>

                        {/* BOTONERA */}
                        <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                            <Button
                                onClick={() => {
                                    setMovementType("ingreso");
                                    setIsDialogOpen(true);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 shadow-md text-white px-6 py-6 h-auto text-base flex gap-3 transition-all duration-200 hover:scale-105"
                            >
                                <ArrowUpCircle className="w-6 h-6" /> Registrar
                                Ingreso
                            </Button>
                            <Button
                                onClick={() => {
                                    setMovementType("egreso");
                                    setIsDialogOpen(true);
                                }}
                                className="bg-rose-600 hover:bg-rose-700 shadow-md text-white px-6 py-6 h-auto text-base flex gap-3 transition-all duration-200 hover:scale-105"
                            >
                                <ArrowDownCircle className="w-6 h-6" />{" "}
                                Registrar Gasto/Retiro
                            </Button>
                            <Button
                                onClick={handleOpenCierre}
                                variant="ghost"
                                className="sm:ml-auto border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-400 active:text-blue-700 dark:active:text-blue-400 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm px-6 py-6 h-auto text-base flex gap-3 transition-all duration-200 hover:scale-105"
                            >
                                <Calculator className="w-6 h-6" /> Realizar
                                Cierre de Caja
                            </Button>
                        </div>

                        {/* PESTAÑAS */}
                        <Tabs defaultValue="movimientos" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                                <TabsTrigger value="movimientos">
                                    Movimientos del Día
                                </TabsTrigger>
                                <TabsTrigger value="historial">
                                    Historial de Cierres
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="movimientos">
                                <div className="bg-card rounded-xl border shadow-sm overflow-hidden mt-4">
                                    <div className="p-4 border-b bg-muted flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <History className="w-5 h-5 text-muted-foreground" />
                                            <h3 className="font-bold text-foreground">
                                                Movimientos Manuales (Hoy)
                                            </h3>
                                        </div>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Hora</TableHead>
                                                <TableHead>Tipo</TableHead>
                                                <TableHead>
                                                    Descripción
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Monto
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    Opciones
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {movements.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        className="text-center py-10 text-gray-400"
                                                    >
                                                        Sin movimientos hoy
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                movements.map((mov) => (
                                                    <TableRow key={mov.id}>
                                                        <TableCell>
                                                            {new Date(
                                                                mov.created_at
                                                            ).toLocaleTimeString(
                                                                [],
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant={
                                                                    mov.type ===
                                                                    "ingreso"
                                                                        ? "default"
                                                                        : "destructive"
                                                                }
                                                                className={
                                                                    mov.type ===
                                                                    "ingreso"
                                                                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"
                                                                        : "bg-rose-100 text-rose-800 hover:bg-rose-100"
                                                                }
                                                            >
                                                                {mov.type.toUpperCase()}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {mov.description}
                                                        </TableCell>
                                                        <TableCell
                                                            className={`text-right font-bold ${
                                                                mov.type ===
                                                                "ingreso"
                                                                    ? "text-emerald-600"
                                                                    : "text-rose-600"
                                                            }`}
                                                        >
                                                            {mov.type ===
                                                            "ingreso"
                                                                ? "+"
                                                                : "-"}{" "}
                                                            ${" "}
                                                            {Number(
                                                                mov.amount
                                                            ).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 w-8 p-0"
                                                                title="Eliminar movimiento"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        mov.id
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 className="w-4 h-4 text-destructive" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>

                            <TabsContent value="historial">
                                <div className="bg-card rounded-xl border shadow-sm overflow-hidden mt-4">
                                    <div className="p-4 border-b bg-muted flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <CalendarClock className="w-5 h-5 text-muted-foreground" />
                                            <h3 className="font-bold text-foreground">
                                                Reportes Guardados
                                            </h3>
                                        </div>
                                    </div>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Fecha</TableHead>
                                                <TableHead>Usuario</TableHead>
                                                <TableHead>Esperado</TableHead>
                                                <TableHead>Contado</TableHead>
                                                <TableHead>
                                                    Diferencia
                                                </TableHead>
                                                <TableHead>Notas</TableHead>
                                                <TableHead className="text-center">
                                                    Opciones
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {!history ||
                                            history.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={6}
                                                        className="text-center py-10 text-gray-400"
                                                    >
                                                        No hay cierres guardados
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                history.map((cierre) => (
                                                    <TableRow key={cierre.id}>
                                                        <TableCell>
                                                            {new Date(
                                                                cierre.created_at
                                                            ).toLocaleDateString()}{" "}
                                                            {new Date(
                                                                cierre.created_at
                                                            ).toLocaleTimeString(
                                                                [],
                                                                {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {cierre.user?.name}
                                                        </TableCell>
                                                        <TableCell>
                                                            ${" "}
                                                            {Number(
                                                                cierre.expected_cash
                                                            ).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell className="font-bold">
                                                            ${" "}
                                                            {Number(
                                                                cierre.counted_cash
                                                            ).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge
                                                                variant="outline"
                                                                className={`${
                                                                    Number(
                                                                        cierre.difference
                                                                    ) === 0
                                                                        ? "text-green-600 border-green-200 bg-green-50"
                                                                        : Number(
                                                                              cierre.difference
                                                                          ) > 0
                                                                        ? "text-blue-600 border-blue-200 bg-blue-50"
                                                                        : "text-red-600 border-red-200 bg-red-50"
                                                                }`}
                                                            >
                                                                ${" "}
                                                                {Number(
                                                                    cierre.difference
                                                                ).toFixed(2)}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-gray-500 italic text-sm truncate max-w-[200px]">
                                                            {cierre.notes ||
                                                                "-"}
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                title="Ver historial de cierre"
                                                                asChild
                                                            >
                                                                {/* Usamos asChild para que el botón se comporte como Link de Inertia */}
                                                                <a
                                                                    href={`/caja/historial/${cierre.id}`}
                                                                >
                                                                    <Eye className="w-4 h-4 text-blue-600" />
                                                                </a>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </main>

                {/* --- MODALES --- */}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    {/* ... Modal Ingreso/Egreso (Sin cambios) ... */}
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>
                                {movementType === "ingreso"
                                    ? "Registrar Entrada"
                                    : "Registrar Salida"}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Monto</Label>
                                <Input
                                    type="number"
                                    className="pl-4 text-lg font-bold"
                                    placeholder="Ej: 500.00"
                                    value={formData.amount}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            amount: e.target.value,
                                        })
                                    }
                                    autoFocus
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Descripción</Label>
                                <Textarea
                                    placeholder="Ej: Pago de proveedor, venta extra, etc."
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSaveMovement}
                                className={
                                    movementType === "ingreso"
                                        ? "bg-emerald-600"
                                        : "bg-rose-600"
                                }
                            >
                                Guardar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* 2. Modal de Cierre/Arqueo (CORREGIDO) */}
                <Dialog open={isCierreOpen} onOpenChange={setIsCierreOpen}>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>Arqueo y Cierre de Caja</DialogTitle>
                            <DialogDescription>
                                Verifique los montos antes de guardar.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                            {/* LADO IZQUIERDO: SISTEMA */}
                            <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                                <h4 className="font-bold text-foreground flex items-center gap-2 text-lg mb-4">
                                    <Calculator className="w-6 h-6 text-blue-600" />
                                    Datos del Sistema
                                </h4>
                                {/* --- BLOQUE DIGITAL --- */}
                                <div className="bg-card p-4 rounded-lg border space-y-3">
                                    <h4 className="font-bold text-foreground flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-blue-600" />{" "}
                                        Digital (Banco)
                                    </h4>
                                    <div className="flex justify-between text-sm">
                                        <span>Transferencias/Tarjetas:</span>
                                        <span className="font-bold text-blue-600">
                                            ${" "}
                                            {liveSummary.sales_digital.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground italic">
                                        Este dinero debe estar en tu cuenta
                                        bancaria.
                                    </p>
                                </div>
                                {/* ----------------------------------------------- */}

                                <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900 space-y-3">
                                    <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                                        <Wallet className="w-5 h-5" /> Efectivo
                                        Esperado
                                    </h4>
                                    <div className="flex justify-between text-sm">
                                        <span>Ventas Efectivo:</span>
                                        <span>
                                            ${" "}
                                            {liveSummary.sales_cash.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>+ Ingresos:</span>
                                        <span>
                                            ${" "}
                                            {liveSummary.manual_incomes.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-red-600">
                                        <span>- Egresos:</span>
                                        <span>
                                            ${" "}
                                            {liveSummary.manual_expenses.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900 flex justify-between font-bold text-lg text-emerald-900 dark:text-emerald-200">
                                        <span>Total en Cajón:</span>
                                        <span>
                                            ${" "}
                                            {liveSummary.expected_cash.toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* LADO DERECHO: USUARIO */}
                            <div className="space-y-4 border-l-2 pl-8 border-dashed border-border">
                                <h4 className="font-bold text-foreground flex items-center gap-2 text-lg mb-4">
                                    <Calculator className="w-6 h-6 text-amber-600" />
                                    Conteo Físico
                                </h4>
                                <div className="space-y-2">
                                    <Label>¿Cuánto efectivo hay?</Label>
                                    <Input
                                        type="number"
                                        className="pl-4 text-xl font-bold bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-900"
                                        placeholder="0.00"
                                        value={arqueoData.counted_cash}
                                        onChange={(e) =>
                                            setArqueoData({
                                                ...arqueoData,
                                                counted_cash: e.target.value,
                                            })
                                        }
                                        autoFocus
                                    />
                                </div>
                                {arqueoData.counted_cash && (
                                    <div
                                        className={`p-4 rounded-lg text-center border-2 animate-in fade-in zoom-in-95 duration-300 ${
                                            difference === 0
                                                ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 text-green-700 dark:text-green-300"
                                                : difference > 0
                                                ? "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300"
                                                : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 text-red-700 dark:text-red-300"
                                        }`}
                                    >
                                        <p className="text-sm font-semibold uppercase tracking-wider mb-1">
                                            {difference === 0
                                                ? "Cuadre Perfecto"
                                                : difference > 0
                                                ? "Sobrante"
                                                : "Faltante"}
                                        </p>
                                        <p className="text-2xl font-bold">
                                            $ {Math.abs(difference).toFixed(2)}
                                        </p>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label>Notas</Label>
                                    <Textarea
                                        placeholder="Observaciones..."
                                        value={arqueoData.notes}
                                        onChange={(e) =>
                                            setArqueoData({
                                                ...arqueoData,
                                                notes: e.target.value,
                                            })
                                        }
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex justify-between sm:justify-between w-full">
                            <Button
                                variant="ghost"
                                onClick={() => setIsCierreOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsReporteOpen(true)}
                                    className="gap-2"
                                >
                                    <Printer className="w-4 h-4" /> Vista Previa
                                </Button>
                                {/* BOTÓN GUARDAR */}
                                <Button
                                    onClick={handleSaveCierre}
                                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md"
                                >
                                    <Save className="w-4 h-4" /> Guardar Cierre
                                </Button>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* AlertDialog Eliminar Movimiento */}
                <AlertDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                ¿Eliminar movimiento?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. El movimiento
                                será eliminado permanentemente.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setIsDeleteDialogOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={confirmDelete}
                            >
                                Eliminar
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* MODAL DE REPORTE */}
                <Dialog open={isReporteOpen} onOpenChange={setIsReporteOpen}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Vista Previa del Reporte</DialogTitle>
                        </DialogHeader>

                        <div className="bg-gray-100 p-4 rounded-md flex justify-center">
                            <ReporteCaja ref={reporteRef} data={reporteData} />
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <Button
                                variant="outline"
                                onClick={() => setIsReporteOpen(false)}
                            >
                                Cerrar
                            </Button>
                            <Button onClick={triggerPrint}>
                                <Printer className="w-4 h-4 mr-2" /> Imprimir
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
