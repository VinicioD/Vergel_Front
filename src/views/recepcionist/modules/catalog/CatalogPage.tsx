import CatalogView from "../../../../components/catalog/CatalogView";

export default function CatalogPage() {
  return (
    <CatalogView
      title="Catálogo de Productos"
      subtitle="Consulta productos, categorías, precios y disponibilidad."
      searchPlaceholder="Buscar producto por nombre..."
      showAddProductButton={false}
    />
  );
}
