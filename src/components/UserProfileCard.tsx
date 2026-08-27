// src/components/UserProfileCard.tsx
import React, { useState } from "react";
import Input from "./Input";
import Button from "./Button";
import { Camera, Save } from "lucide-react";

export default function UserProfileCard() {
  const [user, setUser] = useState({
    name: "Carlos Huerta",
    role: "Administrador",
    email: "carlos.huerta@verdecito.pe",
    phone: "+51 987 654 321",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
  });

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex flex-col gap-6 font-sans"
    >
      <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
        Mi Perfil
      </h2>

      {/* Selector de Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-[#5b642a]/30"
          />
          <button
            type="button"
            className="absolute bottom-0 right-0 p-1.5 bg-[#5b642a] text-white rounded-full shadow-md hover:bg-[#4a5222] transition-colors"
          >
            <Camera size={14} />
          </button>
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {user.name}
          </h3>
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 mt-1">
            {user.role}
          </span>
        </div>
      </div>

      {/* Datos Personales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Nombre Completo"
          value={user.name}
          onChange={(e) => setUser({ ...user, name: e.target.value })}
        />
        <Input
          label="Correo Electrónico"
          value={user.email}
          onChange={(e) => setUser({ ...user, email: e.target.value })}
        />
        <Input
          label="Teléfono"
          value={user.phone}
          onChange={(e) => setUser({ ...user, phone: e.target.value })}
        />
        <Input label="Cargo / Rol" value={user.role} disabled />
      </div>

      <div className="pt-2">
        <Button variant="primary" icon={Save} type="submit">
          Guardar Perfil
        </Button>
      </div>
    </form>
  );
}
