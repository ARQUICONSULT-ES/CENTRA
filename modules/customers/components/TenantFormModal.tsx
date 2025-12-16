"use client";

import { useState, useEffect } from "react";
import type { Tenant, Customer } from "../types";
import ConfirmationModal from "./ConfirmationModal";
import { fetchCustomers } from "../services/customerService";
import { refreshTenantToken } from "../services/tenantService";

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
    description: "",
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
  const [refreshingToken, setRefreshingToken] = useState(false);
  const [tokenRefreshSuccess, setTokenRefreshSuccess] = useState("");

  // Determinar si es un tenant existente (tiene ID válido)
  const isExistingTenant = !!(tenant?.id && tenant.id.trim() !== "");

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
          description: tenant.description || "",
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
          description: "",
          grantType: "",
          clientId: "",
          clientSecret: "",
          scope: "",
          token: "",
          tokenExpiresAt: "",
        });
      }
      setError("");
      setTokenRefreshSuccess("");
    }
  }, [tenant, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = isExistingTenant
        ? `/api/customers/tenants/${tenant.id}`
        : "/api/customers/tenants";
      
      const method = isExistingTenant ? "PUT" : "POST";

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

  const handleRefreshToken = async () => {
    if (!tenant?.id) return;
    
    // Validar que se haya configurado la conexión
    if (!formData.grantType || !formData.clientId || !formData.clientSecret || !formData.scope) {
      setError("Por favor completa toda la configuración de conexión antes de refrescar el token");
      return;
    }
    
    setRefreshingToken(true);
    setError("");
    setTokenRefreshSuccess("");

    try {
      const result = await refreshTenantToken(tenant.id);
      
      // Actualizar el formData con el nuevo token y expiración
      setFormData({
        ...formData,
        token: "Token actualizado ✓",
        tokenExpiresAt: result.tokenExpiresAt instanceof Date 
          ? result.tokenExpiresAt.toISOString() 
          : result.tokenExpiresAt,
      });

      setTokenRefreshSuccess("Token refrescado exitosamente");
      
      // Llamar a onSave para recargar los datos del tenant
      onSave();
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setTokenRefreshSuccess("");
      }, 5000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al refrescar el token");
    } finally {
      setRefreshingToken(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {isExistingTenant ? "Editar Tenant" : "Crear Nuevo Tenant"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 rounded">
              {error}
            </div>
          )}

          {tokenRefreshSuccess && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-400 rounded">
              {tokenRefreshSuccess}
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
                      disabled={isExistingTenant}
                      value={formData.id}
                      onChange={(e) =>
                        setFormData({ ...formData, id: e.target.value })
                      }
                      className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        isExistingTenant
                          ? "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                          : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 dark:focus:ring-blue-400"
                      }`}
                      placeholder="00000000-0000-0000-0000-000000000000"
                    />
                  </div>
                  {!isExistingTenant && (
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
                    disabled={isExistingTenant}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      isExistingTenant
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
                  {!isExistingTenant && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      El cliente no puede cambiarse después de crear el tenant
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 resize-none"
                    placeholder="Descripción opcional del tenant..."
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Añade información adicional sobre este tenant (máx. 500 caracteres)
                  </p>
                </div>
              </div>
            </div>

            {/* Configuración de Conexión */}
            <div className="mb-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  Configuración de Conexión
                </h3>
                {isExistingTenant && (
                  <button
                    type="button"
                    onClick={handleRefreshToken}
                    disabled={
                      refreshingToken || 
                      loading || 
                      !formData.grantType || 
                      !formData.clientId || 
                      !formData.clientSecret || 
                      !formData.scope
                    }
                    className="px-3 py-1.5 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    title={
                      !formData.grantType || !formData.clientId || !formData.clientSecret || !formData.scope
                        ? "Completa la configuración de conexión para refrescar el token"
                        : "Refrescar token de autenticación con Business Central"
                    }
                  >
                    {refreshingToken ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Refrescando...</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        <span>Refrescar Token</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  {isExistingTenant && (!formData.grantType || !formData.clientId || !formData.clientSecret || !formData.scope) && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded text-sm">
                      <p className="font-medium">💡 Completa la configuración de conexión</p>
                      <p className="mt-1">Necesitas configurar todos los campos para poder refrescar el token de autenticación con Business Central.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Grant Type *
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
                        placeholder="client_credentials"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Scope *
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
                        placeholder="https://api.businesscentral.dynamics.com/.default"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Client ID (Application ID) *
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
                      placeholder="00000000-0000-0000-0000-000000000000"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Client Secret *
                    </label>
                    <input
                      type="password"
                      value={formData.clientSecret}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          clientSecret: e.target.value,
                        })
                      }
                      placeholder="Secreto del cliente"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
                            ? new Date(formData.tokenExpiresAt).toLocaleString('es-ES', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : "N/A"
                        }
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md cursor-not-allowed"
                      />
                      {isExistingTenant && formData.tokenExpiresAt && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(formData.tokenExpiresAt) < new Date() 
                            ? "⚠️ Token expirado" 
                            : "✓ Token válido"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              {isExistingTenant && (
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
                  {loading ? "Guardando..." : isExistingTenant ? "Actualizar" : "Crear"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteConfirm && isExistingTenant}
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
