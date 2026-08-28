// src/views/auth/login.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
export default function Login() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4EFE6] dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
      <div className="p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg text-center max-w-sm w-full border border-gray-200/80 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-[#636B2F] dark:text-[#7c8839] mb-2">
          Vergel App
        </h1>
        <p className="text-gray-600 dark:text-gray-300 font-medium">
          Vista Login
        </p>
        {/* Botón temporal de prueba */}
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="w-full py-2.5 px-4 bg-[#636B2F] hover:bg-[#525927] text-white font-semibold rounded-xl shadow transition-colors cursor-pointer"
        >
          Ir al Admin
        </button>
      </div>
    </div>
  );
}
