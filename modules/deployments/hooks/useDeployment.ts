"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { DeploymentEnvironment, DeploymentApplication, VersionType } from "../types";
import type { Application } from "@/modules/applications/types";

export function useDeployment() {
  const [selectedEnvironment, setSelectedEnvironment] = useState<DeploymentEnvironment | null>(null);
  const [applications, setApplications] = useState<DeploymentApplication[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  const addApplication = useCallback((app: Application, versionType: VersionType = 'release') => {
    setApplications(prev => {
      // Check if already exists
      if (prev.find(a => a.id === app.id)) {
        return prev;
      }
      
      const maxOrder = prev.length > 0 ? Math.max(...prev.map(a => a.order)) : -1;
      return [...prev, { ...app, order: maxOrder + 1, versionType }];
    });
  }, []);

  const addApplications = useCallback((apps: Array<{ app: Application; versionType: VersionType }>) => {
    setApplications(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const newApps = apps.filter(item => !existingIds.has(item.app.id));
      
      if (newApps.length === 0) return prev;
      
      const maxOrder = prev.length > 0 ? Math.max(...prev.map(a => a.order)) : -1;
      const appsWithOrder = newApps.map((item, idx) => ({
        ...item.app,
        order: maxOrder + 1 + idx,
        versionType: item.versionType
      }));
      
      return [...prev, ...appsWithOrder];
    });
  }, []);

  const removeApplication = useCallback((appId: string) => {
    setApplications(prev => prev.filter(a => a.id !== appId));
  }, []);

  const moveApplicationUp = useCallback((appId: string) => {
    setApplications(prev => {
      const index = prev.findIndex(a => a.id === appId);
      if (index <= 0) return prev;

      const newApps = [...prev];
      [newApps[index - 1], newApps[index]] = [newApps[index], newApps[index - 1]];
      
      // Update order
      return newApps.map((app, idx) => ({ ...app, order: idx }));
    });
  }, []);

  const moveApplicationDown = useCallback((appId: string) => {
    setApplications(prev => {
      const index = prev.findIndex(a => a.id === appId);
      if (index < 0 || index >= prev.length - 1) return prev;

      const newApps = [...prev];
      [newApps[index], newApps[index + 1]] = [newApps[index + 1], newApps[index]];
      
      // Update order
      return newApps.map((app, idx) => ({ ...app, order: idx }));
    });
  }, []);

  const reorderApplications = useCallback((startIndex: number, endIndex: number) => {
    setApplications(prev => {
      const newApps = [...prev];
      const [removed] = newApps.splice(startIndex, 1);
      newApps.splice(endIndex, 0, removed);
      
      // Update order
      return newApps.map((app, idx) => ({ ...app, order: idx }));
    });
  }, []);

  // Sync state with URL params
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();
    
    if (selectedEnvironment) {
      params.set('tenantId', selectedEnvironment.tenantId);
      params.set('environmentName', selectedEnvironment.name);
    }
    
    if (applications.length > 0) {
      // Store apps as JSON: [{id, versionType}]
      const appsData = applications.map(app => ({
        id: app.id,
        versionType: app.versionType
      }));
      params.set('apps', JSON.stringify(appsData));
    }
    
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [selectedEnvironment, applications, pathname, router]);

  // Update URL when state changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      updateUrlParams();
    }
  }, [selectedEnvironment, applications, isInitialized, updateUrlParams]);

  return {
    selectedEnvironment,
    setSelectedEnvironment,
    applications,
    addApplication,
    addApplications,
    removeApplication,
    moveApplicationUp,
    moveApplicationDown,
    reorderApplications,
    isInitialized,
    setIsInitialized,
  };
}
