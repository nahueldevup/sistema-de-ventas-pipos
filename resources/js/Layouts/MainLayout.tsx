import React, { useEffect, useRef } from "react";
import { Sidebar } from "@/Components/Sidebar";
import { usePage } from "@inertiajs/react";
import { useToast } from "@/Hooks/use-toast";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // usePage nos da acceso a la información de la página actual, incluyendo la URL
    const { url } = usePage();
    const { dismiss } = useToast();
    const previousUrl = useRef(url);

    // CRÍTICO: Limpiar toasts automáticamente cuando el usuario cambia de página
    useEffect(() => {
        if (previousUrl.current !== url) {
            dismiss(); // Cierra todos los toasts abiertos
            previousUrl.current = url;
        }
    }, [url, dismiss]);

    // Verificamos si estamos en una página de autenticación para ocultar el Sidebar
    const isAuthPage =
        url.startsWith("/login") ||
        url.startsWith("/register") ||
        url.startsWith("/forgot-password");

    return (
        <div className="flex min-h-screen w-full bg-background">
            {!isAuthPage && <Sidebar />}
            <div
                className={
                    isAuthPage ? "flex-1" : "flex-1 flex flex-col relative"
                }
            >
                {children}
            </div>
        </div>
    );
}
