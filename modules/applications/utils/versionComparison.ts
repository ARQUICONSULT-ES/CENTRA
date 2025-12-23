/**
 * Extrae la versión major.minor de una cadena de versión
 * Ejemplo: "1.18.0.3" -> "1.18"
 */
export function getMajorMinorVersion(version: string | null | undefined): string | null {
  if (!version) return null;
  
  const parts = version.split('.');
  if (parts.length < 2) return null;
  
  return parts.slice(0, 2).join('.');
}

/**
 * Compara si dos versiones tienen el mismo major.minor
 * Retorna true si son iguales, false si son diferentes
 */
export function isSameMajorMinor(version1: string | null | undefined, version2: string | null | undefined): boolean {
  const v1 = getMajorMinorVersion(version1);
  const v2 = getMajorMinorVersion(version2);
  
  if (!v1 || !v2) return false;
  
  return v1 === v2;
}

/**
 * Compara dos versiones major.minor
 * Retorna: 
 *  - número negativo si version1 < version2 (version1 es más antigua)
 *  - 0 si version1 === version2
 *  - número positivo si version1 > version2 (version1 es más nueva)
 */
export function compareMajorMinorVersions(version1: string | null | undefined, version2: string | null | undefined): number {
  const v1 = getMajorMinorVersion(version1);
  const v2 = getMajorMinorVersion(version2);
  
  if (!v1 || !v2) return 0;
  
  const [major1, minor1] = v1.split('.').map(Number);
  const [major2, minor2] = v2.split('.').map(Number);
  
  if (major1 !== major2) {
    return major1 - major2;
  }
  
  return minor1 - minor2;
}

/**
 * Verifica si la instalación está desactualizada (es decir, tiene una versión menor a la última versión)
 */
export function isVersionOutdated(installedVersion: string | null | undefined, latestVersion: string | null | undefined): boolean {
  if (!installedVersion || !latestVersion) return false;
  
  return compareMajorMinorVersions(installedVersion, latestVersion) < 0;
}

/**
 * Calcula cuántas instalaciones están desactualizadas comparando con la última versión
 * Una instalación está desactualizada si su versión es MENOR a la última versión disponible
 */
export function countOutdatedInstallations(
  latestVersion: string | null | undefined,
  installations: Array<{ version?: string | null }>
): number {
  if (!latestVersion) return 0;
  
  return installations.filter(installation => {
    return isVersionOutdated(installation.version, latestVersion);
  }).length;
}
