"use client";

import type { Customer } from "@/modules/customers/types";
import type { FilterConfig } from "@/modules/customers/types/filters";
import { useGenericFilter } from "./useGenericFilter";

// Configuración de filtros para clientes
export const customerFilterConfig: FilterConfig<Customer> = {
  fields: [
    {
      key: "id",
      label: "ID del Cliente",
      type: "text",
      operator: "contains",
      placeholder: "Filtrar por ID...",
      getValue: (customer) => customer.id,
    },
    {
      key: "customerName",
      label: "Nombre del Cliente",
      type: "text",
      operator: "contains",
      placeholder: "Filtrar por nombre...",
      getValue: (customer) => customer.customerName,
    },
    {
      key: "tenantsCount",
      label: "Número de Tenants",
      type: "range",
      operator: "between",
      placeholder: "Mínimo",
      min: 0,
      getValue: (customer) => customer.tenantsCount ?? 0,
    },
    {
      key: "activeEnvironmentsCount",
      label: "Entornos Activos",
      type: "range",
      operator: "between",
      placeholder: "Mínimo",
      min: 0,
      getValue: (customer) => customer.activeEnvironmentsCount ?? 0,
    },
  ],
};

/**
 * Hook para filtrar clientes usando el sistema genérico de filtros
 */
export function useCustomerFilter(customers: Customer[]) {
  return useGenericFilter(customers, customerFilterConfig, "customerName");
}

