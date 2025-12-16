"use client";

import { useState, useEffect } from "react";
import type { Tenant, Customer } from "../types";
import ConfirmationModal from "./ConfirmationModal";
import { fetchCustomers } from "../services/customerService";

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: Tenant;
  onSave: () => void;
}

export default function TenantFormModal({
  isOpen,
  onClose,
  tenant,
  onSave,
}: TenantFormModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    customerId: "",
    connectionId: "",
    grantType: "",
    clientId: "",
    clientSecret: "",
    scope: "",
    token: "",
    tokenExpiresAt: "",
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Cargar customers al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadCustomers();
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    try {
      const data = await fetchCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Error loading customers:", err);
      setError("Error al cargar la lista de clientes");
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (tenant) {
        setFormData({
          id: tenant.id || "",
          customerId: tenant.customerId || "",
          connectionId: tenant.connectionId || "",
          grantType: tenant.grantType || "",
          clientId: tenant.clientId || "",
          clientSecret: tenant.clientSecret || "",
          scope: tenant.scope || "",
          token: tenant.token || "",
          tokenExpiresAt: tenant.tokenExpiresAt
            ? typeof tenant.tokenExpiresAt === "string"
              ? tenant.tokenExpiresAt
              : tenant.tokenExpiresAt.toISOString()
            : "",
        });
      } else {
        setFormData({
          id: "",
          customerId: "",
          connectionId: "",
          grantType: "",
          clientId: "",
          clientSecret: "",
          scope: "",
          token: "",
          tokenExpiresAt: "",
        });
      }
      setError("");
    }
  }, [tenant, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = tenant
        ? `/api/customers/tenants/${tenant.id}`
        : "/api/customers/tenants";
      
      const method = tenant ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar el tenant");
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
      const response = await fetch(`/api/customers/tenants/${tenant?.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al olvidar el tenant");
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {tenant ? "Editar Tenant" : "Crear Nuevo Tenant"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Información del Tenant */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                Información del Cliente
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    ID del Tenant (UUID) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      disabled={!!tenant}
                      value={formData.id}
                      onChange={(e) =>
                        setFormData({ ...formData, id: e.target.value })
                      }
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        tenant
                          ? "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400"
                      }`}
                      placeholder="00000000-0000-0000-0000-000000000000"
                    />
                    {!tenant && (
                      <button
                        type="button"
                        onClick={() => {
                          const uuid = crypto.randomUUID();
                          setFormData({ ...formData, id: uuid });
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                      >
                        Generar UUID
                      </button>
                    )}
                  </div>
                  {!tenant && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Puedes escribir un UUID manualmente o generar uno automáticamente
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cliente *
                  </label>
                  <select
                    required
                    value={formData.customerId}
                    onChange={(e) =>
                      setFormData({ ...formData, customerId: e.target.value })
                    }
                    disabled={!!tenant}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      tenant
                        ? "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                        : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400"
                    }`}
                  >
                    <option value="">Selecciona un cliente</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.customerName}
                      </option>
                    ))}
                  </select>
                  {!tenant && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      El cliente no puede cambiarse después de crear el tenant
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Configuración de Conexión */}
            <div className="mb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">
                Configuración de Conexión
              </h3>

              <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Grant Type
                      </label>
                      <input
                        type="text"
                        value={formData.grantType}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            grantType: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Scope
                      </label>
                      <input
                        type="text"
                        value={formData.scope}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            scope: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Client ID (UUID)
                    </label>
                    <input
                      type="text"
                      value={formData.clientId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientId: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      placeholder="00000000-0000-0000-0000-000000000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Client Secret
                    </label>
                    <input
                      type="text"
                      value={formData.clientSecret}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientSecret: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      placeholder="Client secret"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Token
                      </label>
                      <input
                        type="text"
                        disabled
                        value={formData.token || "No generado"}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Token Expira
                      </label>
                      <input
                        type="text"
                        disabled
                        value={
                          formData.tokenExpiresAt
                            ? new Date(formData.tokenExpiresAt).toLocaleString()
                            : "N/A"
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {tenant && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  Olvidar
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? "Guardando..." : tenant ? "Actualizar" : "Crear"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteConfirm && !!tenant}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Olvidar tenant"
        message="Esta acción no borrará el tenant real del cliente, solo desaparecerá de esta aplicación. Para olvidar el tenant, escribe el nombre del cliente:"
        confirmationWord={tenant?.customerName || ""}
        confirmButtonText="Olvidar"
        loading={loading}
      />
    </div>
  );
}
