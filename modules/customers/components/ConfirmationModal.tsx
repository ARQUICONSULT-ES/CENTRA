"use client";

import { useState } from "react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmationWord: string;
  confirmButtonText?: string;
  loading?: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmationWord,
  confirmButtonText = "Confirmar",
  loading = false,
}: ConfirmationModalProps) {
  const [inputValue, setInputValue] = useState("");

  const handleClose = () => {
    setInputValue("");
    onClose();
  };

  const handleConfirm = () => {
    if (inputValue === confirmationWord) {
      setInputValue("");
      onConfirm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">
          {title}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          {message}
        </p>
        <p className="font-semibold text-gray-900 dark:text-white mb-4 p-2 bg-gray-100 dark:bg-gray-800 rounded">
          {confirmationWord}
        </p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Escribe "${confirmationWord}" para confirmar`}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 mb-6"
          disabled={loading}
        />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading || inputValue !== confirmationWord}
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Procesando..." : confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}
