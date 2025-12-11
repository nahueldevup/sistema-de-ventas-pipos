import React from "react";
import { Sidebar } from "@/Components/Sidebar";
import { usePage } from "@inertiajs/react";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // usePage nos da acceso a la información de la página actual, incluyendo la URL
    const { url } = usePage();

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
