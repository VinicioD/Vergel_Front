import type { SelectOption } from "../SearchableSelect";

export const MUNICIPIOS_POR_DEPARTAMENTO: Record<string, string[]> = {
  Ahuachapán: [
    "Ahuachapán Norte",
    "Ahuachapán Centro",
    "Ahuachapán Sur",
  ],
  "Santa Ana": [
    "Santa Ana Norte",
    "Santa Ana Centro",
    "Santa Ana Este",
    "Santa Ana Oeste",
  ],
  Sonsonate: [
    "Sonsonate Norte",
    "Sonsonate Centro",
    "Sonsonate Este",
    "Sonsonate Oeste",
  ],
  Chalatenango: [
    "Chalatenango Norte",
    "Chalatenango Centro",
    "Chalatenango Sur",
  ],
  "La Libertad": [
    "La Libertad Norte",
    "La Libertad Centro",
    "La Libertad Oeste",
    "La Libertad Este",
    "La Libertad Costa",
    "La Libertad Sur",
  ],
  "San Salvador": [
    "San Salvador Norte",
    "San Salvador Oeste",
    "San Salvador Este",
    "San Salvador Centro",
    "San Salvador Sur",
  ],
  Cuscatlán: ["Cuscatlán Norte", "Cuscatlán Sur"],
  "La Paz": ["La Paz Oeste", "La Paz Centro", "La Paz Este"],
  Cabañas: ["Cabañas Este", "Cabañas Oeste"],
  "San Vicente": ["San Vicente Norte", "San Vicente Sur"],
  Usulután: ["Usulután Norte", "Usulután Este", "Usulután Oeste"],
  "San Miguel": ["San Miguel Norte", "San Miguel Centro", "San Miguel Oeste"],
  Morazán: ["Morazán Norte", "Morazán Sur"],
  "La Unión": ["La Unión Norte", "La Unión Sur"],
};

export const departamentoOptions: SelectOption[] = Object.keys(
  MUNICIPIOS_POR_DEPARTAMENTO,
).map((departamento) => ({ label: departamento, value: departamento }));
