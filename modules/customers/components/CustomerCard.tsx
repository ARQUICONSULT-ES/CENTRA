"use client";

import { useState, useRef } from "react";
import type { CustomerCardProps } from "@/modules/customers/types";

export function CustomerCard({ customer, onEdit }: CustomerCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEdit = () => {
    onEdit?.(customer);
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header con nombre, imagen y menú */}
      <div className="p-4 flex items-start gap-3">
        {/* Imagen del cliente */}
        <div className="flex-shrink-0">
          {customer.imageBase64 ? (
            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
              <img
                src={customer.imageBase64}
                alt={customer.customerName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Información del cliente */}
        <div className="flex-1 min-w-0">
          <button
            onClick={handleEdit}
            className="font-semibold text-gray-900 dark:text-white text-base truncate text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors block w-full"
          >
            {customer.customerName}
          </button>
          
          {/* Contadores con estilo del EnvironmentCard */}
          <div className="mt-2 grid grid-cols-2 gap-3">
            {/* Tenants Count */}
            {customer.tenantsCount !== undefined && (
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tenants</p>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {customer.tenantsCount}
                  </span>
                </div>
              </div>
            )}

            {/* Environments Count */}
            {customer.activeEnvironmentsCount !== undefined && (
              <div className="flex items-center gap-2 text-xs">
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Entornos</p>
                  <span className="text-xs font-medium text-gray-900 dark:text-white">
                    {customer.activeEnvironmentsCount}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menú de 3 puntos */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuToggle}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
            title="Más opciones"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Editar customer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
