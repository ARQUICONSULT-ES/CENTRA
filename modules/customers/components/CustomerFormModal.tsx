"use client";

import { useState, useEffect, useRef } from "react";
import type { Customer, Tenant } from "../types";
import ConfirmationModal from "./ConfirmationModal";
import TenantFormModal from "./TenantFormModal";
import { useCustomerTenants } from "../hooks/useCustomerTenants";

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  onSave: () => void;
}

export default function CustomerFormModal({
  isOpen,
  onClose,
  customer,
  onSave,
}: CustomerFormModalProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    imageBase64: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para la gestión de tenants
  const [selectedTenant, setSelectedTenant] = useState<Tenant | undefined>();
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const { tenants, isLoading: tenantsLoading, refetch: refetchTenants } = useCustomerTenants(customer?.id);

  useEffect(() => {
    if (customer) {
      setFormData({
        customerName: customer.customerName,
        imageBase64: customer.imageBase64 || "",
      });
      setImagePreview(customer.imageBase64 || "");
    } else {
      setFormData({
        customerName: "",
        imageBase64: "",
      });
      setImagePreview("");
    }
  }, [customer, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        setError("Por favor selecciona un archivo de imagen válido");
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no debe superar los 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, imageBase64: base64String });
        setImagePreview(base64String);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imageBase64: "" });
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = customer
        ? `/api/customers/${customer.id}`
        : "/api/customers";
      
      const method = customer ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar el customer");
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/customers/${customer?.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el customer");
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Funciones para manejar tenants
  const handleAddTenant = () => {
    if (!customer?.id) return;
    
    setSelectedTenant({
      id: "",
      customerId: customer.id,
      customerName: customer.customerName,
      description: "",
      createdAt: new Date(),
      modifiedAt: new Date(),
    });
    setIsTenantModalOpen(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsTenantModalOpen(true);
  };

  const handleCloseTenantModal = () => {
    setIsTenantModalOpen(false);
    setSelectedTenant(undefined);
  };

  const handleSaveTenant = () => {
    refetchTenants();
    handleCloseTenantModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <h2 className="text-lg font-semibold text-white">
            {customer ? "Editar Customer" : "Crear Nuevo Customer"}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-600 text-red-400 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Imagen del cliente */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Imagen del Cliente
              </label>
              
              {imagePreview ? (
                <div className="flex items-start gap-4">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-600 bg-gray-900">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-sm text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                    >
                      Cambiar imagen
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="px-3 py-1.5 text-sm text-red-400 bg-red-900/30 border border-red-600 rounded-md hover:bg-red-900/50 transition-colors"
                    >
                      Eliminar imagen
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-600 bg-gray-900 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Seleccionar imagen
                  </button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-600 bg-gray-900 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del cliente"
              />
            </div>

            {/* Sección de Tenants - Solo visible al editar */}
            {customer && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-300">
                    Tenants asociados
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTenant}
                    className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Añadir tenant
                  </button>
                </div>

                <div className="border border-gray-600 rounded-md bg-gray-900 max-h-64 overflow-y-auto">
                  {tenantsLoading ? (
                    <div className="p-4 text-center text-sm text-gray-400">
                      Cargando tenants...
                    </div>
                  ) : tenants.length === 0 ? (
                    <div className="p-4 text-center">
                      <p className="text-sm text-gray-400 mb-2">
                        No hay tenants configurados
                      </p>
                      <p className="text-xs text-gray-500">
                        Haz clic en "Añadir tenant" para crear el primero
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-700">
                      {tenants.map((tenant) => (
                        <div
                          key={tenant.id}
                          className="p-3 hover:bg-gray-800 transition-colors flex items-center justify-between gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {tenant.id}
                            </p>
                            {tenant.description && (
                              <p className="text-xs text-gray-400 truncate mt-0.5">
                                {tenant.description}
                              </p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleEditTenant(tenant)}
                            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                            title="Editar tenant"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-between gap-3 pt-4 border-t border-gray-700">
              {customer && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Eliminar
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Guardando..." : customer ? "Actualizar" : "Crear"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteConfirm && !!customer}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Eliminar customer"
        message="Esta acción eliminará el customer y TODOS sus tenants asociados. Para eliminar el customer, escribe el nombre del cliente:"
        confirmationWord={customer?.customerName || ""}
        confirmButtonText="Eliminar"
        loading={loading}
      />

      {/* Modal de Tenant */}
      <TenantFormModal
        isOpen={isTenantModalOpen}
        onClose={handleCloseTenantModal}
        tenant={selectedTenant}
        onSave={handleSaveTenant}
      />
    </div>
  );
}
