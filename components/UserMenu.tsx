"use client";

import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import UserFormModal from "@/modules/admin/components/UserFormModal";
import type { User } from "@/modules/admin/types";

export function UserMenu() {
  const { data: session, status, update: updateSession } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut({ 
      callbackUrl: "/",
      redirect: true 
    });
  };

  const handleSettings = () => {
    setIsOpen(false);
    setShowSettingsModal(true);
  };

  const handleSaveSettings = () => {
    // Los datos se recargan automáticamente al abrir el modal
    setShowSettingsModal(false);
  };

  if (status === "loading") {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
    );
  }

  if (!session?.user) {
    return null; // No mostrar nada si no hay sesión
  }

  const user = session.user;

  // Convertir datos de sesión al formato User
  const currentUser: User | undefined = session?.user ? {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    isActive: true, // Si tiene sesión activa, está activo
    canAccessRepos: session.user.canAccessRepos ?? false,
    canAccessCustomers: session.user.canAccessCustomers ?? false,
    allCustomers: session.user.allCustomers ?? false,
    canAccessAdmin: session.user.canAccessAdmin ?? false,
    githubToken: session.user.githubToken || null,
    githubAvatar: session.user.image || null,
    createdAt: session.user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    password: "",
    allowedCustomers: [],
  } : undefined;

  const handleToggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Desktop: Solo botón de avatar */}
        <button
          onClick={handleToggleMenu}
          type="button"
          className="hidden md:flex rounded-full w-10 h-10 overflow-hidden ring-2 ring-transparent hover:ring-blue-400 dark:hover:ring-blue-600 transition-all items-center justify-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Menú de usuario"
        >
          {user.image ? (
            <img 
              src={user.image} 
              alt={user.name || user.email || "Usuario"} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
            </div>
          )}
        </button>

        {/* Móvil: Avatar + Info del usuario */}
        <div className="md:hidden flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full w-12 h-12 overflow-hidden ring-2 ring-blue-400 dark:ring-blue-600 flex items-center justify-center shrink-0">
              {user.image ? (
                <img 
                  src={user.image} 
                  alt={user.name || user.email || "Usuario"} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
          
          {/* Botones de acción en móvil */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSettings}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Ajustes
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 rounded-xl cursor-pointer transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Menú desplegable desktop */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.name || user.email}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
            <div className="py-1">
              <button
                onClick={handleSettings}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Ajustes
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && currentUser && (
        <UserFormModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          user={currentUser}
          onSave={handleSaveSettings}
          protectedMode={true}
        />
      )}
    </>
  );
}
