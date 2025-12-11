import { useState, useEffect, useRef } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { Ticket, TicketData } from "@/Components/Ticket";
import { useReactToPrint } from "react-to-print";
import axios from "axios";
import { useScannerWebSocket } from "@/Hooks/useScannerWebSocket";
import { Switch } from "@/Components/ui/switch";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Printer } from "lucide-react";
import MainLayout from "@/Layouts/MainLayout";
import { Header } from "@/Components/Header";
import { useToast } from "@/Hooks/use-toast";
import {
    Search,
    Plus,
    Minus,
    Trash2,
    ShoppingCart,
    DollarSign,
    X,
    User,
    CreditCard,
    Banknote,
    UserPlus,
    ChevronLeft,
    ChevronRight,
    Menu,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";

// --- Interfaces ---
interface Product {
    id: number;
    barcode: string | null;
    description: string;
    sale_price: number;
    stock: number;
}

interface CartItem extends Product {
    quantity: number;
    total: number;
}

interface Customer {
    id?: number;
    name: string;
    phone?: string;
}

interface Props {
    allProducts: Product[];
    clients: Customer[];
}

interface PageProps {
    flash: {
        success?: string;
        error?: string;
        sale_id?: number;
    };
    businessSettings?: any;
    printerSettings?: any;
    [key: string]: any;
}

// --- Componentes Auxiliares ---
function ProductCard({
    product,
    onAdd,
}: {
    product: Product;
    onAdd: (p: Product) => void;
}) {
    return (
        <button
            onClick={() => onAdd(product)}
            className="group relative flex flex-col items-center p-3 sm:p-4 bg-card border-2 border-border rounded-xl hover:border-ring hover:shadow-lg transition-all duration-200"
        >
            <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 sm:mb-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-400 shadow-sm">
                {product.description.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-foreground text-center line-clamp-2 mb-1 leading-tight">
                {product.description}
            </p>
            <p className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                ${Number(product.sale_price).toFixed(2)}
            </p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-blue-600 rounded-full p-1 shadow-md">
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
            </div>
        </button>
    );
}

function CartItemRow({ item, onIncrease, onDecrease, onRemove }: any) {
    return (
        <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/80 rounded-lg border border-border hover:bg-card hover:shadow-sm transition-all">
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate text-xs sm:text-sm">
                    {item.description}
                </p>
                <p className="text-xs text-muted-foreground">
                    ${Number(item.sale_price).toFixed(2)} c/u
                </p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 transition-all duration-200"
                    title="disminuir cantidad"
                    onClick={() => onDecrease(item.id)}
                >
                    <Minus className="w-3 h-3 text-red-600" />
                </Button>
                <span className="w-6 sm:w-8 text-center font-bold text-xs sm:text-sm tabular-nums">
                    {item.quantity}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 transition-all duration-200"
                    title="aumentar cantidad"
                    onClick={() => onIncrease(item.id)}
                >
                    <Plus className="w-3 h-3 text-green-600" />
                </Button>
            </div>
            <div className="flex flex-col items-end gap-1 min-w-[60px]">
                <p className="font-bold text-xs sm:text-sm text-foreground">
                    ${item.total.toFixed(2)}
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 transition-all duration-200"
                    title="Eliminar del carrito"
                    onClick={() => onRemove(item.id)}
                >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
                </Button>
            </div>
        </div>
    );
}

function PaymentMethodButton({ icon: Icon, label, isSelected, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-2 sm:p-3 rounded-lg border transition-all duration-200 ${
                isSelected
                    ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "border-border text-muted-foreground hover:bg-muted hover:scale-105"
            }`}
        >
            <Icon
                className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    isSelected
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-muted-foreground"
                }`}
            />
            <span className="text-xs font-semibold">{label}</span>
        </button>
    );
}

// --- Componente Principal ---
export default function Vender({ allProducts, clients }: Props) {
    const { props } = usePage<PageProps>();
    const { flash, businessSettings, printerSettings } = props;
    const { toast } = useToast();

    // Ticket Printing State
    const [ticketData, setTicketData] = useState<TicketData | null>(null);
    const ticketRef = useRef<HTMLDivElement>(null);

    // Auto Print State with Persistence
    const [autoPrint, setAutoPrint] = useState<boolean>(() => {
        const saved = localStorage.getItem("autoPrint");
        return saved ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem("autoPrint", JSON.stringify(autoPrint));
    }, [autoPrint]);

    const handlePrint = useReactToPrint({
        contentRef: ticketRef,
        documentTitle: ticketData
            ? `Ticket-${ticketData.folio}`
            : "Ticket-Venta",
        onAfterPrint: () => setTicketData(null), // Limpiar después de imprimir
        onPrintError: (error) => console.error("Error al imprimir:", error),
    });

    // Effect to handle automatic printing when sale_id is present in flash
    useEffect(() => {
        if (flash?.sale_id && autoPrint) {
            const fetchTicketAndPrint = async () => {
                try {
                    const response = await axios.get(
                        `/api/ventas/${flash.sale_id}/ticket`
                    );
                    setTicketData(response.data);
                } catch (error) {
                    console.error("Error fetching ticket:", error);
                    toast({
                        title: "Error",
                        description:
                            "No se pudo cargar el ticket para impresión",
                        variant: "destructive",
                    });
                }
            };
            fetchTicketAndPrint();
        }
    }, [flash?.sale_id, autoPrint]);

    // Trigger print when ticketData is ready
    useEffect(() => {
        if (ticketData) {
            handlePrint();
        }
    }, [ticketData]);

    const [searchQuery, setSearchQuery] = useState("");
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("efectivo");
    const [amountReceived, setAmountReceived] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [mobileCartOpen, setMobileCartOpen] = useState(false);

    // Estados para clientes
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null
    );
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);
    const [isClearCartDialogOpen, setIsClearCartDialogOpen] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerPhone, setNewCustomerPhone] = useState("");
    const [customerSearch, setCustomerSearch] = useState("");

    // Paginación

    const filteredProducts = allProducts
        .filter(
            (product) =>
                product.description
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                (product.barcode && product.barcode.includes(searchQuery))
        )
        .sort((a, b) => {
            // Ordenar por relevancia: código exacto primero, luego código parcial, luego descripción
            const getPriority = (product: Product) => {
                if (product.barcode === searchQuery) return 1; // Código exacto
                if (product.barcode && product.barcode.startsWith(searchQuery))
                    return 2; // Código empieza con búsqueda
                if (
                    product.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                )
                    return 3; // Descripción contiene
                return 4;
            };

            return getPriority(a) - getPriority(b);
        });

    const filteredClients =
        customerSearch.trim() === ""
            ? []
            : clients.filter((c) =>
                  c.name.toLowerCase().includes(customerSearch.toLowerCase())
              );

    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal;
    const payment = parseFloat(amountReceived) || 0;
    const change = payment - total;

    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    useEffect(() => {
        if (showCheckout) {
            setAmountReceived("");
        }
    }, [showCheckout]);

    // Atajo de teclado F9
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "F9" && cartItems.length > 0 && !showCheckout) {
                e.preventDefault();
                setShowCheckout(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [cartItems.length, showCheckout]);

    const addToCart = (product: Product) => {
        const existingItem = cartItems.find((item) => item.id === product.id);
        const price = Number(product.sale_price);

        if (existingItem) {
            setCartItems(
                cartItems.map((item) =>
                    item.id === product.id
                        ? {
                              ...item,
                              quantity: item.quantity + 1,
                              total: (item.quantity + 1) * price,
                          }
                        : item
                )
            );
        } else {
            setCartItems([
                ...cartItems,
                { ...product, quantity: 1, total: price, sale_price: price },
            ]);
        }
        setSearchQuery("");
        searchInputRef.current?.focus();
        setMobileCartOpen(false);
    };
    
        // Callback para cuando el scanner detecta un código
    const handleBarcodeScan = (barcode: string) => {
        const product = allProducts.find((p) => p.barcode === barcode);
        if (product) {
            addToCart(product);
            toast({ title: "Producto agregado", description: product.description, duration: 2000,});
        } else {
            toast({ title: "Producto no encontrado", description: `Código: ${barcode}`, variant: "destructive", duration: 2000,});
        }
    };
    // 📡 Conexión WebSocket al scanner-app local
    const { isConnected: scannerConnected } = useScannerWebSocket(handleBarcodeScan);

    const updateQuantity = (itemId: number, delta: number) => {
        setCartItems(
            cartItems.map((item) => {
                if (item.id === itemId) {
                    const newQuantity = Math.max(1, item.quantity + delta);
                    return {
                        ...item,
                        quantity: newQuantity,
                        total: newQuantity * Number(item.sale_price),
                    };
                }
                return item;
            })
        );
    };

    const removeFromCart = (itemId: number) => {
        setCartItems(cartItems.filter((item) => item.id !== itemId));
    };

    const clearCart = () => {
        setIsClearCartDialogOpen(true);
    };

    const confirmClearCart = () => {
        setCartItems([]);
        setShowCheckout(false);
        setAmountReceived("");
        setIsClearCartDialogOpen(false);
    };

    const handleSelectClient = (client: Customer) => {
        setSelectedCustomer(client);
        setCustomerSearch("");
    };

    const handleRemoveClient = () => {
        setSelectedCustomer(null);
    };

    const handleCreateCustomer = () => {
        if (!newCustomerName.trim()) return;
        const tempClient = { name: newCustomerName, phone: newCustomerPhone };
        setSelectedCustomer(tempClient);
        setIsCreatingCustomer(false);
        setNewCustomerName("");
        setNewCustomerPhone("");
    };

    // --- Procesar Venta (con Inertia y toast) ---
    const completeSale = () => {
        if (cartItems.length === 0) {
            toast({
                title: "Error",
                description: "El carrito está vacío",
                variant: "destructive",
            });
            return;
        }

        if (payment < total) {
            toast({
                title: "Error",
                description: "Monto insuficiente",
                variant: "destructive",
            });
            return;
        }

        const saleData = {
            items: cartItems.map((item) => ({
                id: item.id,
                quantity: item.quantity,
                salePrice: Number(item.sale_price),
            })),
            payment_method: paymentMethod,
            amount_received: payment,
            client_id: selectedCustomer?.id || null,
            client_name: selectedCustomer?.id ? null : selectedCustomer?.name,
            client_phone: selectedCustomer?.id ? null : selectedCustomer?.phone,
        };

        router.post("/vender", saleData, {
            onSuccess: () => {
                toast({
                    title: "¡Venta Exitosa!",
                    description:
                        paymentMethod === "efectivo"
                            ? `Cambio: $${change.toFixed(2)}`
                            : "Venta procesada correctamente",
                    className: "bg-green-500 text-white",
                });
                setCartItems([]);
                setShowCheckout(false);
                setAmountReceived("");
                setSelectedCustomer(null);
                setCustomerSearch("");
                setPaymentMethod("efectivo");
                setMobileCartOpen(false);
            },
            onError: (errors) => {
                console.error("Error en venta:", errors);

                // Extraer el mensaje de error específico del backend
                let errorMessage =
                    "No se pudo procesar la venta. Verifique los datos.";

                if (errors.error) {
                    errorMessage = errors.error;
                } else if (typeof errors === "string") {
                    errorMessage = errors;
                } else if (errors.message) {
                    errorMessage = errors.message;
                }

                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            },
        });
    };

    return (
        <MainLayout>
            <Head title="Vender" />

            <AlertDialog
                open={isClearCartDialogOpen}
                onOpenChange={setIsClearCartDialogOpen}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción vaciará todo el carrito de compras. No
                            podrás deshacer esta acción.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmClearCart}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Sí, vaciar carrito
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Hidden Ticket Component */}
            <div className="hidden">
                {ticketData && (
                    <Ticket
                        ref={ticketRef}
                        data={ticketData}
                        businessSettings={businessSettings}
                        printerSettings={printerSettings}
                    />
                )}
            </div>

            <div className="absolute inset-0 flex flex-col bg-background overflow-hidden">
                {/* Header - Reemplazamos con el Header del MainLayout */}
                <Header title="Nueva Venta" subtitle="Agrega productos al carrito y procesa el pago" />

                <div className="flex-1 flex overflow-hidden">
                    {/* Panel Izquierdo - Productos */}
                    {/* Panel Izquierdo - Productos */}
                    <div className="flex-1 flex flex-col bg-background p-6">
                        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">
                            {/* Configuración de Impresión Automática */}
                            <div className="bg-card border border-border rounded-lg p-3 sm:p-4 shadow-sm mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Printer className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                            <h3 className="font-semibold text-foreground text-sm sm:text-base">
                                                Impresión Automática
                                            </h3>
                                        </div>
                                        <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                                            Imprime el ticket automáticamente al
                                            finalizar la venta
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Label
                                            htmlFor="auto-print-switch"
                                            className="text-xs sm:text-sm font-medium"
                                        >
                                            {autoPrint ? "Activo" : "Inactivo"}
                                        </Label>
                                        <Switch
                                            id="auto-print-switch"
                                            checked={autoPrint}
                                            onCheckedChange={setAutoPrint}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Buscador */}
                            <div className="mb-6 flex items-center gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Buscar un producto por su descripción o código de barras"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Grid de Productos */}
                            <div className="bg-card rounded-lg border border-border flex flex-col flex-1 min-h-0">
                                {/* Paginación */}

                                <div className="flex-1 overflow-y-auto p-4">
                                    {filteredProducts.length === 0 ? (
                                        <p className="text-center text-muted-foreground mt-10">
                                            No se encontraron productos
                                        </p>
                                    ) : (
                                        <div
                                            className="grid gap-3 sm:gap-4"
                                            style={{
                                                gridTemplateColumns:
                                                    "repeat(auto-fill, minmax(150px, 1fr))",
                                            }}
                                        >
                                            {filteredProducts
                                                .slice(0, 20)
                                                .map((product) => (
                                                    <ProductCard
                                                        key={product.id}
                                                        product={product}
                                                        onAdd={addToCart}
                                                    />
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel Derecho - Carrito (Desktop) */}
                    <div
                        className={`${
                            mobileCartOpen
                                ? "fixed inset-0 z-50 bg-card"
                                : "hidden"
                        } lg:flex lg:relative lg:w-[380px] xl:w-[420px] bg-card flex-col shadow-xl z-20 rounded-t-xl overflow-hidden`}
                    >
                        {/* Header del carrito */}
                        <div className="p-3 sm:p-4 bg-blue-600 text-white shadow-md flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShoppingCart className="w-5 h-5" />
                                    <h2 className="font-bold text-base sm:text-lg">
                                        Carrito
                                    </h2>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white/20 px-3 py-0.5 rounded-full text-sm font-medium">
                                        {cartItems.length}
                                    </span>
                                    <button
                                        onClick={() => setMobileCartOpen(false)}
                                        className="lg:hidden p-1"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Items del carrito - CON SCROLL FIJO */}
                        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3 bg-muted/30 min-h-0">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-400 text-sm">
                                            Carrito vacío
                                        </p>
                                        <p className="text-gray-400 text-xs mt-1">
                                            Agrega productos desde el panel
                                            izquierdo
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                cartItems.map((item) => (
                                    <CartItemRow
                                        key={item.id}
                                        item={item}
                                        onIncrease={() =>
                                            updateQuantity(item.id, 1)
                                        }
                                        onDecrease={() =>
                                            updateQuantity(item.id, -1)
                                        }
                                        onRemove={removeFromCart}
                                    />
                                ))
                            )}
                        </div>

                        {/* Footer del carrito - SIEMPRE VISIBLE */}
                        {cartItems.length > 0 && (
                            <div className="bg-card p-3 sm:p-4 border-t border-border flex-shrink-0 shadow-lg">
                                <div className="flex justify-between items-baseline mb-3 sm:mb-4">
                                    <span className="text-lg sm:text-xl font-bold text-foreground">
                                        Total
                                    </span>
                                    <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                    <button
                                        onClick={clearCart}
                                        className="px-3 sm:px-4 py-2.5 sm:py-3 border border-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-50 text-sm sm:text-base transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCheckout(true);
                                            setMobileCartOpen(false);
                                        }}
                                        className="px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 text-sm sm:text-base transition-colors"
                                    >
                                        Cobrar (F9)
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modal Checkout */}
                {showCheckout && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
                            <div className="flex justify-between items-center border-b pb-3 sm:pb-4 sticky top-0 bg-card z-10">
                                <h2 className="text-lg sm:text-xl font-bold">
                                    Procesar Pago
                                </h2>
                                <button
                                    onClick={() => setShowCheckout(false)}
                                    className="p-1 hover:bg-gray-100 rounded-full"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Método de Pago */}
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-2 sm:mb-3">
                                    Método de Pago
                                </label>
                                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                                    <PaymentMethodButton
                                        icon={Banknote}
                                        label="Efectivo"
                                        isSelected={
                                            paymentMethod === "efectivo"
                                        }
                                        onClick={() => {
                                            setPaymentMethod("efectivo");
                                            setAmountReceived(total.toFixed(2));
                                        }}
                                    />
                                    <PaymentMethodButton
                                        icon={CreditCard}
                                        label="Tarjeta"
                                        isSelected={paymentMethod === "tarjeta"}
                                        onClick={() => {
                                            setPaymentMethod("tarjeta");
                                            setAmountReceived(total.toFixed(2));
                                        }}
                                    />
                                    <PaymentMethodButton
                                        icon={DollarSign}
                                        label="Transfer"
                                        isSelected={
                                            paymentMethod === "transferencia"
                                        }
                                        onClick={() => {
                                            setPaymentMethod("transferencia");
                                            setAmountReceived(total.toFixed(2));
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Cliente */}
                            <div>
                                <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                                    Cliente (Opcional)
                                </label>

                                {isCreatingCustomer ? (
                                    <div className="space-y-2 border p-3 rounded bg-muted animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                Nuevo Cliente
                                            </span>
                                            <button
                                                onClick={() =>
                                                    setIsCreatingCustomer(false)
                                                }
                                                className="text-muted-foreground hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <input
                                            className="w-full border border-input bg-background text-foreground p-2 rounded text-sm"
                                            placeholder="Nombre completo *"
                                            value={newCustomerName}
                                            onChange={(e) =>
                                                setNewCustomerName(
                                                    e.target.value
                                                )
                                            }
                                            autoFocus
                                        />
                                        <input
                                            className="w-full border border-input bg-background text-foreground p-2 rounded text-sm"
                                            placeholder="Teléfono (opcional)"
                                            value={newCustomerPhone}
                                            onChange={(e) =>
                                                setNewCustomerPhone(
                                                    e.target.value
                                                )
                                            }
                                        />
                                        <button
                                            onClick={handleCreateCustomer}
                                            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 text-sm font-medium transition-colors"
                                        >
                                            Usar este cliente
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        {selectedCustomer ? (
                                            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-full">
                                                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-foreground">
                                                            {
                                                                selectedCustomer.name
                                                            }
                                                        </p>
                                                        {selectedCustomer.phone && (
                                                            <p className="text-xs text-muted-foreground">
                                                                {
                                                                    selectedCustomer.phone
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleRemoveClient}
                                                    className="text-muted-foreground hover:text-red-500 p-1"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                    <input
                                                        className="w-full pl-9 pr-4 py-2 border border-input bg-background text-foreground rounded-lg focus:ring-2 focus:ring-ring focus:border-ring outline-none transition-all text-sm"
                                                        placeholder="Buscar cliente..."
                                                        value={customerSearch}
                                                        onChange={(e) =>
                                                            setCustomerSearch(
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                    {customerSearch && (
                                                        <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                            {filteredClients.length >
                                                            0 ? (
                                                                filteredClients.map(
                                                                    (
                                                                        client
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                client.id
                                                                            }
                                                                            onClick={() =>
                                                                                handleSelectClient(
                                                                                    client
                                                                                )
                                                                            }
                                                                            className="p-2 hover:bg-accent cursor-pointer text-sm border-b last:border-0 flex justify-between items-center"
                                                                        >
                                                                            <span>
                                                                                {
                                                                                    client.name
                                                                                }
                                                                            </span>
                                                                            {client.phone && (
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    {
                                                                                        client.phone
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                )
                                                            ) : (
                                                                <div className="p-3 text-sm text-muted-foreground text-center">
                                                                    No
                                                                    encontrado
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() =>
                                                        setIsCreatingCustomer(
                                                            true
                                                        )
                                                    }
                                                    className="p-2 bg-muted rounded-lg hover:bg-accent text-muted-foreground border border-border transition-colors"
                                                    title="Crear nuevo cliente"
                                                >
                                                    <UserPlus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Resumen y Pago */}
                            <div className="bg-card border border-border p-3 sm:p-4 rounded-xl space-y-3">
                                <div className="flex justify-between text-lg sm:text-xl font-bold">
                                    <span className="text-foreground">
                                        Total:
                                    </span>
                                    <span className="text-blue-600 dark:text-blue-400">
                                        ${total.toFixed(2)}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                                        <label className="font-semibold text-sm sm:text-base text-foreground whitespace-nowrap">
                                            Monto a Pagar:
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            autoFocus
                                            className="flex-1 w-full border border-input bg-background text-foreground rounded p-2 font-bold text-base sm:text-lg text-right"
                                            value={amountReceived}
                                            onChange={(e) =>
                                                setAmountReceived(
                                                    e.target.value
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                e.key === "Enter" &&
                                                completeSale()
                                            }
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="flex justify-between text-base sm:text-lg">
                                        <span className="text-foreground">
                                            Cambio:
                                        </span>
                                        <span
                                            className={`font-bold ${
                                                change < 0
                                                    ? "text-red-500 dark:text-red-400"
                                                    : "text-green-600 dark:text-green-400"
                                            }`}
                                        >
                                            ${change.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={completeSale}
                                className="w-full py-3 sm:py-4 bg-green-600 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-green-700 transition-colors shadow-lg"
                            >
                                Confirmar Venta
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
