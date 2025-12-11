import { Header } from "@/Components/Header";
import { DashboardCard } from "@/Components/DashboardCard";
import {
    ShoppingBag,
    Package,
    LayoutGrid,
    BarChart3,
    FileText,
    Shield,
    Settings,
    AlertTriangle,
    Users,
    Wallet,
} from "lucide-react";
import { router, Head } from "@inertiajs/react";
import MainLayout from "@/Layouts/MainLayout";
import { Alert, AlertDescription, AlertTitle } from "@/Components/ui/alert";
import { Button } from "@/Components/ui/button";

interface Product {
    id: number;
    description: string;
    stock: number;
    min_stock: number;
}

interface Props {
    lowStockProducts?: Product[];
}

export default function Dashboard({ lowStockProducts = [] }: Props) {
    const hasLowStock = lowStockProducts.length > 0;

    return (
        <MainLayout>
            <Head title="Inicio" />
            <div className="flex-1 flex flex-col">
                <Header title="Inicio" subtitle="Bienvenido" />

                <main className="flex-1 p-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-foreground mb-2">
                                Bienvenido. Elija una opción
                            </h2>
                            <p className="text-muted-foreground">
                                Recuerde que siempre puede explorar el menú
                                completo haciendo click en la parte superior
                                izquierda
                            </p>
                        </div>

                        {/* Alerta de Stock Bajo */}
                        {hasLowStock && (
                            <Alert className="mb-6 border-2 border-red-500/30 dark:border-red-500/40 bg-red-50 dark:bg-red-950/30">
                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                <AlertTitle className="text-lg font-bold text-red-800 dark:text-red-300">
                                    ¡Atención! Productos con stock bajo
                                </AlertTitle>
                                <AlertDescription className="mt-2 text-red-700 dark:text-red-300">
                                    <p className="mb-3">
                                        Hay{" "}
                                        <strong>
                                            {lowStockProducts.length}
                                        </strong>{" "}
                                        producto(s) con existencia por debajo
                                        del mínimo:
                                    </p>
                                    <div className="space-y-1 mb-3">
                                        {lowStockProducts
                                            .slice(0, 2)
                                            .map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="flex justify-between items-center text-sm bg-white dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800/50"
                                                >
                                                    <span className="font-semibold text-red-900 dark:text-red-200">
                                                        {product.description}
                                                    </span>
                                                    <span className="text-red-600 dark:text-red-400 font-bold">
                                                        Stock: {product.stock} /
                                                        Mínimo:{" "}
                                                        {product.min_stock}
                                                    </span>
                                                </div>
                                            ))}
                                        {lowStockProducts.length > 2 && (
                                            <p className="text-sm italic text-red-600 dark:text-red-400">
                                                ... y{" "}
                                                {lowStockProducts.length - 2}{" "}
                                                producto(s) más
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            router.visit(
                                                "reportes/baja-existencia"
                                            )
                                        }
                                        className="bg-white dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200"
                                    >
                                        Ver todos los productos con stock bajo
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <DashboardCard
                                title="Realizar una venta"
                                description="Hacer una venta al contado o a transferencia "
                                icon={ShoppingBag}
                                iconColor="text-warning"
                                onClick={() => router.visit("/vender")}
                            />

                            <DashboardCard
                                title="Productos"
                                description="Registrar, eliminar o actualizar detalles productos"
                                icon={Package}
                                iconColor="text-primary"
                                onClick={() => router.visit("/productos")}
                            />

                            <DashboardCard
                                title="Clientes"
                                description="Registrar, eliminar o actualizar detalles clientes"
                                icon={Users}
                                iconColor="text-primary"
                                onClick={() => router.visit("/clientes")}
                            />

                            <DashboardCard
                                title="Caja"
                                description="Abrir, cerrar o actualizar detalles caja"
                                icon={Wallet}
                                iconColor="text-primary"
                                onClick={() => router.visit("/caja")}
                            />

                            <DashboardCard
                                title="Reportes"
                                description="Ver reporte de caja, de ventas al contado o de ventas con tarjeta"
                                icon={FileText}
                                iconColor="text-foreground"
                                onClick={() => router.visit("/reportes")}
                            />
                            <DashboardCard
                                title="Configuración"
                                description="Cambiar los datos de su tienda, configurar la impresora,gestionar usuarios y permisos"
                                icon={Settings}
                                iconColor="text-warning"
                                onClick={() =>
                                    router.visit("/configuracion/usuarios")
                                }
                            />
                        </div>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}
