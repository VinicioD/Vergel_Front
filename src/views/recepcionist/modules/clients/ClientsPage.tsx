import ClientsView from "../../../../components/clients/ClientsView";

export default function ClientsPage() {
  return (
    <ClientsView
      title="Gestión de Clientes"
      subtitle="Consulta, registra y actualiza la información de tus clientes."
      searchPlaceholder="Buscar por nombre, tipo o correo..."
    />
  );
}
