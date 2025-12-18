// Tipos de filtros soportados
export type FilterType = 
  | "text"           // Búsqueda de texto (includes)
  | "number"         // Número exacto
  | "range"          // Rango numérico (min-max)
  | "date"           // Fecha
  | "dateRange"      // Rango de fechas
  | "boolean"        // Verdadero/Falso
  | "select";        // Selección de opciones

// Operadores de comparación
export type FilterOperator = 
  | "equals"         // Igual
  | "contains"       // Contiene (para texto)
  | "startsWith"     // Empieza con
  | "endsWith"       // Termina con
  | "gt"             // Mayor que
  | "gte"            // Mayor o igual que
  | "lt"             // Menor que
  | "lte"            // Menor o igual que
  | "between"        // Entre (rango)
  | "in";            // En (lista de valores)

// Configuración de un campo filtrable
export interface FilterFieldConfig<T = any> {
  key: string;                                    // Clave del filtro
  label: string;                                  // Etiqueta para mostrar
  type: FilterType;                               // Tipo de filtro
  operator?: FilterOperator;                      // Operador por defecto
  placeholder?: string;                           // Placeholder para inputs
  getValue?: (item: T) => any;                   // Función para obtener el valor del item
  options?: Array<{ value: string; label: string }>; // Opciones para select
  min?: number;                                   // Valor mínimo (para number/range)
  max?: number;                                   // Valor máximo (para number/range)
  step?: number;                                  // Incremento (para number)
  gridColumn?: string;                            // Clase CSS para grid (ej: "col-span-2")
}

// Valor de un filtro
export interface FilterValue {
  value: any;                                     // Valor principal
  operator?: FilterOperator;                      // Operador de comparación
  secondValue?: any;                              // Segundo valor (para rangos)
}

// Estado de todos los filtros
export type FiltersState = Record<string, FilterValue>;

// Configuración completa de filtros para una entidad
export interface FilterConfig<T = any> {
  fields: FilterFieldConfig<T>[];
  defaultOperators?: Partial<Record<FilterType, FilterOperator>>;
}
