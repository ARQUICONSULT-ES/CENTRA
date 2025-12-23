"use client";

import { useState, useRef, useEffect } from "react";

interface FilterDropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}

export function FilterDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Focus en el buscador cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Parsear valores seleccionados (separados por coma)
  const selectedValues = value ? value.split(',') : [];
  const hasValue = selectedValues.length > 0;

  // Filtrar opciones según búsqueda
  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Función para toggle un valor
  const toggleValue = (optionValue: string) => {
    let newValues: string[];
    
    if (selectedValues.includes(optionValue)) {
      // Remover si ya está seleccionado
      newValues = selectedValues.filter(v => v !== optionValue);
    } else {
      // Añadir si no está seleccionado
      newValues = [...selectedValues, optionValue];
    }
    
    onChange(newValues.join(','));
  };

  // Seleccionar todos
  const selectAll = () => {
    onChange('');
  };

  // Generar texto de display
  const getDisplayText = () => {
    if (!hasValue) return placeholder;
    
    if (selectedValues.length <= 3) {
      return selectedValues.join(', ');
    }
    
    return `${selectedValues.slice(0, 3).join(', ')}...`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
          hasValue
            ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-300"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
        }`}
      >
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {label}:
        </span>
        <span className={`text-xs ${hasValue ? 'font-medium' : ''} max-w-[250px] truncate`}>
          {getDisplayText()}
        </span>
        <svg
          className={`w-3.5 h-3.5 transition-transform flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Overlay para móvil */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => {
              setIsOpen(false);
              setSearchQuery("");
            }}
          />
          
          {/* Dropdown - Pantalla completa en móvil, normal en desktop */}
          <div className="fixed md:absolute inset-x-0 bottom-0 md:inset-auto md:z-50 md:mt-1 md:w-80 z-50 bg-white dark:bg-gray-800 border-t md:border border-gray-200 dark:border-gray-700 md:rounded-md shadow-lg rounded-t-2xl md:rounded-t-md max-h-[80vh] md:max-h-none flex flex-col">
            {/* Header para móvil */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {label}
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery("");
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Buscador */}
            <div className="p-3 md:p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="w-full px-3 py-2 md:py-1.5 text-sm md:text-xs bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Lista de opciones con scrollbar oscuro */}
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-gray-700 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-800 md:max-h-60">
              {/* Opción "Todos" */}
              <button
                onClick={() => {
                  selectAll();
                }}
                className={`w-full px-3 py-2.5 md:py-2 text-left text-sm md:text-xs transition-colors flex items-center gap-2 ${
                  !hasValue
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <div className={`w-5 h-5 md:w-4 md:h-4 rounded border flex items-center justify-center ${
                  !hasValue
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {!hasValue && (
                    <svg className="w-3.5 h-3.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                {placeholder}
              </button>
              
              {/* Opciones individuales filtradas */}
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => toggleValue(option)}
                      className={`w-full px-3 py-2.5 md:py-2 text-left text-sm md:text-xs transition-colors flex items-center gap-2 ${
                        isSelected
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <div className={`w-5 h-5 md:w-4 md:h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                        isSelected
                          ? "bg-blue-600 border-blue-600"
                          : "border-gray-300 dark:border-gray-600"
                      }`}>
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 md:w-3 md:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="break-words">{option}</span>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2.5 md:py-2 text-sm md:text-xs text-gray-500 dark:text-gray-400 text-center">
                  No se encontraron resultados
                </div>
              )}
            </div>
            
            {/* Botón de aplicar/cerrar para móvil */}
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700 p-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSearchQuery("");
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Aplicar {hasValue && `(${selectedValues.length})`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
