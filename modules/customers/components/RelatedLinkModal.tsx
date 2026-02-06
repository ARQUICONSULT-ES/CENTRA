"use client";

import { useState, useEffect } from "react";
import { RelatedLink, RelatedLinkFormData } from "@/modules/customers/types";

interface RelatedLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  link?: RelatedLink;
  onSave: () => void;
}

export default function RelatedLinkModal({
  isOpen,
  onClose,
  customerId,
  link,
  onSave,
}: RelatedLinkModalProps) {
  const [formData, setFormData] = useState<RelatedLinkFormData>({
    name: "",
    url: "",
    favicon: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fetchingFavicon, setFetchingFavicon] = useState(false);

  useEffect(() => {
    if (link) {
      setFormData({
        name: link.name,
        url: link.url,
        favicon: link.favicon || null,
      });
    } else {
      setFormData({
        name: "",
        url: "",
        favicon: null,
      });
    }
    setError("");
  }, [link, isOpen]);

  const fetchFavicon = async (url: string) => {
    if (!url) return;

    try {
      setFetchingFavicon(true);
      const urlObj = new URL(url);
      
      // Usar Google's favicon service directamente para evitar problemas de CORS
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${urlObj.host}&sz=32`;
      setFormData(prev => ({ ...prev, favicon: faviconUrl }));
    } catch (error) {
      console.error("Error parsing URL:", error);
    } finally {
      setFetchingFavicon(false);
    }
  };

  const handleUrlBlur = () => {
    if (formData.url && !link) {
      // Only auto-fetch favicon when creating a new link
      fetchFavicon(formData.url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (link) {
        // Update existing link
        const encodedId = Buffer.from(
          `${link.relationType}|${link.relationId}|${link.url}`
        ).toString('base64');

        const response = await fetch(`/api/related-links/${encodedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            originalUrl: link.url,
          }),
        });

        if (!response.ok) {
          throw new Error("Error al actualizar el enlace");
        }
      } else {
        // Create new link
        const response = await fetch("/api/related-links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            relationType: "Customer",
            relationId: customerId,
            ...formData,
          }),
        });

        if (!response.ok) {
          throw new Error("Error al crear el enlace");
        }
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {link ? "Editar Enlace" : "Nuevo Enlace"}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 text-red-600 dark:text-red-400 rounded">
              {error}
            </div>
          )}

          <form id="link-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
                placeholder="Ej: Portal de Cliente"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                URL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                onBlur={handleUrlBlur}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                required
                placeholder="https://ejemplo.com"
              />
              {fetchingFavicon && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Obteniendo favicon...</p>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="link-form"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
