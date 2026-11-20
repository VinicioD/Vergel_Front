// src/views/admin/modules/quotes/QuotesPage.tsx
import { useCallback, useState } from "react";
import QuotesView from "../../../../components/quotes/QuotesView";
import QuoteForm from "./Form";
import Toast, { type ToastType } from "../../../../components/alerts/Toast";
import type { Quote } from "../../../../types/quote";

export default function QuotesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const handleSave = useCallback(() => {
    setReloadKey((current) => current + 1);
    setToast({ message: "Cotización guardada con éxito.", type: "success" });
  }, []);

  return (
    <>
      <QuotesView
        key={reloadKey}
        onNewQuote={() => {
          setEditingQuote(null);
          setFormOpen(true);
        }}
        onEditQuote={(quote) => {
          setEditingQuote(quote);
          setFormOpen(true);
        }}
      />
      {formOpen && (
        <QuoteForm
          initialData={editingQuote}
          onClose={() => {
            setFormOpen(false);
            setEditingQuote(null);
          }}
          onSaved={handleSave}
        />
      )}
      <Toast
        type={toast?.type ?? "info"}
        message={toast?.message ?? ""}
        isOpen={toast !== null}
        onClose={() => setToast(null)}
      />
    </>
  );
}
