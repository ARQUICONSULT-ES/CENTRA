"use client";

import { useState, useEffect } from "react";
import TenantFormModal from "@/modules/customers/components/TenantFormModal";
import { fetchTenantById } from "@/modules/customers/services/tenantService";

interface Customer {
  id: string;
  customerName: string;
  imageBase64?: string;
}

interface Tenant {
  id: string;
  customerId: string;
  description?: string;
  authContext?: string;
}

interface Environment {
  tenantId: string;
  name: string;
  type?: string;
  status?: string;
}

interface CustomerTenantPair {
  customer: Customer;
  tenant: Tenant;
  environments: Environment[];
}

interface AddGitHubEnvironmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (selectedEnvironments: { tenantId: string; environmentName: string; customerName: string }[], mode: 'manual' | 'auto') => void;
  owner: string;
  repo: string;
}

export function AddGitHubEnvironmentModal({
  isOpen,
  onClose,
  onAdd,
  owner,
  repo,
}: AddGitHubEnvironmentModalProps) {
  const [customerTenantPairs, setCustomerTenantPairs] = useState<CustomerTenantPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedPairs, setExpandedPairs] = useState<Set<string>>(new Set());
  const [selectedEnvironment, setSelectedEnvironment] = useState<string | null>(null);
  const [deployMode, setDeployMode] = useState<'manual' | 'auto'>('manual');
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [showTenantModal, setShowTenantModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      // Obtener clientes (respeta permisos del usuario)
      const customersRes = await fetch("/api/customers");
      if (!customersRes.ok) throw new Error("Error al cargar clientes");
      const customersData: Customer[] = await customersRes.json();

      // Crear pares cliente-tenant con sus entornos
      const pairs: CustomerTenantPair[] = [];

      for (const customer of customersData) {
        // Obtener tenants del cliente
        const tenantsRes = await fetch(`/api/customers/tenants?customerId=${customer.id}`);
        if (tenantsRes.ok) {
          const tenantsData: Tenant[] = await tenantsRes.json();

          // Para cada tenant, crear un par con sus entornos
          for (const tenant of tenantsData) {
            const envsRes = await fetch(`/api/customers/tenants/${tenant.id}/environments`);
            if (envsRes.ok) {
              const envsData: Environment[] = await envsRes.json();
              
              // Filtrar solo entornos activos
              const activeEnvs = envsData.filter(env => env.status?.toLowerCase() === 'active');

              // Añadir todos los tenants, incluso sin entornos activos
              pairs.push({
                customer,
                tenant,
                environments: activeEnvs,
              });
            }
          }
        }
      }

      setCustomerTenantPairs(pairs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const togglePair = (pairKey: string) => {
    setExpandedPairs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(pairKey)) {
        newSet.delete(pairKey);
      } else {
        newSet.add(pairKey);
      }
      return newSet;
    });
  };

  const selectEnvironment = (tenantId: string, environmentName: string, isDisabled: boolean) => {
    if (isDisabled) return;

    const key = `${tenantId}|${environmentName}`;
    setSelectedEnvironment(key);
  };

  const handleSubmit = () => {
    if (!selectedEnvironment) {
      alert("Selecciona un entorno");
      return;
    }

    const [tenantId, environmentName] = selectedEnvironment.split("|");
    const pair = customerTenantPairs.find((p) => p.tenant.id === tenantId);
    const selectedEnv = {
      tenantId,
      environmentName,
      customerName: pair?.customer.customerName || "",
    };

    onAdd([selectedEnv], deployMode);
    handleClose();
  };

  const handleClose = () => {
    setSelectedEnvironment(null);
    setExpandedPairs(new Set());
    onClose();
  };

  const handleConfigureTenant = async (tenant: Tenant) => {
    try {
      // Obtener todos los detalles del tenant desde la API
      const fullTenant = await fetchTenantById(tenant.id);
      if (fullTenant) {
        setEditingTenant(fullTenant);
        setShowTenantModal(true);
      } else {
        setError("No se pudo cargar la información del tenant");
      }
    } catch (err) {
      setError("Error al cargar los detalles del tenant");
      console.error("Error loading tenant details:", err);
    }
  };

  const handleTenantModalClose = () => {
    setShowTenantModal(false);
    setEditingTenant(null);
  };

  const handleTenantSaved = () => {
    // Recargar los datos para actualizar el authContext
    loadData();
    setShowTenantModal(false);
    setEditingTenant(null);
  };

  // Función para obtener el color de la etiqueta de tipo
  const getTypeColor = (type?: string) => {
    const typeStr = type?.toLowerCase();
    if (typeStr === 'production') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    } else if (typeStr === 'sandbox') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] border border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Añadir GitHub Environment
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Selecciona un entorno de Business Central para añadir al repositorio como GitHub Environment
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <svg
                  className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">Cargando datos...</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : customerTenantPairs.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No hay tenants disponibles
            </div>
          ) : (
            <div className="space-y-2">
              {customerTenantPairs.map((pair) => {
                const pairKey = `${pair.customer.id}-${pair.tenant.id}`;
                const isExpanded = expandedPairs.has(pairKey);
                const hasAuthContext = !!pair.tenant.authContext;

                return (
                  <div key={pairKey} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-visible">
                    {/* Customer + Tenant Header */}
                    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                      <button
                        onClick={() => togglePair(pairKey)}
                        className="flex items-center gap-3 flex-1 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 -ml-2 rounded transition-colors"
                      >
                        <svg
                          className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform flex-shrink-0 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>

                        {/* Customer Image */}
                        {pair.customer.imageBase64 ? (
                          <img
                            src={pair.customer.imageBase64}
                            alt={pair.customer.customerName}
                            className="w-8 h-8 rounded object-contain flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {pair.customer.customerName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Customer + Tenant Names */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {pair.customer.customerName}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">→</span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {pair.tenant.description || pair.tenant.id}
                            </span>
                          </div>
                        </div>

                        {/* Environment Count Badge */}
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full flex-shrink-0">
                          {pair.environments.length} {pair.environments.length === 1 ? "entorno" : "entornos"}
                        </span>
                      </button>

                      {/* Auth Context Warning */}
                      {!hasAuthContext && (
                        <div className="flex items-center gap-2 ml-2">
                          <div className="relative group">
                            <svg
                              className="w-5 h-5 text-orange-600 dark:text-orange-500 cursor-help"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                              />
                            </svg>
                            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 w-80 p-3 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-2xl border border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
                              <p className="leading-relaxed">
                                Este tenant no tiene configurado el <span className="font-semibold text-orange-400">AUTHCONTEXT</span>. Los entornos no se podrán seleccionar.
                              </p>
                              <div className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 border-4 border-transparent border-l-gray-900 dark:border-l-gray-800"></div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfigureTenant(pair.tenant);
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Configurar
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Environments */}
                    {isExpanded && (
                      <div className="bg-white dark:bg-gray-800 p-4 space-y-2">
                        {pair.environments.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No hay entornos activos disponibles para este tenant
                          </div>
                        ) : (
                          pair.environments.map((env) => {
                            const key = `${pair.tenant.id}|${env.name}`;
                            const isSelected = selectedEnvironment === key;
                            const isDisabled = !hasAuthContext;

                            return (
                              <label
                                key={key}
                                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                  isDisabled 
                                    ? "opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700" 
                                    : "cursor-pointer hover:border-gray-300 dark:hover:border-gray-600"
                                } ${
                                  isSelected 
                                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-500 shadow-sm" 
                                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                                }`}
                              >
                                <div className="relative flex items-center justify-center">
                                  <input
                                    type="radio"
                                    name="environment"
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() => selectEnvironment(pair.tenant.id, env.name, isDisabled)}
                                    className="sr-only"
                                  />
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? "border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-500"
                                      : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                  }`}>
                                    {isSelected && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                      {env.name}
                                    </span>
                                    {env.type && (
                                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${getTypeColor(env.type)}`}>
                                        {env.type}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </label>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          {/* Deploy Mode Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Modo:
            </label>
            <select
              value={deployMode}
              onChange={(e) => setDeployMode(e.target.value as 'manual' | 'auto')}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="manual">Manual deploy</option>
              <option value="auto">Auto-deploy</option>
            </select>
            <div className="relative group">
              <svg
                className="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Auto-deploy:</span> Cada vez que se pushee código a la rama main, se ejecutará el deploy a este entorno automáticamente.
                  </div>
                  <div>
                    <span className="font-semibold">Manual deploy:</span> El deploy no se ejecutará automáticamente. Será bajo demanda con una acción diferente.
                  </div>
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedEnvironment}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed ${
                deployMode === 'auto'
                  ? 'bg-orange-600 hover:bg-orange-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Añadir con {deployMode === 'manual' ? 'Manual deploy' : 'Auto-deploy'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de configuración de Tenant */}
      {showTenantModal && editingTenant && (
        <TenantFormModal
          isOpen={showTenantModal}
          onClose={handleTenantModalClose}
          tenant={editingTenant as any}
          onSave={handleTenantSaved}
        />
      )}
    </div>
  );
}
