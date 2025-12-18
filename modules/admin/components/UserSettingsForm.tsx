"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserFormModal from "./UserFormModal";
import type { User } from "@/modules/admin/types";

interface UserSettingsFormProps {
  onSave?: () => void;
}

export default function UserSettingsForm({ onSave }: UserSettingsFormProps) {
  const { data: session, status, update: updateSession } = useSession();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | undefined>();

  // Cargar datos del usuario desde la sesión
  useEffect(() => {
    if (session?.user) {
      // Convertir los datos de sesión al formato User esperado por el modal
      const userData: User = {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role as "ADMIN" | "USER",
        githubToken: session.user.githubToken || null,
        githubAvatar: session.user.image || null,
        createdAt: session.user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        password: "", // No se usa
        allowedCustomers: [], // No se muestra en modo protegido
      };
      setCurrentUser(userData);
      setShowModal(true); // Mostrar el modal automáticamente
    }
  }, [session]);

  const handleSave = async () => {
    // Actualizar la sesión para reflejar los cambios
    await updateSession();
    onSave?.();
  };

  const handleClose = () => {
    setShowModal(false);
    // Volver a la página anterior
    router.back();
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-3 animate-pulse">
            <span className="text-lg font-bold text-white">CEM</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || !currentUser) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          No se pudo cargar la información del usuario.
        </p>
      </div>
    );
  }

  return (
    <UserFormModal
      isOpen={showModal}
      onClose={handleClose}
      user={currentUser}
      onSave={handleSave}
      protectedMode={true}
    />
  );
}
