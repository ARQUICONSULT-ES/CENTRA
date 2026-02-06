"use client";

import { useState, useEffect } from "react";
import { RelatedLink } from "@/modules/customers/types";
import RelatedLinkModal from "./RelatedLinkModal";
import ConfirmationModal from "./ConfirmationModal";

interface RelatedLinksListProps {
  customerId: string;
}

export default function RelatedLinksList({ customerId }: RelatedLinksListProps) {
  const [links, setLinks] = useState<RelatedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<RelatedLink | undefined>();
  const [linkToDelete, setLinkToDelete] = useState<RelatedLink | null>(null);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/related-links?relationType=Customer&relationId=${customerId}`
      );
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchLinks();
    }
  }, [customerId]);

  const handleEdit = (link: RelatedLink) => {
    setSelectedLink(link);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!linkToDelete) return;

    try {
      const encodedId = Buffer.from(
        `${linkToDelete.relationType}|${linkToDelete.relationId}|${linkToDelete.url}`
      ).toString('base64');

      const response = await fetch(`/api/related-links/${encodedId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchLinks();
      }
    } catch (error) {
      console.error("Error deleting link:", error);
    } finally {
      setLinkToDelete(null);
    }
  };

  const handleNew = () => {
    setSelectedLink(undefined);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedLink(undefined);
  };

  const handleSave = () => {
    fetchLinks();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
            <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Enlaces Relacionados
          </h3>
        </div>
        <div className="p-3 sm:p-4 md:p-5">
          <div className="text-center text-gray-500 dark:text-gray-400 py-4 text-sm">
            <svg className="w-5 h-5 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Cargando...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
            <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Enlaces relacionados
          </h3>
          <button
            onClick={handleNew}
            className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-white bg-green-600 dark:bg-green-600 rounded-lg hover:bg-green-700 dark:hover:bg-green-700 transition-colors flex items-center gap-1 sm:gap-1.5 flex-shrink-0"
          >
            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Añadir</span>
          </button>
        </div>
        <div className="p-3 sm:p-4 md:p-5">
          {links.length === 0 ? (
            <div className="py-6 sm:py-8 text-center">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-600 mx-auto mb-1.5 sm:mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No hay enlaces relacionados</p>
              <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5 sm:mt-1">Añade enlaces útiles para este cliente</p>
            </div>
          ) : (
            <div className="grid gap-1.5 sm:gap-2">
              {links.map((link) => (
                <a
                  key={`${link.relationType}-${link.relationId}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 sm:p-2.5 md:p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between gap-2 sm:gap-3 group cursor-pointer w-full overflow-hidden"
                >
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    {link.favicon ? (
                      <img
                        src={link.favicon}
                        alt=""
                        className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 bg-gray-300 dark:bg-gray-700 rounded"></div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {link.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                        {link.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigator.clipboard.writeText(link.url);
                      }}
                      className="p-1 sm:p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Copiar enlace"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(link);
                      }}
                      className="p-1 sm:p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      title="Editar"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setLinkToDelete(link);
                      }}
                      className="p-1 sm:p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <RelatedLinkModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        customerId={customerId}
        link={selectedLink}
        onSave={handleSave}
      />

      <ConfirmationModal
        isOpen={!!linkToDelete}
        onClose={() => setLinkToDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar Enlace"
        message={`¿Estás seguro de que deseas eliminar el enlace "${linkToDelete?.name}"?`}
        confirmationWord=""
        confirmButtonText="Eliminar"
      />
    </>
  );
}
