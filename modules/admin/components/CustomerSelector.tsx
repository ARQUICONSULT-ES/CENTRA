"use client";

import { useState, useEffect } from "react";
import type { AllowedCustomer } from "@/modules/admin/types";

interface Customer {
  id: string;
  customerName: string;
  imageBase64?: string | null;
}

interface CustomerSelectorProps {
  selectedCustomers: AllowedCustomer[];
  onChange: (customers: AllowedCustomer[]) => void;
}

export function CustomerSelector({ selectedCustomers, onChange }: CustomerSelectorProps) {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/customers");
      if (!response.ok) throw new Error("Error al cargar clientes");
      
      const data = await response.json();
      // El endpoint retorna un array directamente, no un objeto con .customers
      setAllCustomers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setAllCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const isSelected = (customerId: string) => {
    return selectedCustomers.some(c => c.id === customerId);
  };

  const filteredCustomers = allCustomers.filter(customer => 
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar: seleccionados primero, luego alfabéticamente
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const aSelected = isSelected(a.id);
    const bSelected = isSelected(b.id);
    
    // Si uno está seleccionado y el otro no, el seleccionado va primero
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    
    // Si ambos tienen el mismo estado de selección, ordenar alfabéticamente
    return a.customerName.localeCompare(b.customerName);
  });

  const handleToggleCustomer = (customer: Customer) => {
    if (isSelected(customer.id)) {
      // Remover
      onChange(selectedCustomers.filter(c => c.id !== customer.id));
    } else {
      // Agregar
      onChange([
        ...selectedCustomers,
        {
          id: customer.id,
          name: customer.customerName,
          logo: customer.imageBase64 || null
        }
      ]);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 dark:text-red-400 text-sm py-2">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar clientes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
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
      </div>

      {/* Selected count */}
      {selectedCustomers.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {selectedCustomers.length} cliente{selectedCustomers.length !== 1 ? 's' : ''} seleccionado{selectedCustomers.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Customer list */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-64 overflow-y-auto">
        {sortedCustomers.length === 0 ? (
          <div className="p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
            No se encontraron clientes
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700">
            {sortedCustomers.map((customer) => {
              const selected = isSelected(customer.id);
              
              return (
                <button
                  key={customer.id}
                  type="button"
                  onClick={() => handleToggleCustomer(customer)}
                  className={`px-3 py-2 flex items-center gap-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    selected ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-900'
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        selected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {selected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {customer.imageBase64 ? (
                      <div className="w-8 h-8 rounded-md overflow-hidden border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
                        <img
                          src={customer.imageBase64}
                          alt={customer.customerName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-md border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1 text-left min-w-0">
                    <span className={`text-sm font-medium truncate block ${
                      selected 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {customer.customerName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
