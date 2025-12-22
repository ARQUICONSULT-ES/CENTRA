"use client";

import Link from "next/link";
import { UserMenu } from "@/components/UserMenu";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Función para determinar si una ruta está activa
  const isActive = (path: string) => pathname === path;

  // Redirigir a login si no hay sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Mostrar loading mientras se verifica la sesión
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
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
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4 md:gap-8">
              <Link
                href="/"
                className="flex items-center text-xl font-bold text-gray-900 dark:text-white"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg mr-2">
                  <span className="text-sm font-bold text-white">CEM</span>
                </div>
                {/* Mostrar en móvil y desktop, ocultar en tablet */}
                <span className="md:hidden lg:inline">Customer Environment Manager</span>
              </Link>
              
              {/* Navegación desktop */}
              <nav className="hidden md:flex items-center gap-4 lg:gap-6">
                <Link
                  href="/repos"
                  className={`text-sm font-medium transition-colors relative ${
                    isActive('/repos')
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Repositorios
                  {isActive('/repos') && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></span>
                  )}
                </Link>
                <Link
                  href="/customers"
                  className={`text-sm font-medium transition-colors relative ${
                    isActive('/customers')
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Clientes
                  {isActive('/customers') && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></span>
                  )}
                </Link>
                <Link
                  href="/environments"
                  className={`text-sm font-medium transition-colors relative ${
                    isActive('/environments')
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Entornos
                  {isActive('/environments') && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></span>
                  )}
                </Link>
                <Link
                  href="/applications"
                  className={`text-sm font-medium transition-colors relative ${
                    isActive('/applications')
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Aplicaciones
                  {isActive('/applications') && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></span>
                  )}
                </Link>
                {session?.user?.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={`text-sm font-medium transition-colors relative ${
                      isActive('/admin')
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-purple-700 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300'
                    }`}
                  >
                    Administración
                    {isActive('/admin') && (
                      <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-purple-600 dark:bg-purple-400"></span>
                    )}
                  </Link>
                )}
              </nav>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              {/* UserMenu desktop */}
              <div className="hidden md:block">
                <UserMenu />
              </div>
              
              {/* Botón menú móvil */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
          
          {/* Menú móvil desplegable */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-4 space-y-3">
              <Link
                href="/repos"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/repos')
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                Repositorios
              </Link>
              <Link
                href="/customers"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/customers')
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                Clientes
              </Link>
              <Link
                href="/environments"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/environments')
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                Entornos
              </Link>
              <Link
                href="/applications"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive('/applications')
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                Aplicaciones
              </Link>
              {session?.user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive('/admin')
                      ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                      : 'text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-gray-800'
                  }`}
                >
                  Administración
                </Link>
              )}
              
              {/* UserMenu móvil */}
              <div className="px-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <UserMenu />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
