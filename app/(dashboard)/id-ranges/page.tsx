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
  
  // Estado para búsqueda
  const [searchText, setSearchText] = useState("");
  
  // Estado para pantalla completa
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Tooltip
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: "" });
  
  // Estado para drag scroll
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const labelPanelRef = useRef<HTMLDivElement>(null);

  // Sincronizar scrolls verticales entre panel de etiquetas y gráfico
  const syncScroll = useCallback((source: 'label' | 'chart') => {
    if (!labelPanelRef.current || !scrollContainerRef.current) return;
    
    if (source === 'label') {
      scrollContainerRef.current.scrollTop = labelPanelRef.current.scrollTop;
    } else {
      labelPanelRef.current.scrollTop = scrollContainerRef.current.scrollTop;
    }
  }, []);

  // Manejar drag scroll
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Solo iniciar drag con el botón izquierdo y si no es un elemento interactivo
    if (e.button !== 0 || (e.target as HTMLElement).closest('button, input, a')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX + (scrollContainerRef.current?.scrollLeft || 0),
      y: e.clientY + (scrollContainerRef.current?.scrollTop || 0),
    });
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const deltaX = dragStart.x - e.clientX;
    const deltaY = dragStart.y - e.clientY;
    
    // Limitar el scroll a los límites válidos del contenido
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const maxScrollTop = container.scrollHeight - container.clientHeight;
    
    const clampedX = Math.max(0, Math.min(deltaX, maxScrollLeft));
    const clampedY = Math.max(0, Math.min(deltaY, maxScrollTop));
    
    container.scrollLeft = clampedX;
    container.scrollTop = clampedY;
    
    // Sincronizar el scroll vertical con el panel de etiquetas
    if (labelPanelRef.current) {
      labelPanelRef.current.scrollTop = clampedY;
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

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

  // Manejar zoom con Ctrl++ y Ctrl+- y trackpad pinch
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
      
      // Reset zoom con Ctrl+0
      if (e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0') {
        e.preventDefault();
        e.stopPropagation();
        resetZoom();
        return;
      }
    };

    // Prevenir zoom del navegador globalmente cuando el componente está montado
    const preventBrowserZoom = (e: KeyboardEvent) => {
      if (e.ctrlKey && (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '0' ||
          e.code === 'Equal' || e.code === 'Minus' || e.code === 'NumpadAdd' || e.code === 'NumpadSubtract' ||
          e.code === 'Digit0' || e.code === 'Numpad0')) {
        e.preventDefault();
      }
    };

    // Manejar zoom con trackpad (pinch gesture) o Ctrl + rueda del ratón
    const handleWheelZoom = (e: WheelEvent) => {
      // Detectar gesto de pinch en trackpad (Ctrl + wheel)
      if (e.ctrlKey && scrollContainerRef.current) {
        e.preventDefault();
        
        const scrollContainer = scrollContainerRef.current;
        const rect = scrollContainer.getBoundingClientRect();
        
        // Posición del ratón relativa al contenedor
        const mouseX = e.clientX - rect.left;
        
        // Posición actual del scroll
        const scrollLeft = scrollContainer.scrollLeft;
        
        // Calcular la posición del ratón en el contenido (antes del zoom)
        const mousePositionInContent = scrollLeft + mouseX;
        const mouseRatioInContent = mousePositionInContent / (scrollContainer.scrollWidth);
        
        // Aplicar zoom suave basado en el delta
        setZoomScale(prev => {
          const delta = -e.deltaY; // Invertir para que sea intuitivo
          const zoomFactor = 1 + (delta * 0.005); // Factor suave
          const newScale = prev * zoomFactor;
          // Limitar entre 1x y MAX_ZOOM
          const clampedScale = Math.min(Math.max(newScale, 1), MAX_ZOOM);
          
          // Ajustar el scroll después del zoom para mantener el punto bajo el cursor
          setTimeout(() => {
            if (scrollContainerRef.current) {
              const newScrollWidth = scrollContainerRef.current.scrollWidth;
              const newMousePositionInContent = mouseRatioInContent * newScrollWidth;
              const newScrollLeft = newMousePositionInContent - mouseX;
              scrollContainerRef.current.scrollLeft = Math.max(0, newScrollLeft);
            }
          }, 0);
          
          return clampedScale;
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', preventBrowserZoom, { capture: true });
    document.addEventListener('wheel', handleWheelZoom, { passive: false });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', preventBrowserZoom, { capture: true });
      document.removeEventListener('wheel', handleWheelZoom);
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

  // Manejar pantalla completa
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      // Entrar a pantalla completa
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      // Salir de pantalla completa
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Escuchar cambios en el estado de pantalla completa
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Filtrar y ordenar aplicaciones por búsqueda
  const filteredApplications = useMemo(() => {
    if (!data) return [];
    
    let apps = data.applications;
    
    // Filtrar por búsqueda si hay texto
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      apps = apps.filter(app => 
        app.name.toLowerCase().includes(search) || 
        app.publisher.toLowerCase().includes(search)
      );
    }
    
    // Ordenar por el rango más pequeño (from más pequeño)
    return apps.slice().sort((a, b) => {
      const minFromA = Math.min(...a.idRanges.map(r => r.from));
      const minFromB = Math.min(...b.idRanges.map(r => r.from));
      return minFromA - minFromB;
    });
  }, [data, searchText]);

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
    if (isDragging) return; // No mostrar tooltip mientras se arrastra
    
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setTooltip({
      visible: true,
      x: e.clientX - rect.left + 10,
      y: e.clientY - rect.top - 10,
      content: `${app.name}\nRango: ${range.from.toLocaleString()} - ${range.to.toLocaleString()}\nTotal: ${(range.to - range.from + 1).toLocaleString()} IDs`,
    });
  }, [isDragging]);

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

  const chartHeight = filteredApplications.length * ROW_HEIGHT;
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
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Buscar aplicación..."
              className="pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 w-48"
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
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          <button
            onClick={resetZoom}
            disabled={zoomScale === 1}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reiniciar zoom
          </button>
          <button
            onClick={toggleFullscreen}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Controles:</strong> Usa <kbd className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-mono">+</kbd> / <kbd className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-mono">-</kbd> para zoom, <kbd className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-mono">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded text-xs font-mono">0</kbd> para resetear, o usa el gesto de pellizcar en el trackpad. Usa scroll para navegar.
        </p>
      </div>

      {/* Chart container */}
      <div 
        ref={containerRef}
        className={`relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${isFullscreen ? 'h-screen flex flex-col' : ''}`}
      >
        {/* Barra superior en pantalla completa - integrada */}
        {isFullscreen && (
          <div className="flex-shrink-0 flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4 flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Rangos de IDs
              </h2>
              
              {/* Buscador */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Buscar aplicación..."
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
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
                {searchText && (
                  <button
                    onClick={() => setSearchText("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Zoom: {zoomPercent}%
              </span>
              <button
                onClick={resetZoom}
                disabled={zoomScale === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reiniciar zoom
              </button>
              <button
                onClick={toggleFullscreen}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                title="Salir de pantalla completa"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Tooltip */}
        {tooltip.visible && (
          <div
            className="absolute z-50 px-3 py-2 text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg shadow-lg pointer-events-none whitespace-pre-line"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.content}
          </div>
        )}

        <div className={`flex ${isFullscreen ? 'flex-1 min-h-0' : 'max-h-[70vh]'}`}>
          {/* Panel de etiquetas (nombres de aplicaciones) - Fixed */}
          <div 
            ref={labelPanelRef}
            className="flex-shrink-0 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            style={{ width: LABEL_WIDTH }}
            onScroll={() => syncScroll('label')}
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
              {filteredApplications.map((app, index) => {
                // Mantener el color original basado en el índice de la aplicación en data.applications
                const originalIndex = data.applications.findIndex(a => a.id === app.id);
                return (
                  <div
                    key={app.id}
                    className="flex items-center px-4 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    style={{ height: ROW_HEIGHT }}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div 
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: COLORS[originalIndex % COLORS.length] }}
                      />
                      <span className="truncate" title={`${app.publisher} - ${app.name}`}>
                        {app.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Área del gráfico con scroll */}
          <div 
            ref={scrollContainerRef}
            className={`flex-1 overflow-y-auto ${zoomScale > 1 ? 'overflow-x-auto' : 'overflow-x-hidden'} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onScroll={() => syncScroll('chart')}
          >
            {/* Contenedor escalable - solo se expande cuando hay zoom */}
            <div style={{ width: zoomScale > 1 ? scaledWidth : '100%', minWidth: '100%' }}>
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
                {filteredApplications.map((app, appIndex) => {
                  // Mantener el color original basado en el índice de la aplicación en data.applications
                  const originalIndex = data.applications.findIndex(a => a.id === app.id);
                  return (
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
                              backgroundColor: COLORS[originalIndex % COLORS.length],
                              opacity: 0.85,
                            }}
                            onMouseEnter={(e) => showTooltip(e, app, range)}
                            onMouseMove={(e) => showTooltip(e, app, range)}
                            onMouseLeave={hideTooltip}
                          />
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
