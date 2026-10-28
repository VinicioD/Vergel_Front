# Vergel Frontend

Aplicación SPA con React 19, TypeScript, Vite y Tailwind CSS v4 para el sistema de gestión de servicios de jardinería "Vergel". 

El backend es una aplicación **Laravel** separada, por lo que no se encuentra en este repositorio.

## Requisitos

- [Node.js](https://nodejs.org/) >= 18
- [pnpm](https://pnpm.io/) - Se usa **exclusivamente** (existe `pnpm-lock.yaml`)

## Levantar el entorno local

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Vergel_Front
```

### 2. Instalación de dependencias

```bash
pnpm install
```

### 3. Configurar variables de entorno

Copia el archivo de ejemplo:

```bash
cp .env.example .env
```

Edita el archivo `.env` con la URL de tu API. Por ejemplo:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

> **Nota:** Las variables con prefijo `VITE_` se inyectan directamente en el bundle del cliente. Nunca añadas secretos o credenciales a este archivo.

### 4. Ejecutar el proyecto

```bash
pnpm dev
```

La aplicación estará disponible en [http://localhost:5173](http://localhost:5173) por defecto.

## Comandos disponibles

| Comando | Descripción |
| --- | --- |
| `pnpm dev` | Inicia el servidor de desarrollo. |
| `pnpm build` | Ejecuta `tsc -b` y luego `vite build` para generar el build de producción. |
| `pnpm lint` | Ejecuta ESLint sobre el proyecto. |
| `pnpm preview` | Previsualiza el build de producción localmente. |
| `pnpm exec tsc -b` | Solo comprobación de tipos. |
| `pnpm exec vite build` | Solo build con Vite. |

## Notas

- Usar únicamente `pnpm` (no `npm` ni `yarn`).
- La interfaz y los comentarios del código están en **español**.
- No hay tests, CI ni hooks de pre-commit configurados.
