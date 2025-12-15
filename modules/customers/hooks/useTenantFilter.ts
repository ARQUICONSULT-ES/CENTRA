"use client";

import { useState, useMemo } from "react";
import type { Tenant } from "../types";

type SortOption = "updated" | "name" | "tenant";

export function useTenantFilter(tenants: Tenant[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("updated");

  const filteredTenants = useMemo(() => {
    let result = [...tenants];

    // Filtrado por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (tenant) =>
          tenant.customerName.toLowerCase().includes(query) ||
          tenant.id.toString().includes(query)
      );
    }

    // Ordenamiento
    result.sort((a, b) => {
      switch (sortBy) {
        case "updated":
          return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
        case "name":
          return a.customerName.localeCompare(b.customerName);
        case "tenant":
          return a.id - b.id;
        default:
          return 0;
      }
    });

    return result;
  }, [tenants, searchQuery, sortBy]);

  return {
    filteredTenants,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  };
}
