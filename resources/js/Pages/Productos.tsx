import { useState, useEffect } from "react";
import { Header } from "@/Components/Header";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { useScannerWebSocket } from "@/Hooks/useScannerWebSocket";
import {
    Search,
    Plus,
    Minus,
    Edit,
    Trash2,
    FolderPlus,
    X,
    Upload,
    Download,
    FileSpreadsheet,
    Calculator,
} from "lucide-react";
import { useToast } from "@/Hooks/use-toast";
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
    DialogFooter,
} from "@/Components/ui/dialog";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { Switch } from "@/Components/ui/switch";
import MainLayout from "@/Layouts/MainLayout";
import { Head, router } from "@inertiajs/react";

interface Category {
    id: number;
    name: string;
}

interface Product {
    id: number;
    barcode: string | null;
    description: string;
    category_id: number | null;
    category?: Category;
    purchase_price: number;
    sale_price: number;
    stock: number;
    min_stock: number;
}

interface PaginatedProducts {
    data: Product[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface Props {
    products: PaginatedProducts;
    categories: Category[];
    filters: {
        search?: string;
    };
}

export default function Productos({ products, categories, filters }: Props) {
    const { toast } = useToast();

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDeleteCategoryDialogOpen, setIsDeleteCategoryDialogOpen] =
        useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        null
    );
    const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [categorySearch, setCategorySearch] = useState("");
    const [newCategoryName, setNewCategoryName] = useState("");
    const [selectedProductId, setSelectedProductId] = useState<number | null>(
        null
    );
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

        // Callback para cuando el scanner detecta un código
    const handleBarcodeScan = (barcode: string) => {
        const existingProduct = products.data.find((p) => p.barcode === barcode);
        
        if (existingProduct) {
            // Producto existe → abrir modal de edición
            setEditingProduct({
                id: existingProduct.id,
                barcode: existingProduct.barcode || "",
                description: existingProduct.description,
                category_id: existingProduct.category_id?.toString() || "",
                purchasePrice: existingProduct.purchase_price.toString(),
                salePrice: existingProduct.sale_price.toString(),
                existence: existingProduct.stock.toString(),
                minStock: existingProduct.min_stock.toString(),
            });
            setIsEditDialogOpen(true);
            toast({ title: " Editando producto", description: existingProduct.description, duration: 2000,});
        } else {
            // Producto NO existe → abrir modal de registro
            setNewProduct({
                barcode: barcode,
                description: "",
                category_id: "",
                purchasePrice: "",
                salePrice: "",
                existence: "0",
                minStock: "5",
            });
            setIsAddDialogOpen(true);
            toast({ title: "Nuevo producto", description: `Código: ${barcode}` , duration: 2000,});
        }
    };
    // 📡 Conexión WebSocket al scanner-app local
    const { isConnected: scannerConnected } = useScannerWebSocket(handleBarcodeScan);

    // Estado para margen de ganancia automático
    const [profitMargin, setProfitMargin] = useState<number>(() => {
        const saved = localStorage.getItem("profitMargin");
        return saved ? parseFloat(saved) : 40;
    });
    const [autoCalculateEnabled, setAutoCalculateEnabled] = useState<boolean>(
        () => {
            const saved = localStorage.getItem("autoCalculateEnabled");
            return saved ? JSON.parse(saved) : true;
        }
    );

    // Estado para NUEVO producto
    const [newProduct, setNewProduct] = useState({
        barcode: "",
        description: "",
        category_id: "",
        purchasePrice: "",
        salePrice: "",
        existence: "",
        minStock: "",
    });

    // Estado para EDITAR producto
    const [editingProduct, setEditingProduct] = useState({
        id: 0,
        barcode: "",
        description: "",
        category_id: "",
        purchasePrice: "",
        salePrice: "",
        existence: "",
        minStock: "",
    });

    // Guardar configuración en localStorage
    useEffect(() => {
        localStorage.setItem("profitMargin", profitMargin.toString());
    }, [profitMargin]);

    useEffect(() => {
        localStorage.setItem(
            "autoCalculateEnabled",
            JSON.stringify(autoCalculateEnabled)
        );
    }, [autoCalculateEnabled]);

    // Auto-cálculo para NUEVO producto
    useEffect(() => {
        if (autoCalculateEnabled && newProduct.purchasePrice) {
            const purchasePrice = parseFloat(newProduct.purchasePrice);
            if (!isNaN(purchasePrice) && purchasePrice > 0) {
                const calculatedPrice =
                    purchasePrice * (1 + profitMargin / 100);
                setNewProduct((prev) => ({
                    ...prev,
                    salePrice: calculatedPrice.toFixed(2),
                }));
            }
        }
    }, [newProduct.purchasePrice, profitMargin, autoCalculateEnabled]);

    // Auto-cálculo para EDITAR producto
    useEffect(() => {
        if (autoCalculateEnabled && editingProduct.purchasePrice) {
            const purchasePrice = parseFloat(editingProduct.purchasePrice);
            if (!isNaN(purchasePrice) && purchasePrice > 0) {
                const calculatedPrice =
                    purchasePrice * (1 + profitMargin / 100);
                setEditingProduct((prev) => ({
                    ...prev,
                    salePrice: calculatedPrice.toFixed(2),
                }));
            }
        }
    }, [editingProduct.purchasePrice, profitMargin, autoCalculateEnabled]);

    // --- Lógica Backend: Productos ---

    const handleSaveProduct = () => {
        if (!newProduct.description || !newProduct.salePrice) {
            toast({
                title: "Error",
                description: "Completa los campos obligatorios",
                variant: "destructive",
            });
            return;
        }

        router.post(
            "/productos",
            {
                barcode: newProduct.barcode,
                description: newProduct.description,
                purchase_price: newProduct.purchasePrice,
                sale_price: newProduct.salePrice,
                stock: newProduct.existence,
                min_stock: newProduct.minStock,
                category_id: newProduct.category_id,
            },
            {
                onSuccess: () => {
                    setIsAddDialogOpen(false);
                    setNewProduct({
                        barcode: "",
                        description: "",
                        category_id: "",
                        purchasePrice: "",
                        salePrice: "",
                        existence: "",
                        minStock: "",
                    });
                    toast({
                        title: "Producto creado",
                        description: "Se ha registrado correctamente",
                    });
                },
            }
        );
    };

    const handleEditClick = (product: Product) => {
        setEditingProduct({
            id: product.id,
            barcode: product.barcode || "",
            description: product.description,
            category_id: product.category_id?.toString() || "",
            purchasePrice: product.purchase_price.toString(),
            salePrice: product.sale_price.toString(),
            existence: product.stock.toString(),
            minStock: product.min_stock.toString(),
        });
        setIsEditDialogOpen(true);
    };

    const handleUpdateProduct = () => {
        router.put(
            `/productos/${editingProduct.id}`,
            {
                barcode: editingProduct.barcode,
                description: editingProduct.description,
                purchase_price: editingProduct.purchasePrice,
                sale_price: editingProduct.salePrice,
                stock: editingProduct.existence,
                min_stock: editingProduct.minStock,
                category_id: editingProduct.category_id,
            },
            {
                onSuccess: () => {
                    setIsEditDialogOpen(false);
                    toast({
                        title: "Producto actualizado",
                        description: "Los cambios se guardaron correctamente",
                    });
                },
            }
        );
    };

    // --- Lógica Backend: Categorías ---

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;

        router.post(
            "/categorias",
            { name: newCategoryName },
            {
                onSuccess: () => {
                    setNewCategoryName("");
                    toast({ title: "Categoría agregada" });
                },
                preserveScroll: true,
            }
        );
    };

    const handleDeleteCategory = (id: number) => {
        setSelectedCategoryId(id);
        setIsDeleteCategoryDialogOpen(true);
    };

    // --- Otras funciones ---
    const handleUpdateStock = (productId: number, quantity: number) => {
        router.post(
            `/productos/${productId}/stock`,
            { quantity },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast({
                        title:
                            quantity > 0
                                ? "Existencia aumentada"
                                : "Existencia reducida",
                    });
                },
            }
        );
    };

    const handleDeleteProduct = (productId: number) => {
        setSelectedProductId(productId);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteProduct = () => {
        if (selectedProductId) {
            router.delete(`/productos/${selectedProductId}`, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setSelectedProductId(null);
                    toast({
                        title: "Producto eliminado",
                        description:
                            "El producto ha sido removido del inventario",
                    });
                },
            });
        }
    };

    const confirmDeleteCategory = () => {
        if (selectedCategoryId) {
            router.delete(`/categorias/${selectedCategoryId}`, {
                onSuccess: () => {
                    setIsDeleteCategoryDialogOpen(false);
                    setSelectedCategoryId(null);
                    toast({ title: "Categoría eliminada" });
                },
                preserveScroll: true,
            });
        }
    };

    // Manejar búsqueda con debounce
    const handleSearch = (value: string) => {
        setSearchQuery(value);
        if (value.length >= 3 || value.length === 0) {
            router.get(
                "/productos",
                { search: value },
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
        }
    };

    // Navegar entre páginas
    const goToPage = (page: number) => {
        router.get(
            "/productos",
            {
                page,
                search: searchQuery,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    // Exportar productos
    const handleExport = () => {
        window.location.href = "/productos/export";
        toast({
            title: "Exportando productos",
            description: "La descarga comenzará en breve",
        });
    };

    // Descargar plantilla
    const handleDownloadTemplate = () => {
        window.location.href = "/productos/plantilla";
        toast({
            title: "Descargando plantilla",
            description: "La plantilla de ejemplo se descargará ahora",
        });
    };

    // Importar productos
    const handleImport = () => {
        if (!selectedFile) {
            toast({
                title: "Error",
                description: "Por favor selecciona un archivo",
                variant: "destructive",
            });
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        router.post("/productos/import", formData, {
            onSuccess: () => {
                setIsImportDialogOpen(false);
                setSelectedFile(null);
                toast({
                    title: "Productos importados",
                    description: "Los productos se han importado exitosamente",
                });
            },
            onError: (errors) => {
                toast({
                    title: "Error al importar",
                    description:
                        errors.file ||
                        "Hubo un error al importar los productos",
                    variant: "destructive",
                });
            },
        });
    };

    const filteredCategories = categories.filter((c) =>
        c.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    return (
        <MainLayout>
            <Head title="Productos" />
            <div className="flex-1 flex flex-col">
                <Header title="Productos" subtitle="Agrega, organiza y controla todo lo que vendes." />

                <main className="flex-1 p-6 bg-background">
                    <div className="max-w-7xl mx-auto">
                        {/* Card de configuración de margen de ganancia */}
                        <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calculator className="w-5 h-5 text-primary" />
                                        <h3 className="font-semibold text-foreground">
                                            Margen de Ganancia Automático
                                        </h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Calcula automáticamente el precio de
                                        venta al ingresar el precio de compra
                                    </p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-3">
                                        <Label
                                            htmlFor="profit-margin"
                                            className="text-sm font-medium whitespace-nowrap"
                                        >
                                            Margen:
                                        </Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id="profit-margin"
                                                type="number"
                                                min="0"
                                                max="1000"
                                                step="1"
                                                value={profitMargin}
                                                onChange={(e) =>
                                                    setProfitMargin(
                                                        parseFloat(
                                                            e.target.value
                                                        ) || 0
                                                    )
                                                }
                                                className="w-20 text-center font-bold"
                                            />
                                            <span className="text-lg font-semibold text-foreground">
                                                %
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Label
                                            htmlFor="auto-calc-switch"
                                            className="text-sm font-medium"
                                        >
                                            {autoCalculateEnabled
                                                ? "Activo"
                                                : "Inactivo"}
                                        </Label>
                                        <Switch
                                            id="auto-calc-switch"
                                            checked={autoCalculateEnabled}
                                            onCheckedChange={
                                                setAutoCalculateEnabled
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6 flex items-center gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar un producto por su descripción o código de barras"
                                    value={searchQuery}
                                    onChange={(e) =>
                                        handleSearch(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="flex items-center gap-3 transition-all duration-200 hover:scale-105"
                                    >
                                        <FileSpreadsheet className="w-6 h-6" />
                                        Importar/Exportar
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() =>
                                            setIsImportDialogOpen(true)
                                        }
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        Importar Productos
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleExport}>
                                        <Download className="w-4 h-4 mr-2" />
                                        Exportar Productos
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleDownloadTemplate}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        Descargar Plantilla
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                onClick={() => setIsCategoryDialogOpen(true)}
                                variant="outline"
                                className="flex items-center gap-3 transition-all duration-200 hover:scale-105"
                            >
                                <FolderPlus className="w-6 h-6" />
                                Categorías
                            </Button>
                        </div>

                        <div className="bg-card rounded-lg border border-border">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            goToPage(products.current_page - 1)
                                        }
                                        disabled={products.current_page === 1}
                                    >
                                        <span>←</span>
                                    </Button>
                                    <span className="px-3 py-1 bg-primary text-primary-foreground rounded">
                                        {products.current_page}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        de {products.last_page}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            goToPage(products.current_page + 1)
                                        }
                                        disabled={
                                            products.current_page ===
                                            products.last_page
                                        }
                                    >
                                        <span>→</span>
                                    </Button>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Mostrando {products.from} - {products.to} de{" "}
                                    {products.total} productos
                                </div>
                            </div>

                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>#</TableHead>
                                        <TableHead>Código de barras</TableHead>
                                        <TableHead>Descripción</TableHead>
                                        <TableHead>Categoría</TableHead>
                                        <TableHead>P. compra</TableHead>
                                        <TableHead>P. venta</TableHead>
                                        <TableHead>Utilidad</TableHead>
                                        <TableHead>Existencia</TableHead>
                                        <TableHead>Stock Minimo</TableHead>
                                        <TableHead>Opciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.data.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>{product.id}</TableCell>
                                            <TableCell>
                                                {product.barcode || "S/C"}
                                            </TableCell>
                                            <TableCell>
                                                {product.description}
                                            </TableCell>
                                            <TableCell>
                                                {product.category?.name ||
                                                    "General"}
                                            </TableCell>
                                            <TableCell>
                                                ${" "}
                                                {Number(
                                                    product.purchase_price
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                ${" "}
                                                {Number(
                                                    product.sale_price
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell className="font-semibold text-green-600">
                                                ${" "}
                                                {(
                                                    Number(product.sale_price) -
                                                    Number(
                                                        product.purchase_price
                                                    )
                                                ).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <span
                                                    className={
                                                        product.stock <=
                                                        product.min_stock
                                                            ? "text-red-500 font-bold"
                                                            : ""
                                                    }
                                                >
                                                    {product.stock}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {product.min_stock}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0"
                                                        title="Restar stock"
                                                        onClick={() =>
                                                            handleUpdateStock(
                                                                product.id,
                                                                -1
                                                            )
                                                        }
                                                    >
                                                        <Minus className="w-4 h-4 text-warning" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0"
                                                        title="Agregar stock"
                                                        onClick={() =>
                                                            handleUpdateStock(
                                                                product.id,
                                                                1
                                                            )
                                                        }
                                                    >
                                                        <Plus className="w-4 h-4 text-info" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0"
                                                        title="Editar producto"
                                                        onClick={() =>
                                                            handleEditClick(
                                                                product
                                                            )
                                                        }
                                                    >
                                                        <Edit className="w-4 h-4 text-warning" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-8 w-8 p-0"
                                                        title="Eliminar producto"
                                                        onClick={() =>
                                                            handleDeleteProduct(
                                                                product.id
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </main>

                {/* Botón flotante para agregar producto */}
                <Button
                    className="fixed bottom-8 right-8 rounded-full w-14 h-14 shadow-lg transition-all duration-200 hover:scale-110"
                    title="Agregar producto"
                    onClick={() => setIsAddDialogOpen(true)}
                >
                    <Plus className="w-6 h-6" />
                </Button>

                {/* --- DIALOGO 1: AGREGAR PRODUCTO --- */}
                <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Registrar producto</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="barcode">
                                    Código de barras *
                                </Label>
                                <Input
                                    id="barcode"
                                    value={newProduct.barcode}
                                    onChange={(e) =>
                                        setNewProduct({
                                            ...newProduct,
                                            barcode: e.target.value,
                                        })
                                    }
                                    placeholder="Código de barras"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Descripción</Label>
                                <Textarea
                                    id="description"
                                    value={newProduct.description}
                                    onChange={(e) =>
                                        setNewProduct({
                                            ...newProduct,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Descripción del producto"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="purchase-price">
                                        Precio de compra *
                                    </Label>
                                    {/* Espaciador invisible para alinear con el label de precio de venta */}
                                    {autoCalculateEnabled &&
                                        newProduct.purchasePrice && (
                                            <div
                                                className="text-xs"
                                                style={{
                                                    height: "16px",
                                                    visibility: "hidden",
                                                }}
                                            >
                                                Espaciador
                                            </div>
                                        )}
                                    <Input
                                        id="purchase-price"
                                        type="number"
                                        step="0.01"
                                        value={newProduct.purchasePrice}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                purchasePrice: e.target.value,
                                            })
                                        }
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sale-price">
                                        Precio de venta *
                                    </Label>
                                    {autoCalculateEnabled &&
                                        newProduct.purchasePrice && (
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calculator className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                <span className="text-green-600 dark:text-green-400">
                                                    Auto-calculado (+
                                                    {profitMargin}%)
                                                </span>
                                            </div>
                                        )}
                                    <Input
                                        id="sale-price"
                                        type="number"
                                        step="0.01"
                                        value={newProduct.salePrice}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                salePrice: e.target.value,
                                            })
                                        }
                                        placeholder="0.00"
                                        className={
                                            autoCalculateEnabled &&
                                            newProduct.purchasePrice
                                                ? "bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-700"
                                                : ""
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Existencia *</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        value={newProduct.existence}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                existence: e.target.value,
                                            })
                                        }
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="min-stock">
                                        Stock mínimo *
                                    </Label>
                                    <Input
                                        id="min-stock"
                                        type="number"
                                        value={newProduct.minStock}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                minStock: e.target.value,
                                            })
                                        }
                                        placeholder="5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="category">Categoría</Label>
                                    <select
                                        id="category"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={newProduct.category_id}
                                        onChange={(e) =>
                                            setNewProduct({
                                                ...newProduct,
                                                category_id: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Sin categoría</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setIsAddDialogOpen(false)}
                            >
                                CERRAR
                            </Button>
                            <Button
                                onClick={handleSaveProduct}
                                className="bg-success hover:bg-success/90"
                            >
                                GUARDAR
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* --- DIALOGO 2: EDITAR PRODUCTO --- */}
                <Dialog
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Editar producto</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-barcode">
                                    Código de barras *
                                </Label>
                                <Input
                                    id="edit-barcode"
                                    value={editingProduct.barcode}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            barcode: e.target.value,
                                        })
                                    }
                                    placeholder="Código de barras"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description">
                                    Descripción
                                </Label>
                                <Textarea
                                    id="edit-description"
                                    value={editingProduct.description}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            description: e.target.value,
                                        })
                                    }
                                    placeholder="Descripción del producto"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-purchase-price">
                                        Precio de compra *
                                    </Label>
                                    {/* Espaciador invisible para alinear con el label de precio de venta */}
                                    {autoCalculateEnabled &&
                                        editingProduct.purchasePrice && (
                                            <div
                                                className="text-xs"
                                                style={{
                                                    height: "16px",
                                                    visibility: "hidden",
                                                }}
                                            >
                                                Espaciador
                                            </div>
                                        )}
                                    <Input
                                        id="edit-purchase-price"
                                        type="number"
                                        step="0.01"
                                        value={editingProduct.purchasePrice}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                purchasePrice: e.target.value,
                                            })
                                        }
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-sale-price">
                                        Precio de venta *
                                    </Label>
                                    {autoCalculateEnabled &&
                                        editingProduct.purchasePrice && (
                                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calculator className="w-3 h-3 text-green-600 dark:text-green-400" />
                                                <span className="text-green-600 dark:text-green-400">
                                                    Auto-calculado (+
                                                    {profitMargin}%)
                                                </span>
                                            </div>
                                        )}
                                    <Input
                                        id="edit-sale-price"
                                        type="number"
                                        step="0.01"
                                        value={editingProduct.salePrice}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                salePrice: e.target.value,
                                            })
                                        }
                                        placeholder="0.00"
                                        className={
                                            autoCalculateEnabled &&
                                            editingProduct.purchasePrice
                                                ? "bg-green-50 dark:bg-green-900/10 border-green-300 dark:border-green-700"
                                                : ""
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-stock">
                                        Existencia *
                                    </Label>
                                    <Input
                                        id="edit-stock"
                                        type="number"
                                        value={editingProduct.existence}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                existence: e.target.value,
                                            })
                                        }
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-min-stock">
                                        Stock mínimo *
                                    </Label>
                                    <Input
                                        id="edit-min-stock"
                                        type="number"
                                        value={editingProduct.minStock}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                minStock: e.target.value,
                                            })
                                        }
                                        placeholder="5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-category">
                                        Categoría
                                    </Label>
                                    <select
                                        id="edit-category"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={editingProduct.category_id}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                category_id: e.target.value,
                                            })
                                        }
                                    >
                                        <option value="">Sin categoría</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setIsEditDialogOpen(false)}
                            >
                                CERRAR
                            </Button>
                            <Button
                                onClick={handleUpdateProduct}
                                className="bg-success hover:bg-success/90"
                            >
                                GUARDAR
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* --- DIALOGO 3: GESTIONAR CATEGORÍAS --- */}
                <Dialog
                    open={isCategoryDialogOpen}
                    onOpenChange={setIsCategoryDialogOpen}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Gestionar Categorías</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar categoría..."
                                    value={categorySearch}
                                    onChange={(e) =>
                                        setCategorySearch(e.target.value)
                                    }
                                    className="pl-9"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Nueva categoría"
                                    value={newCategoryName}
                                    onChange={(e) =>
                                        setNewCategoryName(e.target.value)
                                    }
                                    onKeyPress={(e) =>
                                        e.key === "Enter" && handleAddCategory()
                                    }
                                />
                                <Button
                                    onClick={handleAddCategory}
                                    disabled={!newCategoryName.trim()}
                                    className="bg-success hover:bg-success/90"
                                    title="Agregar categoría"
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="border border-border rounded-lg max-h-64 overflow-y-auto">
                                {filteredCategories.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        {categorySearch
                                            ? "No se encontraron categorías"
                                            : "No hay categorías"}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {filteredCategories.map((c) => (
                                            <div
                                                key={c.id}
                                                className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
                                            >
                                                <span className="font-medium">
                                                    {c.name}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    title="Eliminar categoría"
                                                    onClick={() =>
                                                        handleDeleteCategory(
                                                            c.id
                                                        )
                                                    }
                                                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setIsCategoryDialogOpen(false)}
                            >
                                CERRAR
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* --- DIALOGO 4: CONFIRMAR ELIMINACIÓN --- */}
                <AlertDialog
                    open={isDeleteDialogOpen}
                    onOpenChange={setIsDeleteDialogOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                ¿Eliminar producto?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. El producto
                                será eliminado permanentemente del inventario.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() => setIsDeleteDialogOpen(false)}
                            >
                                CANCELAR
                            </Button>
                            <Button
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={confirmDeleteProduct}
                            >
                                ELIMINAR
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                {/* --- ALERT DIALOG: CONFIRMAR ELIMINACIÓN DE CATEGORÍA --- */}
                <AlertDialog
                    open={isDeleteCategoryDialogOpen}
                    onOpenChange={setIsDeleteCategoryDialogOpen}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                ¿Eliminar categoría?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. La categoría
                                será eliminada y los productos quedarán sin
                                categoría.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <Button
                                variant="ghost"
                                onClick={() =>
                                    setIsDeleteCategoryDialogOpen(false)
                                }
                            >
                                CANCELAR
                            </Button>
                            <Button
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={confirmDeleteCategory}
                            >
                                ELIMINAR
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* --- MODAL: IMPORTAR PRODUCTOS --- */}
                <Dialog
                    open={isImportDialogOpen}
                    onOpenChange={setIsImportDialogOpen}
                >
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Importar Productos</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Archivo Excel/CSV</Label>
                                <Input
                                    type="file"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={(e) =>
                                        setSelectedFile(
                                            e.target.files?.[0] || null
                                        )
                                    }
                                />
                                {selectedFile && (
                                    <p className="text-sm text-green-600">
                                        ✓ Archivo seleccionado:{" "}
                                        {selectedFile.name}
                                    </p>
                                )}
                            </div>

                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm">
                                <p className="font-semibold mb-2 text-foreground">
                                    Instrucciones:
                                </p>
                                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                                    <li>
                                        El archivo debe tener las columnas:
                                        Código de Barras, Descripción,
                                        Categoría, Precio Compra, Precio Venta,
                                        Stock, Stock Mínimo
                                    </li>
                                    <li>
                                        La descripción y precio de venta son
                                        obligatorios
                                    </li>
                                    <li>
                                        Las categorías se crearán
                                        automáticamente si no existen
                                    </li>
                                    <li>
                                        Descarga la plantilla de ejemplo si
                                        tienes dudas
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsImportDialogOpen(false);
                                    setSelectedFile(null);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleImport}
                                disabled={!selectedFile}
                                className="gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Importar
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </MainLayout>
    );
}
