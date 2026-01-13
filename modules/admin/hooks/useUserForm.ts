"use client";

import { useState } from "react";
import type { User, UserFormData } from "@/modules/admin/types";

interface UseUserFormProps {
  onSuccess?: () => void;
  protectedMode?: boolean; // Usar endpoint /api/users/me en lugar de /api/users/:id
}

export function useUserForm({ onSuccess, protectedMode = false }: UseUserFormProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createUser = async (data: UserFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el usuario");
      }

      const result = await response.json();
      
      // Si se solicitó enviar email de activación, enviarlo después de crear el usuario
      if (data.sendActivationEmail && result.user?.id) {
        try {
          await fetch(`/api/users/${result.user.id}/send-activation`, {
            method: "POST",
          });
        } catch (emailErr) {
          console.error("Error enviando email de activación:", emailErr);
          // No lanzar error, el usuario ya fue creado
        }
      }
      
      onSuccess?.();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userId: string, data: UserFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Usar endpoint diferente en modo protegido
      const endpoint = protectedMode ? "/api/users/me" : `/api/users/${userId}`;
      
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al actualizar el usuario");
      }

      const result = await response.json();
      onSuccess?.();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar el usuario");
      }

      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createUser, updateUser, deleteUser, isLoading, error };
}
