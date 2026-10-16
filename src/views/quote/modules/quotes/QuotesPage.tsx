// src/views/quote/modules/quotes/QuotesPage.tsx
import { useNavigate } from "react-router-dom";
import QuotesView from "../../../../components/quotes/QuotesView";

export default function QuotesPage() {
  const navigate = useNavigate();

  return (
    <QuotesView
      title="Mis Cotizaciones"
      subtitle="Genera presupuestos y da seguimiento a los que están en negociación"
      onNewQuote={() => navigate("new")}
    />
  );
}
