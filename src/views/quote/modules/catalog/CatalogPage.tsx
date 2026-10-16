// src/views/quote/modules/catalog/CatalogPage.tsx
import CatalogView from "../../../../components/catalog/CatalogView";

export default function CatalogPage() {
  return (
    <CatalogView
      title="Catálogo de Productos"
      subtitle="Consulta precios y disponibilidad para tus presupuestos"
      searchPlaceholder="Buscar producto para cotizar..."
    />
  );
}
