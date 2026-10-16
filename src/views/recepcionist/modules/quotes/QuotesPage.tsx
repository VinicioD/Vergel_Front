import QuotesView from "../../../../components/quotes/QuotesView";

export default function QuotesPage() {
  return (
    <QuotesView
      title="Gestión de Cotizaciones"
      subtitle="Consulta el estado y los detalles de las cotizaciones de tus clientes."
      searchPlaceholder="Buscar por cliente, servicio o código..."
    />
  );
}
