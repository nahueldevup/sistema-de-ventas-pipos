import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import { Header } from "@/Components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    TrendingUp,
    DollarSign,
    Package,
    AlertTriangle,
    Calendar,
    Search,
} from "lucide-react";

interface Props {
    filters: { start_date: string; end_date: string };
    chartData: any[];
    topProducts: any[];
    stats: {
        total_sales: number;
        total_profit: number;
        low_stock: number;
        average_ticket: number;
    };
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function Reportes({
    filters,
    chartData,
    topProducts,
    stats,
}: Props) {
    const [dateRange, setDateRange] = useState({
        start: filters.start_date,
        end: filters.end_date,
    });

    const handleFilter = () => {
        router.get(
            "/reportes",
            { start_date: dateRange.start, end_date: dateRange.end },
            { preserveState: true }
        );
    };

    return (
        <MainLayout>
            <Head title="Resumen del Negocio" />
            <div className="flex-1 flex flex-col bg-background">
                <Header title="Resumen del Negocio" subtitle="Ventas, ganancias y estado del inventario" />

                <main className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* FILTROS DE FECHA */}
                        <div className="bg-card p-4 rounded-xl border shadow-sm flex flex-wrap gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Desde
                                </label>
                                <Input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) =>
                                        setDateRange({
                                            ...dateRange,
                                            start: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Hasta
                                </label>
                                <Input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) =>
                                        setDateRange({
                                            ...dateRange,
                                            end: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <Button onClick={handleFilter} className="gap-2">
                                <Search className="w-4 h-4" /> Filtrar
                            </Button>
                        </div>

                        {/* TARJETAS KPI */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Ventas Totales
                                    </CardTitle>
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 transition-transform duration-200 hover:scale-110">
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        $ {Number(stats.total_sales).toFixed(2)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        En el período seleccionado
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Ganancia Estimada
                                    </CardTitle>
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 transition-transform duration-200 hover:scale-110">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-600">
                                        ${" "}
                                        {Number(stats.total_profit).toFixed(2)}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Utilidad neta (Venta - Costo)
                                    </p>
                                </CardContent>
                            </Card>
                            <Link href="/reportes/baja-existencia">
                                <Card className="hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-orange-200 dark:border-orange-900">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-orange-800">
                                            Baja Existencia
                                        </CardTitle>
                                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20 transition-transform duration-200 hover:scale-110">
                                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-orange-700">
                                            {stats.low_stock}
                                        </div>
                                        <p className="text-xs text-orange-600">
                                            Productos requieren reabastecimiento
                                        </p>
                                    </CardContent>
                                </Card>
                            </Link>
                            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        Ticket Promedio
                                    </CardTitle>
                                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 transition-transform duration-200 hover:scale-110">
                                        <Package className="h-4 w-4 text-purple-600" />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">
                                        ${" "}
                                        {Number(stats.average_ticket).toFixed(
                                            2
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Promedio por venta
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* GRÁFICOS */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Gráfico de Ventas (Barras) */}
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle>
                                        Comportamiento de Ventas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="h-[300px]">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart data={chartData}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="name"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) =>
                                                    `$${value}`
                                                }
                                            />
                                            <Tooltip
                                                formatter={(value: number) => [
                                                    `$${value.toFixed(2)}`,
                                                    "Venta",
                                                ]}
                                            />
                                            <Bar
                                                dataKey="ventas"
                                                fill="#0f172a"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Top Productos (Pastel o Lista) */}
                            <Card className="col-span-1">
                                <CardHeader>
                                    <CardTitle>
                                        Top 5 Productos Más Vendidos
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {topProducts.map((product, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-2 border-b last:border-0"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        {index + 1}
                                                    </span>
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {
                                                                product.product_name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {product.total_qty}{" "}
                                                            unidades vendidas
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold">
                                                        ${" "}
                                                        {Number(
                                                            product.total_money
                                                        ).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* accesos directos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link href="/reportes/ventas-contado">
                                <Button
                                    variant="outline"
                                    className="w-full h-12 justify-between px-6"
                                >
                                    <span className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Ver
                                        Historial Completo de Ventas
                                    </span>
                                    <span>→</span>
                                </Button>
                            </Link>
                            <Link href="/reportes/baja-existencia">
                                <Button
                                    variant="outline"
                                    className="w-full h-12 justify-between px-6 border-orange-200 dark:border-orange-900 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20"
                                >
                                    <span className="flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" />{" "}
                                        Ver Reporte Reabastecimiento
                                    </span>
                                    <span>→</span>
                                </Button>
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}
