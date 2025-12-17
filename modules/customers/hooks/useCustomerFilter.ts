"use client";

import { useState, useMemo } from "react";
import type { Customer } from "../types";

type SortOption = "name" | "id";

export function useCustomerFilter(customers: Customer[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  const filteredCustomers = useMemo(() => {
    let result = [...customers];

    // Filtrado por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (customer) =>
          customer.customerName.toLowerCase().includes(query) ||
          customer.id.toLowerCase().includes(query)
      );
    }

    // Ordenamiento
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.customerName.localeCompare(b.customerName);
        case "id":
          return a.id.localeCompare(b.id);
        default:
          return 0;
      }
    });

    return result;
  }, [customers, searchQuery, sortBy]);

  return {
    filteredCustomers,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
  };
}
