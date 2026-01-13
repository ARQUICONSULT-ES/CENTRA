"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { CustomerCardProps } from "@/modules/customers/types";

export function CustomerCard({ customer, onEdit }: CustomerCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEdit = () => {
    onEdit?.(customer);
    setIsMenuOpen(false);
  };

  const handleEnvironmentsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/environments?filterCustomer=${encodeURIComponent(customer.customerName)}`);
  };

  const handleCardClick = () => {
    handleEdit();
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-all shadow-sm hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer"
    >
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
          {/* Nombre y Badge con responsive */}
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base min-w-0 flex-1">
              {customer.customerName}
            </h3>
            
            {/* Badge de tipo de infraestructura */}
            {customer.infraestructureType && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium flex-shrink-0 ${
                customer.infraestructureType === 'Saas'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
              }`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {customer.infraestructureType === 'Saas' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.052A4.001 4.001 0 003 15z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM9 13V9m0 0V5m0 4h6m0 0v4m0 4a2 2 0 11-4 0 2 2 0 014 0zM9 7a1 1 0 100-2 1 1 0 000 2z M19 11h-8v8h8v-8z" />
                  )}
                </svg>
                {customer.infraestructureType === 'Saas' ? 'SaaS' : 'On-Premise'}
              </span>
            )}
          </div>
          
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
              <button
                onClick={handleEnvironmentsClick}
                className="flex items-center gap-2 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded p-1 transition-colors cursor-pointer group/env border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                title="Ver entornos del cliente"
              >
                <svg className="w-3.5 h-3.5 text-gray-400 group-hover/env:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div className="min-w-0 text-left">
                  <p className="text-xs text-gray-500 dark:text-gray-400 group-hover/env:text-blue-600 dark:group-hover/env:text-blue-400 flex items-center gap-1">
                    Entornos
                    <svg className="w-3 h-3 text-gray-400 group-hover/env:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </p>
                  <span className="text-xs font-medium text-gray-900 dark:text-white group-hover/env:text-blue-600 dark:group-hover/env:text-blue-400">
                    {customer.activeEnvironmentsCount}
                  </span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Menú de 3 puntos */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={handleMenuToggle}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors cursor-pointer"
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
