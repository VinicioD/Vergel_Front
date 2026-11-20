// src/components/profile/ProfileView.tsx
// Vista de perfil personal reutilizable por todos los roles.
// Cada rol monta su propio wrapper en
// src/views/<rol>/modules/profile/ProfilePage.tsx y le pasa sus datos.
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Camera, Check, Save } from "lucide-react";
import Input from "../Input";
import Button from "../Button";

export interface ProfileData {
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  role: string;
}

export interface ProfileViewProps {
  /** Datos iniciales. Se combinan con los valores por defecto. */
  initialData?: Partial<ProfileData>;
  /** Muestra el efecto skeleton mientras se cargan los datos del perfil. */
  isLoading?: boolean;
  /** Si se omite, el formulario solo muestra el feedback de guardado. */
  onSave?: (data: ProfileData) => void;
}

const DEFAULT_PROFILE: ProfileData = {
  name: "Usuario Vergel",
  email: "usuario@vergel.com",
  phone: "(01) 456-7890",
  document: "—",
  address: "—",
  role: "—",
};

function ProfileSkeletonCard() {
  return (
    <div
      role="status"
      aria-label="Cargando perfil"
      aria-busy="true"
      className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800 animate-pulse"
    >
      <div className="flex shrink-0 flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6 dark:border-gray-700/60">
        <div className="h-16 w-16 shrink-0 rounded-full bg-gray-200 sm:h-20 sm:w-20 dark:bg-gray-700" />
        <div className="space-y-2">
          <div className="h-5 w-44 rounded-md bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-24 rounded-full bg-gray-100 dark:bg-gray-700/70" />
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 p-5 sm:p-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className={`flex flex-col gap-2 ${index === 4 ? "md:col-span-2" : ""}`}
          >
            <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-10 w-full rounded-xl bg-gray-100 dark:bg-gray-700/70" />
          </div>
        ))}
      </div>

      <div className="flex shrink-0 items-center border-t border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-700/60">
        <div className="h-10 w-36 rounded-xl bg-gray-200 dark:bg-gray-700" />
      </div>
      <span className="sr-only">Cargando perfil...</span>
    </div>
  );
}

export default function ProfileView({
  initialData,
  isLoading = false,
  onSave,
}: ProfileViewProps) {
  // Inicializador perezoso: evita el useEffect de sincronización que dispara
  // react-hooks/set-state-in-effect.
  const [profile, setProfile] = useState<ProfileData>({
    ...DEFAULT_PROFILE,
    ...initialData,
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  const update =
    (field: keyof ProfileData) => (e: ChangeEvent<HTMLInputElement>) =>
      setProfile((prev) => ({ ...prev, [field]: e.target.value }));

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarUrl(URL.createObjectURL(file));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave?.(profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="flex h-[calc(100dvh-5rem)] w-full flex-col gap-4 overflow-hidden p-4 sm:gap-5 sm:p-6 md:h-[calc(100dvh-3rem)] transition-colors duration-300">
      {/* Encabezado */}
      <div className="shrink-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#2A3319] dark:text-gray-100">
          Mi Perfil
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Actualiza tus datos personales y de contacto
        </p>
      </div>

      {isLoading ? (
        <ProfileSkeletonCard />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700/60 dark:bg-gray-800 transition-colors duration-300"
        >
          {/* Avatar */}
          <div className="flex shrink-0 flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:p-6 dark:border-gray-700/60">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profile.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#5b642a]/30"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#5b642a] dark:bg-[#6C7D38] text-white flex items-center justify-center text-xl font-bold border-2 border-[#5b642a]/30 select-none">
                  {initials || "UV"}
                </div>
              )}
              <label
                htmlFor="profile-avatar"
                title="Cambiar foto"
                className="absolute bottom-0 right-0 p-1.5 bg-[#5b642a] hover:bg-[#4a5222] text-white rounded-full shadow-md transition-colors cursor-pointer"
              >
                <Camera size={14} />
              </label>
              <input
                id="profile-avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
                {profile.name}
              </h2>
              <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                {profile.role}
              </span>
            </div>
          </div>

          {/* Datos personales */}
          <div className="grid min-h-0 flex-1 content-start grid-cols-1 gap-4 p-5 sm:p-6 md:grid-cols-3">
            <Input
              label="Nombre Completo"
              value={profile.name}
              onChange={update("name")}
            />
            <Input
              label="Correo Electrónico"
              type="email"
              value={profile.email}
              onChange={update("email")}
            />
            <Input
              label="Teléfono"
              value={profile.phone}
              onChange={update("phone")}
            />
            <Input
              label="Documento de Identidad"
              value={profile.document}
              onChange={update("document")}
            />
            <div className="md:col-span-2">
              <Input
                label="Dirección"
                value={profile.address}
                onChange={update("address")}
              />
            </div>
            <Input label="Cargo / Rol" value={profile.role} disabled />
          </div>

          {/* Guardar */}
          <div className="flex shrink-0 flex-wrap items-center gap-3 border-t border-gray-100 px-5 py-4 sm:px-6 dark:border-gray-700/60">
            <Button type="submit" icon={Save}>
              Guardar Perfil
            </Button>
            {isSaved && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <Check size={16} /> Cambios guardados correctamente
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
