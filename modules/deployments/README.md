# Módulo de Deployments

## Descripción

El módulo de deployments permite gestionar el despliegue de aplicaciones Business Central a entornos específicos. Proporciona una interfaz intuitiva con dos paneles principales:

- **Panel Izquierdo**: Selector de entornos organizados por cliente/tenant
- **Panel Derecho**: Lista de aplicaciones seleccionadas para desplegar, con capacidad de reordenamiento

## Estructura del Módulo

```
modules/deployments/
├── index.tsx                              # Página principal
├── types/
│   └── index.ts                           # Definiciones de tipos TypeScript
├── hooks/
│   └── useDeployment.ts                   # Hook para gestionar el estado del deployment
├── components/
│   ├── EnvironmentSelector.tsx            # Panel izquierdo - selector de entornos
│   ├── ApplicationList.tsx                # Panel derecho - lista de aplicaciones
│   └── ApplicationSelectorModal.tsx       # Modal para seleccionar aplicaciones
└── README.md                              # Documentación
```

## Características

### 1. Selector de Entornos
- **Búsqueda**: Filtra entornos por nombre o cliente
- **Agrupación**: Los entornos se agrupan por cliente
- **Información**: Muestra tipo (Production/Sandbox), versión de BC
- **Selección**: Permite seleccionar un entorno como destino del deployment

### 2. Lista de Aplicaciones
- **Añadir**: Botón para abrir modal y seleccionar aplicaciones
- **Reordenar**: Flechas arriba/abajo para cambiar el orden de despliegue
- **Eliminar**: Botón para quitar aplicaciones de la lista
- **Visualización**: Muestra logo, nombre, publisher y última versión
- **Numeración**: Cada aplicación muestra su orden en la secuencia

### 3. Modal de Selección
- **Búsqueda**: Filtra por nombre de aplicación o publisher
- **Filtrado**: No muestra aplicaciones ya seleccionadas
- **Preview**: Muestra información detallada de cada aplicación
- **Rápido**: Añade la aplicación con un solo clic

## Uso

### Acceso
La página está disponible en `/deployments` y es accesible desde:
- Un botón en la página de aplicaciones (`/applications`)
- Navegación directa

### Flujo de Trabajo
1. **Seleccionar Entorno**: En el panel izquierdo, buscar y seleccionar el entorno destino
2. **Añadir Aplicaciones**: Hacer clic en "Añadir Aplicación" y seleccionar las apps deseadas
3. **Reordenar**: Usar las flechas para ordenar las aplicaciones según la secuencia de instalación
4. **Desplegar**: (Funcionalidad pendiente) Hacer clic en "Desplegar Aplicaciones"

## Tipos de Datos

### DeploymentEnvironment
```typescript
interface DeploymentEnvironment extends EnvironmentWithCustomer {
  selected: boolean;
}
```

### DeploymentApplication
```typescript
interface DeploymentApplication extends Application {
  order: number;  // Orden de despliegue
}
```

### DeploymentState
```typescript
interface DeploymentState {
  selectedEnvironment: DeploymentEnvironment | null;
  applications: DeploymentApplication[];
}
```

## Hook: useDeployment

### Estado
- `selectedEnvironment`: Entorno seleccionado
- `applications`: Lista de aplicaciones ordenadas

### Métodos
- `setSelectedEnvironment(env)`: Establece el entorno destino
- `addApplication(app)`: Añade una aplicación a la lista
- `removeApplication(appId)`: Elimina una aplicación
- `moveApplicationUp(appId)`: Mueve una aplicación hacia arriba
- `moveApplicationDown(appId)`: Mueve una aplicación hacia abajo
- `reorderApplications(startIdx, endIdx)`: Reordena aplicaciones (para drag & drop futuro)

## Próximas Mejoras

### Fase 1 - Completado ✅
- [x] Estructura básica del módulo
- [x] Selector de entornos con búsqueda
- [x] Lista de aplicaciones con reordenamiento
- [x] Modal de selección de aplicaciones
- [x] Integración con la página de aplicaciones

### Fase 2 - Pendiente
- [ ] Implementar funcionalidad real de deployment
- [ ] Agregar drag & drop nativo para reordenar
- [ ] Guardar configuraciones de deployment
- [ ] Historial de deployments realizados
- [ ] Validación de dependencias entre apps
- [ ] Verificación de compatibilidad de versiones
- [ ] Logs en tiempo real del proceso de deployment
- [ ] Rollback automático en caso de error

### Fase 3 - Futuro
- [ ] Plantillas de deployment predefinidas
- [ ] Deployment a múltiples entornos simultáneamente
- [ ] Programación de deployments
- [ ] Notificaciones por email/webhook
- [ ] Integración con pipelines CI/CD

## Permisos

La página está protegida por el middleware de autenticación. Los usuarios deben:
- Estar autenticados
- Tener acceso a los clientes cuyos entornos desean ver (según `UserCustomer`)
- Los administradores ven todos los entornos

## Estilos

El módulo sigue el sistema de diseño de la aplicación:
- Tailwind CSS para estilos
- Soporte para modo oscuro (dark mode)
- Diseño responsivo (mobile-first)
- Transiciones suaves
- Iconos SVG inline

## Dependencias

### Hooks Externos
- `useAllEnvironments` - de `@/modules/customers/hooks/useAllEnvironments`
- `useApplications` - de `@/modules/applications/hooks/useApplications`

### Tipos Externos
- `Application` - de `@/modules/applications/types`
- `EnvironmentWithCustomer` - de `@/modules/customers/types`
