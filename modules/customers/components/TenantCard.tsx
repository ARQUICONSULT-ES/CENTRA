"use client";

import { useState, useRef } from "react";
import type { TenantCardProps } from "../types";
import { formatRelativeTime } from "../services/utils";

export function TenantCard({ tenant, onEdit }: TenantCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleEdit = () => {
    onEdit?.(tenant);
    setIsMenuOpen(false);
  };

  const handleManageEnvironments = () => {
    console.log("Gestionar entornos del tenant:", tenant.id);
    setIsMenuOpen(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex flex-col gap-3 hover:shadow-lg transition-shadow">
      {/* Header con nombre y menú */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <button
            onClick={handleEdit}
            className="font-semibold text-gray-900 dark:text-white text-sm truncate text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {tenant.customerName}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5 truncate">
            ID: {tenant.id}
          </p>
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
                  Editar tenant
                </button>
                <button
                  onClick={handleManageEnvironments}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Gestionar entornos
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer con fecha de actualización */}
      <div className="mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Actualizado {formatRelativeTime(tenant.modifiedAt)}</span>
        </div>
      </div>
    </div>
  );
}
