"use client";

import type { User } from "@/modules/admin/types";

interface UserCardProps {
  user: User;
  onClick: (user: User) => void;
}

export default function UserCard({ user, onClick }: UserCardProps) {
  // Contar permisos activos
  const permissionsCount = [
    user.canAccessRepos,
    user.canAccessCustomers,
    user.canAccessAdmin,
  ].filter(Boolean).length;
  
  return (
    <div
      onClick={() => onClick(user)}
      className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg hover:border-blue-300 hover:-translate-y-1 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600 cursor-pointer"
    >
      {/* Badges de permisos */}
      <div className="absolute top-3 right-3 flex flex-wrap gap-1 justify-end max-w-[60%]">
        {user.canAccessAdmin && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
            Admin
          </span>
        )}
        {user.canAccessRepos && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Repos
          </span>
        )}
        {user.canAccessCustomers && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {user.allCustomers ? 'Todos' : 'Clientes'}
          </span>
        )}
        {permissionsCount === 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
            Sin permisos
          </span>
        )}
      </div>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {user.githubAvatar ? (
            <img 
              src={user.githubAvatar} 
              alt={user.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Información del usuario */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {user.name}
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 truncate">
            {user.email}
          </p>
          
          {/* Fechas */}
          <div className="mt-3 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Creado: {new Date(user.createdAt).toLocaleDateString('es-ES')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
