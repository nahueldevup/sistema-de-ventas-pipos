import { Header } from "@/Components/Header";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
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
    ArrowLeft,
    Printer,
    Wallet,
    CreditCard,
    ArrowUpCircle,
    ArrowDownCircle,
    Loader2,
} from "lucide-react";
import MainLayout from "@/Layouts/MainLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { ReporteCaja, ReporteCajaData } from "@/Components/ReporteCaja";
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";

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
    created_at: string;
    user: { name: string };

    // Totales guardados
    sales_cash: number;
    sales_digital: number;
    manual_incomes: number;
    manual_expenses: number;
    expected_cash: number;
    counted_cash: number;
    difference: number;
    notes?: string;
}

interface Props {
    cierre: CashCount;
    movements: Movement[];
}

export default function CajaDetalle({ cierre, movements }: Props) {
    const [isReporteOpen, setIsReporteOpen] = useState(false);
    const reporteRef = useRef<HTMLDivElement>(null);

    const formatDate = (date: string) =>
        new Date(date).toLocaleString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    // Convertir datos al formato ReporteCajaData
    const reporteData: ReporteCajaData = {
        fecha: formatDate(cierre.created_at),
        usuario: cierre.user.name,
        sales_cash: cierre.sales_cash,
        sales_digital: cierre.sales_digital,
        manual_incomes: cierre.manual_incomes,
        manual_expenses: cierre.manual_expenses,
        expected_cash: cierre.expected_cash,
        counted_cash: cierre.counted_cash,
        difference: cierre.difference,
        notes: cierre.notes,
        movements: movements,
    };

    // Configurar el hook de impresión
    const handlePrint = useReactToPrint({
        contentRef: reporteRef,
        documentTitle: `Reporte-Caja-${cierre.id}`,
        onAfterPrint: () => console.log("Impresión finalizada"),
        onPrintError: (error) => console.error("Error al imprimir:", error),
    });

    // Función para abrir el modal y preparar la impresión
    const openPrintModal = () => {
        setIsReporteOpen(true);
    };

    // Función para ejecutar la impresión
    const triggerPrint = () => {
        if (!reporteRef.current) {
            console.error("El contenido del reporte no está disponible");
            return;
        }
        handlePrint();
    };

    return (
        <MainLayout>
            <Head title={`Cierre #${cierre.id}`} />
            <div className="flex-1 flex flex-col h-full bg-background">
                <Header
                    title={`Detalle de Cierre #${cierre.id}`}
                    subtitle={formatDate(cierre.created_at)}
                />

                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-5xl mx-auto space-y-6">
                        {/* Botonera Superior */}
                        <div className="flex justify-between items-center print:hidden">
                            <Link href="/caja">
                                <Button variant="outline" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Volver a
                                    Caja
                                </Button>
                            </Link>
                            <Button
                                onClick={openPrintModal}
                                className="gap-3 transition-all duration-200 hover:scale-105"
                            >
                                <Printer className="w-6 h-6" /> Imprimir Reporte
                            </Button>
                        </div>

                        {/* 1. RESUMEN DEL ARQUEO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Panel Izquierdo: Datos del Sistema */}
                            <Card>
                                <CardHeader className="bg-muted/50 border-b pb-3">
                                    <CardTitle className="text-base font-bold text-foreground">
                                        Resumen del Sistema
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-3">
                                    <div className="flex justify-between items-center p-2 bg-emerald-50 dark:bg-emerald-950/20 rounded border border-emerald-100 dark:border-emerald-900">
                                        <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                                            <Wallet className="w-4 h-4" />{" "}
                                            Ventas Efectivo
                                        </span>
                                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                                            ${" "}
                                            {Number(cierre.sales_cash).toFixed(
                                                2
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-100 dark:border-blue-900">
                                        <span className="text-sm font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                                            <CreditCard className="w-4 h-4" />{" "}
                                            Ventas Digitales
                                        </span>
                                        <span className="font-bold text-blue-700 dark:text-blue-400">
                                            ${" "}
                                            {Number(
                                                cierre.sales_digital
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Ingresos Manuales
                                            </p>
                                            <p className="text-green-600 font-bold flex items-center gap-1">
                                                <ArrowUpCircle className="w-3 h-3" />{" "}
                                                ${" "}
                                                {Number(
                                                    cierre.manual_incomes
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground">
                                                Egresos Manuales
                                            </p>
                                            <p className="text-red-600 font-bold flex items-center gap-1">
                                                <ArrowDownCircle className="w-3 h-3" />{" "}
                                                ${" "}
                                                {Number(
                                                    cierre.manual_expenses
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t mt-2 flex justify-between items-center">
                                        <span className="font-bold text-foreground">
                                            Esperado en Cajón:
                                        </span>
                                        <span className="text-xl font-bold text-foreground">
                                            ${" "}
                                            {Number(
                                                cierre.expected_cash
                                            ).toFixed(2)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Panel Derecho: Resultado del Cierre */}
                            <Card className="border-2 border-border">
                                <CardHeader className="bg-muted/50 border-b pb-3">
                                    <CardTitle className="text-base font-bold text-foreground">
                                        Resultado del Arqueo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">
                                            Usuario Responsable:
                                        </span>
                                        <span className="font-medium">
                                            {cierre.user.name}
                                        </span>
                                    </div>

                                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg text-center">
                                        <p className="text-sm text-yellow-800 dark:text-yellow-300 uppercase tracking-wide font-semibold">
                                            Dinero Contado
                                        </p>
                                        <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-200">
                                            ${" "}
                                            {Number(
                                                cierre.counted_cash
                                            ).toFixed(2)}
                                        </p>
                                    </div>

                                    <div
                                        className={`p-3 rounded text-center border font-bold ${
                                            Number(cierre.difference) === 0
                                                ? "bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-900"
                                                : Number(cierre.difference) > 0
                                                ? "bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900"
                                                : "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900"
                                        }`}
                                    >
                                        {Number(cierre.difference) === 0
                                            ? "Balance Perfecto"
                                            : Number(cierre.difference) > 0
                                            ? `Sobrante: $ ${Number(
                                                  cierre.difference
                                              ).toFixed(2)}`
                                            : `Faltante: $ ${Math.abs(
                                                  Number(cierre.difference)
                                              ).toFixed(2)}`}
                                    </div>

                                    {cierre.notes && (
                                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded italic">
                                            " {cierre.notes} "
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* 2. DETALLE DE MOVIMIENTOS DEL DÍA */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Detalle de Movimientos Manuales
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Hora</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Descripción</TableHead>
                                            <TableHead>Usuario</TableHead>
                                            <TableHead className="text-right">
                                                Monto
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {movements.length === 0 ? (
                                            <TableRow>
                                                <TableCell
                                                    colSpan={5}
                                                    className="text-center py-8 text-gray-400"
                                                >
                                                    No hubo movimientos manuales
                                                    ese día
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
                                                    <TableCell>
                                                        {mov.user.name}
                                                    </TableCell>
                                                    <TableCell
                                                        className={`text-right font-bold ${
                                                            mov.type ===
                                                            "ingreso"
                                                                ? "text-emerald-600"
                                                                : "text-rose-600"
                                                        }`}
                                                    >
                                                        {mov.type === "ingreso"
                                                            ? "+"
                                                            : "-"}{" "}
                                                        ${" "}
                                                        {Number(
                                                            mov.amount
                                                        ).toFixed(2)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* MODAL DE REPORTE */}
            <Dialog open={isReporteOpen} onOpenChange={setIsReporteOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Vista Previa del Reporte</DialogTitle>
                    </DialogHeader>

                    <div className="bg-muted p-4 rounded-md flex justify-center">
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
        </MainLayout>
    );
}
