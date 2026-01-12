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
  // También considera activas las rutas hijas (ej: /customers/123 activa /customers)
  const isActive = (path: string) => {
    if (pathname === path) return true;
    // Si estamos en una ruta hija, también marcar como activa
    return pathname.startsWith(path + '/');
  };

  // Redirigir a login si no hay sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Bloquear scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Cerrar menú móvil cuando cambia la ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Mostrar loading mientras se verifica la sesión
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <img 
            src="/logo.png" 
            alt="CENTRA Logo" 
            className="w-20 h-20 mx-auto mb-4 object-contain animate-logo-blink"
          />
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto px-4 max-w-7xl">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4 md:gap-8 min-w-0">
              <Link
                href="/"
                className="flex items-center text-xl font-bold text-gray-900 dark:text-white shrink-0"
              >
                <img 
                  src="/logo.png" 
                  alt="CENTRA Logo" 
                  className="w-10 h-10 mr-2 object-contain"
                />
                {/* Mostrar texto cuando el viewport sea suficientemente ancho */}
                <span className="hidden min-[400px]:inline truncate text-xl sm:text-2xl md:text-2xl">CENTRA</span>
              </Link>
              
              {/* Navegación desktop */}
              <nav className="hidden md:flex items-center gap-4 lg:gap-6">
                {session?.user?.canAccessRepos && (
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
                )}
                {session?.user?.canAccessCustomers && (
                  <>
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
                      href="/installed-apps"
                      className={`text-sm font-medium transition-colors relative ${
                        isActive('/installed-apps')
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                      }`}
                    >
                      Instalaciones
                      {isActive('/installed-apps') && (
                        <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></span>
                      )}
                    </Link>
                  </>
                )}
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
                <Link
                  href="/id-ranges"
                  className={`text-sm font-medium transition-colors relative ${
                    isActive('/id-ranges')
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Rangos IDs
                  {isActive('/id-ranges') && (
                    <span className="absolute -bottom-[21px] left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></span>
                  )}
                </Link>
                {session?.user?.canAccessAdmin && (
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
              
              {/* Botón menú móvil con animación hamburguesa → X */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors cursor-pointer z-50 relative"
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
              >
                <div className="w-6 h-6 relative flex flex-col justify-center items-center">
                  <span 
                    className={`block absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${
                      isMobileMenuOpen ? 'rotate-45' : '-translate-y-1.5'
                    }`}
                  />
                  <span 
                    className={`block absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${
                      isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'
                    }`}
                  />
                  <span 
                    className={`block absolute h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${
                      isMobileMenuOpen ? '-rotate-45' : 'translate-y-1.5'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menú móvil fullscreen overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white dark:bg-gray-900 pt-16 overflow-y-auto">
          <div className="px-4 py-6 space-y-2">
            {session?.user?.canAccessRepos && (
              <Link
                href="/repos"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 text-base font-medium rounded-xl transition-colors ${
                  isActive('/repos')
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Repositorios
              </Link>
            )}
            {session?.user?.canAccessCustomers && (
              <>
                <Link
                  href="/customers"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 text-base font-medium rounded-xl transition-colors ${
                    isActive('/customers')
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Clientes
                </Link>
                <Link
                  href="/environments"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 text-base font-medium rounded-xl transition-colors ${
                    isActive('/environments')
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Entornos
                </Link>
                <Link
                  href="/installed-apps"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 text-base font-medium rounded-xl transition-colors ${
                    isActive('/installed-apps')
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Instalaciones
                </Link>
              </>
            )}
            <Link
              href="/applications"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-4 text-base font-medium rounded-xl transition-colors ${
                isActive('/applications')
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              Aplicaciones
            </Link>
            <Link
              href="/id-ranges"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-4 text-base font-medium rounded-xl transition-colors ${
                isActive('/id-ranges')
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Rangos de IDs
            </Link>
            {session?.user?.canAccessAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-4 text-base font-medium rounded-xl transition-colors ${
                  isActive('/admin')
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
                    : 'text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-gray-800'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Administración
              </Link>
            )}
            
            {/* Separador */}
            <div className="my-4 border-t border-gray-200 dark:border-gray-800"></div>
            
            {/* UserMenu móvil */}
            <div className="px-4">
              <UserMenu />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto px-4 py-6 max-w-7xl sm:py-8">{children}</main>
    </div>
  );
}
