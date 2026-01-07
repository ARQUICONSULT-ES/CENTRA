import type { Customer } from "@/modules/customers/types";
import type { EnvironmentWithCustomer } from "@/modules/customers/types";
import type { InstalledAppWithEnvironment } from "@/modules/customers/types";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class DataCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private TTL = 5 * 60 * 1000; // 5 minutos

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Verificar si el cache ha expirado
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Verificar si el cache ha expirado
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

// Instancia global del cache
export const dataCache = new DataCache();

// Keys para el cache
export const CACHE_KEYS = {
  CUSTOMERS: 'customers',
  ENVIRONMENTS: 'environments',
  APPLICATIONS: 'applications',
  TENANTS: 'tenants',
} as const;
