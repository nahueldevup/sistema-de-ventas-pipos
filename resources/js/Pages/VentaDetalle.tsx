import { Head, router, usePage } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import { Header } from "@/Components/Header";
import { Button } from "@/Components/ui/button";
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    User,
    CreditCard,
    Receipt,
    Package,
    TrendingUp,
    Printer,
    Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Ticket, TicketData } from "@/Components/Ticket";
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";

interface Detalle {
    producto: string;
    codigo: string;
    cantidad: number;
    precio_unitario: number;
    costo: number;
    total: number;
    utilidad: number;
}

interface Cliente {
    nombre: string;
    telefono: string;
}

interface Venta {
    id: number;
    folio: string;
    fecha: string;
    cliente: Cliente | null;
    usuario: string;
    subtotal: number;
    impuestos: number;
    total: number;
    metodo_pago: string;
    monto_pagado: number;
    cambio: number;
    detalles: Detalle[];
}

interface Props {
    venta: Venta;
}

interface PageProps {
    businessSettings?: any;
    printerSettings?: any;
    [key: string]: any;
}

export default function VentaDetalle({ venta }: Props) {
    const { businessSettings, printerSettings } = usePage<PageProps>().props;
    const [isTicketOpen, setIsTicketOpen] = useState(false);
    const ticketRef = useRef<HTMLDivElement>(null);

    // Convertir los datos de la venta al formato TicketData
    const ticketData: TicketData = {
        folio: venta.folio,
        fecha: venta.fecha,
        cliente: venta.cliente?.nombre || "Público General",
        cajero: venta.usuario,
        items: venta.detalles.map((detalle) => ({
            descripcion: detalle.producto,
            cantidad: detalle.cantidad,
            precio: detalle.precio_unitario,
            total: detalle.total,
        })),
        subtotal: venta.subtotal,
        total: venta.total,
        pago: venta.monto_pagado,
        cambio: venta.cambio,
        metodo_pago: venta.metodo_pago,
    };

    const handleBack = () => {
        window.history.back();
    };

    // Configurar el hook de impresión
    const handlePrint = useReactToPrint({
        contentRef: ticketRef,
        documentTitle: `Ticket-${venta.folio}`,
        onAfterPrint: () => console.log("Impresión finalizada"),
        onPrintError: (error) => console.error("Error al imprimir:", error),
    });

    // Función para abrir el modal y preparar la impresión
    const openPrintModal = () => {
        setIsTicketOpen(true);
    };

    // Función para ejecutar la impresión
    const triggerPrint = () => {
        if (!ticketRef.current) {
            console.error("El contenido del ticket no está disponible");
            return;
        }
        handlePrint();
    };

    const getPaymentMethodBadge = (method: string) => {
        const colors: Record<string, string> = {
            efectivo: "bg-green-100 text-green-700 border-green-300",
            tarjeta: "bg-blue-100 text-blue-700 border-blue-300",
            transferencia: "bg-purple-100 text-purple-700 border-purple-300",
        };
        return colors[method] || "bg-gray-100 text-gray-700 border-gray-300";
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            efectivo: "Efectivo",
            tarjeta: "Tarjeta",
            transferencia: "Transferencia",
        };
        return labels[method] || method;
    };

    const totalUtilidad = venta.detalles.reduce(
        (sum, item) => sum + Number(item.utilidad),
        0
    );

    return (
        <MainLayout>
            <Head title={`Venta - ${venta.folio}`} />
            <div className="flex-1 flex flex-col">
                <Header title="Ventas" subtitle="Información de la venta" />

                <main className="flex-1 p-6 bg-background">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Botones de acción */}
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="flex items-center gap-3 transition-all duration-200 hover:scale-105"
                            >
                                <ArrowLeft className="w-6 h-6" />
                                Volver
                            </Button>
                            <Button
                                variant="outline"
                                onClick={openPrintModal}
                                className="flex items-center gap-3 transition-all duration-200 hover:scale-105"
                            >
                                <Printer className="w-6 h-6" />
                                Imprimir Ticket
                            </Button>
                        </div>

                        {/* Información general de la venta */}
                        <Card className="border-2 hover:shadow-lg transition-all duration-200">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950">
                                <CardTitle className="text-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Receipt className="w-8 h-8 text-blue-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground font-normal">
                                                Folio de Venta
                                            </p>
                                            <p className="font-mono">
                                                {venta.folio}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className={`px-4 py-2 rounded-full text-sm font-medium border-2 ${getPaymentMethodBadge(
                                            venta.metodo_pago
                                        )}`}
                                    >
                                        {getPaymentMethodLabel(
                                            venta.metodo_pago
                                        )}
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Fecha
                                            </p>
                                            <p className="font-semibold text-sm">
                                                {venta.fecha}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Cliente
                                            </p>
                                            <p className="font-semibold text-sm">
                                                {venta.cliente?.nombre ||
                                                    "Público General"}
                                            </p>
                                            {venta.cliente?.telefono && (
                                                <p className="text-xs text-muted-foreground">
                                                    {venta.cliente.telefono}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Vendedor
                                            </p>
                                            <p className="font-semibold">
                                                {venta.usuario}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <Package className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Productos
                                            </p>
                                            <p className="font-semibold text-xl">
                                                {venta.detalles.length}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Productos vendidos */}
                        <Card className="border-2 hover:shadow-lg transition-all duration-200">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Productos Vendidos
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-lg border border-border overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="font-bold">
                                                    Producto
                                                </TableHead>
                                                <TableHead className="font-bold">
                                                    Código
                                                </TableHead>
                                                <TableHead className="font-bold text-center">
                                                    Cantidad
                                                </TableHead>
                                                <TableHead className="font-bold text-right">
                                                    Precio Unit.
                                                </TableHead>
                                                <TableHead className="font-bold text-right">
                                                    Subtotal
                                                </TableHead>
                                                <TableHead className="font-bold text-right">
                                                    Utilidad
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {venta.detalles.map(
                                                (detalle, index) => (
                                                    <TableRow
                                                        key={index}
                                                        className="hover:bg-muted/50"
                                                    >
                                                        <TableCell className="font-medium">
                                                            {detalle.producto}
                                                        </TableCell>
                                                        <TableCell className="font-mono text-sm text-muted-foreground">
                                                            {detalle.codigo ||
                                                                "S/C"}
                                                        </TableCell>
                                                        <TableCell className="text-center font-semibold">
                                                            {detalle.cantidad}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            $
                                                            {Number(
                                                                detalle.precio_unitario
                                                            ).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-semibold">
                                                            $
                                                            {Number(
                                                                detalle.total
                                                            ).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-semibold text-green-600">
                                                            $
                                                            {Number(
                                                                detalle.utilidad
                                                            ).toFixed(2)}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Resumen financiero */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-2 hover:shadow-lg transition-all duration-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5" />
                                        Resumen de Pago
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-lg">
                                        <span className="text-muted-foreground">
                                            Subtotal:
                                        </span>
                                        <span className="font-semibold">
                                            ${Number(venta.subtotal).toFixed(2)}
                                        </span>
                                    </div>
                                    {venta.impuestos > 0 && (
                                        <div className="flex justify-between text-lg">
                                            <span className="text-muted-foreground">
                                                Impuestos:
                                            </span>
                                            <span className="font-semibold">
                                                $
                                                {Number(
                                                    venta.impuestos
                                                ).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-2xl font-bold pt-3 border-t-2 border-border">
                                        <span>Total:</span>
                                        <span className="text-green-600">
                                            ${Number(venta.total).toFixed(2)}
                                        </span>
                                    </div>
                                    {venta.metodo_pago === "efectivo" && (
                                        <>
                                            <div className="flex justify-between text-lg pt-3 border-t border-border">
                                                <span className="text-muted-foreground">
                                                    Monto Recibido:
                                                </span>
                                                <span className="font-semibold">
                                                    $
                                                    {Number(
                                                        venta.monto_pagado
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-lg">
                                                <span className="text-muted-foreground">
                                                    Cambio:
                                                </span>
                                                <span className="font-semibold text-blue-600">
                                                    $
                                                    {Number(
                                                        venta.cambio
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-2 hover:shadow-lg transition-all duration-200">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5" />
                                        Análisis de Utilidad
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between text-lg">
                                        <span className="text-muted-foreground">
                                            Total Vendido:
                                        </span>
                                        <span className="font-semibold">
                                            ${Number(venta.total).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-lg">
                                        <span className="text-muted-foreground">
                                            Costo Total:
                                        </span>
                                        <span className="font-semibold text-red-600">
                                            $
                                            {venta.detalles
                                                .reduce(
                                                    (sum, d) =>
                                                        sum +
                                                        Number(d.costo) *
                                                            d.cantidad,
                                                    0
                                                )
                                                .toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-2xl font-bold pt-3 border-t-2 border-border">
                                        <span>Utilidad:</span>
                                        <span className="text-green-600">
                                            ${totalUtilidad.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm text-muted-foreground pt-2">
                                        <span>Margen:</span>
                                        <span className="font-semibold">
                                            {(
                                                (totalUtilidad /
                                                    Number(venta.total)) *
                                                100
                                            ).toFixed(1)}
                                            %
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>
            </div>

            {/* MODAL DE TICKET */}
            <Dialog open={isTicketOpen} onOpenChange={setIsTicketOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Imprimir Ticket</DialogTitle>
                    </DialogHeader>

                    <div className="bg-gray-100 p-4 rounded-md flex justify-center max-h-[60vh] overflow-y-auto">
                        <Ticket
                            ref={ticketRef}
                            data={ticketData}
                            businessSettings={businessSettings}
                            printerSettings={printerSettings}
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsTicketOpen(false)}
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
