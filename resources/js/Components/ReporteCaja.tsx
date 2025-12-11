import React, { forwardRef } from "react";

// Interfaces para los datos del reporte
interface Movement {
    id: number;
    amount: number;
    description: string;
    type: "ingreso" | "egreso";
    created_at: string;
    user: { name: string };
}

export interface ReporteCajaData {
    fecha: string;
    usuario: string;
    sales_cash: number;
    sales_digital: number;
    manual_incomes: number;
    manual_expenses: number;
    expected_cash: number;
    counted_cash: number;
    difference: number;
    notes?: string;
    movements: Movement[];
}

interface Props {
    data: ReporteCajaData;
}

// IMPORTANTE: forwardRef es obligatorio para imprimir
export const ReporteCaja = forwardRef<HTMLDivElement, Props>(
    ({ data }, ref) => {
        if (!data) return null;

        const differenceColor =
            data.difference === 0
                ? "text-green-700"
                : data.difference > 0
                ? "text-blue-700"
                : "text-red-700";

        const differenceBg =
            data.difference === 0
                ? "bg-green-50 border-green-200"
                : data.difference > 0
                ? "bg-blue-50 border-blue-200"
                : "bg-red-50 border-red-200";

        const differenceLabel =
            data.difference === 0
                ? "Balance Perfecto"
                : data.difference > 0
                ? "Sobrante"
                : "Faltante";

        return (
            <div
                ref={ref}
                className="p-8 bg-white text-black w-[800px] mx-auto print:w-full print:p-6"
            >
                {/* CABECERA */}
                <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
                    <h1 className="text-2xl font-bold uppercase mb-2">
                        Reporte de Cierre de Caja
                    </h1>
                    <p className="text-sm text-gray-600">Mi Tienda POS</p>
                    <p className="text-sm text-gray-600">
                        Av. Siempre Viva 123 | Tel: 555-1234
                    </p>
                    <div className="mt-3 text-sm">
                        <p>
                            <strong>Fecha:</strong> {data.fecha}
                        </p>
                        <p>
                            <strong>Responsable:</strong> {data.usuario}
                        </p>
                    </div>
                </div>

                {/* RESUMEN FINANCIERO */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold mb-3 bg-gray-100 p-2">
                        Resumen Financiero
                    </h2>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        {/* Columna Izquierda: Sistema */}
                        <div className="border border-gray-300 p-3 rounded">
                            <h3 className="font-bold text-sm mb-2 text-gray-700">
                                Datos del Sistema
                            </h3>
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-1">
                                            Ventas Efectivo:
                                        </td>
                                        <td className="text-right font-semibold text-green-700">
                                            ${" "}
                                            {Number(data.sales_cash).toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-1">
                                            Ventas Digitales:
                                        </td>
                                        <td className="text-right font-semibold text-blue-700">
                                            ${" "}
                                            {Number(data.sales_digital).toFixed(
                                                2
                                            )}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-1">
                                            + Ingresos Manuales:
                                        </td>
                                        <td className="text-right font-semibold text-green-600">
                                            ${" "}
                                            {Number(
                                                data.manual_incomes
                                            ).toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-1">
                                            - Egresos Manuales:
                                        </td>
                                        <td className="text-right font-semibold text-red-600">
                                            ${" "}
                                            {Number(
                                                data.manual_expenses
                                            ).toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr className="font-bold border-t-2 border-gray-400">
                                        <td className="py-2">
                                            Esperado en Cajón:
                                        </td>
                                        <td className="text-right text-lg">
                                            ${" "}
                                            {Number(data.expected_cash).toFixed(
                                                2
                                            )}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Columna Derecha: Resultado */}
                        <div className="border border-gray-300 p-3 rounded">
                            <h3 className="font-bold text-sm mb-2 text-gray-700">
                                Resultado del Arqueo
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-yellow-50 border border-yellow-300 p-3 rounded text-center">
                                    <p className="text-xs uppercase text-yellow-800 font-semibold">
                                        Dinero Contado
                                    </p>
                                    <p className="text-2xl font-bold text-yellow-900">
                                        $ {Number(data.counted_cash).toFixed(2)}
                                    </p>
                                </div>

                                <div
                                    className={`border p-3 rounded text-center font-bold ${differenceBg} ${differenceColor}`}
                                >
                                    <p className="text-sm">{differenceLabel}</p>
                                    {data.difference !== 0 && (
                                        <p className="text-xl">
                                            ${" "}
                                            {Math.abs(data.difference).toFixed(
                                                2
                                            )}
                                        </p>
                                    )}
                                </div>

                                {data.notes && (
                                    <div className="bg-gray-50 border border-gray-300 p-2 rounded text-xs italic text-gray-700">
                                        <strong>Notas:</strong> {data.notes}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* DETALLE DE MOVIMIENTOS */}
                {data.movements && data.movements.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-bold mb-3 bg-gray-100 p-2">
                             Movimientos Manuales del Día
                        </h2>
                        <table className="w-full text-sm border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border border-gray-300 p-2 text-left">
                                        Hora
                                    </th>
                                    <th className="border border-gray-300 p-2 text-left">
                                        Tipo
                                    </th>
                                    <th className="border border-gray-300 p-2 text-left">
                                        Descripción
                                    </th>
                                    <th className="border border-gray-300 p-2 text-left">
                                        Usuario
                                    </th>
                                    <th className="border border-gray-300 p-2 text-right">
                                        Monto
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.movements.map((mov, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="border border-gray-300 p-2">
                                            {new Date(
                                                mov.created_at
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-semibold ${
                                                    mov.type === "ingreso"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-red-100 text-red-800"
                                                }`}
                                            >
                                                {mov.type.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            {mov.description}
                                        </td>
                                        <td className="border border-gray-300 p-2">
                                            {mov.user.name}
                                        </td>
                                        <td
                                            className={`border border-gray-300 p-2 text-right font-bold ${
                                                mov.type === "ingreso"
                                                    ? "text-green-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {mov.type === "ingreso" ? "+" : "-"}{" "}
                                            $ {Number(mov.amount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PIE DE PÁGINA */}
                <div className="mt-8 pt-4 border-t-2 border-gray-300 text-center text-xs text-gray-500">
                    <p>
                        Este documento es un comprobante oficial del cierre de
                        caja
                    </p>
                    <p className="mt-1">
                        Impreso el {new Date().toLocaleString("es-ES")}
                    </p>
                </div>
            </div>
        );
    }
);

ReporteCaja.displayName = "ReporteCaja";
