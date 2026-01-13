"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ActivateAccountForm } from "./components/ActivateAccountForm";

function ActivateAccountContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return <ActivateAccountForm token={token} />;
}

export default function ActivateAccountModule() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl mb-4 animate-pulse">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <p className="text-gray-600 dark:text-gray-400 animate-pulse">Cargando...</p>
          </div>
        </div>
      }
    >
      <ActivateAccountContent />
    </Suspense>
  );
}
