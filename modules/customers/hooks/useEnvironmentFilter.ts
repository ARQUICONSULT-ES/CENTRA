import { useMemo, useState } from 'react';
import type { EnvironmentWithCustomer } from '@/modules/customers/types';

type SortBy = 'name' | 'customer' | 'type';

export function useEnvironmentFilter(environments: EnvironmentWithCustomer[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('customer');
  const [showDeleted, setShowDeleted] = useState(false);

  const filteredEnvironments = useMemo(() => {
    let filtered = [...environments];

    // Filtrar por estado eliminado
    if (!showDeleted) {
      filtered = filtered.filter(env => env.status?.toLowerCase() !== 'softdeleted');
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (env) =>
          env.name.toLowerCase().includes(query) ||
          env.customerName.toLowerCase().includes(query) ||
          env.type?.toLowerCase().includes(query)
      );
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'customer':
          return a.customerName.localeCompare(b.customerName);
        case 'type':
          return (a.type || '').localeCompare(b.type || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [environments, searchQuery, sortBy, showDeleted]);

  return {
    filteredEnvironments,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    showDeleted,
    setShowDeleted,
  };
}
