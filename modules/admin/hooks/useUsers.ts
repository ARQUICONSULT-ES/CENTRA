"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@/modules/admin/types";
import { dataCache, CACHE_KEYS } from "@/modules/shared/utils/cache";

export function useUsers() {
  const [users, setUsers] = useState<User[]>(() => {
    // Intentar cargar desde cache al inicializar
    return dataCache.get<User[]>(CACHE_KEYS.USERS) || [];
  });
  const [isLoading, setIsLoading] = useState(() => {
    // Si hay datos en cache, no mostrar loading
    return !dataCache.has(CACHE_KEYS.USERS);
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await fetch("/api/users");
      
      if (!response.ok) {
        throw new Error("Error al cargar los usuarios");
      }
      
      const data = await response.json();
      const usersData = data.users || [];
      
      setUsers(usersData);
      // Guardar en cache
      dataCache.set(CACHE_KEYS.USERS, usersData);
    } catch (err) {
      console.error("Error loading users:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
      setUsers([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    await loadUsers(true);
  }, [loadUsers]);

  useEffect(() => {
    // Solo cargar si no hay datos en cache
    if (!dataCache.has(CACHE_KEYS.USERS)) {
      loadUsers();
    }
  }, [loadUsers]);

  return {
    users,
    isLoading,
    isRefreshing,
    error,
    refreshUsers,
  };
}
