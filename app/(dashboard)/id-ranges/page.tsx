"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";

interface IdRange {
  from: number;
  to: number;
}

interface ApplicationWithRanges {
  id: string;
  name: string;
  publisher: string;
  idRanges: IdRange[];
}

interface ApiResponse {
  applications: ApplicationWithRanges[];
  minId: number;
  maxId: number;
}

// Colores para las barras de cada aplicación
const COLORS = [
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#F97316", // orange
  "#84CC16", // lime
  "#6366F1", // indigo
];

// Altura de cada fila
const ROW_HEIGHT = 40;
// Padding vertical de las barras
const BAR_PADDING = 8;
// Ancho del panel lateral con nombres de aplicaciones
const LABEL_WIDTH = 250;
// Altura del eje X
const X_AXIS_HEIGHT = 40;
// Rango total de IDs
const MIN_ID = 50000;
const MAX_ID = 99999;
const TOTAL_RANGE = MAX_ID - MIN_ID;

export default function IdRangesPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para zoom (escala del contenido)
  const [zoomScale, setZoomScale] = useState(1);
  
  // Tooltip
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: "" });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/applications/id-ranges");
        if (!response.ok) {
          throw new Error("Error al cargar los datos");
        }
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calcular posición X para un ID dado (siempre sobre el rango completo)
  const getXPosition = useCallback((id: number): number => {
    return ((id - MIN_ID) / TOTAL_RANGE) * 100;
  }, []);

  // Calcular ancho de una barra en porcentaje
  const getBarWidth = useCallback((from: number, to: number): number => {
    const width = ((to - from) / TOTAL_RANGE) * 100;
    return Math.max(width, 0.05); // Mínimo 0.05% para que sea visible
  }, []);

  // Función de zoom - máximo zoom muestra 100 IDs de rango
  const MAX_ZOOM = TOTAL_RANGE / 100; // ~500x para ver de 100 en 100
  
  const applyZoom = useCallback((zoomIn: boolean) => {
    setZoomScale(prev => {
      const factor = zoomIn ? 1.5 : 0.67;
      const newScale = prev * factor;
      // Limitar entre 1x y MAX_ZOOM
      return Math.min(Math.max(newScale, 1), MAX_ZOOM);
    });
  }, []);

  // Manejar zoom con Ctrl++ y Ctrl+-
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Verificar si Ctrl está presionado
      if (!e.ctrlKey) return;
      
      // Zoom in con Ctrl++ o Ctrl+=
      if (e.key === '+' || e.key === '=' || e.code === 'Equal' || e.code === 'NumpadAdd') {
        e.preventDefault();
        e.stopPropagation();
        applyZoom(true);
        return;
      }
      
      // Zoom out con Ctrl+-
      if (e.key === '-' || e.code === 'Minus' || e.code === 'NumpadSubtract') {
        e.preventDefault();
        e.stopPropagation();
        applyZoom(false);
        return;
      }
    };

    // Prevenir zoom del navegador globalmente cuando el componente está montado
    const preventBrowserZoom = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === '+' || e.key === '=' || e.key === '-' || 
          e.code === 'Equal' || e.code === 'Minus' || e.code === 'NumpadAdd' || e.code === 'NumpadSubtract')) {
        e.preventDefault();
      }
    };

    // Prevenir zoom con rueda del ratón
    const preventWheelZoom = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', preventBrowserZoom, { capture: true });
    document.addEventListener('wheel', preventWheelZoom, { passive: false });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', preventBrowserZoom, { capture: true });
      document.removeEventListener('wheel', preventWheelZoom);
    };
  }, [applyZoom]);

  // Reset zoom
  const resetZoom = useCallback(() => {
    setZoomScale(1);
    // Volver al inicio del scroll
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, []);

  // Generar marcas del eje X con números redondos (~10 marcas visibles)
  const xAxisTicks = useMemo(() => {
    // Determinar el intervalo redondo basado en el zoom
    // Queremos aproximadamente 10 marcas visibles
    const visibleRange = TOTAL_RANGE / zoomScale;
    
    // Elegir un intervalo redondo apropiado para tener ~10 marcas
    let interval: number;
    if (visibleRange <= 200) {
      interval = 20;
    } else if (visibleRange <= 500) {
      interval = 50;
    } else if (visibleRange <= 1000) {
      interval = 100;
    } else if (visibleRange <= 2000) {
      interval = 200;
    } else if (visibleRange <= 5000) {
      interval = 500;
    } else if (visibleRange <= 10000) {
      interval = 1000;
    } else if (visibleRange <= 20000) {
      interval = 2000;
    } else {
      interval = 5000; // ~10 marcas para el rango completo de 49999
    }
    
    const ticks: number[] = [];
    // Empezar desde el primer múltiplo del intervalo >= MIN_ID
    const start = Math.ceil(MIN_ID / interval) * interval;
    
    for (let tick = start; tick <= MAX_ID; tick += interval) {
      ticks.push(tick);
    }
    
    return ticks;
  }, [zoomScale]);

  // Mostrar tooltip
  const showTooltip = useCallback((e: React.MouseEvent, app: ApplicationWithRanges, range: IdRange) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setTooltip({
      visible: true,
      x: e.clientX - rect.left + 10,
      y: e.clientY - rect.top - 10,
      content: `${app.name}\nRango: ${range.from.toLocaleString()} - ${range.to.toLocaleString()}\nTotal: ${(range.to - range.from + 1).toLocaleString()} IDs`,
    });
  }, []);

  const hideTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando rangos de IDs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.applications.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rangos de IDs
          </h1>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <p className="text-gray-600 dark:text-gray-400">
              No hay aplicaciones con rangos de IDs definidos
            </p>
          </div>
        </div>
      </div>
    );
  }

  const chartHeight = data.applications.length * ROW_HEIGHT;
  const zoomPercent = Math.round(zoomScale * 100);
  // Ancho del contenido escalado
  const scaledWidth = `${zoomScale * 100}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rangos de IDs
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Visualización de rangos de IDs por aplicación ({MIN_ID.toLocaleString()} - {MAX_ID.toLocaleString()})
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Zoom: {zoomPercent}%
          </span>
          <button
            onClick={resetZoom}
            disabled={zoomScale === 1}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reiniciar zoom
          </button>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Controles:</strong> Usa <kbd className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-mono">+</kbd> para acercar y <kbd className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-mono">-</kbd> para alejar. Usa scroll para navegar.
        </p>
      </div>

      {/* Chart container */}
      <div 
        ref={containerRef}
        className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
      >
        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="absolute z-50 px-3 py-2 text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg shadow-lg pointer-events-none whitespace-pre-line"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.content}
          </div>
        )}

        <div className="flex max-h-[70vh]">
          {/* Panel de etiquetas (nombres de aplicaciones) - Fixed */}
          <div 
            className="flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto"
            style={{ width: LABEL_WIDTH }}
          >
            {/* Header del panel - Sticky */}
            <div 
              className="flex items-center px-4 font-medium text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-750 sticky top-0 z-10"
              style={{ height: X_AXIS_HEIGHT }}
            >
              Aplicación
            </div>
            {/* Lista de aplicaciones */}
            <div>
              {data.applications.map((app, index) => (
                <div
                  key={app.id}
                  className="flex items-center px-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  style={{ height: ROW_HEIGHT }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div 
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="truncate" title={`${app.publisher} - ${app.name}`}>
                      {app.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Área del gráfico con scroll */}
          <div 
            ref={scrollContainerRef}
            className={`flex-1 ${zoomScale > 1 ? 'overflow-auto' : 'overflow-hidden'}`}
            onMouseLeave={hideTooltip}
          >
            {/* Contenedor escalable - solo se expande cuando hay zoom */}
            <div style={{ width: zoomScale > 1 ? scaledWidth : '100%' }}>
              {/* Eje X - Sticky */}
              <div 
                className="flex items-end px-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10"
                style={{ height: X_AXIS_HEIGHT }}
              >
                <div className="relative w-full h-6">
                  {xAxisTicks.map((tick, i) => {
                    const xPos = getXPosition(tick);
                    return (
                      <div
                        key={i}
                        className="absolute text-xs text-gray-500 dark:text-gray-400 transform -translate-x-1/2 whitespace-nowrap"
                        style={{ left: `${xPos}%` }}
                      >
                        {tick.toLocaleString()}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filas del gráfico */}
              <div className="relative" style={{ height: chartHeight }}>
                {/* Líneas de guía verticales */}
                {xAxisTicks.map((tick, i) => {
                  const xPos = getXPosition(tick);
                  return (
                    <div
                      key={`grid-${i}`}
                      className="absolute top-0 bottom-0 w-px bg-gray-100 dark:bg-gray-800"
                      style={{ left: `${xPos}%` }}
                    />
                  );
                })}

                {/* Barras de rangos */}
                {data.applications.map((app, appIndex) => (
                  <div
                    key={app.id}
                    className="absolute left-0 right-0 border-b border-gray-100 dark:border-gray-800"
                    style={{
                      top: appIndex * ROW_HEIGHT,
                      height: ROW_HEIGHT,
                    }}
                  >
                    {app.idRanges.map((range, rangeIndex) => {
                      const xPos = getXPosition(range.from);
                      const width = getBarWidth(range.from, range.to);

                      return (
                        <div
                          key={`${app.id}-${rangeIndex}`}
                          className="absolute rounded-sm cursor-pointer hover:brightness-110 transition-all"
                          style={{
                            left: `${xPos}%`,
                            width: `${width}%`,
                            top: BAR_PADDING,
                            height: ROW_HEIGHT - BAR_PADDING * 2,
                            backgroundColor: COLORS[appIndex % COLORS.length],
                            opacity: 0.85,
                          }}
                          onMouseEnter={(e) => showTooltip(e, app, range)}
                          onMouseMove={(e) => showTooltip(e, app, range)}
                          onMouseLeave={hideTooltip}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info del rango */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
          <span>Inicio: {MIN_ID.toLocaleString()}</span>
          <span>Rango total: {TOTAL_RANGE.toLocaleString()} IDs</span>
          <span>Fin: {MAX_ID.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
