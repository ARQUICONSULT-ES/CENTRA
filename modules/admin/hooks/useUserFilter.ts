"use client";

import { useMemo, useState } from "react";
import type { User } from "@/modules/admin/types";

export function useUserFilter(users: User[]) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Aplicar búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [users, searchQuery]);

  return {
    filteredUsers,
    searchQuery,
    setSearchQuery,
  };
}
