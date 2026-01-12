"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type { ApiResponse, ApplicationWithRanges, IdRange } from "./types";
import {
  COLORS,
  ROW_HEIGHT,
  BAR_PADDING,
  LABEL_WIDTH,
  X_AXIS_HEIGHT,
  MIN_ID,
  MAX_ID,
  TOTAL_RANGE,
} from "./utils/constants";

export function IdRangesPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para zoom (escala del contenido)
  const [zoomScale, setZoomScale] = useState(1);
  
  // Estado para búsqueda
  const [searchText, setSearchText] = useState("");
  
  // Estado para filtro de rango
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  
  // Estado para pantalla completa
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Tooltip
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: string;
  }>({ visible: false, x: 0, y: 0, content: "" });
  
  // Estado para dropdown contextual
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    range: IdRange | null;
  }>({ visible: false, x: 0, y: 0, range: null });
  
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

  // Filtrar y ordenar aplicaciones por búsqueda y rango
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
    
    // Filtrar por rango de IDs si hay valores
    const filterFrom = rangeFrom ? parseInt(rangeFrom) : null;
    const filterTo = rangeTo ? parseInt(rangeTo) : null;
    
    if (filterFrom !== null || filterTo !== null) {
      apps = apps.filter(app => {
        // Verificar si alguno de los rangos de la app intersecta con el filtro
        return app.idRanges.some(range => {
          // Si solo hay filterFrom, verificar que el rango termine después de filterFrom
          if (filterFrom !== null && filterTo === null) {
            return range.to >= filterFrom;
          }
          // Si solo hay filterTo, verificar que el rango empiece antes de filterTo
          if (filterFrom === null && filterTo !== null) {
            return range.from <= filterTo;
          }
          // Si hay ambos, verificar intersección completa
          // Dos rangos [a, b] y [c, d] intersectan si: a <= d && b >= c
          return range.from <= filterTo! && range.to >= filterFrom!;
        });
      });
    }
    
    // Ordenar por el rango más pequeño (from más pequeño)
    return apps.slice().sort((a, b) => {
      const minFromA = Math.min(...a.idRanges.map(r => r.from));
      const minFromB = Math.min(...b.idRanges.map(r => r.from));
      return minFromA - minFromB;
    });
  }, [data, searchText, rangeFrom, rangeTo]);

  // Calcular el rango dinámico basado en las aplicaciones filtradas
  const { displayMinId, displayMaxId, displayRange } = useMemo(() => {
    if (filteredApplications.length === 0) {
      return { displayMinId: MIN_ID, displayMaxId: MAX_ID, displayRange: TOTAL_RANGE };
    }

    // Encontrar el mínimo y máximo de todos los rangos de las aplicaciones filtradas
    let min = Infinity;
    let max = -Infinity;

    filteredApplications.forEach(app => {
      app.idRanges.forEach(range => {
        min = Math.min(min, range.from);
        max = Math.max(max, range.to);
      });
    });

    // Agregar un pequeño margen (5% a cada lado)
    const range = max - min;
    const margin = Math.ceil(range * 0.05);
    
    const adjustedMin = Math.max(MIN_ID, min - margin);
    const adjustedMax = Math.min(MAX_ID, max + margin);
    const adjustedRange = adjustedMax - adjustedMin;

    return { 
      displayMinId: adjustedMin, 
      displayMaxId: adjustedMax, 
      displayRange: adjustedRange 
    };
  }, [filteredApplications]);

  // Calcular posición X para un ID dado (ahora basado en el rango dinámico)
  const getXPosition = useCallback((id: number): number => {
    return ((id - displayMinId) / displayRange) * 100;
  }, [displayMinId, displayRange]);

  // Calcular ancho de una barra en porcentaje
  const getBarWidth = useCallback((from: number, to: number): number => {
    const width = ((to - from) / displayRange) * 100;
    return Math.max(width, 0.3); // Mínimo 0.3% para que sea visible sin zoom
  }, [displayRange]);

  // Función de zoom - máximo zoom muestra ~1000 IDs de rango (ticks de 100 en 100)
  const MAX_ZOOM = displayRange / 1000; // Calculado dinámicamente basado en el rango actual
  
  const applyZoom = useCallback((zoomIn: boolean) => {
    setZoomScale(prev => {
      const factor = zoomIn ? 1.5 : 0.67;
      const newScale = prev * factor;
      // Limitar entre 1x y MAX_ZOOM
      const maxZoom = displayRange / 1000;
      return Math.min(Math.max(newScale, 1), maxZoom);
    });
  }, [displayRange]);

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
        
        // Posición del ratón relativa al contenedor visible
        const mouseX = e.clientX - rect.left;
        
        // Posición actual del scroll y ancho del contenido
        const scrollLeft = scrollContainer.scrollLeft;
        const contentWidth = scrollContainer.scrollWidth;
        const viewportWidth = scrollContainer.clientWidth;
        
        // Posición del ratón en el contenido (posición absoluta en el contenido)
        const mousePositionInContent = scrollLeft + mouseX;
        
        // Calcular el nuevo zoom
        const delta = -e.deltaY; // Invertir para que sea intuitivo
        const zoomFactor = 1 + (delta * 0.005); // Factor suave
        const maxZoom = displayRange / 1000;
        
        setZoomScale(prev => {
          const newScale = Math.min(Math.max(prev * zoomFactor, 1), maxZoom);
          
          // Calcular el ratio de cambio de escala
          const scaleRatio = newScale / prev;
          
          // El nuevo ancho del contenido será proporcional al cambio de escala
          // La posición del ratón en el contenido escalará proporcionalmente
          const newMousePositionInContent = mousePositionInContent * scaleRatio;
          
          // Calcular el nuevo scroll para mantener el punto bajo el cursor
          const newScrollLeft = newMousePositionInContent - mouseX;
          
          // Aplicar el scroll de forma síncrona usando requestAnimationFrame
          // para que ocurra justo después del re-render
          requestAnimationFrame(() => {
            if (scrollContainerRef.current) {
              const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
              scrollContainerRef.current.scrollLeft = Math.max(0, Math.min(newScrollLeft, maxScroll));
            }
          });
          
          return newScale;
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
  }, [applyZoom, displayRange]);

  // Reset zoom
  const resetZoom = useCallback(() => {
    setZoomScale(1);
    // Volver al inicio del scroll
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
  }, []);

  // Resetear zoom cuando cambia el texto de búsqueda o el filtro de rango
  useEffect(() => {
    if (searchText || rangeFrom || rangeTo) {
      resetZoom();
    }
  }, [searchText, rangeFrom, rangeTo, resetZoom]);

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

  // Generar marcas del eje X con números redondos (~10 marcas visibles)
  const xAxisTicks = useMemo(() => {
    // Determinar el intervalo redondo basado en el zoom
    // Queremos aproximadamente 10 marcas visibles
    const visibleRange = displayRange / zoomScale;
    
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
      interval = 5000; // Para rangos muy grandes
    }
    
    const ticks: number[] = [];
    // Empezar desde el primer múltiplo del intervalo >= displayMinId
    const start = Math.ceil(displayMinId / interval) * interval;
    
    for (let tick = start; tick <= displayMaxId; tick += interval) {
      ticks.push(tick);
    }
    
    return ticks;
  }, [zoomScale, displayMinId, displayMaxId, displayRange]);

  // Mostrar tooltip
  const showTooltip = useCallback((e: React.MouseEvent, app: ApplicationWithRanges, range: IdRange) => {
    if (isDragging) return; // No mostrar tooltip mientras se arrastra
    
    const tooltipOffset = 10;
    
    // Usar coordenadas absolutas de la ventana para posicionamiento fixed
    const x = e.clientX + tooltipOffset;
    const y = e.clientY + tooltipOffset;
    
    setTooltip({
      visible: true,
      x,
      y,
      content: `${app.name}\n${app.publisher}\nRango: ${range.from.toLocaleString()} - ${range.to.toLocaleString()}\nTotal: ${(range.to - range.from + 1).toLocaleString()} IDs`,
    });
  }, [isDragging]);

  const hideTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  // Manejar clic en una barra para mostrar menú contextual
  const handleBarClick = useCallback((e: React.MouseEvent, range: IdRange) => {
    e.stopPropagation();
    hideTooltip();
    
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      range,
    });
  }, [hideTooltip]);

  // Cerrar menú contextual
  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  // Aplicar filtro desde el menú contextual
  const applyRangeFilter = useCallback((range: IdRange) => {
    setRangeFrom(range.from.toString());
    setRangeTo(range.to.toString());
    closeContextMenu();
  }, [closeContextMenu]);

  // Cerrar menú contextual al hacer clic fuera
  useEffect(() => {
    if (contextMenu.visible) {
      const handleClickOutside = () => closeContextMenu();
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.visible, closeContextMenu]);

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
          
          {/* Filtro de rango */}
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={rangeFrom}
              onChange={(e) => setRangeFrom(e.target.value)}
              placeholder="Desde"
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-gray-500 dark:text-gray-400">-</span>
            <input
              type="number"
              value={rangeTo}
              onChange={(e) => setRangeTo(e.target.value)}
              placeholder="Hasta"
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            {(rangeFrom || rangeTo) && (
              <button
                onClick={() => {
                  setRangeFrom("");
                  setRangeTo("");
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Limpiar filtro de rango"
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
              
              {/* Filtro de rango */}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(e.target.value)}
                  placeholder="Desde"
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-gray-500 dark:text-gray-400">-</span>
                <input
                  type="number"
                  value={rangeTo}
                  onChange={(e) => setRangeTo(e.target.value)}
                  placeholder="Hasta"
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 w-24 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {(rangeFrom || rangeTo) && (
                  <button
                    onClick={() => {
                      setRangeFrom("");
                      setRangeTo("");
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Limpiar filtro de rango"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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
            className="fixed z-50 px-3 py-2 text-sm bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg shadow-lg pointer-events-none whitespace-pre-line max-w-xs"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.content}
          </div>
        )}

        {/* Menú contextual */}
        {contextMenu.visible && contextMenu.range && (
          <div
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[200px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => applyRangeFilter(contextMenu.range!)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>
                Filtrar este rango {contextMenu.range.from.toLocaleString()} - {contextMenu.range.to.toLocaleString()}
              </span>
            </button>
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
              className="flex items-center px-4 font-medium text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700 sticky top-0 z-10"
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
                    const isFirst = i === 0;
                    const isLast = i === xAxisTicks.length - 1;
                    return (
                      <div
                        key={i}
                        className={`absolute text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ${
                          isFirst ? '' : isLast ? 'transform -translate-x-full' : 'transform -translate-x-1/2'
                        }`}
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
                        // Detectar si el rango está completamente fuera del rango visible
                        const isAboveMax = range.from > MAX_ID;
                        const isBelowMin = range.to < MIN_ID;
                        
                        // Contar cuántos rangos están en cada categoría para esta app
                        const aboveMaxRanges = app.idRanges.filter(r => r.from > MAX_ID);
                        const belowMinRanges = app.idRanges.filter(r => r.to < MIN_ID);
                        
                        // Solo mostrar el primer rango de cada categoría
                        const isFirstAboveMax = isAboveMax && aboveMaxRanges.findIndex(r => r.from === range.from && r.to === range.to) === 0;
                        const isFirstBelowMin = isBelowMin && belowMinRanges.findIndex(r => r.from === range.from && r.to === range.to) === 0;
                        
                        if (isAboveMax && isFirstAboveMax) {
                          // Mostrar indicador al final del rango visible con flecha derecha
                          return (
                            <div
                              key={`${app.id}-${rangeIndex}`}
                              className="absolute flex items-center gap-1 cursor-pointer hover:brightness-110 transition-all"
                              style={{
                                right: '8px', // Posicionado al final del gráfico
                                top: BAR_PADDING,
                                height: ROW_HEIGHT - BAR_PADDING * 2,
                              }}
                              onMouseEnter={(e) => showTooltip(e, app, range)}
                              onMouseMove={(e) => showTooltip(e, app, range)}
                              onMouseLeave={hideTooltip}
                              onClick={(e) => handleBarClick(e, range)}
                            >
                              <div 
                                className="rounded-sm px-2 py-1 text-xs font-medium flex items-center gap-1 border-2"
                                style={{
                                  borderColor: COLORS[originalIndex % COLORS.length],
                                  color: COLORS[originalIndex % COLORS.length],
                                  backgroundColor: 'transparent',
                                }}
                              >
                                {range.from.toLocaleString()}
                                <svg 
                                  className="w-3 h-3" 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                              </div>
                            </div>
                          );
                        }
                        
                        if (isBelowMin && isFirstBelowMin) {
                          // Mostrar indicador al inicio del rango visible con flecha izquierda
                          return (
                            <div
                              key={`${app.id}-${rangeIndex}`}
                              className="absolute flex items-center gap-1 cursor-pointer hover:brightness-110 transition-all"
                              style={{
                                left: '8px', // Posicionado al inicio del gráfico
                                top: BAR_PADDING,
                                height: ROW_HEIGHT - BAR_PADDING * 2,
                              }}
                              onMouseEnter={(e) => showTooltip(e, app, range)}
                              onMouseMove={(e) => showTooltip(e, app, range)}
                              onMouseLeave={hideTooltip}
                              onClick={(e) => handleBarClick(e, range)}
                            >
                              <div 
                                className="rounded-sm px-2 py-1 text-xs font-medium flex items-center gap-1 border-2"
                                style={{
                                  borderColor: COLORS[originalIndex % COLORS.length],
                                  color: COLORS[originalIndex % COLORS.length],
                                  backgroundColor: 'transparent',
                                }}
                              >
                                <svg 
                                  className="w-3 h-3" 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path 
                                    fillRule="evenodd" 
                                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                                    clipRule="evenodd" 
                                  />
                                </svg>
                                {range.to.toLocaleString()}
                              </div>
                            </div>
                          );
                        }
                        
                        // Si el rango está fuera pero no es el primero, no mostrar nada
                        if ((isAboveMax && !isFirstAboveMax) || (isBelowMin && !isFirstBelowMin)) {
                          return null;
                        }
                        
                        // Barra normal
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
                            onClick={(e) => handleBarClick(e, range)}
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
