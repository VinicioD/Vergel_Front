// src/views/admin/modules/quotes/QuotesPage.tsx
import { useNavigate } from "react-router-dom";
import QuotesView from "../../../../components/quotes/QuotesView";

export default function QuotesPage() {
  const navigate = useNavigate();

  return <QuotesView onNewQuote={() => navigate("new")} />;
}
