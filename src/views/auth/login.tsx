// src/views/auth/login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Input";
import Button from "../../components/Button";

export default function Login() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/admin/catalog");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans bg-[#E3E3E3]">
      {/* Columna Izquierda: Imagen de Fondo */}
      <div className="w-1/2 h-full relative">
        <img
          src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1000&auto=format&fit=crop"
          alt="Jardinería"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Columna Derecha: Formulario de Login */}
      <div className="w-1/2 h-full flex flex-col items-center justify-center p-8 bg-[#E3E3E3]">
        <div className="w-full max-w-sm flex flex-col items-center">
          
          {/* Círculo Verde Oliva con Ícono de Perfil */}
          <div className="w-40 h-40 rounded-full bg-[#5d682e] flex items-center justify-center mb-8 shadow-md">
            <svg
              className="w-24 h-24 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
            {/* Campo Usuario */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-800">
                Usuario
              </label>
              <Input
                type="text"
                value={usuario}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setUsuario(e.target.value)
                }
              />
            </div>

            {/* Campo Contraseña */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-800">
                Contraseña
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />
            </div>

            {/* Botón Entrar */}
            <div className="mt-4">
              <Button
                type="submit"
                style={{
                  backgroundColor: "#5d682e",
                  color: "#FFFFFF",
                  width: "100%",
                  paddingTop: "0.75rem",
                  paddingBottom: "0.75rem",
                  fontSize: "1.1rem",
                  letterSpacing: "0.05em",
                  borderRadius: "0.75rem"
                }}
              >
                ENTRAR
              </Button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}