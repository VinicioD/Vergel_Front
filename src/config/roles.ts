export const APP_ROLES = {
  admin: "Administrador",
  auditor: "Auditor",
  receptionist: "Recepcionista",
  technical: "Tecnico de campo",
  quote: "quote",
  counter: "counter",
} as const;

export const ROLE_ID_MAP: Record<number, string> = {
  1: APP_ROLES.admin,
  2: APP_ROLES.auditor,
  3: APP_ROLES.receptionist,
  4: APP_ROLES.technical,
};

const ROLE_ALIASES: Record<string, string> = {
  admin: APP_ROLES.admin,
  administrador: APP_ROLES.admin,
  auditor: APP_ROLES.auditor,
  recepcionista: APP_ROLES.receptionist,
  recepcionist: APP_ROLES.receptionist,
  "tecnico de campo": APP_ROLES.technical,
  technical: APP_ROLES.technical,
  quote: APP_ROLES.quote,
  counter: APP_ROLES.counter,
};

export const normalizeRoleName = (role: unknown): string => {
  let roleName: string;

  if (typeof role === "number") {
    roleName = ROLE_ID_MAP[role] || "";
  } else if (typeof role === "string") {
    roleName = role;
  } else if (typeof role === "object" && role !== null) {
    const candidate = role as { name?: unknown; id?: unknown };
    if (typeof candidate.name === "string") {
      roleName = candidate.name;
    } else if (typeof candidate.id === "number") {
      roleName = ROLE_ID_MAP[candidate.id] || "";
    } else {
      return "";
    }
  } else {
    return "";
  }

  const normalized = roleName
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return ROLE_ALIASES[normalized] || normalized;
};

export const getRoleHomePath = (role: unknown): string => {
  switch (normalizeRoleName(role)) {
    case APP_ROLES.admin:
      return "/admin";
    case APP_ROLES.auditor:
      return "/auditor";
    case APP_ROLES.receptionist:
      return "/recepcionist";
    case APP_ROLES.technical:
      return "/technical";
    case APP_ROLES.quote:
      return "/quote";
    case APP_ROLES.counter:
      return "/counter";
    default:
      return "/login";
  }
};
