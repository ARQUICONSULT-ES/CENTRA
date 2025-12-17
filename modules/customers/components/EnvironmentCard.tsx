import type { EnvironmentWithCustomer } from "../types";

interface EnvironmentCardProps {
  environment: EnvironmentWithCustomer;
}

export default function EnvironmentCard({ environment }: EnvironmentCardProps) {
  const isDeleted = environment.status?.toLowerCase() === 'softdeleted';
  
  // Función para obtener el color de la etiqueta de tipo
  const getTypeColor = (type?: string | null) => {
    const typeStr = type?.toLowerCase();
    if (typeStr === 'production') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    } else if (typeStr === 'sandbox') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
  };
  
  return (
    <div className={`group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 ${isDeleted ? 'opacity-60 bg-red-50 dark:bg-red-900/10' : ''}`}>
      {/* Tipo de entorno en esquina superior derecha */}
      {environment.type && (
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${getTypeColor(environment.type)}`}>
            {environment.type}
          </span>
        </div>
      )}
      {isDeleted && (
        <div className="absolute top-3 right-3">
          <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded flex-shrink-0">
            Eliminado
          </span>
        </div>
      )}

      <div className="space-y-3">
        {/* Header con imagen y nombre del entorno */}
        <div className="flex items-center gap-2">
          {/* Imagen del cliente - cuadrado redondeado */}
          <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {environment.customerImage ? (
              <img 
                src={environment.customerImage} 
                alt={environment.customerName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{environment.customerName.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* Nombre del entorno */}
          <div className="flex-1 min-w-0 pr-20">
            <h3 className={`text-base font-semibold text-gray-900 dark:text-white truncate ${isDeleted ? 'line-through' : ''}`}>
              {environment.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {environment.customerName}
            </p>
          </div>
        </div>

        {/* Status y Apps Count */}
        <div className="grid grid-cols-2 gap-3">
          {/* Status */}
          <div className="flex items-center gap-2 text-xs">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
              <span className={`text-xs font-medium ${
                isDeleted
                  ? 'text-red-800 dark:text-red-400'
                  : environment.status?.toLowerCase() === 'active'
                  ? 'text-green-800 dark:text-green-400'
                  : 'text-gray-800 dark:text-gray-400'
              }`}>
                {environment.status || 'N/A'}
              </span>
            </div>
          </div>

          {/* Apps Count */}
          {environment.appsCount !== undefined && (
            <div className="flex items-center gap-2 text-xs">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Apps</p>
                <span className="text-xs font-medium text-gray-900 dark:text-white">
                  {environment.appsCount}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Versiones */}
        <div className="grid grid-cols-2 gap-3">
          {/* Application Version */}
          {environment.applicationVersion && (
            <div className="flex items-start gap-1.5">
              <svg className="w-3.5 h-3.5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">App Version</p>
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate" title={environment.applicationVersion}>
                  {environment.applicationVersion}
                </p>
              </div>
            </div>
          )}

          {/* Platform Version */}
          {environment.platformVersion && (
            <div className="flex items-start gap-1.5">
              <svg className="w-3.5 h-3.5 text-purple-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Platform Version</p>
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate" title={environment.platformVersion}>
                  {environment.platformVersion}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
