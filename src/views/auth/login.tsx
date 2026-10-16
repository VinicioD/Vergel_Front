// src/views/auth/login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader2 } from "lucide-react";
import logoImg from "../../assets/Logo.png";
import fondoLight from "../../assets/Fondo_light.jpeg";
import { login } from "../../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Estados para la llamada a la API
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      // Petición real al backend: POST /api/login
      await login({ email, password });

      // Al ser exitoso, redirige a la vista deseada
      navigate("/admin/catalog");
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      if (error.response?.status === 422 || error.response?.status === 401) {
        setErrorMessage("Las credenciales proporcionadas son incorrectas.");
      } else {
        setErrorMessage(
          "Error de conexión con el servidor. Inténtalo más tarde.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const bgLight = fondoLight;
  const bgDark =
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1000&auto=format&fit=crop";

  return (
    <div
      className={`min-h-screen w-full flex flex-col md:flex-row font-sans transition-colors duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-[#E3E3E3]"
      }`}
    >
      {/* Columna Izquierda: Imagen de Fondo */}
      <div className="hidden md:block md:w-1/2 lg:w-7/12 h-64 md:h-screen relative overflow-hidden">
        <img
          src={isDarkMode ? bgDark : bgLight}
          alt="Fondo Jardinería"
          className="w-full h-full object-cover transition-all duration-500"
        />
      </div>

      {/* Columna Derecha: Formulario */}
      <div className="w-full md:w-1/2 lg:w-5/12 min-h-screen md:min-h-0 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-700 transition-colors duration-300 flex flex-col items-center">
          {/* Logo de la empresa */}
          <div className="mb-4 sm:mb-6 flex justify-center w-full">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-50 dark:bg-gray-700/50 p-2 sm:p-3 flex items-center justify-center shadow-inner border border-gray-100 dark:border-gray-600">
              <img
                src={logoImg}
                alt="Logo Empresa"
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-[#2A3319] dark:text-gray-100 mb-1 text-center">
            ¡Hola de nuevo!
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
            Ingresa tus datos para acceder
          </p>

          {/* Banner de error de credenciales */}
          {errorMessage && (
            <div className="w-full mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm text-center font-medium">
              {errorMessage}
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            {/* Campo Correo */}
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                Correo / Usuario
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  placeholder="admin@vergel.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5d682e] disabled:opacity-50"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="flex flex-col gap-1">
              <label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5d682e] disabled:opacity-50"
                />
              </div>
            </div>

            {/* Botón ENTRAR */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 sm:mt-3 py-3 bg-[#5d682e] hover:bg-[#4d5626] text-white font-bold text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>INGRESANDO...</span>
                </>
              ) : (
                "ENTRAR"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
