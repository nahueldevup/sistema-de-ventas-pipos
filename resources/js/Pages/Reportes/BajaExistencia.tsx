import { useState, useRef, useMemo } from "react";
import { Header } from "@/Components/Header";
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
import { Button } from "@/Components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    AlertTriangle,
    ArrowLeft,
    Printer,
    DollarSign,
    PackageX,
    ShoppingCart,
    Plus,
    Minus,
} from "lucide-react";
import MainLayout from "@/Layouts/MainLayout";
import { Head, Link, router } from "@inertiajs/react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import {
    ReporteBajaExistencia,
    ReporteBajaExistenciaData,
} from "@/Components/ReporteBajaExistencia";
import { useReactToPrint } from "react-to-print";

interface Producto {
    id: number;
    barcode?: string;
    description: string;
    category?: { name: string };
    stock: number;
    min_stock: number;
    purchase_price: number;
}

interface Props {
    productos: Producto[];
}

export default function BajaExistencia({ productos = [] }: Props) {
    const [isReporteOpen, setIsReporteOpen] = useState(false);
    const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
    const [ordenamiento, setOrdenamiento] = useState<string>("deficit");
    const reporteRef = useRef<HTMLDivElement>(null);

    // Obtener categorías únicas
    const categorias = useMemo(() => {
        const cats = new Set(
            productos.map((p) => p.category?.name || "General")
        );
        return Array.from(cats).sort();
    }, [productos]);

    // Filtrar y ordenar productos
    const productosFiltrados = useMemo(() => {
        let filtered = [...productos];

        // Filtrar por categoría
        if (filtroCategoria !== "todas") {
            filtered = filtered.filter(
                (p) => (p.category?.name || "General") === filtroCategoria
            );
        }

        // Ordenar
        filtered.sort((a, b) => {
            switch (ordenamiento) {
                case "deficit":
                    return b.min_stock - b.stock - (a.min_stock - a.stock);
                case "nombre":
                    return a.description.localeCompare(b.description);
                default:
                    return 0;
            }
        });

        return filtered;
    }, [productos, filtroCategoria, ordenamiento]);

    // Cálculos de Resumen
    const resumen = useMemo(() => {
        let totalInversion = 0;
        let totalAgotados = 0;
        let totalReponer = 0;

        productosFiltrados.forEach((p) => {
            const deficit = Math.max(0, p.min_stock - p.stock);
            if (deficit > 0) {
                totalInversion += deficit * p.purchase_price;
                totalReponer += deficit;
            }
            if (p.stock <= 0) {
                totalAgotados++;
            }
        });

        return { totalInversion, totalAgotados, totalReponer };
    }, [productosFiltrados]);

    // Preparar datos para el reporte
    const reporteData: ReporteBajaExistenciaData = {
        fecha: new Date().toLocaleString("es-ES", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }),
        productos: productosFiltrados,
    };

    // Configurar impresión
    const handlePrint = useReactToPrint({
        contentRef: reporteRef,
        documentTitle: `Lista-Reabastecimiento-${new Date().toLocaleDateString()}`,
    });

    const triggerPrint = () => {
        if (!reporteRef.current) return;
        handlePrint();
    };

    // Manejar actualización de stock
    const handleUpdateStock = (productId: number, quantity: number) => {
        router.post(
            `/productos/${productId}/stock`,
            { quantity },
            {
                preserveScroll: true,
            }
        );
    };

    return (
        <MainLayout>
            <Head title="Reabastecimiento" />
            <div className="flex-1 flex flex-col h-full bg-background">
                <Header
                    title="Reabastecimiento"
                    subtitle="Productos por comprar y presupuesto de reposición"
                />

                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Botonera Superior */}
                        <div className="flex justify-between items-center print:hidden">
                            <Link href="/reportes">
                                <Button variant="outline" className="gap-2">
                                    <ArrowLeft className="w-4 h-4" /> Volver
                                </Button>
                            </Link>
                            <Button
                                onClick={() => setIsReporteOpen(true)}
                                className="gap-2"
                                disabled={productosFiltrados.length === 0}
                            >
                                <Printer className="w-4 h-4" /> Imprimir Lista
                            </Button>
                        </div>

                        {/* Tarjetas de Resumen */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">
                                        Total a Reponer
                                    </CardTitle>
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 transition-transform duration-200 hover:scale-110">
                                        <ShoppingCart className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                                        {resumen.totalReponer}{" "}
                                        <span className="text-sm font-normal text-blue-700 dark:text-blue-300">
                                            unidades
                                        </span>
                                    </div>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        En {productosFiltrados.length} productos
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">
                                        Inversión Estimada
                                    </CardTitle>
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 transition-transform duration-200 hover:scale-110">
                                        <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                                        $
                                        {resumen.totalInversion.toLocaleString(
                                            "es-AR",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </div>
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        Costo base de reposición
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-red-800 dark:text-red-300">
                                        Productos Agotados
                                    </CardTitle>
                                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 transition-transform duration-200 hover:scale-110">
                                        <PackageX className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-900 dark:text-red-200">
                                        {resumen.totalAgotados}
                                    </div>
                                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                        Requieren atención inmediata
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Filtros */}
                        {productos.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Filtros
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Categoría
                                            </label>
                                            <Select
                                                value={filtroCategoria}
                                                onValueChange={
                                                    setFiltroCategoria
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Todas las categorías" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="todas">
                                                        Todas las categorías
                                                    </SelectItem>
                                                    {categorias.map((cat) => (
                                                        <SelectItem
                                                            key={cat}
                                                            value={cat}
                                                        >
                                                            {cat}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Ordenar por
                                            </label>
                                            <Select
                                                value={ordenamiento}
                                                onValueChange={setOrdenamiento}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Ordenar por" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="deficit">
                                                        Mayor Déficit
                                                    </SelectItem>
                                                    <SelectItem value="nombre">
                                                        Nombre (A-Z)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Tabla de Productos */}
                        <Card className="border border-border shadow-md bg-card">
                            <CardHeader className="bg-orange-50 dark:bg-orange-950/30 border-b border-border">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-orange-800 dark:text-orange-400">
                                        <AlertTriangle className="w-5 h-5" />
                                        <CardTitle>
                                            Inventario Crítico (
                                            {productosFiltrados.length})
                                        </CardTitle>
                                    </div>
                                    {productosFiltrados.length > 0 && (
                                        <Badge
                                            variant="outline"
                                            className="bg-card border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400"
                                        >
                                            {productosFiltrados.length} producto
                                            {productosFiltrados.length !== 1
                                                ? "s"
                                                : ""}
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Código</TableHead>
                                                <TableHead>Producto</TableHead>
                                                <TableHead>Categoría</TableHead>
                                                <TableHead className="text-center">
                                                    Stock Actual
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    Stock Mínimo
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Costo Unit.
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Déficit
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Inversión
                                                </TableHead>
                                                <TableHead className="text-center">
                                                    Opciones
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {productosFiltrados.length === 0 ? (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={9}
                                                        className="text-center py-8 text-green-600 font-medium"
                                                    >
                                                        ¡Excelente! No hay
                                                        productos con bajo
                                                        stock.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                productosFiltrados.map(
                                                    (prod) => {
                                                        const deficit =
                                                            prod.min_stock -
                                                            prod.stock;

                                                        return (
                                                            <TableRow
                                                                key={prod.id}
                                                                className="hover:bg-orange-50/30"
                                                            >
                                                                <TableCell className="font-mono text-xs">
                                                                    {prod.barcode ||
                                                                        "S/C"}
                                                                </TableCell>
                                                                <TableCell className="font-medium">
                                                                    {
                                                                        prod.description
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-muted-foreground">
                                                                    {prod
                                                                        .category
                                                                        ?.name ||
                                                                        "General"}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <Badge
                                                                        variant="destructive"
                                                                        className="text-sm font-bold"
                                                                    >
                                                                        {
                                                                            prod.stock
                                                                        }
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-center text-muted-foreground">
                                                                    {
                                                                        prod.min_stock
                                                                    }
                                                                </TableCell>
                                                                <TableCell className="text-right text-muted-foreground">
                                                                    $
                                                                    {Number(
                                                                        prod.purchase_price
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right font-bold text-orange-600">
                                                                    {deficit}
                                                                </TableCell>
                                                                <TableCell className="text-right font-bold text-green-700">
                                                                    $
                                                                    {(
                                                                        deficit *
                                                                        prod.purchase_price
                                                                    ).toFixed(
                                                                        2
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    <div className="flex gap-1 justify-center">
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-8 w-8 p-0"
                                                                            title="Disminuir stock del producto"
                                                                            onClick={() =>
                                                                                handleUpdateStock(
                                                                                    prod.id,
                                                                                    -1
                                                                                )
                                                                            }
                                                                        >
                                                                            <Minus className="w-4 h-4 text-orange-600" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-8 w-8 p-0"
                                                                            title="Agregar stock al producto"
                                                                            onClick={() =>
                                                                                handleUpdateStock(
                                                                                    prod.id,
                                                                                    1
                                                                                )
                                                                            }
                                                                        >
                                                                            <Plus className="w-4 h-4 text-green-600" />
                                                                        </Button>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    }
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>

            {/* MODAL DE REPORTE */}
            <Dialog open={isReporteOpen} onOpenChange={setIsReporteOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            Lista de Reabastecimiento - Vista Previa
                        </DialogTitle>
                    </DialogHeader>

                    <div className="bg-muted p-4 rounded-md flex justify-center">
                        <ReporteBajaExistencia
                            ref={reporteRef}
                            data={reporteData}
                        />
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
