import React, { forwardRef } from "react";

// Interfaces para los datos
interface TicketItem {
    descripcion: string;
    cantidad: number;
    precio: number;
    total: number;
}

export interface TicketData {
    folio: string;
    fecha: string;
    cliente: string;
    cajero: string;
    items: TicketItem[];
    subtotal: number;
    total: number;
    pago: number;
    cambio: number;
    metodo_pago: string;
}

interface BusinessSettings {
    business_name: string;
    tax_id?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    logo_path?: string | null;
}

interface PrinterSettings {
    show_logo: boolean;
    show_business_info: boolean;
    header_message?: string | null;
    footer_message?: string | null;
    paper_size: string;
}

interface Props {
    data: TicketData;
    businessSettings?: BusinessSettings;
    printerSettings?: PrinterSettings;
}

// IMPORTANTE: forwardRef es obligatorio para imprimir
export const Ticket = forwardRef<HTMLDivElement, Props>(
    ({ data, businessSettings, printerSettings }, ref) => {
        // Si no hay datos, no renderizamos nada para evitar errores
        if (!data) return null;

        // Valores por defecto si no se pasan configuraciones
        const business = businessSettings || {
            business_name: "Mi Tienda POS",
            address: "Av. Siempre Viva 123",
            phone: "555-1234",
        };

        const printer = printerSettings || {
            show_logo: false,
            show_business_info: true,
            header_message: "",
            footer_message: "¡Gracias por su compra!",
            paper_size: "80mm",
        };

        // Determinar ancho según tamaño de papel
        const widthClass =
            printer.paper_size === "58mm" ? "w-[220px]" : "w-[300px]";

        return (
            <div
                ref={ref}
                className={`p-4 bg-white text-black font-mono text-xs ${widthClass} mx-auto border shadow-sm print:shadow-none print:border-none print:w-full`}
            >
                {/* LOGO (si está configurado) */}
                {printer.show_logo && business.logo_path && (
                    <div className="text-center mb-2">
                        <img
                            src={`/storage/${business.logo_path}`}
                            alt="Logo"
                            className="h-16 mx-auto object-contain"
                        />
                    </div>
                )}

                {/* MENSAJE DE ENCABEZADO PERSONALIZADO */}
                {printer.header_message && (
                    <div className="text-center mb-2">
                        <p className="font-semibold">
                            {printer.header_message}
                        </p>
                    </div>
                )}

                {/* CABECERA - DATOS DEL NEGOCIO */}
                {printer.show_business_info && (
                    <div className="text-center mb-4">
                        <h2 className="text-lg font-bold uppercase">
                            {business.business_name}
                        </h2>
                        {business.tax_id && <p>CUIT: {business.tax_id}</p>}
                        {business.address && <p>{business.address}</p>}
                        {business.phone && <p>Tel: {business.phone}</p>}
                        {business.email && <p>{business.email}</p>}
                    </div>
                )}

                {/* DATOS DE LA VENTA */}
                <div className="text-center border-y-2 border-dashed border-black py-2 my-2">
                    <p>Folio: {data.folio}</p>
                    <p>Fecha: {data.fecha}</p>
                </div>

                {/* DATOS CLIENTE */}
                <div className="mb-2">
                    <p>Cliente: {data.cliente}</p>
                    <p>Atendió: {data.cajero}</p>
                </div>

                {/* TABLA PRODUCTOS */}
                <div className="border-b-2 border-dashed border-black mb-2" />
                <table className="w-full text-left mb-2">
                    <thead>
                        <tr>
                            <th className="w-10">Cant.</th>
                            <th>Desc.</th>
                            <th className="text-right">Importe</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item, index) => (
                            <tr key={index}>
                                <td className="align-top">{item.cantidad}</td>
                                <td className="align-top">
                                    {item.descripcion}
                                </td>
                                <td className="text-right align-top">
                                    ${Number(item.total).toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="border-b-2 border-dashed border-black mb-2" />

                {/* TOTALES */}
                <div className="text-right space-y-1">
                    <div className="flex justify-between font-bold text-sm">
                        <span>TOTAL:</span>
                        <span>${Number(data.total).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span>Pago ({data.metodo_pago}):</span>
                        <span>${Number(data.pago).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span>Cambio:</span>
                        <span>${Number(data.cambio).toFixed(2)}</span>
                    </div>
                </div>

                {/* PIE - MENSAJE PERSONALIZADO */}
                <div className="text-center mt-6">
                    {printer.footer_message && <p>{printer.footer_message}</p>}
                    <p className="text-[10px] mt-1">Conserve este ticket</p>
                </div>
            </div>
        );
    }
);

Ticket.displayName = "Ticket";
