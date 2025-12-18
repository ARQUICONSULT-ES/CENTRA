"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import UserSettingsForm from "@/modules/admin/components/UserSettingsForm";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirigir a login si no hay sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Mostrar loading mientras se verifica la sesión
  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">CEM</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  // No mostrar contenido si no está autenticado
  if (status === "unauthenticated" || !session?.user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Ajustes de Usuario
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configura tu perfil y preferencias personales
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <UserSettingsForm />
      </div>
    </div>
  );
}
