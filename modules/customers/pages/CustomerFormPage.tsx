"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Customer, Tenant } from "@/modules/customers/types";
import type { Application } from "@/modules/applications/types";
import ConfirmationModal from "@/modules/customers/components/ConfirmationModal";
import TenantFormModal from "@/modules/customers/components/TenantFormModal";
import { useCustomerTenants } from "@/modules/customers/hooks/useCustomerTenants";
import { useCustomerEnvironments } from "@/modules/customers/hooks/useCustomerEnvironments";
import { useCustomerInstalledApps } from "@/modules/customers/hooks/useCustomerInstalledApps";
import EnvironmentList from "@/modules/customers/components/EnvironmentList";
import { EnvironmentListSkeleton } from "@/modules/customers/components/EnvironmentCardSkeleton";
import { ApplicationsList } from "@/modules/customers/components/ApplicationsList";
import { ApplicationListSkeleton } from "@/modules/customers/components/ApplicationCardSkeleton";

interface CustomerFormPageProps {
  customerId?: string;
}

export function CustomerFormPage({ customerId }: CustomerFormPageProps) {
  const router = useRouter();
  const isEditMode = !!customerId;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    imageBase64: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(isEditMode);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para la gestión de tenants
  const [selectedTenant, setSelectedTenant] = useState<Tenant | undefined>();
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const { tenants, isLoading: tenantsLoading, refetch: refetchTenants } = useCustomerTenants(customerId);

  // Hook para la gestión de entornos
  const { 
    environments, 
    loading: environmentsLoading, 
    isRefreshing: isSyncingEnvironments,
    error: environmentsError,
    syncEnvironments 
  } = useCustomerEnvironments(customerId);

  // Hook para la gestión de instalaciones
  const {
    installedApps,
    loading: installedAppsLoading,
    isRefreshing: isSyncingInstalledApps,
    error: installedAppsError,
    syncInstalledApps
  } = useCustomerInstalledApps(customerId);

  // Estado para filtro de entornos activos
  const [showOnlyActiveEnvironments, setShowOnlyActiveEnvironments] = useState(true);

  // Estado para filtro de aplicaciones de Microsoft
  const [hideMicrosoftApps, setHideMicrosoftApps] = useState(true);

  // Estado para filtro de entornos Sandbox en aplicaciones instaladas
  const [hideSandboxApps, setHideSandboxApps] = useState(true);

  // Estado para almacenar las versiones más recientes de las aplicaciones
  const [latestVersions, setLatestVersions] = useState<Record<string, string>>({});

  // Cargar aplicaciones del catálogo para obtener las últimas versiones
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/applications');
        if (response.ok) {
          const applications: Application[] = await response.json();
          const versionsMap: Record<string, string> = {};
          applications.forEach(app => {
            if (app.latestReleaseVersion) {
              versionsMap[app.id] = app.latestReleaseVersion;
            }
          });
          setLatestVersions(versionsMap);
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    if (customerId) {
      fetchApplications();
    }
  }, [customerId]);

  // Filtrar y ordenar entornos
  const filteredAndSortedEnvironments = environments
    .filter(env => !showOnlyActiveEnvironments || env.status === "Active")
    .sort((a, b) => {
      // Primero por tipo (Production primero)
      if (a.type === "Production" && b.type !== "Production") return -1;
      if (a.type !== "Production" && b.type === "Production") return 1;
      // Luego por nombre
      return a.name.localeCompare(b.name);
    });

  // Filtrar aplicaciones de Microsoft y entornos Sandbox
  const filteredInstalledApps = installedApps.filter(app => {
    // Filtro de Microsoft
    if (hideMicrosoftApps) {
      // Ocultar apps de Microsoft (case insensitive)
      if (app.publisher.toLowerCase().includes('microsoft')) {
        return false;
      }
    }
    
    // Filtro de Sandbox
    if (hideSandboxApps) {
      // Ocultar apps de entornos Sandbox
      if (app.environmentType === 'Sandbox') {
        return false;
      }
    }
    
    return true;
  });

  // Cargar datos del cliente al editar
  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const fetchCustomer = async () => {
    setLoadingCustomer(true);
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (!response.ok) {
        throw new Error("Error al cargar el cliente");
      }
      const data = await response.json();
      setCustomer(data);
      setFormData({
        customerName: data.customerName,
        imageBase64: data.imageBase64 || "",
      });
      setImagePreview(data.imageBase64 || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoadingCustomer(false);
    }
  };

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
      const url = isEditMode
        ? `/api/customers/${customerId}`
        : "/api/customers";

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar el cliente");
      }

      const savedCustomer = await response.json();
      
      // Si es creación, redirigir al modo edición del nuevo cliente
      if (!isEditMode && savedCustomer.id) {
        router.push(`/customers/${savedCustomer.id}/edit`);
        router.refresh();
      } else {
        // Si es edición, volver a la lista y refrescar
        router.push('/customers');
        router.refresh();
      }
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
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el cliente");
      }

      router.push('/customers');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  // Funciones para manejar tenants
  const handleAddTenant = () => {
    if (!customerId) return;

    setSelectedTenant({
      id: "",
      customerId: customerId,
      customerName: customer?.customerName || "",
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

  const handleSyncEnvironments = async () => {
    if (!customerId) return;
    await syncEnvironments();
  };

  const handleSyncInstalledApps = async () => {
    if (!customerId) return;
    
    try {
      const result = await syncInstalledApps();
      
      if (result) {
        if (result.failed === 0) {
          alert(`✅ Sincronización completada: ${result.success}/${result.total} entornos sincronizados`);
        } else {
          const errorMessages = result.errors.map(e => `- ${e.environmentName}: ${e.error}`).join('\n');
          alert(`⚠️ Sincronización completada con errores:\n✅ Exitosos: ${result.success}\n❌ Fallidos: ${result.failed}\n\nDetalles:\n${errorMessages}`);
        }
      }
    } catch (error) {
      alert(`❌ Error al sincronizar las instalaciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  if (loadingCustomer) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 h-32"></div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 h-64"></div>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 h-48"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={handleCancel}
            className="p-1.5 sm:p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            title="Volver"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {isEditMode ? "Editar Cliente" : "Crear Nuevo Cliente"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
              {isEditMode
                ? "Modifica los datos del cliente y gestiona sus tenants"
                : "Completa el formulario para crear un nuevo cliente"}
            </p>
          </div>
        </div>
        
        {/* Actions en el header */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {isEditMode && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading}
              className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="hidden sm:inline">Olvidar</span>
              <span className="sm:hidden">🗑️</span>
            </button>
          )}
          <button
            type="submit"
            form="customer-form"
            disabled={loading}
            className="px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 sm:gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : isEditMode ? (
              "Guardar cambios"
            ) : (
              "Crear cliente"
            )}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg flex items-start gap-2 sm:gap-3">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-sm">Error</p>
            <p className="text-xs sm:text-sm">{error}</p>
          </div>
        </div>
      )}

      <form id="customer-form" onSubmit={handleSubmit}>
        <div className={`grid grid-cols-1 ${isEditMode ? 'lg:grid-cols-2' : ''} gap-3 sm:gap-4 md:gap-6`}>
          {/* Columna 1: Información del Cliente */}
          <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
            <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Información del Cliente
              </h2>
            </div>
            <div className="p-3 sm:p-4 md:p-5">
              <div className="flex gap-3 sm:gap-4 md:gap-5">
                {/* Logo del cliente */}
                <div className="flex-shrink-0">
                  {imagePreview ? (
                    <div className="space-y-1.5 sm:space-y-2">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg sm:rounded-xl overflow-hidden border-2 border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-900">
                        <img
                          src={imagePreview}
                          alt="Logo"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-1.5 justify-center">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2 py-1 text-[10px] text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                        >
                          Cambiar
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-2 py-1 text-[10px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
                        >
                          Quitar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-lg sm:rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400 dark:text-gray-600 mb-0.5 sm:mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">Subir logo</span>
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

                {/* Campos del formulario */}
                <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-1.5">
                      Nombre del Cliente <span className="text-red-500 dark:text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({ ...formData, customerName: e.target.value })
                      }
                      className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xs sm:text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="Ingresa el nombre del cliente"
                    />
                  </div>
                  {/* Espacio para más campos aquí */}
                </div>
              </div>
            </div>
          </div>

          {/* Columna 2: Tenants - Solo en modo edición */}
          {isEditMode && (
            <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
              <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="truncate">Tenants asociados</span>
                  <span className="ml-0.5 sm:ml-1 px-1.5 py-0.5 text-[10px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex-shrink-0">
                    {tenants.length}
                  </span>
                </h2>
                <button
                  type="button"
                onClick={handleAddTenant}
                className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1 sm:gap-1.5 flex-shrink-0"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Añadir</span>
              </button>
            </div>
            <div className="p-3 sm:p-4 md:p-5 flex-1 overflow-y-auto">
              {tenantsLoading ? (
                <div className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-5 h-5 animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Cargando tenants...
                </div>
              ) : tenants.length === 0 ? (
                <div className="py-6 sm:py-8 text-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 dark:text-gray-600 mx-auto mb-1.5 sm:mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">No hay tenants configurados</p>
                  <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5 sm:mt-1">Añade un tenant para conectar con Business Central</p>
                </div>
              ) : (
                <div className="grid gap-1.5 sm:gap-2">
                  {tenants.map((tenant) => (
                    <div
                      key={tenant.id}
                      onClick={() => handleEditTenant(tenant)}
                      className="p-2 sm:p-2.5 md:p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-between gap-2 sm:gap-3 cursor-pointer group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {tenant.id}
                        </p>
                        {tenant.description && (
                          <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
                            {tenant.description}
                          </p>
                        )}
                      </div>
                      <div
                        className="flex-shrink-0 p-1 sm:p-1.5 text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                        title="Editar tenant"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </form>

      {/* Sección de Entornos - Solo en modo edición */}
      {isEditMode && (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap w-full sm:w-auto">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <span className="hidden sm:inline">Entornos</span>
                <span className="sm:hidden">Entornos BC</span>
                <span className="ml-0.5 sm:ml-1 px-1.5 py-0.5 text-[10px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {filteredAndSortedEnvironments.length}
                </span>
              </h2>
              
              {/* Checkbox para filtrar solo activos */}
              <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showOnlyActiveEnvironments}
                  onChange={(e) => setShowOnlyActiveEnvironments(e.target.checked)}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  Solo activos
                </span>
              </label>
            </div>
            
            <button
              type="button"
              onClick={handleSyncEnvironments}
              disabled={isSyncingEnvironments || environmentsLoading}
              className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-center"
            >
              {isSyncingEnvironments ? (
                <>
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sincronizando...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sincronizar
                </>
              )}
            </button>
          </div>
          <div className="p-3 sm:p-4 md:p-5">
            {environmentsLoading ? (
              <EnvironmentListSkeleton count={6} />
            ) : environmentsError ? (
              <div className="py-8 text-center">
                <svg className="w-10 h-10 text-red-500 dark:text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-400">Error al cargar entornos</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{environmentsError}</p>
              </div>
            ) : environments.length === 0 ? (
              <div className="py-8 text-center">
                <svg className="w-10 h-10 text-gray-400 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay entornos disponibles</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Configura tenants y sincroniza para ver los entornos</p>
              </div>
            ) : filteredAndSortedEnvironments.length === 0 ? (
              <div className="py-8 text-center">
                <svg className="w-10 h-10 text-gray-400 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay entornos activos</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Desactiva el filtro para ver todos los entornos</p>
              </div>
            ) : (
              <EnvironmentList environments={filteredAndSortedEnvironments} />
            )}
          </div>
        </div>
      )}

      {/* Sección de Instalaciones - Solo en modo edición */}
      {isEditMode && (
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-visible">
          <div className="px-3 sm:px-5 py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-wrap w-full sm:w-auto">
              <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center gap-1.5 sm:gap-2">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <span className="hidden sm:inline">Aplicaciones Instaladas</span>
                <span className="sm:hidden">Apps Instaladas</span>
                <span className="ml-0.5 sm:ml-1 px-1.5 py-0.5 text-[10px] sm:text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  {filteredInstalledApps.length}
                </span>
              </h2>
              
              {/* Checkbox para ocultar apps de Microsoft */}
              <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={hideMicrosoftApps}
                  onChange={(e) => setHideMicrosoftApps(e.target.checked)}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  Ocultar Microsoft
                </span>
              </label>
              
              {/* Checkbox para ocultar apps de entornos Sandbox */}
              <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={hideSandboxApps}
                  onChange={(e) => setHideSandboxApps(e.target.checked)}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                  Ocultar Sandbox
                </span>
              </label>
            </div>
            
            <button
              type="button"
              onClick={handleSyncInstalledApps}
              disabled={isSyncingInstalledApps || installedAppsLoading}
              className="px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 sm:gap-1.5 w-full sm:w-auto justify-center"
            >
              {isSyncingInstalledApps ? (
                <>
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sincronizando...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sincronizar
                </>
              )}
            </button>
          </div>
          <div className="p-3 sm:p-4 md:p-5">
            {installedAppsLoading ? (
              <ApplicationListSkeleton count={6} />
            ) : installedAppsError ? (
              <div className="py-8 text-center">
                <svg className="w-10 h-10 text-red-500 dark:text-red-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-600 dark:text-red-400">Error al cargar instalaciones</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{installedAppsError}</p>
              </div>
            ) : installedApps.length === 0 ? (
              <div className="py-8 text-center">
                <svg className="w-10 h-10 text-gray-400 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay instalaciones disponibles</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Sincroniza para ver las aplicaciones instaladas</p>
              </div>
            ) : filteredInstalledApps.length === 0 ? (
              <div className="py-8 text-center">
                <svg className="w-10 h-10 text-gray-400 dark:text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">No hay aplicaciones que mostrar</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {hideMicrosoftApps && hideSandboxApps 
                    ? "Desactiva los filtros para ver las aplicaciones de Microsoft y Sandbox"
                    : hideMicrosoftApps 
                    ? "Desactiva el filtro para ver las aplicaciones de Microsoft"
                    : "Desactiva el filtro para ver las aplicaciones de Sandbox"}
                </p>
              </div>
            ) : (
              <ApplicationsList 
                applications={filteredInstalledApps} 
                lockExpanded={true}
                latestVersions={latestVersions}
              />
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteConfirm && isEditMode}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Olvidar cliente"
        message="Esta acción eliminará el cliente y TODOS sus tenants asociados. Para confirmar, escribe el nombre del cliente:"
        confirmationWord={customer?.customerName || ""}
        confirmButtonText="Olvidar"
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
