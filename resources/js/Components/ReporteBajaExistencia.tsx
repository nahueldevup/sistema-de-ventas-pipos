import React, { forwardRef } from "react";

interface Producto {
    id: number;
    barcode?: string;
    description: string;
    category?: { name: string };
    stock: number;
    min_stock: number;
    purchase_price: number;
}

export interface ReporteBajaExistenciaData {
    fecha: string;
    productos: Producto[];
}

interface Props {
    data: ReporteBajaExistenciaData;
}

export const ReporteBajaExistencia = forwardRef<HTMLDivElement, Props>(
    function ReporteBajaExistencia({ data }, ref) {
        if (!data) return null;

        const totalInversion = data.productos.reduce((acc, prod) => {
            const deficit = Math.max(0, prod.min_stock - prod.stock);
            return acc + deficit * prod.purchase_price;
        }, 0);

        return (
            <div
                ref={ref}
                className="p-8 bg-white text-black max-w-4xl mx-auto"
            >
                {/* CABECERA */}
                <div className="text-center mb-6 border-b-2 border-gray-800 pb-4">
                    <h1 className="text-2xl font-bold uppercase">
                        Lista de Reabastecimiento
                    </h1>
                    <p className="text-sm text-gray-600 mt-2">{data.fecha}</p>
                    <p className="text-sm text-gray-600">
                        Total de productos: {data.productos.length}
                    </p>
                </div>

                {/* TABLA */}
                <table className="w-full text-sm border border-gray-300">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2 text-center w-10">
                                <span className="sr-only">Check</span>
                            </th>
                            <th className="border border-gray-300 p-2 text-left">
                                Producto
                            </th>
                            <th className="border border-gray-300 p-2 text-left">
                                Categoría
                            </th>
                            <th className="border  border-gray-300 p-2 text-center">
                                Stock
                            </th>
                            <th className="border border-gray-300 p-2 text-center">
                                Mín.
                            </th>
                            <th className="border border-gray-300 p-2 text-center">
                                Pedir
                            </th>
                            <th className="border border-gray-300 p-2 text-right">
                                Costo
                            </th>
                            <th className="border border-gray-300 p-2 text-right">
                                Total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.productos.map((prod, index) => {
                            const deficit = prod.min_stock - prod.stock;
                            return (
                                <tr key={index}>
                                    <td className="border border-gray-300 p-2 text-center">
                                        <div className="w-4 h-4 border border-gray-400 mx-auto"></div>
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <div className="font-bold text-sm">
                                            {prod.description}
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono">
                                            {prod.barcode || "S/C"}
                                        </div>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-sm">
                                        {prod.category?.name || "General"}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center font-bold text-red-600">
                                        {prod.stock}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center text-gray-600">
                                        {prod.min_stock}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center font-bold text-lg">
                                        {deficit}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-right text-sm">
                                        $
                                        {Number(prod.purchase_price).toFixed(2)}
                                    </td>
                                    <td className="border border-gray-300 p-2 text-right font-bold text-sm">
                                        $
                                        {(
                                            deficit * prod.purchase_price
                                        ).toFixed(2)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100 font-bold">
                            <td
                                colSpan={7}
                                className="border border-gray-300 p-2 text-right"
                            >
                                TOTAL ESTIMADO DE INVERSIÓN:
                            </td>
                            <td className="border border-gray-300 p-2 text-right">
                                $
                                {totalInversion.toLocaleString("es-AR", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                })}
                            </td>
                        </tr>
                    </tfoot>
                </table>

                {/* PIE */}
                <div className="mt-6 text-xs text-gray-500 text-center border-t pt-4">
                    <p>
                        Documento generado el{" "}
                        {new Date().toLocaleString("es-ES")}
                    </p>
                </div>
            </div>
        );
    }
);
