"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import { TenantCard } from "./TenantCard";
import type { TenantListProps, TenantListHandle, Tenant } from "../types";

export const TenantList = forwardRef<TenantListHandle, TenantListProps>(
  function TenantList({ tenants, onEdit }, ref) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refreshTenants = async () => {
      setIsRefreshing(true);
      try {
        // Simular actualización
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Tenants actualizados");
      } catch (error) {
        console.error("Error al actualizar tenants:", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refreshTenants,
      isRefreshing,
    }));

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tenants.map((tenant) => (
          <TenantCard key={tenant.id} tenant={tenant} onEdit={onEdit} />
        ))}
      </div>
    );
  }
);
