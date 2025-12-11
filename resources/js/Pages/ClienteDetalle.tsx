import { Head, router } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import { Header } from "@/Components/Header";
import { Button } from "@/Components/ui/button";
import {
    ArrowLeft,
    Phone,
    Calendar,
    DollarSign,
    ShoppingBag,
    Receipt,
    Eye,
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

interface Venta {
    id: number;
    folio: string;
    fecha: string;
    total: number;
    metodo_pago: string;
    productos: number;
}

interface Cliente {
    id: number;
    name: string;
    phone: string | null;
    created_at: string;
    total_comprado: number;
    total_compras: number;
    ultima_compra: string;
    ventas: Venta[];
}

interface Props {
    cliente: Cliente;
}

export default function ClienteDetalle({ cliente }: Props) {
    const handleBack = () => {
        router.visit("/clientes");
    };

    const handleViewSale = (saleId: number) => {
        router.visit(`/ventas/${saleId}`);
    };

    const getPaymentMethodBadge = (method: string) => {
        const colors: Record<string, string> = {
            efectivo: "bg-green-100 text-green-700 border-green-200",
            tarjeta: "bg-blue-100 text-blue-700 border-blue-200",
            transferencia: "bg-purple-100 text-purple-700 border-purple-200",
        };
        return colors[method] || "bg-gray-100 text-gray-700 border-gray-200";
    };

    const getPaymentMethodLabel = (method: string) => {
        const labels: Record<string, string> = {
            efectivo: "Efectivo",
            tarjeta: "Tarjeta",
            transferencia: "Transferencia",
        };
        return labels[method] || method;
    };

    return (
        <MainLayout>
            <Head title={`Cliente - ${cliente.name}`} />
            <div className="flex-1 flex flex-col">
                <Header title="Clientes" subtitle="Información del cliente" />

                <main className="flex-1 p-6 bg-background">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Botón volver */}
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            className="flex items-center gap-3 transition-all duration-200 hover:scale-105"
                        >
                            <ArrowLeft className="w-6 h-6" />
                            Volver a Clientes
                        </Button>

                        {/* Información del cliente */}
                        <Card className="border-2 hover:shadow-lg transition-all duration-200">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                                        {cliente.name.charAt(0).toUpperCase()}
                                    </div>
                                    {cliente.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Phone className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Teléfono
                                            </p>
                                            <p className="font-semibold">
                                                {cliente.phone ||
                                                    "Sin teléfono"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                            <Calendar className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Cliente desde
                                            </p>
                                            <p className="font-semibold">
                                                {cliente.created_at}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                            <ShoppingBag className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Total de Compras
                                            </p>
                                            <p className="font-semibold text-2xl">
                                                {cliente.total_compras}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                            <DollarSign className="w-6 h-6 text-orange-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">
                                                Total Gastado
                                            </p>
                                            <p className="font-semibold text-2xl text-green-600">
                                                $
                                                {Number(
                                                    cliente.total_comprado
                                                ).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-border">
                                    <p className="text-sm text-muted-foreground">
                                        <Calendar className="inline w-4 h-4 mr-1" />
                                        Última compra:{" "}
                                        <span className="font-semibold text-foreground">
                                            {cliente.ultima_compra}
                                        </span>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Historial de compras */}
                        <Card className="border-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Receipt className="w-5 h-5" />
                                    Historial de Compras (
                                    {cliente.ventas.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {cliente.ventas.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                                        <p className="text-muted-foreground text-lg">
                                            Este cliente aún no ha realizado
                                            compras
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-lg border border-border overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-muted/50">
                                                    <TableHead className="font-bold">
                                                        Folio
                                                    </TableHead>
                                                    <TableHead className="font-bold">
                                                        Fecha
                                                    </TableHead>
                                                    <TableHead className="font-bold">
                                                        Productos
                                                    </TableHead>
                                                    <TableHead className="font-bold">
                                                        Método de Pago
                                                    </TableHead>
                                                    <TableHead className="font-bold">
                                                        Total
                                                    </TableHead>
                                                    <TableHead className="font-bold">
                                                        Opciones
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {cliente.ventas.map((venta) => (
                                                    <TableRow
                                                        key={venta.id}
                                                        className="hover:bg-muted/50"
                                                    >
                                                        <TableCell className="font-mono font-semibold">
                                                            {venta.folio}
                                                        </TableCell>
                                                        <TableCell className="text-sm">
                                                            {venta.fecha}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                                                                <ShoppingBag className="w-3 h-3" />
                                                                {
                                                                    venta.productos
                                                                }{" "}
                                                                items
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span
                                                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getPaymentMethodBadge(
                                                                    venta.metodo_pago
                                                                )}`}
                                                            >
                                                                {getPaymentMethodLabel(
                                                                    venta.metodo_pago
                                                                )}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="font-bold text-lg text-green-600">
                                                            $
                                                            {Number(
                                                                venta.total
                                                            ).toFixed(2)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                title="Ver venta"
                                                                onClick={() =>
                                                                    handleViewSale(
                                                                        venta.id
                                                                    )
                                                                }
                                                                className="flex items-center gap-3 transition-all duration-200 hover:scale-105"
                                                            >
                                                                <Eye className="w-5 h-5" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}
