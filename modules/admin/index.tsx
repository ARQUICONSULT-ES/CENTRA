"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useUsers } from "@/modules/admin/hooks/useUsers";
import { useUserFilter } from "@/modules/admin/hooks/useUserFilter";
import UserList from "@/modules/admin/components/UserList";
import UserFormModal from "@/modules/admin/components/UserFormModal";
import type { User } from "@/modules/admin/types";
import { useToast } from "@/modules/shared/hooks/useToast";
import ToastContainer from "@/modules/shared/components/ToastContainer";

export function AdminPage() {
  const { toasts, removeToast } = useToast();
  const { data: session, status } = useSession();
  const router = useRouter();
  const { users, isLoading, isRefreshing, refreshUsers } = useUsers();
  const {
    filteredUsers,
    searchQuery,
    setSearchQuery,
  } = useUserFilter(users);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // Verificar que el usuario sea admin
  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-4 animate-pulse">
            <span className="text-2xl font-bold text-white">Admin</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Redirigir si no tiene permiso de admin
  if (!session?.user?.canAccessAdmin) {
    router.push("/customers");
    return null;
  }

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(undefined);
    setIsUserModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(undefined);
  };

  const handleSave = async () => {
    await refreshUsers();
  };

  const handleRefresh = async () => {
    await refreshUsers();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Usuarios
          </h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-wait rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Actualizar"
          >
            {isRefreshing ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {users.length} usuarios registrados
        </p>
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre o email..."
            autoComplete="off"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          />
        </div>

        <button
          onClick={handleCreateUser}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors whitespace-nowrap"
          title="Crear nuevo usuario"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Añadir usuario
        </button>
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
        onSave={handleSave}
      />

      {/* Contenido */}
      {isLoading ? (
        <UserList users={[]} isLoading={true} onUserClick={handleUserClick} />
      ) : filteredUsers.length > 0 ? (
        <UserList users={filteredUsers} isLoading={false} onUserClick={handleUserClick} />
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? `No se encontraron usuarios con "${searchQuery}"` : "No hay usuarios"}
          </p>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
