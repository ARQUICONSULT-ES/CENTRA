"use client";

import { forwardRef, useImperativeHandle } from "react";
import type { CustomerListProps, CustomerListHandle } from "../types";
import { CustomerCard } from "./CustomerCard";
import { useCustomers } from "../hooks/useCustomers";

export const CustomerList = forwardRef<CustomerListHandle, CustomerListProps>(
  function CustomerList({ customers, onEdit }, ref) {
    const { isRefreshing, refreshCustomers } = useCustomers();

    useImperativeHandle(ref, () => ({
      refreshCustomers,
      isRefreshing,
    }));

    if (customers.length === 0) {
      return (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No hay customers
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comienza creando un nuevo customer
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map((customer) => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onEdit={onEdit}
          />
        ))}
      </div>
    );
  }
);
