"use client";

import { useRef, useState } from "react";
import { TenantList } from "./components/TenantList";
import { CustomerList } from "./components/CustomerList";
import TenantFormModal from "./components/TenantFormModal";
import CustomerFormModal from "./components/CustomerFormModal";
import type { TenantListHandle, Tenant, Customer, CustomerListHandle } from "./types";
import { useTenants } from "./hooks/useTenants";
import { useCustomers } from "./hooks/useCustomers";
import { useTenantFilter } from "./hooks/useTenantFilter";

type ViewMode = "grouped" | "customers" | "tenants";

function SkeletonCard() {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex flex-col gap-3 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="w-5 h-5 bg-gray-700 rounded-full"></div>
      </div>
      <div className="h-5 bg-gray-700 rounded w-20"></div>
      <div className="flex items-center gap-4">
        <div className="h-4 bg-gray-700 rounded w-24"></div>
        <div className="h-4 bg-gray-700 rounded w-28"></div>
      </div>
      <div className="mt-auto pt-2 border-t border-gray-700">
        <div className="h-3 bg-gray-700 rounded w-32"></div>
      </div>
    </div>
  );
}

export function TenantsPage() {
  const { tenants, isLoading: tenantsLoading, error: tenantsError, fetchTenants } = useTenants();
  const { customers, isLoading: customersLoading, error: customersError, refreshCustomers } = useCustomers();
  const {
    filteredTenants,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  } = useTenantFilter(tenants);
  const tenantListRef = useRef<TenantListHandle>(null);
  const customerListRef = useRef<CustomerListHandle>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | undefined>(undefined);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>("grouped");
  const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());

  const isLoading = tenantsLoading || customersLoading;
  const error = tenantsError || customersError;

  const handleRefresh = async () => {
    if (viewMode === "tenants" && tenantListRef.current) {
      await tenantListRef.current.refreshTenants();
    } else if (viewMode === "customers" && customerListRef.current) {
      await customerListRef.current.refreshCustomers();
    }
    await fetchTenants();
    await refreshCustomers();
  };

  const handleCreateTenant = (customerId?: string) => {
    if (customerId) {
      // Crear un objeto parcial solo con customerId para pre-seleccionar el cliente
      setSelectedTenant({ 
        id: "",
        customerId,
        connectionId: "",
        grantType: "",
        clientId: "",
        clientSecret: "",
        scope: "",
        token: "",
        tokenExpiresAt: "",
        createdAt: new Date(),
        modifiedAt: new Date(),
      } as Tenant);
    } else {
      setSelectedTenant(undefined);
    }
    setIsModalOpen(true);
  };

  const handleCreateCustomer = () => {
    setSelectedCustomer(undefined);
    setIsCustomerModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const handleEditTenant = async (tenant: Tenant) => {
    try {
      // Cargar el tenant completo con su conexión
      const response = await fetch(`/api/customers/tenants/${tenant.id}`);
      if (response.ok) {
        const fullTenant = await response.json();
        setSelectedTenant(fullTenant);
      } else {
        setSelectedTenant(tenant);
      }
    } catch (error) {
      console.error("Error loading tenant:", error);
      setSelectedTenant(tenant);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTenant(undefined);
  };

  const handleCloseCustomerModal = () => {
    setIsCustomerModalOpen(false);
    setSelectedCustomer(undefined);
  };

  const handleSaveTenant = async () => {
    await fetchTenants();
  };

  const handleSaveCustomer = async () => {
    await refreshCustomers();
  };

  const toggleCustomer = (customerId: string) => {
    setExpandedCustomers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(customerId)) {
        newSet.delete(customerId);
      } else {
        newSet.add(customerId);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedCustomers(new Set(customers.map((c: Customer) => c.id)));
  };

  const collapseAll = () => {
    setExpandedCustomers(new Set());
  };

  const isRefreshing = (viewMode === "tenants" && tenantListRef.current?.isRefreshing) || 
                       (viewMode === "customers" && customerListRef.current?.isRefreshing) || 
                       false;

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-32"></div>
        </div>

        {/* Search and sort skeleton */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-10 bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="h-10 bg-gray-700 rounded-lg w-64 animate-pulse"></div>
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="w-16 h-16 text-red-500 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Error al cargar tenants
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={fetchTenants}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Clientes y Tenants
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {customers.length} clientes • {tenants.length} tenants
          </p>
        </div>
        
        {/* Selector de vista */}
        <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
          <button
            onClick={() => setViewMode("grouped")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "grouped"
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            Agrupado
          </button>
          <button
            onClick={() => setViewMode("customers")}
            className={`px-4 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-700 transition-colors ${
              viewMode === "customers"
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            Clientes
          </button>
          <button
            onClick={() => setViewMode("tenants")}
            className={`px-4 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-700 transition-colors ${
              viewMode === "tenants"
                ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            Tenants
          </button>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="flex flex-col sm:flex-row gap-3">
        {viewMode === "tenants" && (
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tenants..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
            />
          </div>
        )}

        <div className="flex items-center gap-3 ml-auto">
          {viewMode === "tenants" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                Ordenar:
              </span>
              <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setSortBy("updated")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    sortBy === "updated"
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  Recientes
                </button>
                <button
                  onClick={() => setSortBy("name")}
                  className={`px-3 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-700 transition-colors ${
                    sortBy === "name"
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  Nombre
                </button>
                <button
                  onClick={() => setSortBy("tenant")}
                  className={`px-3 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-700 transition-colors ${
                    sortBy === "tenant"
                      ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                      : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
                >
                  Tenant
                </button>
              </div>
            </div>
          )}

          {viewMode === "grouped" && (
            <>
              <button
                onClick={expandAll}
                className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Expandir todo
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Contraer todo
              </button>
            </>
          )}

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-wait rounded-lg transition-colors whitespace-nowrap"
            title="Actualizar"
          >
            {isRefreshing ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Actualizar
          </button>

          {viewMode === "customers" && (
            <button
              onClick={handleCreateCustomer}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors whitespace-nowrap"
              title="Crear nuevo cliente"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir cliente
            </button>
          )}

          {viewMode === "tenants" && (
            <button
              onClick={() => handleCreateTenant()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors whitespace-nowrap"
              title="Crear nuevo tenant"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir tenant
            </button>
          )}
        </div>
      </div>

      {/* Modales */}
      <TenantFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        tenant={selectedTenant}
        onSave={handleSaveTenant}
      />

      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        onClose={handleCloseCustomerModal}
        customer={selectedCustomer}
        onSave={handleSaveCustomer}
      />

      {/* Contenido según vista seleccionada */}
      {viewMode === "grouped" && (
        <div className="space-y-4">
          {customers.map((customer: Customer) => {
            const customerTenants = tenants.filter((t) => t.customerId === customer.id);
            const isExpanded = expandedCustomers.has(customer.id);
            
            return (
              <div key={customer.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                {/* Customer Header */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 flex-1">
                    <button
                      onClick={() => toggleCustomer(customer.id)}
                      className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg
                        className={`w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {customer.customerName}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {customerTenants.length} {customerTenants.length === 1 ? "tenant" : "tenants"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCreateTenant(customer.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-500 rounded-md transition-colors"
                      title="Añadir tenant a este cliente"
                    >
                      + Tenant
                    </button>
                    <button
                      onClick={() => handleEditCustomer(customer)}
                      className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                      title="Editar cliente"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Customer Tenants */}
                {isExpanded && (
                  <div className="p-4">
                    {customerTenants.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {customerTenants.map((tenant) => (
                          <div
                            key={tenant.id}
                            onClick={() => handleEditTenant(tenant)}
                            className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer"
                          >
                            <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                              {tenant.id}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Actualizado {new Date(tenant.modifiedAt).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                        <p>No hay tenants para este cliente</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {customers.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 mb-4">No hay clientes</p>
              <button
                onClick={handleCreateCustomer}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
              >
                Crear primer cliente
              </button>
            </div>
          )}
        </div>
      )}

      {viewMode === "customers" && (
        <CustomerList ref={customerListRef} customers={customers} onEdit={handleEditCustomer} />
      )}

      {viewMode === "tenants" && (
        <>
          {filteredTenants.length > 0 ? (
            <TenantList ref={tenantListRef} tenants={filteredTenants} onEdit={handleEditTenant} />
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? `No se encontraron tenants con "${searchQuery}"` : "No hay tenants"}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
