"use client";

import { useState, useEffect } from "react";
import type { User, UserFormData, AllowedCustomer } from "@/modules/admin/types";
import { useUserForm } from "@/modules/admin/hooks/useUserForm";
import { CustomerSelector } from "./CustomerSelector";
import { useToast } from "@/modules/shared/hooks/useToast";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onSave: () => void;
  protectedMode?: boolean; // Modo protegido: sin rol, permisos ni eliminación
}

export default function UserFormModal({
  isOpen,
  onClose,
  user,
  onSave,
  protectedMode = false,
}: UserFormModalProps) {
  const { warning, success, error: showError } = useToast();
  
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    password: "",
    githubToken: "",
    allowedCustomerIds: [],
    canAccessRepos: false,
    canAccessCustomers: false,
    allCustomers: false,
    canAccessAdmin: false,
  });
  const [selectedCustomers, setSelectedCustomers] = useState<AllowedCustomer[]>([]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  
  // Nuevos estados para activación por email
  const [sendActivationEmail, setSendActivationEmail] = useState(true); // Por defecto activado
  const [isSendingActivation, setIsSendingActivation] = useState(false);
  
  const { createUser, updateUser, deleteUser, isLoading, error } = useUserForm({
    onSuccess: () => {
      onSave();
      onClose();
    },
    protectedMode, // Pasar el modo protegido al hook
  });

  const isEditMode = !!user;

  // Cargar datos del usuario desde la base de datos en modo protegido
  useEffect(() => {
    const loadUserData = async () => {
      if (protectedMode && isOpen) {
        setIsLoadingUser(true);
        try {
          const response = await fetch('/api/users/me');
          if (response.ok) {
            const { user: userData } = await response.json();
            setFormData({
              name: userData.name,
              email: userData.email,
              password: "",
              githubToken: userData.githubToken || "",
              allowedCustomerIds: userData.allowedCustomers?.map((c: any) => c.id) || [],
              canAccessRepos: userData.canAccessRepos ?? false,
              canAccessCustomers: userData.canAccessCustomers ?? false,
              allCustomers: userData.allCustomers ?? false,
              canAccessAdmin: userData.canAccessAdmin ?? false,
            });
            setSelectedCustomers(userData.allowedCustomers || []);
          }
        } catch (error) {
          console.error("Error al cargar datos del usuario:", error);
        } finally {
          setIsLoadingUser(false);
        }
      }
    };

    if (protectedMode && isOpen) {
      loadUserData();
    } else if (user && isOpen) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        githubToken: user.githubToken || "",
        allowedCustomerIds: user.allowedCustomers?.map(c => c.id) || [],
        canAccessRepos: user.canAccessRepos ?? false,
        canAccessCustomers: user.canAccessCustomers ?? false,
        allCustomers: user.allCustomers ?? false,
        canAccessAdmin: user.canAccessAdmin ?? false,
      });
      setSelectedCustomers(user.allowedCustomers || []);
      setShowPassword(false);
      setShowResetPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    } else if (!user && isOpen) {
      setFormData({
        name: "",
        email: "",
        password: "",
        githubToken: "",
        allowedCustomerIds: [],
        canAccessRepos: false,
        canAccessCustomers: false,
        allCustomers: false,
        canAccessAdmin: false,
      });
      setSelectedCustomers([]);
      setShowPassword(false);
      setShowResetPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
      setPasswordError("");
    }
  }, [user, isOpen, protectedMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode) {
        // Actualizar usuario (sin contraseña, se usa el botón separado)
        const dataToSend: UserFormData = {
          name: formData.name,
          email: formData.email,
          githubToken: formData.githubToken,
          allowedCustomerIds: selectedCustomers.map(c => c.id),
          canAccessRepos: formData.canAccessRepos,
          canAccessCustomers: formData.canAccessCustomers,
          allCustomers: formData.allCustomers,
          canAccessAdmin: formData.canAccessAdmin,
        };

        await updateUser(user.id, dataToSend);
      } else {
        // Crear nuevo usuario
        // Si se enviará email de activación, la contraseña no es requerida
        if (!sendActivationEmail && (!formData.password || formData.password.trim() === "")) {
          warning("La contraseña es obligatoria cuando no se envía email de activación");
          return;
        }

        const dataToSend: UserFormData = {
          ...formData,
          allowedCustomerIds: selectedCustomers.map(c => c.id),
          sendActivationEmail, // Incluir el flag
        };

        // Si se envía email de activación, no enviar contraseña
        if (sendActivationEmail) {
          delete dataToSend.password;
        }

        await createUser(dataToSend);
        
        if (sendActivationEmail) {
          success("Usuario creado. Se enviará el email de activación.");
        }
      }
    } catch (err) {
      // El error ya se maneja en el hook
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    
    try {
      await deleteUser(user.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      // El error ya se maneja en el hook
    }
  };

  // Enviar o reenviar email de activación
  const handleSendActivationEmail = async () => {
    if (!user) return;
    
    setIsSendingActivation(true);
    try {
      const response = await fetch(`/api/users/${user.id}/send-activation`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        showError(data.error || 'Error al enviar el email de activación');
        return;
      }
      
      success('Email de activación enviado correctamente');
    } catch (err) {
      showError('Error de conexión al enviar el email');
    } finally {
      setIsSendingActivation(false);
    }
  };

  const handleResetPassword = async () => {
    setPasswordError("");

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    // Validar longitud mínima
    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!user) return;

    try {
      const dataToSend: UserFormData = {
        name: user.name,
        email: user.email,
        password: newPassword,
      };

      await updateUser(user.id, dataToSend);
      setShowResetPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      // El error ya se maneja en el hook
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-800 shadow-xl">
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {protectedMode ? "Ajustes de Usuario" : (isEditMode ? "Editar Usuario" : "Crear Nuevo Usuario")}
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Loading indicator */}
            {isLoadingUser && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Cargando datos del usuario...</span>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && !isLoadingUser && (
              <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Contenido del formulario - solo mostrar cuando no está cargando */}
            {!isLoadingUser && (
              <>
                {/* User info header (solo en modo edición) */}
                {isEditMode && (
                  <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID de Usuario</p>
                      <p className="font-mono text-xs text-gray-700 dark:text-gray-300">{user.id}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    {user.githubAvatar ? (
                      <img 
                        src={user.githubAvatar} 
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500 dark:ring-blue-400"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-blue-500 dark:ring-blue-400">
                        <span className="text-white text-lg font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                autoComplete="off"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="off"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="usuario@ejemplo.com"
              />
            </div>

            {/* GitHub Token */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                GitHub Token
              </label>
              <input
                type="text"
                value={formData.githubToken || ""}
                onChange={(e) => setFormData({ ...formData, githubToken: e.target.value })}
                autoComplete="off"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Token personal de GitHub para acceso a repositorios (opcional)
              </p>
            </div>

            {/* Password / Activación por email (solo en modo creación) */}
            {!isEditMode && (
              <div className="space-y-4">
                {/* Toggle: Activación por email */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <input
                    type="checkbox"
                    id="sendActivationEmail"
                    checked={sendActivationEmail}
                    onChange={(e) => setSendActivationEmail(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="sendActivationEmail" className="flex-1">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Enviar email de activación
                    </span>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      El usuario recibirá un email para crear su propia contraseña (recomendado)
                    </p>
                  </label>
                </div>

                {/* Campo de contraseña (solo si NO se envía email) */}
                {!sendActivationEmail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contraseña <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required={!sendActivationEmail}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        autoComplete="new-password"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Contraseña del usuario"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      ⚠️ Deberás comunicar esta contraseña al usuario de forma segura
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Botones de gestión de contraseña/activación (solo en modo edición) */}
            {isEditMode && (
              <div className="space-y-3 pt-2">
                {/* Mostrar estado de activación si el usuario no está activo */}
                {user && !user.isActive && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                          Cuenta pendiente de activación
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          Este usuario aún no ha configurado su contraseña.
                        </p>
                        <button
                          type="button"
                          onClick={handleSendActivationEmail}
                          disabled={isSendingActivation}
                          className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-100 hover:bg-amber-200 dark:text-amber-200 dark:bg-amber-800/50 dark:hover:bg-amber-800 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isSendingActivation ? (
                            <>
                              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Reenviar email de activación
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reset Password Button */}
                <button
                  type="button"
                  onClick={() => setShowResetPasswordModal(true)}
                  className="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-600 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    {protectedMode ? "Cambiar Contraseña" : "Restablecer Contraseña"}
                  </div>
                </button>
              </div>
            )}

            {/* Permissions */}
            {protectedMode ? (
              // Modo protegido: mostrar permisos como información solo lectura
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Tus permisos actuales:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.canAccessRepos && (
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded">Repositorios</span>
                      )}
                      {formData.canAccessCustomers && (
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded">
                          Clientes {formData.allCustomers ? "(Todos)" : "(Específicos)"}
                        </span>
                      )}
                      {formData.canAccessAdmin && (
                        <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded">Administración</span>
                      )}
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
                      No puedes modificar tus permisos. Contacta con un administrador si necesitas cambios.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Modo normal: permitir editar permisos
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Permisos de acceso
                </label>
                
                {/* Repositorios */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <input
                    type="checkbox"
                    id="canAccessRepos"
                    checked={formData.canAccessRepos}
                    onChange={(e) => setFormData({ ...formData, canAccessRepos: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="canAccessRepos" className="flex-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Repositorios</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Acceso al módulo de repositorios de GitHub</p>
                  </label>
                </div>

                {/* Clientes */}
                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="canAccessCustomers"
                      checked={formData.canAccessCustomers}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        canAccessCustomers: e.target.checked,
                        allCustomers: e.target.checked ? formData.allCustomers : false,
                      })}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor="canAccessCustomers" className="flex-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Clientes</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Acceso a Clientes, Entornos e Instalaciones</p>
                    </label>
                  </div>
                  
                  {formData.canAccessCustomers && (
                    <div className="ml-7 space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="allCustomers"
                          checked={formData.allCustomers}
                          onChange={(e) => setFormData({ ...formData, allCustomers: e.target.checked })}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <label htmlFor="allCustomers" className="flex-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Todos los clientes</span>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Si está desactivado, deberás seleccionar clientes específicos</p>
                        </label>
                      </div>
                      
                      {/* Customer Selector - justo debajo del checkbox */}
                      {!formData.allCustomers && (
                        <div className="pt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Selecciona los clientes específicos que este usuario podrá ver:
                          </p>
                          <CustomerSelector
                            selectedCustomers={selectedCustomers}
                            onChange={setSelectedCustomers}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Administración */}
                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <input
                    type="checkbox"
                    id="canAccessAdmin"
                    checked={formData.canAccessAdmin}
                    onChange={(e) => setFormData({ ...formData, canAccessAdmin: e.target.checked })}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="canAccessAdmin" className="flex-1">
                    <span className="text-sm font-medium text-purple-900 dark:text-purple-100">Administración</span>
                    <p className="text-xs text-purple-700 dark:text-purple-300">Gestionar usuarios y permisos del sistema</p>
                  </label>
                </div>
              </div>
            )}
            </>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {isEditMode && !protectedMode ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Eliminar Usuario
                </button>
              ) : (
                <div></div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isLoadingUser}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (isEditMode ? "Guardando..." : "Creando...") : (isEditMode ? "Guardar Cambios" : "Crear Usuario")}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && isEditMode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ¿Eliminar usuario?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Esta acción no se puede deshacer. El usuario <strong>{user.name}</strong> será eliminado permanentemente.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPasswordModal && isEditMode && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {protectedMode ? "Cambiar Contraseña" : "Restablecer Contraseña"}
              </h3>
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                }}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {protectedMode ? "Establece tu nueva contraseña" : `Establece una nueva contraseña para ${user.name}`}
            </p>

            {passwordError && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-200">{passwordError}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Ingresa la nueva contraseña"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Confirma la nueva contraseña"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordError("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                disabled={isLoading || !newPassword || !confirmPassword}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (protectedMode ? "Cambiando..." : "Restableciendo...") : (protectedMode ? "Cambiar" : "Restablecer")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
